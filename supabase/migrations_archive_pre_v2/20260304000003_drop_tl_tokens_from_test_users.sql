-- Revert: test users are now stored in teamleader_users (is_test_user = true)
-- and their tokens go in oauth_tokens like all other users.
-- The test_users table reverts to a phone whitelist + WhatsApp OTP store only.

ALTER TABLE public.test_users
  DROP COLUMN IF EXISTS teamleader_id,
  DROP COLUMN IF EXISTS tl_access_token,
  DROP COLUMN IF EXISTS tl_refresh_token,
  DROP COLUMN IF EXISTS tl_token_expires_at;

-- Drop the UPDATE policy added for the old approach (service_role bypasses RLS anyway)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'test_users' AND policyname = 'test_users: service role can update'
  ) THEN
    DROP POLICY "test_users: service role can update" ON public.test_users;
  END IF;
END $$;
