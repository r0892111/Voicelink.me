// ── stripe-checkout ───────────────────────────────────────────────────────────
// Creates a Stripe Checkout session and returns the URL.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';

const log = createLogger('stripe-checkout');

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    r.info('authenticating user');
    const { data: { user }, error: authError } =
      await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      r.warn('auth failed', { error: authError?.message });
      r.done(401);
      return json({ error: 'Unauthorized' }, 401);
    }
    r.info('authenticated', { user_id: user.id, email: user.email });

    const { price_id, quantity, success_url, cancel_url } = await req.json();
    r.info('creating checkout session', { price_id, quantity, user_id: user.id });

    if (!price_id) {
      r.warn('missing price_id');
      r.done(400);
      return json({ error: 'Missing price_id' }, 400);
    }

    // Quantity matters for volume-tier plans (Professional / Business): the
    // Stripe Price is tiered, and the per-unit amount depends on how many
    // seats are bought. Previously hardcoded to 1, which billed a 10-user
    // team at the 1-3-bracket rate.
    const qty = Math.max(1, Math.min(50, Number(quantity) || 1));

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

    const session = await stripe.checkout.sessions.create({
      mode:                 'subscription',
      payment_method_types: ['card'],
      line_items:           [{ price: price_id, quantity: qty }],
      // {CHECKOUT_SESSION_ID} is a Stripe template literal — it gets replaced with the real session ID on redirect
      success_url:          `${success_url ?? `${Deno.env.get('SITE_URL') ?? ''}/dashboard`}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:           cancel_url  ?? `${Deno.env.get('SITE_URL') ?? ''}/`,
      client_reference_id:  user.id,
      allow_promotion_codes: true,
      subscription_data: {
        // 1-month free trial (was 14 days). Pairs with the 100 credits we
        // hand out during the trial — users get 1 month to burn through them.
        trial_period_days: 30,
      },
    });

    r.info('checkout session created', { session_id: session.id, url_present: !!session.url });
    r.done(200);
    return json({ success: true, checkout_url: session.url });
  } catch (err) {
    r.error('unhandled error', toErrorDetail(err));
    r.done(500);
    return json({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
