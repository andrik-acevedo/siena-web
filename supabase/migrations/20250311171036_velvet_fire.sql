/*
  # Create profiles table and policies

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text, required)
      - `email` (text, required)
      - `phone` (text, optional)
      - `timezone` (text, defaults to 'America/New_York')
      - `created_at` (timestamptz, auto-set)
      - `updated_at` (timestamptz, auto-updated)

  2. Security
    - Enable RLS on profiles table
    - Add policies for authenticated users to:
      - Read their own profile
      - Update their own profile

  3. Changes
    - Added safety checks for existing objects
    - Handles policy recreation safely
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    timezone text DEFAULT 'America/New_York',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
DO $$ 
BEGIN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create policies
DO $$ 
BEGIN
    CREATE POLICY "Users can read own profile"
        ON profiles
        FOR SELECT
        TO authenticated
        USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Users can update own profile"
        ON profiles
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create function to handle updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DO $$
BEGIN
    CREATE TRIGGER update_profiles_updated_at
        BEFORE UPDATE ON profiles
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;