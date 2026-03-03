-- Create test_users table for pre-registered test accounts.
-- Admins add rows directly; phone is the lookup key.
-- WhatsApp OTP columns mirror the structure used in teamleader_users so the
-- existing whatsapp-otp edge function can drive verification with
-- crm_provider = 'test'.

CREATE TABLE IF NOT EXISTS public.test_users (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- user_id is the stable identifier passed to the whatsapp-otp edge function.
  -- It defaults to a fresh UUID string; update it if you need to link to an
  -- external identity later.
  user_id                 text        UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  phone                   text        UNIQUE NOT NULL,
  whatsapp_number         text,
  whatsapp_status         text        NOT NULL DEFAULT 'not_set',
  whatsapp_otp_code       text,
  whatsapp_otp_expires_at timestamptz,
  whatsapp_otp_phone      text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT test_users_whatsapp_status_check
    CHECK (whatsapp_status IN ('not_set', 'pending', 'active'))
);

ALTER TABLE public.test_users ENABLE ROW LEVEL SECURITY;

-- Anon users can look up their own record by phone (needed for the /test page).
CREATE POLICY "test_users: anon can select"
  ON public.test_users
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- No public inserts — admins manage this table directly in the Supabase UI.

CREATE INDEX IF NOT EXISTS idx_test_users_phone ON public.test_users (phone);
