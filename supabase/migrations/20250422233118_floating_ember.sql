/*
  # Add exercise views tracking

  1. New Tables
    - `exercise_views`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `exercise_id` (uuid, references exercises)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users to:
      - Read their own exercise views
      - Create their own exercise views
*/

CREATE TABLE exercise_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  exercise_id uuid REFERENCES exercises(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE exercise_views ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own exercise views"
  ON exercise_views
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise views"
  ON exercise_views
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX exercise_views_user_id_idx ON exercise_views(user_id);
CREATE INDEX exercise_views_created_at_idx ON exercise_views(created_at);