// ── get-subscription ──────────────────────────────────────────────────────────
// Returns the active Stripe subscription details for the authenticated user.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

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

    const { data: { user }, error: authError } =
      await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) return json({ success: false, error: 'Unauthorized' }, 401);

    const { data: row } = await supabase
      .from('teamleader_users')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!row?.stripe_customer_id) {
      return json({ success: true, subscription: { subscription_status: 'none' } });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

    const subscriptions = await stripe.subscriptions.list({
      customer: row.stripe_customer_id,
      status:   'all',
      limit:    5,
      expand:   ['data.items.data.price'],
    });

    const sub =
      subscriptions.data.find((s) => s.status === 'active' || s.status === 'trialing') ??
      subscriptions.data[0];

    if (!sub) {
      return json({ success: true, subscription: { subscription_status: 'none' } });
    }

    const price     = sub.items.data[0]?.price;
    const productId = typeof price?.product === 'string' ? price.product : price?.product?.id;
    let   planName  = 'VoiceLink';
    if (productId) {
      const product = await stripe.products.retrieve(productId);
      planName = product.name ?? planName;
    }

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
    console.error('get-subscription:', err);
    return json({ success: false, error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
