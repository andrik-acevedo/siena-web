/*
  # Update exercise_views table structure

  1. Changes
    - Remove foreign key constraint from exercise_id column
    - Change exercise_id column type to text
    
  2. Notes
    - This allows more flexibility in exercise references
    - Maintains existing data while changing structure
*/

-- Remove foreign key constraint if it exists
ALTER TABLE exercise_views 
DROP CONSTRAINT IF EXISTS exercise_views_exercise_id_fkey;

-- Change column type to text
ALTER TABLE exercise_views
ALTER COLUMN exercise_id TYPE text USING exercise_id::text;