/*
  # Add next_session_time column to therapy_sessions table

  1. Changes
    - Add `next_session_time` column to `therapy_sessions` table
    - Add `sms_reminder` column to `therapy_sessions` table for SMS reminder functionality

  2. Security
    - No changes to RLS policies needed as these are just additional columns
*/

-- Add next_session_time column to store the time for the next session
ALTER TABLE therapy_sessions 
ADD COLUMN IF NOT EXISTS next_session_time TIME;

-- Add sms_reminder column to track if SMS reminders are enabled
ALTER TABLE therapy_sessions 
ADD COLUMN IF NOT EXISTS sms_reminder BOOLEAN DEFAULT false;