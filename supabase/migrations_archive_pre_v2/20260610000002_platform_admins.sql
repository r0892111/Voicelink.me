-- Platform admins: DB-driven allowlist for owner-only views (affiliate
-- overview). Replaces the PLATFORM_ADMIN_USER_IDS env secret so owners are
-- added with a plain INSERT instead of a secrets deploy:
--
--   insert into public.platform_admins (user_id) values ('<auth.users id>');
--
-- NOT the per-workspace teamleader_users.is_admin flag — every customer
-- workspace admin has that one.

CREATE TABLE IF NOT EXISTS public.platform_admins (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Service-role only: RLS enabled with no policies.
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
