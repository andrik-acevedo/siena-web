/*
  # Add Stripe Integration Tables

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `stripe_customer_id` (text)
      - `stripe_subscription_id` (text)
      - `status` (text)
      - `price_id` (text)
      - `quantity` (integer)
      - `cancel_at_period_end` (boolean)
      - `current_period_start` (timestamptz)
      - `current_period_end` (timestamptz)
      - `created_at` (timestamptz)
      - `trial_start` (timestamptz)
      - `trial_end` (timestamptz)

    - `stripe_customers`
      - `id` (text, primary key, stripe customer id)
      - `user_id` (uuid, references auth.users)
      - `email` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users to view their own data
*/

-- Create subscriptions table
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text UNIQUE NOT NULL,
  status text NOT NULL,
  price_id text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  trial_start timestamptz,
  trial_end timestamptz
);

-- Create stripe_customers table
CREATE TABLE stripe_customers (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) UNIQUE NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own stripe customer"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX subscriptions_status_idx ON subscriptions(status);
CREATE INDEX stripe_customers_user_id_idx ON stripe_customers(user_id);

-- Add subscription status to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS trial_start timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS trial_end timestamptz DEFAULT (now() + interval '7 days');

-- Create indexes for subscription fields
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_end ON profiles(trial_end);