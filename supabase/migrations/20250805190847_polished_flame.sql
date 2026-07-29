/*
  # Create affiliate applications table

  1. New Tables
    - `affiliate_applications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `first_name` (varchar)
      - `last_name` (varchar)
      - `email` (varchar)
      - `phone` (varchar, nullable)
      - `profession` (varchar)
      - `license_number` (varchar, nullable)
      - `license_state` (varchar, nullable)
      - `years_experience` (varchar)
      - `practice_name` (varchar, nullable)
      - `practice_address` (text, nullable)
      - `practice_website` (varchar, nullable)
      - `estimated_referrals` (varchar)
      - `referral_experience` (text, nullable)
      - `why_interested` (text)
      - `additional_info` (text, nullable)
      - `status` (varchar, default 'pending')
      - `reviewed_by` (uuid, nullable)
      - `reviewed_at` (timestamptz, nullable)
      - `rejection_reason` (text, nullable)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `affiliate_applications` table
    - Add policy for users to manage their own applications
    - Add policy for admins to view and manage all applications
*/

CREATE TABLE IF NOT EXISTS affiliate_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  first_name character varying(100) NOT NULL,
  last_name character varying(100) NOT NULL,
  email character varying(255) NOT NULL,
  phone character varying(20),
  profession character varying(100) NOT NULL,
  license_number character varying(100),
  license_state character varying(50),
  years_experience character varying(20) NOT NULL,
  practice_name character varying(200),
  practice_address text,
  practice_website character varying(255),
  estimated_referrals character varying(50) NOT NULL,
  referral_experience text,
  why_interested text NOT NULL,
  additional_info text,
  status character varying(20) DEFAULT 'pending' NOT NULL,
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE affiliate_applications ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own applications
CREATE POLICY "Users can manage their own applications"
  ON affiliate_applications
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy for admins to view and manage all applications
CREATE POLICY "Admins can manage all applications"
  ON affiliate_applications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_applications_user_id ON affiliate_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_applications_email ON affiliate_applications(email);
CREATE INDEX IF NOT EXISTS idx_affiliate_applications_status ON affiliate_applications(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_applications_created_at ON affiliate_applications(created_at);

-- Add constraint to ensure valid status values
ALTER TABLE affiliate_applications 
ADD CONSTRAINT affiliate_applications_status_check 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_affiliate_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_affiliate_applications_updated_at
  BEFORE UPDATE ON affiliate_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_applications_updated_at();