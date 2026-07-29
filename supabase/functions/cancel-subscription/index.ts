import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import Stripe from "npm:stripe@14.21.0";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient()
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user ID from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authorization token');
    }

    // Get user's subscription ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.subscription_id) {
      throw new Error('No active subscription found');
    }

    // Cancel the subscription at period end
    const subscription = await stripe.subscriptions.update(
      profile.subscription_id,
      { cancel_at_period_end: true }
    );

    // Update profile status
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'canceling',
        // Don't change the subscription_tier yet - it will change when subscription actually ends
      })
      .eq('id', user.id);

    return new Response(
      JSON.stringify({
        message: 'Subscription will be canceled at the end of the billing period',
        cancelAt: new Date(subscription.current_period_end * 1000).toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (err) {
    console.error('Error canceling subscription:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});