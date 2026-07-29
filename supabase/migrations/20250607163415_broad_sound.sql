/*
  # Add Couples Internal World tables

  1. New Tables
    - `internal_world_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `relationship_id` (uuid, not null)
      - `entry_date` (date, not null)
      - `feelings_about_partner` (text)
      - `thoughts_about_relationship` (text)
      - `thoughts_about_life` (text)
      - `feelings_about_life` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `reconnection_exercises`
      - `id` (uuid, primary key)
      - `relationship_id` (uuid, not null)
      - `entry_date` (date, not null)
      - `partner_a_summary` (text)
      - `partner_b_summary` (text)
      - `shared_themes` (text)
      - `reconnection_prompts` (text)
      - `mindfulness_moment` (text)
      - `audio_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users to manage their own entries
*/

-- Create internal_world_entries table
CREATE TABLE IF NOT EXISTS internal_world_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  relationship_id uuid NOT NULL,
  entry_date date NOT NULL,
  feelings_about_partner text,
  thoughts_about_relationship text,
  thoughts_about_life text,
  feelings_about_life text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reconnection_exercises table
CREATE TABLE IF NOT EXISTS reconnection_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id uuid NOT NULL,
  entry_date date NOT NULL,
  partner_a_summary text,
  partner_b_summary text,
  shared_themes text,
  reconnection_prompts text,
  mindfulness_moment text,
  audio_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE internal_world_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconnection_exercises ENABLE ROW LEVEL SECURITY;

-- Create policies for internal_world_entries
CREATE POLICY "Users can manage their own internal world entries"
  ON internal_world_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for reconnection_exercises
CREATE POLICY "Users can view reconnection exercises for their relationship"
  ON reconnection_exercises
  FOR SELECT
  TO authenticated
  USING (
    relationship_id IN (
      SELECT relationship_id FROM internal_world_entries WHERE user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX internal_world_entries_user_id_idx ON internal_world_entries(user_id);
CREATE INDEX internal_world_entries_relationship_id_idx ON internal_world_entries(relationship_id);
CREATE INDEX internal_world_entries_entry_date_idx ON internal_world_entries(entry_date);
CREATE INDEX reconnection_exercises_relationship_id_idx ON reconnection_exercises(relationship_id);
CREATE INDEX reconnection_exercises_entry_date_idx ON reconnection_exercises(entry_date);

-- Create updated_at trigger for internal_world_entries
CREATE TRIGGER update_internal_world_entries_updated_at
  BEFORE UPDATE ON internal_world_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for reconnection_exercises
CREATE TRIGGER update_reconnection_exercises_updated_at
  BEFORE UPDATE ON reconnection_exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();