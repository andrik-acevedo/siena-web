// supabase/functions/approve-affiliate/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import Stripe from "npm:stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) throw new Error("Missing Supabase env vars");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { applicationId, action, rejectionReason } = await req.json();
    if (!applicationId || !action) throw new Error("Missing required params");

    // Load application
    const { data: application, error: appError } = await supabase
      .from("affiliate_applications")
      .select("*")
      .eq("id", applicationId)
      .single();
    if (appError || !application) throw new Error("Application not found");

    if (action === "approve") {
      // 1. Create or reuse affiliate record
      const referralCode =
        application.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") +
        "-" +
        Math.random().toString(36).slice(2, 6);

      const { data: affiliate, error: affErr } = await supabase
        .from("affiliates")
        .insert([{
          first_name: application.first_name,
          last_name: application.last_name,
          email: application.email,
          phone: application.phone,
          professional_title: application.profession,
          license_number: application.license_number,
          practice_name: application.practice_name,
          website: application.practice_website,
          referral_code: referralCode,
          commission_rate: 0.25,
          is_active: true,
          is_approved: true,
          application_id: applicationId,
          approval_date: new Date().toISOString(),
        }])
        .select()
        .single();

      if (affErr) throw affErr;

      // 2. Create Stripe Connect account
      const account = await stripe.accounts.create({
        type: "express",
        email: application.email,
        business_type: "individual",
      });

      // 3. Save Stripe account ID
      await supabase
        .from("affiliates")
        .update({ stripe_account_id: account.id })
        .eq("id", affiliate.id);

      // 4. Create onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${Deno.env.get("SITE_URL")}/affiliate/onboarding/refresh`,
        return_url: `${Deno.env.get("SITE_URL")}/affiliate/onboarding/return`,
        type: "account_onboarding",
      });

      // 5. Mark application as approved
      await supabase
        .from("affiliate_applications")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", applicationId);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Affiliate approved + onboarding link created",
          onboardingUrl: accountLink.url,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "reject") {
      await supabase
        .from("affiliate_applications")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", applicationId);

      return new Response(
        JSON.stringify({ success: true, message: "Application rejected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid action");
  } catch (err: any) {
    console.error("approve-affiliate error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
