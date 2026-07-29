// /supabase/functions/stripe-webhook/index.ts
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2.39.7";
import Stripe from "npm:stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ---------- helpers ----------
function getSupabase() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseKey) throw new Error("Missing Supabase credentials");
  return createClient(supabaseUrl, supabaseKey);
}

function getAvailableOnDate(): string {
  const holdDays = Number(Deno.env.get("AFFILIATE_HOLD_DAYS") ?? "1");
  const dt = new Date();
  dt.setDate(dt.getDate() + holdDays);
  return dt.toISOString();
}

async function findAffiliateForUser(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("affiliate_referrals")
    .select("id, affiliate_id, affiliates(commission_rate)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  if (!data || data.length === 0) return null;

  const referral = data[0] as any;
  const defaultRate = Number(Deno.env.get("AFFILIATE_DEFAULT_RATE") ?? "0.25");
  const commissionRate = referral.affiliates?.commission_rate != null
    ? Number(referral.affiliates.commission_rate)
    : defaultRate;

  return {
    affiliateId: referral.affiliate_id,
    commissionRate,
  };
}

// ---------- server ----------
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No Stripe signature found");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) throw new Error("Missing Stripe webhook secret");

    const rawBody = await req.text();
    const event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);

    const supabase = getSupabase();

    // --- [CORRECTED] Handle successful payments and create commission records ---
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      const totalAmount = invoice.total / 100;

      if (totalAmount > 0 && invoice.customer) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("customer_id", invoice.customer)
          .single();

        if (profile && !profileError) {
          const userId = profile.id;
          const affiliateInfo = await findAffiliateForUser(supabase, userId);

          if (affiliateInfo) {
            const { affiliateId, commissionRate } = affiliateInfo;
            const commissionAmount = totalAmount * commissionRate;

            const { error: insertError } = await supabase.from("affiliate_referrals").insert({
              affiliate_id: affiliateId,
              user_id: userId,
              status: "pending",
              payment_amount: totalAmount,
              commission_amount: commissionAmount,
              gross_amount: totalAmount,
              customer_id: invoice.customer as string,
              invoice_id: invoice.id,
              stripe_subscription_id: typeof invoice.subscription === 'string' ? invoice.subscription : null,
              available_on: getAvailableOnDate(),
            });

            if (insertError && insertError.code !== '23505') { // Ignore unique constraint violations
              throw insertError;
            }
            console.log(`Webhook: Processed commission for invoice ${invoice.id}.`);
          }
        }
      }
    }

    // --- [RESTORED] Handle checkout session completion ---
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        const userId = session.metadata?.userId;
        if (userId) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            const plan = (session.metadata?.plan as string | undefined) ?? "plus";
            const trialStart = subscription.trial_start ? new Date(subscription.trial_start * 1000) : null;
            const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;

            const { error } = await supabase
                .from("profiles")
                .update({
                    subscription_status: "active",
                    subscription_id: session.subscription,
                    customer_id: session.customer,
                    payment_status: session.payment_status,
                    trial_start: trialStart?.toISOString(),
                    trial_end: trialEnd?.toISOString(),
                    subscription_tier: plan === "premium" ? "premium" : "plus",
                    subscription_tier_updated_at: new Date().toISOString(),
                })
                .eq("id", userId);
            if (error) throw error;
        }
    }

    // --- [RESTORED] Handle subscription updates ---
    if (event.type === "customer.subscription.updated") {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;
        
        const { data: profile } = await supabase.from("profiles").select("id").eq("customer_id", customerId).single();
        
        if (profile) {
            let subscriptionTier: "basic" | "plus" | "premium" = "basic";
            if (subscription.items?.data?.length > 0) {
                const priceId = subscription.items.data[0].price.id;
                if (priceId === "price_1RLXb4P12yeoN5mpVgGVU9aq" || priceId === "price_1RVZmqP12yeoN5mpBNu9upBu") {
                    subscriptionTier = "premium";
                } else if (priceId === "price_1RGsVoP12yeoN5mp6BOF8ynk") {
                    subscriptionTier = "plus";
                }
            }

            const { error } = await supabase
                .from("profiles")
                .update({
                    subscription_status: subscription.status,
                    subscription_tier: subscriptionTier,
                    subscription_tier_updated_at: new Date().toISOString(),
                })
                .eq("id", profile.id);
            if (error) throw error;
        }
    }

    // --- [RESTORED] Handle subscription deletions ---
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as any;
      const customerId = subscription.customer as string;

      const { data: profile } = await supabase.from("profiles").select("id").eq("customer_id", customerId).single();

      if (profile) {
        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_status: "inactive",
            subscription_tier: "basic",
            subscription_tier_updated_at: new Date().toISOString(),
          })
          .eq("id", profile.id);
        if (error) throw error;
      }
    }

    // success
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Webhook error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

