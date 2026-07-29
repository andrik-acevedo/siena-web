/*
  # Add intimacy challenge tables

  1. New Tables
    - `intimacy_challenge_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `day` (integer, not null)
      - `date` (date, not null)
      - `category` (text, not null)
      - `prompt` (text, not null)
      - `reflection` (text)
      - `shared_with_partner` (boolean, default false)
      - `reaction` (text)
      - `completed` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users to manage their own entries
*/

-- Create intimacy_challenge_entries table
CREATE TABLE IF NOT EXISTS intimacy_challenge_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day integer NOT NULL,
  date date NOT NULL,
  category text NOT NULL,
  prompt text NOT NULL,
  reflection text,
  shared_with_partner boolean DEFAULT false,
  reaction text,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE intimacy_challenge_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own challenge entries"
  ON intimacy_challenge_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX intimacy_challenge_entries_user_id_idx ON intimacy_challenge_entries(user_id);
CREATE INDEX intimacy_challenge_entries_day_idx ON intimacy_challenge_entries(day);
CREATE INDEX intimacy_challenge_entries_date_idx ON intimacy_challenge_entries(date);
CREATE INDEX intimacy_challenge_entries_completed_idx ON intimacy_challenge_entries(completed);

-- Create updated_at trigger
CREATE TRIGGER update_intimacy_challenge_entries_updated_at
  BEFORE UPDATE ON intimacy_challenge_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();