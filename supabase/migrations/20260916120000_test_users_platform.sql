-- 20260916120000_test_users_platform.sql
--
-- A test slot carries the CRM it is for. Until now every slot on
-- public.test_users was implicitly a Teamleader slot: /test verified the
-- phone by OTP and then always started Teamleader OAuth. The tester page
-- now lives at /test/<platform> and the slot's platform must match the URL,
-- so a Catermonkey slot can never be redeemed as a Teamleader account and
-- vice versa (plan: VoiceLink docs/crm-onboarding/PLAN-test-accounts-per-crm.md,
-- decision D2).
--
-- Allowed values = the portal's Platform union (src/hooks/useAuth.ts).
-- Existing rows default to 'teamleader' — nothing changes for them.
--
-- The lookup RPC gains the column in its return type, which Postgres only
-- allows through DROP + CREATE. Grants and SECURITY DEFINER are restated
-- verbatim from 20260501000008_test_users_secure_rpc.sql.
--
-- Rollback: DROP the recreated function, recreate the 3-column version from
-- 20260501000008, ALTER TABLE public.test_users DROP COLUMN platform.

ALTER TABLE public.test_users
  ADD COLUMN IF NOT EXISTS platform text NOT NULL DEFAULT 'teamleader';

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'test_users_platform_check'
  ) THEN
    ALTER TABLE public.test_users
      ADD CONSTRAINT test_users_platform_check
      CHECK (platform IN ('teamleader', 'pipedrive', 'odoo', 'catermonkey_mcp'));
  END IF;
END $$;

COMMENT ON COLUMN public.test_users.platform IS
  'CRM this slot is for; /test/<platform> refuses a slot whose platform differs (PLAN-test-accounts-per-crm D2).';
COMMENT ON COLUMN public.test_users.tl_user_id IS
  'Portal auth user id of the account created from this slot — any platform, despite the historical tl_ prefix.';

DROP FUNCTION IF EXISTS public.lookup_test_user_by_phone(text);

CREATE OR REPLACE FUNCTION public.lookup_test_user_by_phone(phone_in text)
RETURNS TABLE(user_id text, whatsapp_status text, tl_user_id text, platform text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT user_id, whatsapp_status, tl_user_id, platform
  FROM test_users
  WHERE phone = phone_in
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_test_user_by_phone(text) TO anon, authenticated;

