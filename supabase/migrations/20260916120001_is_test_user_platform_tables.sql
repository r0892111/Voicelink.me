-- 20260916120001_is_test_user_platform_tables.sql
--
-- The test-user flag exists on teamleader_users only
-- (20260304000001_add_is_test_user_to_teamleader_users.sql). Test accounts
-- for the other platforms need the same flag on their own users table: the
-- dashboard's SubscriptionGate / DashboardHome read it through
-- DashboardLayout.checkSubscription, which now selects it from the
-- platform's own table (VoiceLink docs/crm-onboarding/PLAN-test-accounts-per-crm.md, D5).
--
-- CANONICAL here; VoiceLink keeps the same change as
-- migrations/031_is_test_user_platform_tables.sql (its monitor reads the
-- column to show which accounts are test accounts).
--
-- odoo_users: this project dropped the table in 20260228000001_drop_pipedrive_odoo.sql;
-- the Odoo adapter recreates it from VoiceLink migrations/029_odoo_users.sql
-- when that track reaches production. The ALTER is therefore conditional
-- here so this migration applies cleanly whether or not 029 has run yet.
-- Applied migrations never re-run: whoever recreates odoo_users on this
-- project must add the column then (a new migration or by hand) AND keep
-- the table's own-row UPDATE policy column-scoped (language, language_locked,
-- …) the way 20260910120000 does for catermonkey_mcp_users — a full-row
-- update policy would let a user flip their own is_test_user.
--
-- Additive; the existing "own row" select policies expose the column
-- without a policy change. Rollback: DROP COLUMN on both tables.

ALTER TABLE public.catermonkey_mcp_users
  ADD COLUMN IF NOT EXISTS is_test_user boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.catermonkey_mcp_users.is_test_user IS
  'Test account created from a /test/catermonkey slot: no trial, no paywall (set only by catermonkey-mcp-auth after verifying the slot).';

DO $$ BEGIN
  IF to_regclass('public.odoo_users') IS NOT NULL THEN
    ALTER TABLE public.odoo_users
      ADD COLUMN IF NOT EXISTS is_test_user boolean NOT NULL DEFAULT false;
    COMMENT ON COLUMN public.odoo_users.is_test_user IS
      'Test account created from a /test/odoo slot: no trial, no paywall (to be set by the Odoo auth function once it exists).';
  END IF;
END $$;

