-- Remove Pipedrive and Odoo CRM tables — VoiceLink is Teamleader-only.
-- CASCADE drops all dependent indexes, constraints, and RLS policies automatically.

DROP TABLE IF EXISTS public.pipedrive_users CASCADE;
DROP TABLE IF EXISTS public.odoo_users CASCADE;
