/*
  # Add mood column to therapy sessions

  1. Changes
    - Add mood column to therapy_sessions table
    - Add index for efficient querying
*/

-- Add mood column
ALTER TABLE therapy_sessions
ADD COLUMN IF NOT EXISTS mood text;

-- Create index for mood column
CREATE INDEX IF NOT EXISTS therapy_sessions_mood_idx ON therapy_sessions(mood);