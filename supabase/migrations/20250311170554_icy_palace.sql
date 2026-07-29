/*
  # Create chat history table

  1. New Tables
    - `chat_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `messages` (jsonb array of chat messages)
      - `created_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `chat_history` table
    - Add policy for users to read their own chat history
    - Add policy for users to insert their own chat history
*/

CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  messages jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own chat history"
  ON chat_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history"
  ON chat_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX chat_history_user_id_created_at_idx ON chat_history (user_id, created_at);