// supabase/functions/create-checkout-session/index.ts
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient()
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ---- Test Price (no trial) ----
const TEST_PRICE_ID = 'price_1SDsd8P12yeoN5mpxjE3NkrU';

// ---- Your live Price IDs ----
const PRICE_IDS = {
  plus: {
    monthly: 'price_1SB0L7P12yeoN5mpMdLYOBec', // $9.99/mo (Plus)
    yearly:  'price_1SB0OFP12yeoN5mprOlSgd0y', // $83.92/yr (Plus - ~30% off)
  },
  premium: {
    monthly: 'price_1SB0MlP12yeoN5mpfyHkwUyQ', // $14.99/mo (Premium)
    yearly:  'price_1SB0PaP12yeoN5mpFl30fpZf', // $125.92/yr (Premium - ~30% off)
  },
} as const;

const UPGRADE_DIFFERENCE_PRICE_ID = 'price_1RVZmqP12yeoN5mpBNu9upBu';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      plan = 'plus',
      billingPeriod = 'monthly',
      email,
      userId,
      isUpgrade = false,
      useTestPrice = false,  // NEW: Allow forcing test price
    } = body ?? {};

    // Validate plan/period
    if (!['plus', 'premium'].includes(plan)) {
      throw new Error('Invalid plan. Must be "plus" or "premium".');
    }
    if (!['monthly', 'yearly'].includes(billingPeriod)) {
      throw new Error('Invalid billingPeriod. Must be "monthly" or "yearly".');
    }

    // Choose price
    let priceId: string;
    
    // Use test price if explicitly requested OR if we're in test mode
    if (useTestPrice || Deno.env.get('USE_TEST_PRICE') === 'true') {
      priceId = TEST_PRICE_ID;
      console.log('🧪 Using TEST price (no trial):', priceId);
    } else if (isUpgrade && plan === 'premium' && UPGRADE_DIFFERENCE_PRICE_ID) {
      priceId = UPGRADE_DIFFERENCE_PRICE_ID;
    } else {
      priceId = PRICE_IDS[plan as 'plus' | 'premium'][billingPeriod as 'monthly' | 'yearly'];
    }

    const origin = req.headers.get('origin') ?? '';

    const sessionOptions: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: { userId: userId ?? '', plan, billingPeriod, isUpgrade: String(isUpgrade) },
        // Only add trial if NOT using test price and NOT upgrading
        ...((!useTestPrice && !isUpgrade && Deno.env.get('USE_TEST_PRICE') !== 'true') 
          ? { trial_period_days: 7 } 
          : {}),
      },
      customer_email: email,
      metadata: { userId: userId ?? '', plan, billingPeriod, isUpgrade: String(isUpgrade) },
      success_url: `${origin}/dashboard`,
      cancel_url: `${origin}/pricing`,
      allow_promotion_codes: true,
    };

    const session = await stripe.checkout.sessions.create(sessionOptions);

    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message ?? 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});