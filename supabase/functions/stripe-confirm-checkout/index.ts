// ── stripe-confirm-checkout ───────────────────────────────────────────────────
// Called immediately when the user returns from Stripe checkout (success URL).
// Retrieves the session from Stripe and saves stripe_customer_id to
// teamleader_users — so the subscription check works even before the
// webhook fires.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';

const log = createLogger('stripe-confirm-checkout');

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

    const { session_id } = await req.json();
    if (!session_id) {
      r.warn('missing session_id');
      r.done(400);
      return json({ success: false, error: 'Missing session_id' }, 400);
    }

    r.info('retrieving stripe session', { session_id });
    const stripe  = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    r.info('session retrieved', {
      session_id,
      status: session.status,
      client_reference_id: session.client_reference_id,
      user_id: user.id,
    });

    // Verify this session belongs to the authenticated user
    if (session.client_reference_id !== user.id) {
      r.error('client_reference_id mismatch', {
        expected: user.id,
        actual: session.client_reference_id,
      });
      r.done(403);
      return json({ success: false, error: 'Session does not belong to this user' }, 403);
    }

    if (session.status !== 'complete') {
      r.warn('session not complete', { session_status: session.status });
      r.done(400);
      return json({ success: false, error: `Session not complete (status: ${session.status})` }, 400);
    }

    const customerId = session.customer as string;
    if (!customerId) {
      r.error('no customer on session', { session_id });
      r.done(400);
      return json({ success: false, error: 'No customer on session' }, 400);
    }

    // Save customer ID — idempotent, safe to call multiple times
    r.info('saving stripe_customer_id', { user_id: user.id, customer_id: customerId });
    const { data: updated, error: dbError } = await supabase
      .from('teamleader_users')
      .update({ stripe_customer_id: customerId })
      .eq('user_id', user.id)
      .select('user_id');

    if (dbError) {
      r.error('db update failed', { error: dbError.message, code: dbError.code });
      r.done(500);
      return json({ success: false, error: dbError.message }, 500);
    }

    if (!updated || updated.length === 0) {
      r.error('no teamleader_users row found', { user_id: user.id });
      r.done(404);
      return json({ success: false, error: 'User row not found in teamleader_users' }, 404);
    }

    r.info('stripe_customer_id saved successfully', { user_id: user.id, customer_id: customerId });
    r.done(200);
    return json({ success: true, customer_id: customerId });

  } catch (err) {
    r.error('unhandled error', toErrorDetail(err));
    r.done(500);
    return json({ success: false, error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
