/*
  # Add sleep tracking tables

  1. New Tables
    - `sleep_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `date` (date, not null)
      - `sleep_time` (time, not null)
      - `wake_time` (time, not null)
      - `quality` (integer, 1-5 scale)
      - `notes` (text, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users to manage their own sleep entries
*/

-- Create sleep_entries table
CREATE TABLE IF NOT EXISTS sleep_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  sleep_time time NOT NULL,
  wake_time time NOT NULL,
  quality integer NOT NULL CHECK (quality BETWEEN 1 AND 5),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sleep_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own sleep entries"
  ON sleep_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX sleep_entries_user_id_idx ON sleep_entries(user_id);
CREATE INDEX sleep_entries_date_idx ON sleep_entries(date);
CREATE INDEX sleep_entries_quality_idx ON sleep_entries(quality);