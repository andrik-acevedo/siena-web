/*
  # Add avatar_url to profiles table

  1. Schema Changes
    - Add `avatar_url` column to profiles table to store user's selected avatar image URL
    - This field will be populated during onboarding when users select an avatar

  2. Notes
    - Nullable text field since not all users may have completed onboarding
    - Works alongside existing avatar_emoji field for backwards compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;
END $$;
