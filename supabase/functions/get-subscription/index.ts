// ── get-subscription ──────────────────────────────────────────────────────────
// Returns the active Stripe subscription details for the authenticated user.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';

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

    r.info('looking up stripe_customer_id');
    const { data: row } = await supabase
      .from('teamleader_users')
      .select('stripe_customer_id, is_admin, admin_user_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    // For invited members (is_admin=false with an admin_user_id), the
    // subscription lives on the admin's row — members don't have their own
    // Stripe customer. Resolve the admin's row instead so the dashboard
    // reflects the team-level subscription state and members aren't
    // prompted to start a trial they don't own.
    let stripeCustomerId: string | null = row?.stripe_customer_id ?? null;
    if (row && !row.is_admin && row.admin_user_id) {
      r.info('caller is member, resolving admin subscription', { admin_user_id: row.admin_user_id });
      const { data: adminRow } = await supabase
        .from('teamleader_users')
        .select('stripe_customer_id')
        .eq('user_id', row.admin_user_id)
        .is('deleted_at', null)
        .maybeSingle();
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

    r.done(200, { subscription_status: sub.status, plan: planName });
    return json({
      success: true,
      subscription: {
        subscription_status: sub.status,
        trial_end:           sub.trial_end ?? null,
        current_period_end:  sub.current_period_end ?? null,
        plan_name:           planName,
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
