/*
  # Remove Stripe integration

  1. Changes
    - Remove Stripe-related edge functions
    - Remove Stripe-related triggers
    - Clean up any remaining Stripe artifacts
*/

-- Drop Stripe-related functions if they exist
DROP FUNCTION IF EXISTS handle_stripe_webhook CASCADE;
DROP FUNCTION IF EXISTS process_stripe_payment CASCADE;
DROP FUNCTION IF EXISTS update_subscription_status CASCADE;

-- Drop any remaining Stripe-related triggers
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS stripe_webhook_trigger ON stripe_events;
  DROP TRIGGER IF EXISTS subscription_update_trigger ON subscriptions;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Drop any remaining Stripe-related tables
DROP TABLE IF EXISTS stripe_events;
DROP TABLE IF EXISTS stripe_customers;
DROP TABLE IF EXISTS subscriptions;