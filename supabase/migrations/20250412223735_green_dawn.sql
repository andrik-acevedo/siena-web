/*
  # Add Stripe subscription fields

  1. Changes
    - Add subscription_id column to profiles table
    - Add customer_id column to profiles table
    - Add payment_status column to profiles table
    - Add indexes for efficient querying
*/

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_id text,
ADD COLUMN IF NOT EXISTS customer_id text,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_id 
ON profiles(subscription_id);

CREATE INDEX IF NOT EXISTS idx_profiles_customer_id 
ON profiles(customer_id);

CREATE INDEX IF NOT EXISTS idx_profiles_payment_status 
ON profiles(payment_status);