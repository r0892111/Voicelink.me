-- Tighten test_users RLS by routing the two anon-key access patterns through
-- SECURITY DEFINER RPC functions instead of broad table reads.
--
-- Before: "test_users: anon can select" with USING (true) → any anon caller
-- could SELECT every row, exposing phone numbers / WhatsApp numbers / OTP
-- state across all test users.
--
-- The two flows that legitimately need anon access:
--   1. TestSignup → look up user_id + whatsapp_status by phone (to start
--      the OTP flow without an account).
--   2. TestDashboard → read tl_user_id by phone (to check Teamleader
--      connection status), and clear tl_user_id by phone on revoke.
--
-- Both go through narrow RPCs now: callers can only check a phone they know
-- and only get back the fields the flow actually needs. No way to enumerate.

CREATE OR REPLACE FUNCTION public.lookup_test_user_by_phone(phone_in text)
RETURNS TABLE(user_id text, whatsapp_status text, tl_user_id text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT user_id, whatsapp_status, tl_user_id
  FROM test_users
  WHERE phone = phone_in
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.lookup_test_user_by_phone(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.clear_test_user_tl_link(phone_in text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE test_users SET tl_user_id = NULL, updated_at = now() WHERE phone = phone_in;
END;
$$;
GRANT EXECUTE ON FUNCTION public.clear_test_user_tl_link(text) TO anon, authenticated;

-- Now lock down the underlying table.
DROP POLICY IF EXISTS "test_users: anon can select" ON test_users;
DROP POLICY IF EXISTS test_users_read_own ON test_users;
CREATE POLICY test_users_read_own ON test_users
  FOR SELECT TO authenticated
  USING (tl_user_id = auth.uid()::text);
-- "Users update own test_users row" UPDATE policy stays — keyed on auth.uid().
