/*
  # Remove foreign key constraint from exercise_views table

  1. Changes
    - Remove foreign key constraint `exercise_views_exercise_id_fkey` from `exercise_views` table
    
  2. Notes
    - This will allow exercise_views to reference non-existent exercises
    - Consider data integrity implications
*/

ALTER TABLE exercise_views 
DROP CONSTRAINT IF EXISTS exercise_views_exercise_id_fkey;