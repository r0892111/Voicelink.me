-- Example Supabase migration for storing OAuth tokens
-- Run this in your Supabase SQL editor if you want to store tokens in the database

-- Create oauth_tokens table
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  provider TEXT NOT NULL DEFAULT 'teamleader',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_provider ON oauth_tokens(user_id, provider);
-- Enable Row Level Security (RLS)
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
-- Create policy to allow users to read their own tokens
CREATE POLICY "Users can read their own tokens"
  ON oauth_tokens FOR SELECT
  USING (auth.uid()::text = user_id);
-- Create policy to allow users to insert their own tokens
CREATE POLICY "Users can insert their own tokens"
  ON oauth_tokens FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);
-- Create policy to allow users to update their own tokens
CREATE POLICY "Users can update their own tokens"
  ON oauth_tokens FOR UPDATE
  USING (auth.uid()::text = user_id);
-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';
-- Create trigger to automatically update updated_at
CREATE TRIGGER update_oauth_tokens_updated_at
  BEFORE UPDATE ON oauth_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
