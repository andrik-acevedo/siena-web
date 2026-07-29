/*
  # Create smart goals table

  1. New Tables
    - `smart_goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `specific` (text)
      - `measurable` (text)
      - `achievable` (text)
      - `relevant` (text)
      - `time_bound` (text)
      - `target_date` (date)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users to manage their own goals
*/

-- Create smart_goals table
CREATE TABLE IF NOT EXISTS smart_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  specific text NOT NULL,
  measurable text NOT NULL,
  achievable text NOT NULL,
  relevant text NOT NULL,
  time_bound text NOT NULL,
  target_date date NOT NULL,
  status text NOT NULL DEFAULT 'in_progress',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE smart_goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own goals"
  ON smart_goals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX smart_goals_user_id_idx ON smart_goals(user_id);
CREATE INDEX smart_goals_status_idx ON smart_goals(status);
CREATE INDEX smart_goals_target_date_idx ON smart_goals(target_date);

-- Create updated_at trigger
CREATE TRIGGER update_smart_goals_updated_at
  BEFORE UPDATE ON smart_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();