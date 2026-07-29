/*
  # Add Status and Color to Dating Tracker

  1. Changes
    - Add `status` column to `date_entries` table
      - Values: 'sparks', 'first_dates', 'getting_to_know', 'exclusive', 'pause_or_let_go'
      - Default: 'sparks'
    - Add `color_index` column to `date_entries` table
      - Integer for gradient color selection
      - Default: 0

  2. Notes
    - Allows tracking progression of dating connections
    - Allows personalized card colors
    - No data loss, existing entries default to 'sparks' and color 0
*/

-- Add status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'date_entries' AND column_name = 'status'
  ) THEN
    ALTER TABLE date_entries ADD COLUMN status text DEFAULT 'sparks';
  END IF;
END $$;

-- Add color_index column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'date_entries' AND column_name = 'color_index'
  ) THEN
    ALTER TABLE date_entries ADD COLUMN color_index integer DEFAULT 0;
  END IF;
END $$;

-- Create index for status
CREATE INDEX IF NOT EXISTS date_entries_status_idx ON date_entries(status);
