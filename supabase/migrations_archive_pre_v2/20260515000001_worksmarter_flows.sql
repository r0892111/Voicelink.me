-- WorkSmarter trade-show lead capture tables + promo subscription bypass

-- Voicelink trial signups captured at the stand before CRM OAuth
CREATE TABLE IF NOT EXISTS worksmarter_leads (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  naam            text        NOT NULL,
  telefoonnummer  text        NOT NULL,
  email           text        NOT NULL,
  bedrijf         text        NOT NULL,
  source          text        NOT NULL DEFAULT 'worksmarter_voicelink',
  created_at      timestamptz DEFAULT now()
);

-- Service/audit inquiry leads captured at the stand
CREATE TABLE IF NOT EXISTS service_leads (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  naam            text        NOT NULL,
  bedrijf         text        NOT NULL,
  telefoonnummer  text        NOT NULL,
  email           text        NOT NULL,
  source          text        NOT NULL DEFAULT 'worksmarter_service',
  created_at      timestamptz DEFAULT now()
);

-- Time-limited promo access granted without Stripe checkout.
-- get-subscription checks this before calling the Stripe API:
-- if promo_end_date > now() it returns status='active', plan='professional_monthly'.
ALTER TABLE teamleader_users ADD COLUMN IF NOT EXISTS promo_end_date timestamptz;
