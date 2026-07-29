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

-- Drop existing policy if it exists
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can manage their own challenge entries" ON intimacy_challenge_entries;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Create policies
CREATE POLICY "Users can manage their own challenge entries"
  ON intimacy_challenge_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes if they don't exist
DO $$ 
BEGIN
    CREATE INDEX IF NOT EXISTS intimacy_challenge_entries_user_id_idx ON intimacy_challenge_entries(user_id);
    CREATE INDEX IF NOT EXISTS intimacy_challenge_entries_day_idx ON intimacy_challenge_entries(day);
    CREATE INDEX IF NOT EXISTS intimacy_challenge_entries_date_idx ON intimacy_challenge_entries(date);
    CREATE INDEX IF NOT EXISTS intimacy_challenge_entries_completed_idx ON intimacy_challenge_entries(completed);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create updated_at trigger if it doesn't exist
DO $$ 
BEGIN
    CREATE TRIGGER update_intimacy_challenge_entries_updated_at
      BEFORE UPDATE ON intimacy_challenge_entries
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;