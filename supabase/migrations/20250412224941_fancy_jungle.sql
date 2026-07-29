/*
  # Add role column to profiles

  1. Changes
    - Add role column to profiles table with default value 'user'
    - Create index for role column for faster queries
    - Add check constraint to ensure role is either 'user' or 'admin'
*/

-- Add role column with check constraint
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'
CHECK (role IN ('user', 'admin'));

-- Create index for role column
CREATE INDEX IF NOT EXISTS idx_profiles_role 
ON profiles(role);