/*
  # Create Couple Activity Tracking Tables

  1. New Tables
    - `couple_activity_types`
      - `id` (uuid, primary key)
      - `owner_user_id` (uuid, foreign key to profiles)
      - `name` (text)
      - `color` (text) - hex color for UI display
      - `created_at` (timestamptz)

    - `couple_activity_logs`
      - `id` (uuid, primary key)
      - `owner_user_id` (uuid, foreign key to profiles)
      - `activity_type_id` (uuid, foreign key to couple_activity_types)
      - `activity_date` (date) - the date the activity occurred
      - `count` (integer, nullable) - number of times this activity occurred
      - `intensity` (integer, nullable) - intensity/rating of the activity
      - `notes` (text, nullable)
      - `created_by_user_id` (uuid, nullable, foreign key to profiles)
      - `created_at` (timestamptz)

    - `couple_activity_settings`
      - `owner_user_id` (uuid, primary key, foreign key to profiles)
      - `share_with_partner` (boolean) - whether to share activity with partner
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for partners to view shared data
*/

-- Create couple_activity_types table
CREATE TABLE IF NOT EXISTS couple_activity_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create couple_activity_logs table
CREATE TABLE IF NOT EXISTS couple_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type_id uuid NOT NULL REFERENCES couple_activity_types(id) ON DELETE CASCADE,
  activity_date date NOT NULL,
  count integer DEFAULT 1,
  intensity integer,
  notes text,
  created_by_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create couple_activity_settings table
CREATE TABLE IF NOT EXISTS couple_activity_settings (
  owner_user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  share_with_partner boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_couple_activity_types_owner ON couple_activity_types(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_couple_activity_logs_owner ON couple_activity_logs(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_couple_activity_logs_date ON couple_activity_logs(activity_date);
CREATE INDEX IF NOT EXISTS idx_couple_activity_logs_type ON couple_activity_logs(activity_type_id);

-- Enable Row Level Security
ALTER TABLE couple_activity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_activity_settings ENABLE ROW LEVEL SECURITY;

-- Policies for couple_activity_types

-- Users can view their own types
CREATE POLICY "Users can view own activity types"
  ON couple_activity_types FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_user_id);

-- Partners can view types if sharing is enabled
CREATE POLICY "Partners can view shared activity types"
  ON couple_activity_types FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.invited_by = couple_activity_types.owner_user_id
      AND EXISTS (
        SELECT 1 FROM couple_activity_settings
        WHERE couple_activity_settings.owner_user_id = couple_activity_types.owner_user_id
        AND couple_activity_settings.share_with_partner = true
      )
    )
  );

-- Users can insert their own types
CREATE POLICY "Users can insert own activity types"
  ON couple_activity_types FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_user_id);

-- Users can update their own types
CREATE POLICY "Users can update own activity types"
  ON couple_activity_types FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- Users can delete their own types
CREATE POLICY "Users can delete own activity types"
  ON couple_activity_types FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_user_id);

-- Policies for couple_activity_logs

-- Users can view their own logs
CREATE POLICY "Users can view own activity logs"
  ON couple_activity_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_user_id);

-- Partners can view logs if sharing is enabled
CREATE POLICY "Partners can view shared activity logs"
  ON couple_activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.invited_by = couple_activity_logs.owner_user_id
      AND EXISTS (
        SELECT 1 FROM couple_activity_settings
        WHERE couple_activity_settings.owner_user_id = couple_activity_logs.owner_user_id
        AND couple_activity_settings.share_with_partner = true
      )
    )
  );

-- Users can insert logs to their own activity types
CREATE POLICY "Users can insert own activity logs"
  ON couple_activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_user_id);

-- Partners can insert logs if sharing is enabled
CREATE POLICY "Partners can insert shared activity logs"
  ON couple_activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.invited_by = couple_activity_logs.owner_user_id
      AND EXISTS (
        SELECT 1 FROM couple_activity_settings
        WHERE couple_activity_settings.owner_user_id = couple_activity_logs.owner_user_id
        AND couple_activity_settings.share_with_partner = true
      )
    )
  );

-- Users can update their own logs
CREATE POLICY "Users can update own activity logs"
  ON couple_activity_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- Partners can update shared logs
CREATE POLICY "Partners can update shared activity logs"
  ON couple_activity_logs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.invited_by = couple_activity_logs.owner_user_id
      AND EXISTS (
        SELECT 1 FROM couple_activity_settings
        WHERE couple_activity_settings.owner_user_id = couple_activity_logs.owner_user_id
        AND couple_activity_settings.share_with_partner = true
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.invited_by = couple_activity_logs.owner_user_id
      AND EXISTS (
        SELECT 1 FROM couple_activity_settings
        WHERE couple_activity_settings.owner_user_id = couple_activity_logs.owner_user_id
        AND couple_activity_settings.share_with_partner = true
      )
    )
  );

-- Users can delete their own logs
CREATE POLICY "Users can delete own activity logs"
  ON couple_activity_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_user_id);

-- Partners can delete shared logs
CREATE POLICY "Partners can delete shared activity logs"
  ON couple_activity_logs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.invited_by = couple_activity_logs.owner_user_id
      AND EXISTS (
        SELECT 1 FROM couple_activity_settings
        WHERE couple_activity_settings.owner_user_id = couple_activity_logs.owner_user_id
        AND couple_activity_settings.share_with_partner = true
      )
    )
  );

-- Policies for couple_activity_settings

-- Users can view their own settings
CREATE POLICY "Users can view own activity settings"
  ON couple_activity_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_user_id);

-- Users can insert their own settings
CREATE POLICY "Users can insert own activity settings"
  ON couple_activity_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_user_id);

-- Users can update their own settings
CREATE POLICY "Users can update own activity settings"
  ON couple_activity_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- Users can delete their own settings
CREATE POLICY "Users can delete own activity settings"
  ON couple_activity_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_user_id);
