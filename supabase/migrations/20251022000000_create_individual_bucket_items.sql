/*
  # Create Individual Bucket List Table

  1. New Tables
    - `individual_bucket_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `status` (text) - not_started, planning, in_progress, booked, completed
      - `category` (text, nullable)
      - `priority` (integer, nullable) - 1-5
      - `target_date` (date, nullable)
      - `location` (text, nullable)
      - `budget_estimate` (numeric, nullable)
      - `emotional_meaning` (text, nullable)
      - `description` (text, nullable)
      - `completed_at` (date, nullable)
      - `color_index` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `individual_bucket_items` table
    - Add policies for authenticated users to manage their own items
*/

CREATE TABLE IF NOT EXISTS individual_bucket_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'not_started',
  category text,
  priority integer,
  target_date date,
  location text,
  budget_estimate numeric,
  emotional_meaning text,
  description text,
  completed_at date,
  color_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE individual_bucket_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bucket items
CREATE POLICY "Users can view own bucket items"
  ON individual_bucket_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own bucket items
CREATE POLICY "Users can insert own bucket items"
  ON individual_bucket_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own bucket items
CREATE POLICY "Users can update own bucket items"
  ON individual_bucket_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own bucket items
CREATE POLICY "Users can delete own bucket items"
  ON individual_bucket_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_individual_bucket_items_user_id
  ON individual_bucket_items(user_id);

CREATE INDEX IF NOT EXISTS idx_individual_bucket_items_status
  ON individual_bucket_items(status);
