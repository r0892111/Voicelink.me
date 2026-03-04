-- Store Teamleader OAuth tokens directly on test_users rows so test accounts
-- never need a teamleader_users row or an auth.users identity.

ALTER TABLE public.test_users
  ADD COLUMN IF NOT EXISTS teamleader_id        text,
  ADD COLUMN IF NOT EXISTS tl_access_token      text,
  ADD COLUMN IF NOT EXISTS tl_refresh_token     text,
  ADD COLUMN IF NOT EXISTS tl_token_expires_at  timestamptz;

-- Allow the edge function (service role) to update tokens via anon/service key.
-- The existing SELECT policy already covers reading; we add UPDATE for service role.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'test_users' AND policyname = 'test_users: service role can update'
  ) THEN
    CREATE POLICY "test_users: service role can update"
      ON public.test_users
      FOR UPDATE
      TO service_role
      USING (true);
  END IF;
END $$;
