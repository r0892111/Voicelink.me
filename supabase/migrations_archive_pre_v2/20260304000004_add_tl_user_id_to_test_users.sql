-- Link test_users to their teamleader_users row so the TestDashboard
-- can check connection status without a separate token store.

ALTER TABLE public.test_users
  ADD COLUMN IF NOT EXISTS tl_user_id text;
