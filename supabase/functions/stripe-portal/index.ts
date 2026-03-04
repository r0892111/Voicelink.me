// ── stripe-portal ─────────────────────────────────────────────────────────────
// Creates a Stripe Billing Portal session for the authenticated user.

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

    const { data: tlUser, error: dbError } = await supabase
      .from('teamleader_users')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (dbError || !tlUser?.stripe_customer_id) {
      return json({ error: 'No Stripe customer found' }, 400);
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

    const { return_url } = await req.json().catch(() => ({}));

    const session = await stripe.billingPortal.sessions.create({
      customer:   tlUser.stripe_customer_id,
      return_url: return_url ?? `${Deno.env.get('SITE_URL') ?? ''}/dashboard`,
    });

    return json({ success: true, url: session.url });
  } catch (err) {
    console.error('stripe-portal:', err);
    return json({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
