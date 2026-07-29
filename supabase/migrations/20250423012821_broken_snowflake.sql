/*
  # Remove exercise_progress and subscriptions tables

  1. Changes
    - Drop exercise_progress table and its dependencies
    - Drop subscriptions table and its dependencies
    - Clean up any related foreign key constraints
*/

-- First drop any foreign key constraints
ALTER TABLE exercise_progress
DROP CONSTRAINT IF EXISTS exercise_progress_user_id_fkey,
DROP CONSTRAINT IF EXISTS exercise_progress_exercise_id_fkey;

ALTER TABLE subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;

-- Drop the tables
DROP TABLE IF EXISTS exercise_progress;
DROP TABLE IF EXISTS subscriptions;

-- Remove any related indexes
DROP INDEX IF EXISTS idx_exercise_progress_user;
DROP INDEX IF EXISTS idx_exercise_progress_status;
DROP INDEX IF EXISTS subscriptions_user_id_idx;
DROP INDEX IF EXISTS subscriptions_status_idx;
DROP INDEX IF EXISTS subscriptions_stripe_subscription_id_key;