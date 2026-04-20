// ── stripe-portal ─────────────────────────────────────────────────────────────
// Creates a Stripe Billing Portal session for the authenticated user.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';

const log = createLogger('stripe-portal');

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

    r.info('looking up stripe_customer_id');
    const { data: tlUser, error: dbError } = await supabase
      .from('teamleader_users')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (dbError || !tlUser?.stripe_customer_id) {
      r.warn('no stripe customer found', { user_id: user.id, db_error: dbError?.message });
      r.done(400);
      return json({ error: 'No Stripe customer found' }, 400);
    }

    r.info('creating billing portal session', { customer_id: tlUser.stripe_customer_id });
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

    const { return_url } = await req.json().catch(() => ({}));

    const session = await stripe.billingPortal.sessions.create({
      customer:   tlUser.stripe_customer_id,
      return_url: return_url ?? `${Deno.env.get('SITE_URL') ?? ''}/dashboard`,
    });

    r.info('billing portal session created', { session_url_present: !!session.url });
    r.done(200);
    return json({ success: true, url: session.url });
  } catch (err) {
    r.error('unhandled error', toErrorDetail(err));
    r.done(500);
    return json({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
