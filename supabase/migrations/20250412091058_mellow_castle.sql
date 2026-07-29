/*
  # Create Stripe Schema

  1. New Tables
    - `stripe_customers`
      - `id` (text, primary key)
      - `user_id` (uuid, references auth.users)
      - `email` (text)
      - `created_at` (timestamptz)

    - `stripe_subscriptions`
      - `id` (uuid, primary key)
      - `customer_id` (text, references stripe_customers)
      - `subscription_id` (text, unique)
      - `status` (stripe_subscription_status)
      - Other subscription details

    - `stripe_orders`
      - `id` (uuid, primary key)
      - `customer_id` (text, references stripe_customers)
      - Order details and status

  2. Security
    - Enable RLS
    - Add policies for user data access
*/

-- Create subscription status enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stripe_subscription_status') THEN
    CREATE TYPE stripe_subscription_status AS ENUM (
      'not_started',
      'incomplete',
      'incomplete_expired',
      'trialing',
      'active',
      'past_due',
      'canceled',
      'unpaid',
      'paused'
    );
  END IF;
END $$;

-- Create order status enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stripe_order_status') THEN
    CREATE TYPE stripe_order_status AS ENUM (
      'pending',
      'completed',
      'canceled'
    );
  END IF;
END $$;

-- Create stripe_customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create stripe_subscriptions table
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text REFERENCES stripe_customers(id) NOT NULL,
  subscription_id text UNIQUE,
  price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  payment_method_brand text,
  payment_method_last4 text,
  status stripe_subscription_status NOT NULL,
  created_at timestamptz DEFAULT now(),
  trial_start timestamptz,
  trial_end timestamptz
);

-- Create stripe_orders table
CREATE TABLE IF NOT EXISTS stripe_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_session_id text NOT NULL,
  payment_intent_id text NOT NULL,
  customer_id text REFERENCES stripe_customers(id) NOT NULL,
  amount_subtotal bigint NOT NULL,
  amount_total bigint NOT NULL,
  currency text NOT NULL,
  payment_status text NOT NULL,
  status stripe_order_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own customer data"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscription data"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM stripe_customers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own order data"
  ON stripe_orders
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM stripe_customers WHERE user_id = auth.uid()
    )
  );

-- Create views
CREATE OR REPLACE VIEW stripe_user_subscriptions 
WITH (security_invoker = true) 
AS
SELECT
  c.id as customer_id,
  s.subscription_id,
  s.status as subscription_status,
  s.price_id,
  s.current_period_start,
  s.current_period_end,
  s.cancel_at_period_end,
  s.payment_method_brand,
  s.payment_method_last4
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.id = s.customer_id
WHERE c.user_id = auth.uid();

CREATE OR REPLACE VIEW stripe_user_orders 
WITH (security_invoker = true) 
AS
SELECT
  c.id as customer_id,
  o.id as order_id,
  o.checkout_session_id,
  o.payment_intent_id,
  o.amount_subtotal,
  o.amount_total,
  o.currency,
  o.payment_status,
  o.status as order_status,
  o.created_at as order_date
FROM stripe_customers c
LEFT JOIN stripe_orders o ON c.id = o.customer_id
WHERE c.user_id = auth.uid();

-- Grant access to views
GRANT SELECT ON stripe_user_subscriptions TO authenticated;
GRANT SELECT ON stripe_user_orders TO authenticated;

-- Create indexes
CREATE INDEX IF NOT EXISTS stripe_customers_user_id_idx ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS stripe_subscriptions_customer_id_idx ON stripe_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS stripe_orders_customer_id_idx ON stripe_orders(customer_id);