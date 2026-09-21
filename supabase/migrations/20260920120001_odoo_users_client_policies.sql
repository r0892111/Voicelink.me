-- 20260920120001_odoo_users_client_policies.sql
-- Portal parity copy of VoiceLink migration 033 (one shared database).
--
-- The dashboard reads the account's own odoo_users row with the browser's
-- anon client (useWhatsAppConnect: WhatsApp status; DashboardLayout: language
-- + test flag; useTeamRole: is_admin/admin_user_id) and writes its language
-- preference — exactly like catermonkey_mcp_users (20260910120000). 029
-- enabled RLS with no policies (deny-all), so an Odoo account's dashboard
-- showed WhatsApp "not connected" forever and asked for the language on every
-- visit (trial-first sign-up, 2026-09-20).
--
-- Column-scoped: the API key (access_token), refresh_token, expires_at_unix and
-- the OTP code never reach a browser; a client may change only language,
-- language_locked and trial_started_tracked, on its own row. Every other write
-- stays with the edge functions / VoiceLink (service role, unaffected).
-- Idempotent. Apply via Supabase dashboard → SQL editor, per env project.

BEGIN;

DROP POLICY IF EXISTS "Users can read own odoo row" ON public.odoo_users;
CREATE POLICY "Users can read own odoo row"
  ON public.odoo_users
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own odoo language" ON public.odoo_users;
CREATE POLICY "Users update own odoo language"
  ON public.odoo_users
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

REVOKE ALL ON public.odoo_users FROM anon;
REVOKE ALL ON public.odoo_users FROM authenticated;

GRANT SELECT (
  odoo_user_id, api_domain, odoo_db, odoo_login, odoo_uid, odoo_version,
  user_id, env,
  whatsapp_number, whatsapp_status, whatsapp_otp_phone, whatsapp_otp_expires_at,
  stripe_customer_id, is_admin, admin_user_id, promo_end_date, trial_started_tracked,
  language, language_locked, is_test_user,
  erasure_due_at, deleted_at, created_at, updated_at
) ON public.odoo_users TO authenticated;

GRANT UPDATE (language, language_locked, trial_started_tracked)
  ON public.odoo_users TO authenticated;

-- The account owner is its own admin. 029 defaulted is_admin to false and the
-- dashboard reads a non-admin row as a TEAM MEMBER (useTeamRole: isMember =
-- !is_admin) — every Odoo account was "awaiting admin", with no trial banner
-- and no Start Trial First (Playwright, 2026-09-20). catermonkey_mcp_users
-- defaults to true; same here, and existing rows without an admin get it.
ALTER TABLE public.odoo_users ALTER COLUMN is_admin SET DEFAULT true;
UPDATE public.odoo_users SET is_admin = true WHERE admin_user_id IS NULL AND is_admin = false;

COMMIT;

-- ── Rollback (manual) ────────────────────────────────────────────────────────
-- BEGIN;
-- DROP POLICY IF EXISTS "Users can read own odoo row" ON public.odoo_users;
-- DROP POLICY IF EXISTS "Users update own odoo language" ON public.odoo_users;
-- GRANT ALL ON public.odoo_users TO anon;          -- the pre-033 default grants
-- GRANT ALL ON public.odoo_users TO authenticated; -- (RLS with no policies still denied every row)
-- ALTER TABLE public.odoo_users ALTER COLUMN is_admin SET DEFAULT false;
-- COMMIT;
