// ── stripe-webhook ────────────────────────────────────────────────────────────
// Handles Stripe webhook events.
// checkout.session.completed → saves stripe_customer_id to teamleader_users.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';

const log = createLogger('stripe-webhook');

Deno.serve(async (req) => {
  const r = log.withRequest(req);

  const stripe        = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

  const body      = await req.text();
  const signature = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    r.error('webhook signature verification failed', toErrorDetail(err));
    r.done(400);
    return new Response(`Webhook error: ${err instanceof Error ? err.message : 'unknown'}`, { status: 400 });
  }

  r.info('webhook event received', { event_type: event.type, event_id: event.id });

  if (event.type === 'checkout.session.completed') {
    const session    = event.data.object as Stripe.Checkout.Session;
    const userId     = session.client_reference_id;   // our Supabase user UUID
    const customerId = session.customer as string;     // Stripe customer ID

    r.info('processing checkout.session.completed', {
      session_id: session.id,
      user_id: userId,
      customer_id: customerId,
    });

    if (userId && customerId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      );

      r.info('saving stripe_customer_id to teamleader_users', { user_id: userId, customer_id: customerId });
      const { error } = await supabase
        .from('teamleader_users')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId);

      if (error) {
        r.error('failed to save stripe_customer_id', { error: error.message, code: error.code, user_id: userId });
      } else {
        r.info('stripe_customer_id saved successfully', { user_id: userId, customer_id: customerId });
      }
    } else {
      r.warn('missing userId or customerId on session', { user_id: userId, customer_id: customerId });
    }
  } else {
    r.info('ignoring unhandled event type', { event_type: event.type });
  }

  r.done(200);
  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
