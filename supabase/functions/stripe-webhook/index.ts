// ── stripe-webhook ────────────────────────────────────────────────────────────
// Handles Stripe webhook events.
// checkout.session.completed → saves stripe_customer_id to teamleader_users.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';

Deno.serve(async (req) => {
  const stripe        = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

  const body      = await req.text();
  const signature = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response(`Webhook error: ${err instanceof Error ? err.message : 'unknown'}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session    = event.data.object as Stripe.Checkout.Session;
    const userId     = session.client_reference_id;   // our Supabase user UUID
    const customerId = session.customer as string;     // Stripe customer ID

    if (userId && customerId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      );

      const { error } = await supabase
        .from('teamleader_users')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to save stripe_customer_id:', error);
      } else {
        console.log(`stripe_customer_id saved for user ${userId}: ${customerId}`);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
