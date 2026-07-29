/*
  # Create scheduled reminders table

  1. New Tables
    - `scheduled_reminders`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key to therapy_sessions)
      - `phone_number` (text)
      - `message` (text)
      - `scheduled_time` (timestamptz)
      - `status` (text) - pending, sent, failed
      - `sent_at` (timestamptz, nullable)
      - `message_id` (text, nullable) - Twilio message ID
      - `error_message` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `scheduled_reminders` table
    - Add policies for system access only (no user access needed)

  3. Indexes
    - Index on status and scheduled_time for efficient querying
*/

CREATE TABLE IF NOT EXISTS scheduled_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES therapy_sessions(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  message text NOT NULL,
  scheduled_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at timestamptz,
  message_id text,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE scheduled_reminders ENABLE ROW LEVEL SECURITY;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS scheduled_reminders_status_time_idx 
ON scheduled_reminders (status, scheduled_time);

CREATE INDEX IF NOT EXISTS scheduled_reminders_session_id_idx 
ON scheduled_reminders (session_id);

-- Add trigger for updated_at
CREATE TRIGGER update_scheduled_reminders_updated_at
  BEFORE UPDATE ON scheduled_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- No user policies needed - this table is managed by system functions only
-- The Edge Functions use the service role key to access this table