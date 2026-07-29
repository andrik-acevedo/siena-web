/*
  # Create intimacy wheel history table

  1. New Tables
    - `intimacy_wheel_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `date` (date)
      - `scores` (jsonb)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `intimacy_wheel_history` table
    - Add policies for authenticated users to:
      - Insert their own entries
      - Select their own entries
      - Delete their own entries

  3. Indexes
    - Index on user_id and date for efficient querying
*/

-- Create the intimacy wheel history table
CREATE TABLE IF NOT EXISTS public.intimacy_wheel_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  scores jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS intimacy_wheel_history_user_id_idx ON public.intimacy_wheel_history(user_id);
CREATE INDEX IF NOT EXISTS intimacy_wheel_history_date_idx ON public.intimacy_wheel_history(date);
CREATE INDEX IF NOT EXISTS intimacy_wheel_history_user_id_date_idx ON public.intimacy_wheel_history(user_id, date);

-- Enable Row Level Security
ALTER TABLE public.intimacy_wheel_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own entries"
  ON public.intimacy_wheel_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own entries"
  ON public.intimacy_wheel_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
  ON public.intimacy_wheel_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);