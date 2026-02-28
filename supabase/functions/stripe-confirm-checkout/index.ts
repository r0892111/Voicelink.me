// ── stripe-confirm-checkout ───────────────────────────────────────────────────
// Called immediately when the user returns from Stripe checkout (success URL).
// Retrieves the session from Stripe and saves stripe_customer_id to
// teamleader_users — so the subscription check works even before the
// webhook fires.

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

    const { session_id } = await req.json();
    if (!session_id) return json({ success: false, error: 'Missing session_id' }, 400);

    const stripe  = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    console.log(`stripe-confirm-checkout: session ${session_id} status=${session.status} client_ref=${session.client_reference_id} user=${user.id}`);

    // Verify this session belongs to the authenticated user
    if (session.client_reference_id !== user.id) {
      console.error(`client_reference_id mismatch: ${session.client_reference_id} !== ${user.id}`);
      return json({ success: false, error: 'Session does not belong to this user' }, 403);
    }

    if (session.status !== 'complete') {
      return json({ success: false, error: `Session not complete (status: ${session.status})` }, 400);
    }

    const customerId = session.customer as string;
    if (!customerId) {
      return json({ success: false, error: 'No customer on session' }, 400);
    }

    // Save customer ID — idempotent, safe to call multiple times
    const { data: updated, error: dbError } = await supabase
      .from('teamleader_users')
      .update({ stripe_customer_id: customerId })
      .eq('user_id', user.id)
      .select('user_id');

    if (dbError) {
      console.error('stripe-confirm-checkout db error:', dbError);
      return json({ success: false, error: dbError.message }, 500);
    }

    if (!updated || updated.length === 0) {
      console.error(`stripe-confirm-checkout: no teamleader_users row found for user_id=${user.id}`);
      return json({ success: false, error: 'User row not found in teamleader_users' }, 404);
    }

    console.log(`stripe_customer_id saved for user ${user.id}: ${customerId}`);
    return json({ success: true, customer_id: customerId });

  } catch (err) {
    console.error('stripe-confirm-checkout:', err);
    return json({ success: false, error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
