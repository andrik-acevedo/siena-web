/*
  # Add Analytics Tables

  1. New Tables
    - `user_activity`
      - Tracks user engagement with different features
      - Records time spent, actions taken, and last activity
    - `exercise_progress`
      - Tracks user progress through exercises
      - Records completion status and time spent

  2. Security
    - Enable RLS
    - Add policies for users to manage their own data
*/

-- Create user_activity table
CREATE TABLE user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  feature_type text NOT NULL,
  action_type text NOT NULL,
  duration_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create exercise_progress table
CREATE TABLE exercise_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  exercise_id uuid REFERENCES exercises(id) NOT NULL,
  status text NOT NULL,
  time_spent_seconds integer DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own activity"
  ON user_activity
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own progress"
  ON exercise_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_feature ON user_activity(feature_type);
CREATE INDEX idx_exercise_progress_user ON exercise_progress(user_id);
CREATE INDEX idx_exercise_progress_status ON exercise_progress(status);