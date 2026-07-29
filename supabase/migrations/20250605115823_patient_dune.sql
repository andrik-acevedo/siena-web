/*
  # Create date_entries table

  1. New Tables
    - `date_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `person_name` (text, not null)
      - `date_number` (integer, not null)
      - `how_met` (text, not null)
      - `date_type` (text, not null)
      - `mood_before` (text, not null)
      - `mood_after` (text, not null)
      - `energy_before` (integer, not null)
      - `energy_after` (integer, not null)
      - `connection_rating` (integer, not null)
      - `red_flags` (text array)
      - `green_flags` (text array)
      - `reflection` (text)
      - `future_questions` (text)
      - `date` (date, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users to manage their own date entries
*/

-- Create date_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS date_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  person_name text NOT NULL,
  date_number integer NOT NULL,
  how_met text NOT NULL,
  date_type text NOT NULL,
  mood_before text NOT NULL,
  mood_after text NOT NULL,
  energy_before integer NOT NULL,
  energy_after integer NOT NULL,
  connection_rating integer NOT NULL,
  red_flags text[],
  green_flags text[],
  reflection text,
  future_questions text,
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE date_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can manage their own date entries" ON date_entries;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Create policy
CREATE POLICY "Users can manage their own date entries"
  ON date_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes if they don't exist
DO $$ 
BEGIN
    CREATE INDEX IF NOT EXISTS date_entries_user_id_idx ON date_entries(user_id);
    CREATE INDEX IF NOT EXISTS date_entries_date_idx ON date_entries(date);
    CREATE INDEX IF NOT EXISTS date_entries_person_name_idx ON date_entries(person_name);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create updated_at trigger if it doesn't exist
DO $$ 
BEGIN
    CREATE TRIGGER update_date_entries_updated_at
      BEFORE UPDATE ON date_entries
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;