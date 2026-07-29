/*
  # Update profiles table to use first_name and last_name

  1. Changes
    - Add first_name and last_name columns
    - Copy existing name data to first_name
    - Drop name column
*/

-- Add new columns
ALTER TABLE profiles
ADD COLUMN first_name text,
ADD COLUMN last_name text;

-- Copy existing name data to first_name (as a fallback)
UPDATE profiles 
SET first_name = name
WHERE first_name IS NULL AND name IS NOT NULL;

-- Make columns required after data migration
ALTER TABLE profiles
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;

-- Drop old name column
ALTER TABLE profiles
DROP COLUMN name;