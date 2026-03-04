-- Store the test user's WhatsApp phone number on their teamleader_users row
-- so it's always available alongside the CRM identity.

ALTER TABLE public.teamleader_users
  ADD COLUMN IF NOT EXISTS phone text;
