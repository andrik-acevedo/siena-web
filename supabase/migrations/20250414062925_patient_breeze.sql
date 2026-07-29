/*
  # Add personal client support

  1. Changes
    - Add personal_client boolean flag to profiles
    - Add trial_expiration date to profiles
    - Add indexes for efficient querying
*/

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN personal_client boolean DEFAULT false,
ADD COLUMN trial_expiration timestamptz;

-- Create indexes
CREATE INDEX idx_profiles_personal_client ON profiles(personal_client);
CREATE INDEX idx_profiles_trial_expiration ON profiles(trial_expiration);