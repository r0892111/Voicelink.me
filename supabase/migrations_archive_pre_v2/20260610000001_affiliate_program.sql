-- Affiliate program: partner registry + signup attribution.
--
-- affiliates: one row per partner company. Rows are created manually (SQL /
-- Studio) for now — no CRUD UI. ref_code is the slug used in tracked links
-- (voicelink.me/?ref=<code>). auth_user_id is claimed on the partner's first
-- magic-link login by matching contact_email (see affiliate-portal function).
--
-- teamleader_users attribution columns: written once, server-side, on the
-- account-creation path of teamleader-auth. ref_code is deliberately TEXT
-- (not a FK) so an unknown/typo'd code is still recorded instead of lost;
-- the dashboard join surfaces unmatched codes.

CREATE TABLE IF NOT EXISTS public.affiliates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_code        text NOT NULL UNIQUE CHECK (ref_code ~ '^[a-z0-9-]{2,32}$'),
  company_name    text NOT NULL,
  contact_name    text,
  contact_email   text NOT NULL,
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'terminated')),
  commission_rate numeric NOT NULL DEFAULT 0.20 CHECK (commission_rate >= 0 AND commission_rate <= 1),
  auth_user_id    uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Service-role only: RLS enabled with no policies. The partner portal and the
-- owner overview both read through edge functions.
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.teamleader_users
  ADD COLUMN IF NOT EXISTS ref_code           text,
  ADD COLUMN IF NOT EXISTS ref_attributed_at  timestamptz,
  ADD COLUMN IF NOT EXISTS ref_source         text CHECK (ref_source IN ('link', 'manual'));

CREATE INDEX IF NOT EXISTS idx_teamleader_users_ref_code
  ON public.teamleader_users (ref_code)
  WHERE ref_code IS NOT NULL;
