// ── get-subscription ──────────────────────────────────────────────────────────
// Returns the active Stripe subscription details for the authenticated user.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';
import { findBillingRow, getBillingRowInTable } from '../_shared/billing/users.ts';

const log = createLogger('get-subscription');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const r = log.withRequest(req);

  const json = (data: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase   = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    r.info('authenticating user');
    const { data: { user }, error: authError } =
      await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      r.warn('auth failed', { error: authError?.message });
      r.done(401);
      return json({ success: false, error: 'Unauthorized' }, 401);
    }
    r.info('authenticated', { user_id: user.id, email: user.email });

    // The `?provider=` query param is informational only: the billing row is
    // discovered by user id across every billing-capable users table
    // (_shared/billing/users.ts), so a stale or missing param can't route a
    // user to the wrong table.
    r.info('looking up billing row');
    const billing = await findBillingRow(supabase, user.id);
    const row = billing?.row ?? null;
    r.info('billing row', { table: billing?.table ?? null });

    // Promo bypass — time-limited Professional access granted without Stripe.
    // Checked before the Stripe API call so it works even when the user has
    // no stripe_customer_id yet (e.g. fresh WorkSmarter signups).
    if (row?.promo_end_date && new Date(row.promo_end_date) > new Date()) {
      r.info('promo active, returning Professional without Stripe', { promo_end_date: row.promo_end_date });
      r.done(200, { subscription_status: 'active', voicelink_key: 'professional_monthly' });
      return json({
        success: true,
        subscription: {
          subscription_status: 'active',
          voicelink_key:       'professional_monthly',
          plan_name:           'Professional',
          current_period_end:  Math.floor(new Date(row.promo_end_date).getTime() / 1000),
          trial_end:           null,
          amount:              0,
          currency:            'eur',
          interval:            'month',
        },
      });
    }

    // For invited members (is_admin=false with an admin_user_id), the
    // subscription lives on the admin's row — members don't have their own
    // Stripe customer. Resolve the admin's row instead so the dashboard
    // reflects the team-level subscription state and members aren't
    // prompted to start a trial they don't own.
    let stripeCustomerId: string | null = row?.stripe_customer_id ?? null;
    if (billing && row && !row.is_admin && row.admin_user_id) {
      r.info('caller is member, resolving admin subscription', { admin_user_id: row.admin_user_id });
      // An admin's row lives in the same table as the member's.
      const adminRow = await getBillingRowInTable(supabase, billing.table, row.admin_user_id);
      stripeCustomerId = adminRow?.stripe_customer_id ?? null;
    }

    if (!stripeCustomerId) {
      r.info('no stripe customer found', { user_id: user.id, is_member: row && !row.is_admin });
      r.done(200, { subscription_status: 'none' });
      return json({ success: true, subscription: { subscription_status: 'none' } });
    }

    r.info('fetching subscriptions from Stripe', { customer_id: stripeCustomerId });
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status:   'all',
      limit:    5,
      expand:   ['data.items.data.price'],
    });

    r.info('stripe returned subscriptions', { count: subscriptions.data.length });

    const sub =
      subscriptions.data.find((s) => s.status === 'active' || s.status === 'trialing') ??
      subscriptions.data[0];

    if (!sub) {
      r.info('no subscription found for customer');
      r.done(200, { subscription_status: 'none' });
      return json({ success: true, subscription: { subscription_status: 'none' } });
    }

    const price     = sub.items.data[0]?.price;
    const productId = typeof price?.product === 'string' ? price.product : price?.product?.id;
    let   planName  = 'VoiceLink';
    if (productId) {
      r.info('retrieving product name', { product_id: productId });
      const product = await stripe.products.retrieve(productId);
      planName = product.name ?? planName;
    }

    const voicelinkKey =
      (price?.metadata?.voicelink_key as string | undefined) ?? null;

    r.done(200, { subscription_status: sub.status, plan: planName, voicelink_key: voicelinkKey });
    return json({
      success: true,
      subscription: {
        subscription_status: sub.status,
        trial_end:           sub.trial_end ?? null,
        current_period_end:  sub.current_period_end ?? null,
        plan_name:           planName,
        voicelink_key:       voicelinkKey,
        amount:              price?.unit_amount ?? null,
        currency:            price?.currency ?? null,
        interval:            price?.recurring?.interval ?? null,
      },
    });
  } catch (err) {
    r.error('unhandled error', toErrorDetail(err));
    r.done(500);
    return json({ success: false, error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
