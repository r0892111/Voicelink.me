-- Mark certain teamleader_users rows as test accounts so the Dashboard
-- skips the Stripe subscription gate for them.

ALTER TABLE public.teamleader_users
  ADD COLUMN IF NOT EXISTS is_test_user boolean NOT NULL DEFAULT false;

-- Allow authenticated users to update their own row (needed for the
-- AuthCallback to set is_test_user = true after the test OAuth flow).
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'teamleader_users'
      AND policyname = 'Users can update own teamleader row'
  ) THEN
    CREATE POLICY "Users can update own teamleader row"
      ON public.teamleader_users
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;
