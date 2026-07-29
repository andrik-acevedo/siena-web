/*
  # Update subscription tracking fields

  1. Changes
    - Safely add trial_start, trial_end, and subscription_status columns if they don't exist
    - Create indexes for efficient querying
    - Add safety checks to prevent errors on existing columns
*/

DO $$ 
BEGIN
  -- Add trial_start if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'trial_start'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_start timestamptz DEFAULT now();
  END IF;

  -- Add trial_end if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'trial_end'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_end timestamptz DEFAULT (now() + interval '7 days');
  END IF;

  -- Add subscription_status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_status text DEFAULT 'trial';
  END IF;
END $$;

-- Create indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'profiles' AND indexname = 'idx_profiles_trial_end'
  ) THEN
    CREATE INDEX idx_profiles_trial_end ON profiles(trial_end);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'profiles' AND indexname = 'idx_profiles_subscription_status'
  ) THEN
    CREATE INDEX idx_profiles_subscription_status ON profiles(subscription_status);
  END IF;
END $$;