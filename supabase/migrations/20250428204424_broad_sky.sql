/*
  # Restore exercises table

  1. New Tables
    - `exercises`
      - `id` (text, primary key)
      - `title` (text, not null)
      - `description` (text, not null)
      - `content` (text, not null)
      - `category` (text, not null)
      - `subcategory` (text, not null)
      - `type` (text, not null)
      - `therapist_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for:
      - Therapists to manage their exercises
      - Users to view exercises
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_exercises_updated_at ON exercises;

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id text PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  subcategory text NOT NULL,
  type text NOT NULL,
  therapist_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
DO $$ 
BEGIN
  CREATE TRIGGER update_exercises_updated_at
    BEFORE UPDATE ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Therapists can manage their exercises" ON exercises;
  DROP POLICY IF EXISTS "Users can view exercises" ON exercises;
  
  CREATE POLICY "Therapists can manage their exercises"
    ON exercises
    FOR ALL
    TO authenticated
    USING (auth.uid() = therapist_id)
    WITH CHECK (auth.uid() = therapist_id);

  CREATE POLICY "Users can view exercises"
    ON exercises
    FOR SELECT
    TO authenticated
    USING (true);
END $$;