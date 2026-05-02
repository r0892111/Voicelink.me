-- Lock down the credit-checker tables with RLS.
-- Without these policies an authenticated user (anon key) could read other
-- people's subscriptions/top-ups, or worse, INSERT a fake credit_topups row
-- and grant themselves credits.
--
-- Catalogs (plan_limits, credit_packs) stay readable so the dashboard can
-- still render pricing info from the anon key. Per-user state
-- (stripe_subscriptions, credit_topups) is only readable by the user the
-- record belongs to (or an invited member of that user's team).
--
-- Writes are not granted to anyone — service role bypasses RLS, so edge
-- functions + VLAgent keep working unchanged.

CREATE OR REPLACE FUNCTION public.current_billing_customer() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH me AS (
    SELECT user_id, is_admin, admin_user_id, stripe_customer_id
    FROM teamleader_users
    WHERE user_id = auth.uid() AND deleted_at IS NULL
    LIMIT 1
  )
  SELECT COALESCE(
    (SELECT stripe_customer_id FROM me WHERE is_admin = true),
    (SELECT admin.stripe_customer_id
       FROM me
       JOIN teamleader_users admin
         ON admin.user_id = me.admin_user_id
        AND admin.is_admin = true
        AND admin.deleted_at IS NULL)
  );
$$;

GRANT EXECUTE ON FUNCTION public.current_billing_customer() TO authenticated;

ALTER TABLE plan_limits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS plan_limits_read ON plan_limits;
CREATE POLICY plan_limits_read ON plan_limits
  FOR SELECT TO authenticated, anon USING (true);

ALTER TABLE credit_packs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS credit_packs_read_active ON credit_packs;
CREATE POLICY credit_packs_read_active ON credit_packs
  FOR SELECT TO authenticated, anon USING (active = true);

ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS stripe_subscriptions_read_own ON stripe_subscriptions;
CREATE POLICY stripe_subscriptions_read_own ON stripe_subscriptions
  FOR SELECT TO authenticated
  USING (customer_id = current_billing_customer());

ALTER TABLE credit_topups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS credit_topups_read_own ON credit_topups;
CREATE POLICY credit_topups_read_own ON credit_topups
  FOR SELECT TO authenticated
  USING (customer_id = current_billing_customer());
