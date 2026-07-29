/*
  # Add therapy sessions tracking

  1. New Tables
    - `therapy_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `date` (date, not null)
      - `time` (time, not null) 
      - `duration_minutes` (integer)
      - `type` (text) - in-person, video, phone
      - `therapist_name` (text)
      - `notes` (text)
      - `takeaways` (text)
      - `goals` (text)
      - `next_session` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users to manage their own sessions
*/

CREATE TABLE therapy_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  duration_minutes integer,
  type text NOT NULL,
  therapist_name text,
  notes text,
  takeaways text,
  goals text,
  next_session date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE therapy_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own sessions"
  ON therapy_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX therapy_sessions_user_id_idx ON therapy_sessions(user_id);
CREATE INDEX therapy_sessions_date_idx ON therapy_sessions(date);

-- Create updated_at trigger
CREATE TRIGGER update_therapy_sessions_updated_at
  BEFORE UPDATE ON therapy_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();