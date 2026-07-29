/*
  # Remove Stripe-related tables and columns

  1. Changes
    - Drop payments table
    - Remove subscription-related columns from profiles
    - Remove subscription-related indexes
*/

-- Drop payments table if it exists
DROP TABLE IF EXISTS payments;

-- Remove subscription columns from profiles
ALTER TABLE profiles 
DROP COLUMN IF EXISTS trial_start,
DROP COLUMN IF EXISTS trial_end,
DROP COLUMN IF EXISTS subscription_status;

-- Remove subscription indexes
DROP INDEX IF EXISTS idx_profiles_trial_end;
DROP INDEX IF EXISTS idx_profiles_subscription_status;