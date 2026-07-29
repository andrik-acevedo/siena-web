/*
  # Create intimacy wheel history table

  1. New Tables
    - `intimacy_wheel_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `date` (date, not null)
      - `scores` (jsonb, array of category scores)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users to:
      - Read their own history
      - Create their own entries
      - Delete their own entries
*/

-- Create intimacy wheel history table if it doesn't exist
CREATE TABLE IF NOT EXISTS intimacy_wheel_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  scores jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

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

-- Create indexes
CREATE INDEX IF NOT EXISTS intimacy_wheel_history_user_id_idx ON intimacy_wheel_history(user_id);
CREATE INDEX IF NOT EXISTS intimacy_wheel_history_date_idx ON intimacy_wheel_history(date);
CREATE INDEX IF NOT EXISTS intimacy_wheel_history_user_id_date_idx ON intimacy_wheel_history(user_id, date);