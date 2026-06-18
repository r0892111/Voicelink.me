-- ── teamleader_users self-update for language preference ────────────────────
-- The dashboard lets the user pick / change their reply language. Without an
-- UPDATE policy + column grants the client write silently no-ops under RLS
-- (PostgREST returns 0 rows affected, no error), and the language modal
-- keeps reappearing on every visit.
--
-- Grant column-level UPDATE only on (language, language_locked) so a hostile
-- client can't flip is_admin, stripe_customer_id, or any other security-
-- sensitive column. RLS still scopes writes to the user's own row.
--
-- Rollback:
--   DROP POLICY "Users update own language" ON teamleader_users;
--   REVOKE UPDATE (language, language_locked) ON teamleader_users FROM authenticated;

DROP POLICY IF EXISTS "Users update own language" ON teamleader_users;
CREATE POLICY "Users update own language" ON teamleader_users
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

REVOKE UPDATE ON teamleader_users FROM authenticated;
GRANT UPDATE (language, language_locked) ON teamleader_users TO authenticated;
