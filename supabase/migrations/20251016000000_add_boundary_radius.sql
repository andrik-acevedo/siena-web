/*
  # Add Boundary Radius Column

  1. Changes
    - Add `boundary_radius` column to boundaries table
    - Values represent relationship circles: 'self', 'family', 'friends', 'acquaintances', 'strangers'

  2. Notes
    - This field categorizes boundaries by relationship proximity
    - Based on the circle of trust model (self at center, strangers at outer edge)
    - Optional field, can be null for existing boundaries
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'boundaries' AND column_name = 'boundary_radius'
  ) THEN
    ALTER TABLE boundaries ADD COLUMN boundary_radius text;
  END IF;
END $$;
