/*
  # Create boundaries table

  1. New Tables
    - `boundaries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `area` (text, not null)
      - `situation` (text, not null)
      - `boundary_statement` (text, not null)
      - `consequence` (text, not null)
      - `communication_plan` (text, not null)
      - `reflection` (text)
      - `status` (text, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users to manage their own boundaries
*/

-- Create boundaries table
CREATE TABLE IF NOT EXISTS boundaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  area text NOT NULL,
  situation text NOT NULL,
  boundary_statement text NOT NULL,
  consequence text NOT NULL,
  communication_plan text NOT NULL,
  reflection text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE boundaries ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can manage their own boundaries" ON boundaries;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Users can manage their own boundaries"
  ON boundaries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
DO $$ 
BEGIN
    CREATE INDEX IF NOT EXISTS boundaries_user_id_idx ON boundaries(user_id);
    CREATE INDEX IF NOT EXISTS boundaries_area_idx ON boundaries(area);
    CREATE INDEX IF NOT EXISTS boundaries_status_idx ON boundaries(status);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create updated_at trigger
DO $$ 
BEGIN
    CREATE TRIGGER update_boundaries_updated_at
      BEFORE UPDATE ON boundaries
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;