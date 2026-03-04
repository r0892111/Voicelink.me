-- Add WhatsApp OTP and status columns to teamleader_users.
-- Uses IF NOT EXISTS guards so it is safe to run on databases that already
-- have some or all of these columns.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'teamleader_users' AND column_name = 'whatsapp_number')
  THEN ALTER TABLE public.teamleader_users ADD COLUMN whatsapp_number text; END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'teamleader_users' AND column_name = 'whatsapp_status')
  THEN ALTER TABLE public.teamleader_users ADD COLUMN whatsapp_status text DEFAULT 'not_set'; END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'teamleader_users' AND column_name = 'whatsapp_otp_code')
  THEN ALTER TABLE public.teamleader_users ADD COLUMN whatsapp_otp_code text; END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'teamleader_users' AND column_name = 'whatsapp_otp_expires_at')
  THEN ALTER TABLE public.teamleader_users ADD COLUMN whatsapp_otp_expires_at timestamptz; END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'teamleader_users' AND column_name = 'whatsapp_otp_phone')
  THEN ALTER TABLE public.teamleader_users ADD COLUMN whatsapp_otp_phone text; END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'teamleader_users_whatsapp_status_check')
  THEN ALTER TABLE public.teamleader_users
    ADD CONSTRAINT teamleader_users_whatsapp_status_check
    CHECK (whatsapp_status IN ('not_set', 'pending', 'active')); END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_teamleader_users_whatsapp_status ON public.teamleader_users (whatsapp_status);
