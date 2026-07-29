/*
  # Modify exercise_id columns and constraints

  1. Changes
    - Drop all foreign key constraints that reference exercises.id
    - Change exercise_id columns to text type
    - Change exercises.id to text type
    - Recreate all foreign key constraints
    
  2. Security
    - Maintain existing RLS policies
*/

-- Drop all foreign key constraints first
ALTER TABLE exercise_views
DROP CONSTRAINT IF EXISTS exercise_views_exercise_id_fkey;

ALTER TABLE exercise_progress
DROP CONSTRAINT IF EXISTS exercise_progress_exercise_id_fkey;

-- Change the exercise_id columns to text
ALTER TABLE exercise_views
ALTER COLUMN exercise_id TYPE text USING exercise_id::text;

ALTER TABLE exercise_progress
ALTER COLUMN exercise_id TYPE text USING exercise_id::text;

-- Change the exercises table id column to text
ALTER TABLE exercises
ALTER COLUMN id TYPE text USING id::text;

-- Recreate the foreign key constraints
ALTER TABLE exercise_views
ADD CONSTRAINT exercise_views_exercise_id_fkey
FOREIGN KEY (exercise_id) REFERENCES exercises(id);

ALTER TABLE exercise_progress
ADD CONSTRAINT exercise_progress_exercise_id_fkey
FOREIGN KEY (exercise_id) REFERENCES exercises(id);