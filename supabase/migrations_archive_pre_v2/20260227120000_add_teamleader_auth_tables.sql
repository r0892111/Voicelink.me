-- Add tables required for Teamleader OAuth auth flow
-- Tokens stored in oauth_tokens; this adds users + teamleader_users mapping

-- 1. Users table (profiles linked to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  webhook text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON public.users FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON public.users FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- handle_updated_at for users
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. teamleader_users (mapping teamleader_id -> user_id, no tokens)
CREATE TABLE IF NOT EXISTS public.teamleader_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teamleader_id text UNIQUE NOT NULL,
  user_info jsonb,
  trial_started_tracked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.teamleader_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own TeamLeader data"
  ON public.teamleader_users FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own TeamLeader data"
  ON public.teamleader_users FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own TeamLeader data"
  ON public.teamleader_users FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_teamleader_users_user_id ON public.teamleader_users(user_id);
CREATE INDEX IF NOT EXISTS idx_teamleader_users_teamleader_id ON public.teamleader_users(teamleader_id);

CREATE TRIGGER teamleader_users_updated_at
  BEFORE UPDATE ON public.teamleader_users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Ensure oauth_tokens has unique constraint for upsert (user_id, provider)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'oauth_tokens' AND c.conname = 'oauth_tokens_user_provider_unique'
  ) THEN
    ALTER TABLE public.oauth_tokens
    ADD CONSTRAINT oauth_tokens_user_provider_unique UNIQUE (user_id, provider);
  END IF;
END $$;
