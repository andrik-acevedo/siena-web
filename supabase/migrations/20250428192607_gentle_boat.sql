/*
  # Add journal entries table

  1. New Tables
    - `journal_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text, not null)
      - `content` (text, not null)
      - `mood` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users to manage their own entries
*/

CREATE TABLE journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  mood text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own journal entries"
  ON journal_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX journal_entries_user_id_idx ON journal_entries(user_id);
CREATE INDEX journal_entries_created_at_idx ON journal_entries(created_at);

-- Create updated_at trigger
CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();