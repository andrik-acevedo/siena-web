/*
  # Add card views tracking

  1. New Tables
    - `card_views`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `card_id` (text, not null)
      - `deck_type` (text, not null)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users to:
      - Read their own card views
      - Create their own card views
*/

CREATE TABLE card_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  card_id text NOT NULL,
  deck_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE card_views ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own card views"
  ON card_views
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own card views"
  ON card_views
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX card_views_user_id_idx ON card_views(user_id);
CREATE INDEX card_views_created_at_idx ON card_views(created_at);