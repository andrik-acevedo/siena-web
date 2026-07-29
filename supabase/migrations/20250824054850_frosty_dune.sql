/*
  # Add color column to habits table

  1. Schema Changes
    - Add `color` column to `habits` table with default gradient color
    - Update existing habits to have default colors

  2. Data Migration
    - Set default colors for existing habits if any exist
*/

-- Add color column to habits table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habits' AND column_name = 'color'
  ) THEN
    ALTER TABLE habits ADD COLUMN color text NOT NULL DEFAULT 'from-[#01B1AF] to-[#018a88]';
  END IF;
END $$;

-- Update existing habits with default colors (if any exist)
UPDATE habits 
SET color = CASE 
  WHEN id IN (
    SELECT id FROM habits ORDER BY created_at LIMIT 1 OFFSET 0
  ) THEN 'from-[#e88584] to-[#8e4f63]'
  WHEN id IN (
    SELECT id FROM habits ORDER BY created_at LIMIT 1 OFFSET 1
  ) THEN 'from-[#0068aa] to-[#004d7f]'
  WHEN id IN (
    SELECT id FROM habits ORDER BY created_at LIMIT 1 OFFSET 2
  ) THEN 'from-[#FFA600] to-[#B36B00]'
  WHEN id IN (
    SELECT id FROM habits ORDER BY created_at LIMIT 1 OFFSET 3
  ) THEN 'from-[#B1E006] to-[#6C8300]'
  ELSE 'from-[#01B1AF] to-[#018a88]'
END
WHERE color = 'from-[#01B1AF] to-[#018a88]';