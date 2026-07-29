/*
  # Add subscription tier tracking

  1. Changes
    - Add subscription_tier column to profiles table
    - Add subscription_tier_updated_at column to profiles table
    - Create enum type for subscription tiers
    - Add indexes for efficient querying
*/

-- Create subscription tier enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
    CREATE TYPE subscription_tier AS ENUM ('basic', 'plus', 'premium');
  END IF;
END $$;

-- Add subscription tier columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tier subscription_tier DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS subscription_tier_updated_at timestamptz DEFAULT now();

-- Create indexes for subscription tier columns
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier 
ON profiles(subscription_tier);

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier_updated_at 
ON profiles(subscription_tier_updated_at);

-- Update existing profiles based on current data
UPDATE profiles
SET subscription_tier = 
  CASE 
    WHEN personal_client = true THEN 'premium'::subscription_tier
    WHEN subscription_status = 'active' THEN 'plus'::subscription_tier
    ELSE 'basic'::subscription_tier
  END,
subscription_tier_updated_at = now()
WHERE subscription_tier IS NULL OR subscription_tier = 'basic'::subscription_tier;

-- Add function to update subscription_tier_updated_at on tier change
CREATE OR REPLACE FUNCTION update_subscription_tier_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier THEN
    NEW.subscription_tier_updated_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for subscription tier updates
DROP TRIGGER IF EXISTS update_subscription_tier_timestamp ON profiles;
CREATE TRIGGER update_subscription_tier_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_subscription_tier_timestamp();