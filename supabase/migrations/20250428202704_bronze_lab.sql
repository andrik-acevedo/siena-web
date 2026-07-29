/*
  # Add therapeutic homework table

  1. New Tables
    - `therapeutic_homework`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text, not null)
      - `description` (text, not null)
      - `assigned_date` (date, not null)
      - `due_date` (date, not null)
      - `status` (text, not null)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users to manage their own homework
*/

CREATE TABLE therapeutic_homework (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  assigned_date date NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE therapeutic_homework ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own homework"
  ON therapeutic_homework
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX therapeutic_homework_user_id_idx ON therapeutic_homework(user_id);
CREATE INDEX therapeutic_homework_status_idx ON therapeutic_homework(status);
CREATE INDEX therapeutic_homework_due_date_idx ON therapeutic_homework(due_date);

-- Create updated_at trigger
CREATE TRIGGER update_therapeutic_homework_updated_at
  BEFORE UPDATE ON therapeutic_homework
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();