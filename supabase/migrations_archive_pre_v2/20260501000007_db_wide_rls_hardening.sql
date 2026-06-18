-- DB-wide RLS hardening — close the gaps left after the credit-checker
-- tables were locked down in 005.
--
-- Reasoning per table:
--
-- analytics: anon could DELETE rows to wipe their usage and bypass the
--   credit gate. SELECT only own rows via teamleader_id ↔ auth.uid mapping.
--   Writes are service-role-only (VLAgent backend).
--
-- feedback: contains user_prompts that may be sensitive. No per-row scoping
--   field exists. Frontend doesn't read/write it; the /feedback WhatsApp
--   command writes via service role. Lock to service-role-only entirely.
--
-- teamleader_users: existing UPDATE policies allowed users to mutate their
--   own row. That row holds stripe_customer_id, is_admin, is_test_user,
--   admin_user_id — all privilege-escalation fields. A user could swap
--   stripe_customer_id to someone else's customer and consume their plan
--   credits. Audited: no React anon-key code does .update() on this table
--   — all writes go through edge functions with service role. Drop the
--   direct INSERT/UPDATE policies. SELECT (own row) stays. DELETE (own row)
--   stays for the TestDashboard reset flow.
--
-- oauth_tokens: contains Teamleader access_token + refresh_token. Existing
--   policies allowed users to SELECT/INSERT/UPDATE their own tokens via the
--   anon key — but no client-side code reads tokens directly (edge functions
--   handle all token use with service role). Drop SELECT/INSERT/UPDATE.
--   DELETE stays for the TestDashboard reset flow.

-- ── analytics ────────────────────────────────────────────────────────────────
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS analytics_read_own ON analytics;
CREATE POLICY analytics_read_own ON analytics
  FOR SELECT TO authenticated
  USING (
    user_id IN (
      SELECT teamleader_id FROM teamleader_users
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- ── feedback ─────────────────────────────────────────────────────────────────
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
-- No policies = anon/authenticated denied; service role bypasses.

-- ── teamleader_users — drop direct INSERT/UPDATE policies ───────────────────
DROP POLICY IF EXISTS "Users can insert their own TeamLeader data" ON teamleader_users;
DROP POLICY IF EXISTS "Users can update own teamleader row" ON teamleader_users;
DROP POLICY IF EXISTS "Users can update their own TeamLeader data" ON teamleader_users;
-- SELECT ("Users can view their own TeamLeader data") and DELETE
-- ("Users delete own teamleader row") policies are intentionally left in
-- place — both are scoped to the user's own row and are used by the dashboard.

-- ── oauth_tokens — drop SELECT/INSERT/UPDATE policies ───────────────────────
DROP POLICY IF EXISTS "Users can read their own tokens" ON oauth_tokens;
DROP POLICY IF EXISTS "Users can insert their own tokens" ON oauth_tokens;
DROP POLICY IF EXISTS "Users can update their own tokens" ON oauth_tokens;
-- DELETE ("Users delete own oauth tokens") policy stays.
