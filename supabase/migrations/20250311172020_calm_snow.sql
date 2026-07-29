/*
  # Initial Schema Setup for LovePath

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text, required)
      - `email` (text, required)
      - `phone` (text, optional)
      - `timezone` (text, defaults to 'America/New_York')
      - `created_at` (timestamptz, auto-set)
      - `updated_at` (timestamptz, auto-updated)
    
    - `chat_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `messages` (jsonb, stores conversation)
      - `created_at` (timestamptz, auto-set)

  2. Security
    - Enable RLS on both tables
    - Add policies for:
      - Profiles: read/update own profile
      - Chat History: read/insert own messages

  3. Functions
    - Add updated_at trigger function
*/

-- Drop existing objects if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "New users can insert profile" ON profiles;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS chat_history;
DROP TABLE IF EXISTS profiles;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create profiles table
CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    timezone text DEFAULT 'America/New_York',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create chat_history table
CREATE TABLE chat_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    messages jsonb NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
CREATE POLICY "Users can read own profile"
    ON profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "New users can insert profile"
    ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Create chat_history policies
CREATE POLICY "Users can read own chat history"
    ON chat_history
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
    ON chat_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS chat_history_user_id_created_at_idx 
    ON chat_history(user_id, created_at);