-- 20260920120000_odoo_users_whatsapp_not_set.sql
-- Portal parity copy of VoiceLink migration 032 (one shared database).

-- The portal's WhatsApp flow (useWhatsAppConnect, whatsapp-otp) reads
-- whatsapp_status 'not_set' as "nothing started", 'pending' as "OTP sent,
-- waiting for the code" and 'active' as verified. 029 defaulted odoo_users to
-- 'pending' and its CHECK refused 'not_set', so a fresh Odoo account opened the
-- dashboard on the OTP step with no number (trial-first sign-up, 2026-09-20).
-- Same vocabulary as teamleader_users / catermonkey_mcp_users now. Idempotent.
--
-- Apply via Supabase dashboard → SQL editor, per env project (staging first).

BEGIN;

ALTER TABLE public.odoo_users
    DROP CONSTRAINT IF EXISTS odoo_users_whatsapp_status_check;

ALTER TABLE public.odoo_users
    ADD CONSTRAINT odoo_users_whatsapp_status_check
    CHECK (whatsapp_status IN ('not_set', 'pending', 'active', 'disabled'));

ALTER TABLE public.odoo_users
    ALTER COLUMN whatsapp_status SET DEFAULT 'not_set';

-- Rows that never started an OTP were 'pending' only because of the old
-- default: they are 'not_set' in the portal's sense.
UPDATE public.odoo_users
   SET whatsapp_status = 'not_set'
 WHERE whatsapp_status = 'pending'
   AND whatsapp_otp_code IS NULL
   AND whatsapp_otp_phone IS NULL
   AND whatsapp_number IS NULL;

COMMIT;

-- ── Rollback (manual) ────────────────────────────────────────────────────────
-- BEGIN;
-- UPDATE public.odoo_users SET whatsapp_status = 'pending' WHERE whatsapp_status = 'not_set';
-- ALTER TABLE public.odoo_users DROP CONSTRAINT IF EXISTS odoo_users_whatsapp_status_check;
-- ALTER TABLE public.odoo_users ADD CONSTRAINT odoo_users_whatsapp_status_check
--     CHECK (whatsapp_status IN ('pending', 'active', 'disabled'));
-- ALTER TABLE public.odoo_users ALTER COLUMN whatsapp_status SET DEFAULT 'pending';
-- COMMIT;
