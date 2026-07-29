/*
  # Add mood tracking table

  1. New Tables
    - `moods`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `date` (date, not null)
      - `mood` (text, not null)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users to:
      - Read their own moods
      - Create their own moods
      - Update their own moods
*/

-- Create moods table
CREATE TABLE moods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  date date NOT NULL,
  mood text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own moods"
  ON moods
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own moods"
  ON moods
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own moods"
  ON moods
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX moods_user_id_date_idx ON moods(user_id, date);