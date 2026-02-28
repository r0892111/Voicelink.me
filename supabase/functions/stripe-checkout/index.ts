// ── stripe-checkout ───────────────────────────────────────────────────────────
// Creates a Stripe Checkout session and returns the URL.

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } =
      await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) return json({ error: 'Unauthorized' }, 401);

    const { price_id, success_url, cancel_url } = await req.json();

    if (!price_id) return json({ error: 'Missing price_id' }, 400);

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

    const session = await stripe.checkout.sessions.create({
      mode:                 'subscription',
      payment_method_types: ['card'],
      line_items:           [{ price: price_id, quantity: 1 }],
      success_url:          success_url ?? `${Deno.env.get('SITE_URL') ?? ''}/dashboard`,
      cancel_url:           cancel_url  ?? `${Deno.env.get('SITE_URL') ?? ''}/`,
      client_reference_id:  user.id,
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 14,
      },
    });

    return json({ success: true, checkout_url: session.url });
  } catch (err) {
    console.error('stripe-checkout:', err);
    return json({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
