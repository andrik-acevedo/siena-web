/*
  # Initial Schema Setup

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text, not null)
      - `email` (text, not null)
      - `phone` (text, nullable)
      - `timezone` (text, default 'America/New_York')
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    
    - `chat_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `messages` (jsonb, not null)
      - `created_at` (timestamptz, default now())

  2. Functions
    - Create updated_at trigger function for automatic timestamp updates

  3. Security
    - Enable RLS on both tables
    - Add policies for user data access control
*/

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    timezone text DEFAULT 'America/New_York',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create chat_history table
CREATE TABLE IF NOT EXISTS chat_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    messages jsonb NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_profiles_updated_at_v2 ON profiles;

-- Create updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at_v2
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS chat_history_user_id_created_at_idx 
    ON chat_history(user_id, created_at);

-- Create policies for profiles table
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "New users can insert profile" ON profiles;
    
    -- Create new policies
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
END $$;

-- Create policies for chat_history table
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can read own chat history" ON chat_history;
    DROP POLICY IF EXISTS "Users can insert own chat messages" ON chat_history;
    
    -- Create new policies
    CREATE POLICY "Users can read own chat history"
        ON chat_history
        FOR SELECT
        USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own chat messages"
        ON chat_history
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);
END $$;