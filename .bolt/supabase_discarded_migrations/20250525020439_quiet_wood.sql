/*
  # Add date tracking to chat history

  1. Changes
    - Add date column to chat_history table
    - Add daily_message_count column to track messages per day
    - Create indexes for efficient date-based queries
    - Set default values and constraints
*/

-- Add date column if it doesn't exist
ALTER TABLE chat_history
ADD COLUMN IF NOT EXISTS date date;

-- Create index on date column
CREATE INDEX IF NOT EXISTS chat_history_date_idx ON chat_history(date);

-- Backfill existing records
UPDATE chat_history
SET date = (created_at AT TIME ZONE 'UTC')::date
WHERE date IS NULL;

-- Set default value for future records
ALTER TABLE chat_history
ALTER COLUMN date SET DEFAULT CURRENT_DATE;

-- Make date column not null for future records
ALTER TABLE chat_history
ALTER COLUMN date SET NOT NULL;

-- Add daily_message_count column to track messages per day
ALTER TABLE chat_history
ADD COLUMN IF NOT EXISTS daily_message_count integer DEFAULT 1;

-- Create index for message count queries
CREATE INDEX IF NOT EXISTS chat_history_user_id_date_idx ON chat_history(user_id, date);