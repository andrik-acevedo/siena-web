/*
  # Create sleep entries table

  1. New Tables
    - `sleep_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `date` (date, not null)
      - `sleep_time` (time, not null)
      - `wake_time` (time, not null)
      - `quality` (integer, 1-5, not null)
      - `notes` (text, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for users to manage their own entries
*/

-- Create the sleep_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.sleep_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date date NOT NULL,
    sleep_time time without time zone NOT NULL,
    wake_time time without time zone NOT NULL,
    quality integer NOT NULL CHECK (quality >= 1 AND quality <= 5),
    notes text,
    created_at timestamptz DEFAULT now()
);

-- Create indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'sleep_entries' 
    AND indexname = 'sleep_entries_user_id_idx'
  ) THEN
    CREATE INDEX sleep_entries_user_id_idx ON public.sleep_entries(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'sleep_entries' 
    AND indexname = 'sleep_entries_date_idx'
  ) THEN
    CREATE INDEX sleep_entries_date_idx ON public.sleep_entries(date);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'sleep_entries' 
    AND indexname = 'sleep_entries_quality_idx'
  ) THEN
    CREATE INDEX sleep_entries_quality_idx ON public.sleep_entries(quality);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.sleep_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can manage their own sleep entries" ON public.sleep_entries;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create RLS policy
CREATE POLICY "Users can manage their own sleep entries"
    ON public.sleep_entries
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);