/*
  # Create journal entries table

  1. New Tables
    - `journal_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `content` (text)
      - `mood` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Indexes
    - Index on user_id for faster lookups
    - Index on created_at for sorting

  3. Security
    - Enable RLS
    - Add policy for authenticated users to manage their own entries
*/

-- Drop existing policy if it exists
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can manage their own journal entries" ON journal_entries;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Create the journal entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,
  content text NOT NULL,
  mood text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS journal_entries_user_id_idx ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS journal_entries_created_at_idx ON journal_entries(created_at);

-- Enable Row Level Security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own entries
CREATE POLICY "Users can manage their own journal entries"
  ON journal_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updating the updated_at column
DO $$ 
BEGIN
    CREATE TRIGGER update_journal_entries_updated_at
        BEFORE UPDATE ON journal_entries
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;