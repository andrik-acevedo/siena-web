/*
  # Add subscription plan fields to profiles table

  1. Changes
    - Add personal_client boolean field to profiles table (for premium plan)
    - Add subscription_id text field to profiles table
    - Add customer_id text field to profiles table
    - Add payment_status text field to profiles table
    - Add indexes for efficient querying
*/

-- Add fields if they don't exist
DO $$ 
BEGIN
  -- Add personal_client if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'personal_client'
  ) THEN
    ALTER TABLE profiles ADD COLUMN personal_client boolean DEFAULT false;
  END IF;

  -- Add subscription_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_id text;
  END IF;

  -- Add customer_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN customer_id text;
  END IF;

  -- Add payment_status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN payment_status text DEFAULT 'pending';
  END IF;
END $$;

-- Create indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'profiles' AND indexname = 'idx_profiles_personal_client'
  ) THEN
    CREATE INDEX idx_profiles_personal_client ON profiles(personal_client);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'profiles' AND indexname = 'idx_profiles_subscription_id'
  ) THEN
    CREATE INDEX idx_profiles_subscription_id ON profiles(subscription_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'profiles' AND indexname = 'idx_profiles_customer_id'
  ) THEN
    CREATE INDEX idx_profiles_customer_id ON profiles(customer_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'profiles' AND indexname = 'idx_profiles_payment_status'
  ) THEN
    CREATE INDEX idx_profiles_payment_status ON profiles(payment_status);
  END IF;
END $$;