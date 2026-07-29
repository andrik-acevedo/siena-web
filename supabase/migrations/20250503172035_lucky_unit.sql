/*
  # Add medication management tables with safety checks

  1. New Tables
    - `medications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text, not null)
      - `dosage` (text, not null)
      - `frequency` (text, not null)
      - `time_of_day` (text, not null)
      - `start_date` (date, not null)
      - `end_date` (date, nullable)
      - `notes` (text, nullable)
      - `refill_date` (date, nullable)
      - `refill_reminder` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `medication_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `medication_id` (uuid, references medications)
      - `date` (date, not null)
      - `time` (time, not null)
      - `taken` (boolean, not null)
      - `notes` (text, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own data
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can manage their own medications" ON medications;
    DROP POLICY IF EXISTS "Users can manage their own medication logs" ON medication_logs;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Create medications table if it doesn't exist
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  time_of_day text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  notes text,
  refill_date date,
  refill_reminder boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create medication_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS medication_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medication_id uuid REFERENCES medications(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  taken boolean NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
    CREATE POLICY "Users can manage their own medications"
        ON medications
        FOR ALL
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can manage their own medication logs"
        ON medication_logs
        FOR ALL
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes if they don't exist
DO $$ 
BEGIN
    CREATE INDEX IF NOT EXISTS medications_user_id_idx ON medications(user_id);
    CREATE INDEX IF NOT EXISTS medications_name_idx ON medications(name);
    CREATE INDEX IF NOT EXISTS medications_refill_date_idx ON medications(refill_date);
    CREATE INDEX IF NOT EXISTS medication_logs_user_id_idx ON medication_logs(user_id);
    CREATE INDEX IF NOT EXISTS medication_logs_medication_id_idx ON medication_logs(medication_id);
    CREATE INDEX IF NOT EXISTS medication_logs_date_idx ON medication_logs(date);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create updated_at trigger if it doesn't exist
DO $$ 
BEGIN
    DROP TRIGGER IF EXISTS update_medications_updated_at ON medications;
    
    CREATE TRIGGER update_medications_updated_at
        BEFORE UPDATE ON medications
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;