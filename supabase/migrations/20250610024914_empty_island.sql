/*
  # Create invites table for partner invitations

  1. New Tables
    - `invites`
      - `id` (uuid, primary key)
      - `email` (text, not null)
      - `code` (text, not null) - Stores relationship_id as text
      - `status` (text, not null, default 'pending')
      - `sent_count` (integer, not null, default 1)
      - `last_sent_at` (timestamptz, not null, default now())
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS
    - Add policies for users to manage their own invites
*/

-- Create invites table
CREATE TABLE IF NOT EXISTS invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL, -- Store as text to avoid type casting issues
  status text NOT NULL DEFAULT 'pending',
  sent_count integer NOT NULL DEFAULT 1,
  last_sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique constraint on email and code
ALTER TABLE invites ADD CONSTRAINT invites_email_code_key UNIQUE (email, code);

-- Enable RLS
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Create policies without type casts
CREATE POLICY "Users can view invites with their relationship ID"
  ON invites
  FOR SELECT
  TO authenticated
  USING (
    code IN (
      SELECT relationship_id::text FROM internal_world_entries WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert invites with their relationship ID"
  ON invites
  FOR INSERT
  TO authenticated
  WITH CHECK (
    code IN (
      SELECT relationship_id::text FROM internal_world_entries WHERE user_id = auth.uid()
    ) OR
    NOT EXISTS (
      SELECT 1 FROM internal_world_entries WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update invites with their relationship ID"
  ON invites
  FOR UPDATE
  TO authenticated
  USING (
    code IN (
      SELECT relationship_id::text FROM internal_world_entries WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    code IN (
      SELECT relationship_id::text FROM internal_world_entries WHERE user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX invites_email_idx ON invites(email);
CREATE INDEX invites_code_idx ON invites(code);
CREATE INDEX invites_status_idx ON invites(status);

-- Create updated_at trigger
CREATE TRIGGER update_invites_updated_at
  BEFORE UPDATE ON invites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();