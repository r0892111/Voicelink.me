-- 20260915120000_create_odoo_users.sql
--
-- Portal parity copy of VoiceLink migration 029_odoo_users.sql (spec D2, OD-12).
-- The portal and VoiceLink share one database: the table is created by
-- whichever side applies first (IF NOT EXISTS), and this copy keeps
-- `supabase db reset` / a fresh project consistent. Dated before
-- 20260916120001_is_test_user_platform_tables.sql, which alters it.
-- odoo-connect links odoo_users.user_id; VoiceLink owns every other column.

BEGIN;

CREATE TABLE IF NOT EXISTS public.odoo_users (
    odoo_user_id            TEXT         PRIMARY KEY,
    api_domain              TEXT         NOT NULL,
    odoo_db                 TEXT         NOT NULL,
    odoo_login              TEXT         NOT NULL,
    odoo_uid                INTEGER,
    access_token            TEXT         NOT NULL,
    refresh_token           TEXT         NOT NULL DEFAULT '',
    expires_at_unix         DOUBLE PRECISION,
    odoo_version            TEXT,
    user_id                 UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
    env                     TEXT         NOT NULL DEFAULT 'prod',
    whatsapp_number         TEXT,
    whatsapp_status         TEXT         NOT NULL DEFAULT 'pending',
    whatsapp_otp_code       TEXT,
    whatsapp_otp_expires_at TIMESTAMPTZ,
    whatsapp_otp_phone      TEXT,
    stripe_customer_id      TEXT,
    is_admin                BOOLEAN      NOT NULL DEFAULT false,
    admin_user_id           UUID,
    promo_end_date          TIMESTAMPTZ,
    trial_started_tracked   BOOLEAN      NOT NULL DEFAULT false,
    language                TEXT,
    language_locked         BOOLEAN      NOT NULL DEFAULT false,
    erasure_due_at          TIMESTAMPTZ,
    deleted_at              TIMESTAMPTZ,
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT odoo_users_env_check
        CHECK (env IN ('dev', 'staging', 'prod')),
    CONSTRAINT odoo_users_whatsapp_status_check
        CHECK (whatsapp_status IN ('pending', 'active', 'disabled'))
);

CREATE INDEX IF NOT EXISTS idx_odoo_users_env
    ON public.odoo_users(env);

CREATE INDEX IF NOT EXISTS idx_odoo_users_whatsapp
    ON public.odoo_users(whatsapp_number)
    WHERE whatsapp_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_odoo_users_user_id
    ON public.odoo_users(user_id)
    WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_odoo_users_erasure_due
    ON public.odoo_users(erasure_due_at)
    WHERE erasure_due_at IS NOT NULL;

ALTER TABLE public.odoo_users ENABLE ROW LEVEL SECURITY;

COMMIT;

-- ── Rollback (manual) ────────────────────────────────────────────────────────
-- BEGIN;
-- DROP TABLE IF EXISTS public.odoo_users;
-- COMMIT;
