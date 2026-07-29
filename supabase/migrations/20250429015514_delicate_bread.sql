/*
  # Add life balance history table

  1. New Tables
    - `life_balance_history`
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
*/

CREATE TABLE life_balance_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  date date NOT NULL,
  scores jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE life_balance_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own history"
  ON life_balance_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own entries"
  ON life_balance_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX life_balance_history_user_id_idx ON life_balance_history(user_id);
CREATE INDEX life_balance_history_date_idx ON life_balance_history(date);