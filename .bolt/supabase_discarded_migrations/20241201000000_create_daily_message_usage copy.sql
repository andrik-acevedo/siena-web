-- Create daily_message_usage table for tracking AI therapist message limits
CREATE TABLE daily_message_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one record per user per day
  UNIQUE(user_id, date)
);

-- Create index for efficient queries
CREATE INDEX idx_daily_message_usage_user_date ON daily_message_usage(user_id, date);

-- Enable RLS
ALTER TABLE daily_message_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own message usage" ON daily_message_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own message usage" ON daily_message_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own message usage" ON daily_message_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_daily_message_usage_updated_at
  BEFORE UPDATE ON daily_message_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 