-- ── catermonkey_mcp_users ─────────────────────────────────────────────────────
-- Portal identity row for a customer who signed up by connecting Catermonkey
-- through its MCP server (VoiceLink plan: VoiceLink repo
-- docs/crm-onboarding/mcp/PLAN-selfserve-signup.md). One row per portal
-- account, keyed by the Supabase auth user like teamleader_users.
--
-- This table holds IDENTITY + WhatsApp verification + billing linkage only.
-- The Catermonkey OAuth tokens live in mcp_connections (VoiceLink backend,
-- service-role only), joined by (server_key='catermonkey', env, vendor_subject)
-- — the same identity/token split hubspot_users ↔ oauth_tokens uses.
--
-- Every column exists because a concrete reader needs it (2026-09-10 audit,
-- re-checked in review):
--   user_id, whatsapp_number, whatsapp_status, whatsapp_otp_code,
--   whatsapp_otp_expires_at, whatsapp_otp_phone, updated_at
--       → supabase/functions/_shared/whatsapp/repository.ts (provider key
--         'catermonkey_mcp' ⇒ table `${provider}_users`, keyed on user_id)
--   stripe_customer_id, is_admin, admin_user_id, promo_end_date
--       → whatsapp-otp trial gate; get-subscription selects all four
--         unconditionally (line 43), so promo_end_date must exist here or
--         the generalized lookup 400s and every user reads as unsubscribed
--   trial_started_tracked            → src/components/AuthCallback.tsx (read +
--                                      anon-client update ⇒ in the column grant)
--   user_info (first_name, last_name, name?, role, email)
--       → src/hooks/useAuth.ts name fallback; useTeamRole.ts
--   deleted_at                       → every dashboard query (.is('deleted_at', null))
--   language, language_locked        → dashboard reply-language setting
--                                      (DashboardLayout.tsx is hardcoded to
--                                      teamleader_users today — Phase 3 generalizes it)
--   vendor_subject, env, whatsapp_number, whatsapp_status
--       → VoiceLink app/transport/twilio_inbound.py phone → tenant resolution
--         (only whatsapp_status = 'active' rows are ever routable)
--   company_id                       → stored for a possible company-level merge
--                                      later (decision D1: per-user accounts today)
--   erasure_due_at                   → GDPR erasure scheduling, parity with teamleader_users
--
-- NOT copied from teamleader_users on purpose: team-invitation columns, entity
-- sync counters, affiliate/ref columns, is_test_user, phone, projects_version,
-- token columns — no reader for this provider. Consequence for D2: the
-- generalized stripe-webhook must branch per provider (it writes
-- access_token/refresh_token onto the users row for Teamleader), not just
-- swap the table name.
--
-- Security posture mirrors 20260501000007_db_wide_rls_hardening.sql and
-- 20260511000003_teamleader_users_language_update_policy.sql: authenticated
-- users may SELECT their own row and UPDATE only (language, language_locked,
-- trial_started_tracked) on it. All other writes go through edge functions /
-- VoiceLink with the service role. No DELETE policy (no client-side reset
-- flow for this provider).
--
-- A parity copy of this DDL lives in the VoiceLink repo as
-- migrations/026_catermonkey_mcp_users.sql; THIS file is canonical.

CREATE TABLE IF NOT EXISTS public.catermonkey_mcp_users (
  user_id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_subject           TEXT NOT NULL,
  company_id               BIGINT,
  user_info                JSONB NOT NULL DEFAULT '{}'::jsonb,
  env                      TEXT NOT NULL DEFAULT 'prod',

  whatsapp_number          TEXT,
  whatsapp_status          TEXT NOT NULL DEFAULT 'not_set',
  whatsapp_otp_code        TEXT,
  whatsapp_otp_expires_at  TIMESTAMPTZ,
  whatsapp_otp_phone       TEXT,

  stripe_customer_id       TEXT,
  is_admin                 BOOLEAN NOT NULL DEFAULT true,
  admin_user_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  trial_started_tracked    BOOLEAN NOT NULL DEFAULT false,
  promo_end_date           TIMESTAMPTZ,

  language                 TEXT NOT NULL DEFAULT 'nl',
  language_locked          BOOLEAN NOT NULL DEFAULT false,

  erasure_due_at           TIMESTAMPTZ,
  deleted_at               TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT catermonkey_mcp_users_env_check
    CHECK (env IN ('dev', 'staging', 'prod', 'test')),
  CONSTRAINT catermonkey_mcp_users_whatsapp_status_check
    CHECK (whatsapp_status IN ('not_set', 'pending', 'active')),
  -- One row per Catermonkey user per env, mirroring the mcp_connections key.
  -- user_id is the PK, so one auth user == one env: a dev and a prod row for
  -- the same Catermonkey login need two auth users (auth.users email is
  -- unique per project) — exactly how Teamleader test accounts work today.
  CONSTRAINT catermonkey_mcp_users_vendor_subject_env_key
    UNIQUE (vendor_subject, env)
);

-- Inbound resolution: phone match on active rows only (the Phase 4 filter).
CREATE INDEX IF NOT EXISTS idx_catermonkey_mcp_users_whatsapp
  ON public.catermonkey_mcp_users (whatsapp_number)
  WHERE whatsapp_number IS NOT NULL AND whatsapp_status = 'active';

CREATE INDEX IF NOT EXISTS idx_catermonkey_mcp_users_env
  ON public.catermonkey_mcp_users (env);

-- updated_at trigger — the same function every portal *_users table uses
-- (defined in 20250606090103 and 20260227120000 with this exact body, so
-- the CREATE OR REPLACE is a no-op here and makes the file standalone elsewhere).
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS catermonkey_mcp_users_updated_at ON public.catermonkey_mcp_users;
CREATE TRIGGER catermonkey_mcp_users_updated_at
  BEFORE UPDATE ON public.catermonkey_mcp_users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.catermonkey_mcp_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own catermonkey_mcp row" ON public.catermonkey_mcp_users;
CREATE POLICY "Users can read own catermonkey_mcp row"
  ON public.catermonkey_mcp_users
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own catermonkey_mcp language" ON public.catermonkey_mcp_users;
CREATE POLICY "Users update own catermonkey_mcp language"
  ON public.catermonkey_mcp_users
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Column-scoped: a hostile client can't flip is_admin / stripe_customer_id.
-- trial_started_tracked is included because AuthCallback.tsx updates it
-- through the anon client; it is a benign analytics flag.
REVOKE UPDATE ON public.catermonkey_mcp_users FROM authenticated;
GRANT UPDATE (language, language_locked, trial_started_tracked)
  ON public.catermonkey_mcp_users TO authenticated;

-- Rollback:
--   DROP TABLE IF EXISTS public.catermonkey_mcp_users;
--   (public.handle_updated_at() is shared — do not drop it.)
