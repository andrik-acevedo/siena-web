/*
  # Add Color Index to Bucket Items

  1. Changes
    - Add `color_index` column to couple_bucket_items table
    - Integer value 0-10 representing predefined gradient color schemes
    - Default value 0 for existing items

  2. Notes
    - Allows users to customize visual appearance of bucket list cards
    - Color index maps to gradient definitions in the UI
    - Optional field with sensible default
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'couple_bucket_items' AND column_name = 'color_index'
  ) THEN
    ALTER TABLE couple_bucket_items ADD COLUMN color_index integer DEFAULT 0;
  END IF;
END $$;
