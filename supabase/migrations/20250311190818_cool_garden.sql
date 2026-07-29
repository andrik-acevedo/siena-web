/*
  # Create exercises table and update attachment title

  1. New Tables
    - `exercises`
      - `id` (uuid, primary key)
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
      - Therapists can manage their exercises
      - Users can view assigned exercises
*/

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies
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

-- Insert initial exercise data
INSERT INTO exercises (
  title,
  description,
  content,
  category,
  subcategory,
  type,
  therapist_id
) VALUES (
  'Understand your attachment patterns',
  'Learn about different attachment styles and identify your patterns',
  'Content about attachment patterns...',
  'adults',
  'personal-growth',
  'attachment',
  auth.uid()
);