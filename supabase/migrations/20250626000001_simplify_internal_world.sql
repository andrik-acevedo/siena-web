/*
  # Simplify Internal World for profiles.invited_by relationship model

  1. Changes
    - Remove relationship_id requirement from internal_world_entries
    - Update reconnection_exercises to use premium_user_id instead of relationship_id
    - Update policies to work with the simplified model
    - Clean up old relationship_id based data

  This simplifies the internal world system to work directly with the 
  profiles.invited_by relationship without needing complex relationship_id generation.
*/

-- First, let's see what data exists and clean it up
-- Remove any existing internal_world_entries that might have invalid relationship_ids
DELETE FROM internal_world_entries WHERE relationship_id IS NOT NULL;

-- Remove any existing reconnection_exercises 
DELETE FROM reconnection_exercises WHERE relationship_id IS NOT NULL;

-- Drop all policies that might depend on relationship_id columns
DROP POLICY IF EXISTS "Users can view reconnection exercises for their relationship" ON reconnection_exercises;
DROP POLICY IF EXISTS "Users can manage their own internal world entries" ON internal_world_entries;

-- Drop indexes that depend on relationship_id
DROP INDEX IF EXISTS internal_world_entries_relationship_id_idx;
DROP INDEX IF EXISTS reconnection_exercises_relationship_id_idx;

-- Now safely drop the relationship_id columns
ALTER TABLE internal_world_entries DROP COLUMN IF EXISTS relationship_id CASCADE;
ALTER TABLE reconnection_exercises DROP COLUMN IF EXISTS relationship_id CASCADE;

-- Add premium_user_id column to reconnection_exercises
ALTER TABLE reconnection_exercises ADD COLUMN IF NOT EXISTS premium_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create new simplified policies for internal_world_entries
CREATE POLICY "Users can manage their own internal world entries"
  ON internal_world_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create new policies for reconnection_exercises
CREATE POLICY "Premium users can manage their reconnection exercises"
  ON reconnection_exercises
  FOR ALL
  TO authenticated
  USING (auth.uid() = premium_user_id)
  WITH CHECK (auth.uid() = premium_user_id);

CREATE POLICY "Invited users can view reconnection exercises"
  ON reconnection_exercises
  FOR SELECT
  TO authenticated
  USING (
    premium_user_id IN (
      SELECT invited_by FROM profiles WHERE id = auth.uid()
    )
  );

-- Create new indexes
CREATE INDEX IF NOT EXISTS reconnection_exercises_premium_user_id_idx ON reconnection_exercises(premium_user_id);

-- Add constraint to ensure premium_user_id is not null for new records
-- First, handle any existing NULL values
UPDATE reconnection_exercises SET premium_user_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE premium_user_id IS NULL;

-- Now add the NOT NULL constraint
ALTER TABLE reconnection_exercises ALTER COLUMN premium_user_id SET NOT NULL; 