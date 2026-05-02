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

    const { price_id, quantity, success_url, cancel_url, trial_days, mode } = await req.json();
    r.info('creating checkout session', { price_id, quantity, trial_days, mode, user_id: user.id });

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

    // Clamp trial_days to a sensible range. 0 / undefined = no trial (paid
    // immediately). 30 is what "Start free" sends; we cap at 90 for safety.
    const trialDays = Math.max(0, Math.min(90, Number(trial_days) || 0));

    // mode='payment' is the one-time-purchase flow (credit packs); the
    // default 'subscription' mode handles plan signups.
    const checkoutMode: 'subscription' | 'payment' =
      mode === 'payment' ? 'payment' : 'subscription';

    const baseParams = {
      mode:                 checkoutMode,
      payment_method_types: ['card'] as ['card'],
      line_items:           [{ price: price_id, quantity: qty }],
      // {CHECKOUT_SESSION_ID} is a Stripe template literal — it gets replaced with the real session ID on redirect
      success_url:          `${success_url ?? `${Deno.env.get('SITE_URL') ?? ''}/dashboard`}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:           cancel_url  ?? `${Deno.env.get('SITE_URL') ?? ''}/`,
      client_reference_id:  user.id,
      allow_promotion_codes: true,
    };

    const session = await stripe.checkout.sessions.create(
      checkoutMode === 'subscription'
        ? {
            ...baseParams,
            // The "Start free" CTA requests trial_days=30. Pass it through so the
            // subscription goes into the `trialing` state with the same card on
            // file — Stripe auto-charges once the trial ends, no second checkout.
            // Homepage paid-plan CTAs don't send trial_days, so those users pay
            // from day one.
            ...(trialDays > 0 ? { subscription_data: { trial_period_days: trialDays } } : {}),
          }
        : baseParams,
    );

    r.info('checkout session created', { session_id: session.id, url_present: !!session.url });
    r.done(200);
    return json({ success: true, checkout_url: session.url });
  } catch (err) {
    r.error('unhandled error', toErrorDetail(err));
    r.done(500);
    return json({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
