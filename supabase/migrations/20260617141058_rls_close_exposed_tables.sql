-- Close the 3 public tables still exposed to anon/authenticated (Supabase advisor).
-- Backend uses service_role (BYPASSRLS) so this does not affect the app.
-- Explicitly authorized by the user (2026-06-17), including the service_leads policy.

-- pipedrive_users — OAuth credential table; backend-only ⇒ deny-all.
ALTER TABLE public.pipedrive_users ENABLE ROW LEVEL SECURITY;

-- user_instructions — agent remember_instruction feature; backend-only ⇒ deny-all.
ALTER TABLE public.user_instructions ENABLE ROW LEVEL SECURITY;

-- service_leads — public lead-capture form. Enable RLS + anon INSERT only so the
-- form keeps working but captured PII can no longer be read via the anon key.
ALTER TABLE public.service_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS service_leads_anon_insert ON public.service_leads;
CREATE POLICY service_leads_anon_insert ON public.service_leads
  FOR INSERT TO anon, authenticated WITH CHECK (true);
