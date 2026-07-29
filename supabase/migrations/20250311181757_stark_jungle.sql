/*
  # Create chat history table and security policies

  1. New Tables
    - `chat_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `messages` (jsonb array of chat messages)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

  2. Security
    - Enable RLS
    - Add policies for users to manage their own chat history
*/

-- Create chat history table
CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own chat history"
  ON chat_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own chat history"
  ON chat_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat history"
  ON chat_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_history_updated_at
  BEFORE UPDATE ON chat_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();