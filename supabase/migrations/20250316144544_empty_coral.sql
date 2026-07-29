/*
  # Add trial status to profiles table

  1. Changes
    - Add trial_start and trial_end columns to profiles table
    - Add subscription_status column to profiles table
    - Add function to calculate trial end date
*/

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS trial_start timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS trial_end timestamptz DEFAULT (now() + interval '7 days'),
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trial';

-- Create index for faster trial status queries
CREATE INDEX IF NOT EXISTS idx_profiles_trial_end 
ON profiles(trial_end);

-- Create index for subscription status
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status 
ON profiles(subscription_status);