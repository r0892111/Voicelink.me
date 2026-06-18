-- Create teamleader_users table if it doesn't exist
-- Links Supabase auth users to Teamleader OAuth tokens

CREATE TABLE IF NOT EXISTS public.teamleader_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  teamleader_user_id TEXT NOT NULL UNIQUE,
  user_info JSONB DEFAULT '{}',
  trial_started_tracked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tokens are stored in oauth_tokens table

-- Enable RLS
ALTER TABLE public.teamleader_users ENABLE ROW LEVEL SECURITY;

-- Users can read their own row
CREATE POLICY "Users can read own teamleader data"
  ON public.teamleader_users
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role (Edge Functions) can do everything
-- RLS is bypassed when using service_role key
