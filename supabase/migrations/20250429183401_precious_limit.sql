/*
  # Add intimacy wheel history table with safety checks

  1. New Tables
    - `intimacy_wheel_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `date` (date, not null)
      - `scores` (jsonb, not null)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users to:
      - View their own entries
      - Insert their own entries
      - Delete their own entries
*/

DO $$ 
BEGIN
  -- Create table if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'intimacy_wheel_history'
  ) THEN
    CREATE TABLE intimacy_wheel_history (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      date date NOT NULL,
      scores jsonb NOT NULL,
      created_at timestamptz DEFAULT now()
    );
  END IF;

  -- Enable RLS
  ALTER TABLE intimacy_wheel_history ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view their own entries" ON intimacy_wheel_history;
  DROP POLICY IF EXISTS "Users can insert their own entries" ON intimacy_wheel_history;
  DROP POLICY IF EXISTS "Users can delete their own entries" ON intimacy_wheel_history;

  -- Create policies
  CREATE POLICY "Users can view their own entries"
    ON intimacy_wheel_history
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert their own entries"
    ON intimacy_wheel_history
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete their own entries"
    ON intimacy_wheel_history
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

  -- Create indexes if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'intimacy_wheel_history' 
    AND indexname = 'intimacy_wheel_history_user_id_idx'
  ) THEN
    CREATE INDEX intimacy_wheel_history_user_id_idx ON intimacy_wheel_history(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'intimacy_wheel_history' 
    AND indexname = 'intimacy_wheel_history_date_idx'
  ) THEN
    CREATE INDEX intimacy_wheel_history_date_idx ON intimacy_wheel_history(date);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'intimacy_wheel_history' 
    AND indexname = 'intimacy_wheel_history_user_id_date_idx'
  ) THEN
    CREATE INDEX intimacy_wheel_history_user_id_date_idx ON intimacy_wheel_history(user_id, date);
  END IF;

END $$;