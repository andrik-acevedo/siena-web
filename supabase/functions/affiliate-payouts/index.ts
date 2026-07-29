// supabase/functions/affiliate-payouts/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import Stripe from "npm:stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const THRESHOLD_USD = 25; // minimum to send in one batch (USD)

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
async function sbAdmin() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing Supabase admin env (URL/Service Role)");
  return createClient(url, key);
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER
// ─────────────────────────────────────────────────────────────────────────────
serve(async (req) => {
  // Require POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Optional: simple protection so only your scheduler can run it
  const requiredToken = Deno.env.get("CRON_TOKEN");
  if (requiredToken) {
    const token = req.headers.get("x-cron-token");
    if (token !== requiredToken) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  try {
    const supabase = await sbAdmin();

    // 1) Fetch affiliates that have a Stripe Connect account
    const { data: affiliates, error: affErr } = await supabase
      .from("affiliates")
      .select("id, email, referral_code, stripe_account_id")
      .not("stripe_account_id", "is", null);

    if (affErr) throw affErr;

    // 2) For each affiliate, compute unpaid converted commissions
    for (const aff of affiliates ?? []) {
      const accountId = aff.stripe_account_id as string | null;
      if (!accountId) continue;

      const { data: rows, error: sumErr } = await supabase
        .from("affiliate_referrals")
        .select("id, commission_amount")
        .eq("affiliate_id", aff.id)
        .eq("status", "converted")
        .is("paid_at", null);

      if (sumErr) throw sumErr;

      const unpaid = rows ?? [];
      const totalUSD = unpaid.reduce((s, r) => s + Number(r.commission_amount ?? 0), 0);
      if (totalUSD < THRESHOLD_USD) continue; // skip if under threshold

      // 3) Create a transfer to the affiliate’s Connect account
      // NOTE: Your PLATFORM balance must have funds available!
      const cents = Math.round(totalUSD * 100);
      await stripe.transfers.create({
        amount: cents,
        currency: "usd",
        destination: accountId,
        description: `Affiliate payout: ${aff.email ?? aff.referral_code ?? aff.id}`,
      });

      // 4) Mark all included referrals as paid
      const ids = unpaid.map((r) => r.id);
      if (ids.length > 0) {
        const { error: updErr } = await supabase
          .from("affiliate_referrals")
          .update({ paid_at: new Date().toISOString() })
          .in("id", ids);
        if (updErr) throw updErr;
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    console.error("payout job error:", err);
    return new Response(JSON.stringify({ error: err?.message ?? "error" }), {
      headers: { "content-type": "application/json" },
      status: 500,
    });
  }
});