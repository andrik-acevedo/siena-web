/*
  # Add terms agreement tracking

  1. Changes
    - Add terms_agreed_at column to profiles table
    - Add index for faster queries on terms agreement status
*/

-- Add terms agreement timestamp column
ALTER TABLE profiles 
ADD COLUMN terms_agreed_at timestamptz DEFAULT NULL;

-- Create index for faster queries
CREATE INDEX idx_profiles_terms_agreed 
ON profiles(terms_agreed_at);