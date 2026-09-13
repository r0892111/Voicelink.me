// ── stripe-webhook ────────────────────────────────────────────────────────────
// Handles Stripe webhook events.
//   checkout.session.completed         → saves stripe_customer_id to the user's
//                                        billing row (`${platform}_users`)
//   customer.subscription.created      → upsert into stripe_subscriptions
//   customer.subscription.updated      → upsert into stripe_subscriptions
//   customer.subscription.deleted      → upsert into stripe_subscriptions (status=canceled)
//
// We rely on customer.subscription.updated to surface payment-failure transitions
// (Stripe sets status='past_due' on the subscription itself), so a separate
// invoice.payment_failed handler isn't needed for v1 enforcement.
//
// Which users table a customer lives in is decided by _shared/billing/users.ts
// (teamleader_users, catermonkey_mcp_users). The erasure schedule below is
// per-table on purpose: Teamleader's OAuth tokens sit on the users row and
// are nulled here; Catermonkey-via-MCP tokens live in VoiceLink's
// mcp_connections, so only the erasure deadline is stamped and VoiceLink's
// sweep revokes/removes them.

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';
import { createLogger, toErrorDetail, RequestLogger } from '../_shared/logger.ts';
import { BILLING_TABLES, findBillingRow, updateBillingRow } from '../_shared/billing/users.ts';

const log = createLogger('stripe-webhook');

function epochToIso(epoch: number | null | undefined): string | null {
  if (!epoch) return null;
  return new Date(epoch * 1000).toISOString();
}

function subscriptionToRow(sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  if (!item) return null;
  const price = item.price;
  return {
    subscription_id: sub.id,
    customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
    price_id: price?.id ?? null,
    voicelink_key: (price?.metadata?.voicelink_key as string | undefined) ?? null,
    status: sub.status,
    quantity: item.quantity ?? 1,
    current_period_start: epochToIso(sub.current_period_start)!,
    current_period_end: epochToIso(sub.current_period_end)!,
    cancel_at_period_end: sub.cancel_at_period_end,
    canceled_at: epochToIso(sub.canceled_at),
    updated_at: new Date().toISOString(),
  };
}

async function handleCheckoutCompleted(
  r: RequestLogger,
  supabase: SupabaseClient,
  stripe: Stripe,
  session: Stripe.Checkout.Session,
) {
  const userId     = session.client_reference_id;
  let customerId   = session.customer as string | null;

  // Payment-mode sessions created before 2026-08-26 carried no customer
  // (stripe-checkout now passes one). Attribute the purchase to the customer
  // the credit gate reads for this user so the pack is never silently lost.
  if (!customerId && userId && session.mode === 'payment') {
    const billing = await findBillingRow(supabase, userId, (table, message) =>
      r.warn('customer fallback lookup failed', { table, error: message }),
    );
    customerId = billing?.row.stripe_customer_id ?? null;
    r.info('payment session without customer — resolved via client_reference_id', {
      user_id: userId,
      customer_id: customerId,
      table: billing?.table ?? null,
    });
  }

  r.info('processing checkout.session.completed', {
    session_id: session.id,
    user_id: userId,
    customer_id: customerId,
    mode: session.mode,
  });

  if (userId && customerId) {
    const result = await updateBillingRow(supabase, userId, { stripe_customer_id: customerId });
    if (result.table === null) {
      r.error('failed to save stripe_customer_id', { error: result.error, user_id: userId });
    } else {
      r.info('stripe_customer_id saved', { user_id: userId, customer_id: customerId, table: result.table });
    }
  } else {
    r.warn('missing userId or customerId on session — skipping stripe_customer_id update', {
      user_id: userId,
      customer_id: customerId,
    });
  }

  // One-time purchases (credit packs) write a credit_topups row so the
  // credit gate can include the bought credits in the user's limit.
  if (session.mode === 'payment' && customerId) {
    await handleCreditPackPurchase(r, supabase, stripe, session, customerId);
  }
}

async function handleCreditPackPurchase(
  r: RequestLogger,
  supabase: SupabaseClient,
  stripe: Stripe,
  session: Stripe.Checkout.Session,
  customerId: string,
) {
  if (session.payment_status !== 'paid') {
    r.info('non-paid session, skipping credit pack write', {
      session_id: session.id,
      payment_status: session.payment_status,
    });
    return;
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ['data.price'],
  });

  // Best-effort: resolve the buyer's teamleader_id; null is acceptable since
  // the credit grant attaches to customer_id either way (credit_topups has a
  // Teamleader-specific column — other platforms simply leave it null).
  let teamleaderId: string | null = null;
  if (session.client_reference_id) {
    const billing = await findBillingRow(supabase, session.client_reference_id);
    teamleaderId = billing?.table === 'teamleader_users' ? (billing.row.teamleader_id ?? null) : null;
  }

  const paymentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? session.id;

  for (const item of lineItems.data) {
    const price = item.price;
    const voicelinkKey = (price?.metadata?.voicelink_key as string | undefined) ?? null;
    const creditsStr = (price?.metadata?.credits as string | undefined) ?? null;

    if (!voicelinkKey?.startsWith('credit_pack_') || !creditsStr) {
      r.info('line item is not a credit pack, skipping', {
        price_id: price?.id,
        voicelink_key: voicelinkKey,
      });
      continue;
    }

    const creditsPerPack = parseInt(creditsStr, 10);
    if (!Number.isFinite(creditsPerPack) || creditsPerPack <= 0) {
      r.warn('invalid credits metadata on price', { price_id: price?.id, credits: creditsStr });
      continue;
    }

    const totalCredits = creditsPerPack * (item.quantity ?? 1);

    const row = {
      customer_id: customerId,
      teamleader_id: teamleaderId,
      stripe_payment_id: paymentId,
      voicelink_key: voicelinkKey,
      credits_added: totalCredits,
      amount_cents: item.amount_total ?? 0,
      currency: (item.currency ?? 'eur').toLowerCase(),
      status: 'paid',
      purchased_at: new Date(session.created * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    };

    r.info('writing credit_topups', {
      voicelink_key: voicelinkKey,
      credits: totalCredits,
      amount_cents: row.amount_cents,
    });

    const { error } = await supabase
      .from('credit_topups')
      .upsert(row, { onConflict: 'stripe_payment_id' });

    if (error) {
      r.error('failed to upsert credit_topups', {
        error: error.message,
        code: error.code,
        voicelink_key: voicelinkKey,
        stripe_payment_id: paymentId,
      });
    }
  }
}

async function handleSubscriptionEvent(
  r: RequestLogger,
  supabase: SupabaseClient,
  sub: Stripe.Subscription,
  eventType: string,
) {
  const row = subscriptionToRow(sub);
  if (!row) {
    r.warn('subscription has no items', { subscription_id: sub.id });
    return;
  }

  r.info('processing subscription event', {
    event_type: eventType,
    subscription_id: row.subscription_id,
    customer_id: row.customer_id,
    voicelink_key: row.voicelink_key,
    status: row.status,
    quantity: row.quantity,
  });

  const { error } = await supabase
    .from('stripe_subscriptions')
    .upsert(row, { onConflict: 'subscription_id' });

  if (error) {
    r.error('failed to upsert stripe_subscriptions', {
      error: error.message,
      code: error.code,
      subscription_id: row.subscription_id,
    });
  } else {
    r.info('stripe_subscriptions upserted', { subscription_id: row.subscription_id });
  }

  // ── GDPR retention schedule ────────────────────────────────────────────
  // Subscription ENDED (`deleted` fires at period lapse for
  // cancel_at_period_end, immediately for hard cancels): null the OAuth
  // tokens so processing stops, and stamp the 30-day erasure deadline.
  // VLAgent's daily sweep runs the full Art. 17 cascade once it lapses.
  // Subscription ACTIVE again: clear the stamp — resubscribers within the
  // grace period lose nothing (they reconnect OAuth via onboarding).
  if (eventType === 'customer.subscription.deleted') {
    await scheduleErasureIfLastSubscription(r, supabase, row.customer_id, row.subscription_id);
  } else if (sub.status === 'active' || sub.status === 'trialing') {
    await clearScheduledErasure(r, supabase, row.customer_id);
  }
}

const ERASURE_GRACE_DAYS = 30;

async function scheduleErasureIfLastSubscription(
  r: RequestLogger,
  supabase: SupabaseClient,
  customerId: string,
  endedSubscriptionId: string,
) {
  // Plan switches fire `deleted` for the OLD subscription while the new one
  // is live — never cut a paying customer's tokens. Only schedule when the
  // customer has no other live subscription.
  const { data: live, error: liveErr } = await supabase
    .from('stripe_subscriptions')
    .select('subscription_id')
    .eq('customer_id', customerId)
    .neq('subscription_id', endedSubscriptionId)
    .in('status', ['active', 'trialing', 'past_due'])
    .limit(1);

  if (liveErr) {
    r.error('erasure schedule: live-subscription check failed — NOT scheduling', {
      error: liveErr.message,
      customer_id: customerId,
    });
    return;
  }
  if (live && live.length > 0) {
    r.info('erasure schedule skipped: customer still has a live subscription', {
      customer_id: customerId,
      live_subscription_id: live[0].subscription_id,
    });
    return;
  }

  const dueAt = new Date(Date.now() + ERASURE_GRACE_DAYS * 24 * 3600 * 1000).toISOString();
  for (const table of BILLING_TABLES) {
    // Teamleader keeps its OAuth tokens on the users row: null them so
    // processing stops now. Catermonkey-via-MCP has no token columns here
    // (they live in VoiceLink's mcp_connections) — stamp the deadline only.
    const patch =
      table === 'teamleader_users'
        ? { access_token: null, refresh_token: null, erasure_due_at: dueAt }
        : { erasure_due_at: dueAt };
    const { data, error } = await supabase
      .from(table)
      .update(patch)
      .eq('stripe_customer_id', customerId)
      .is('deleted_at', null)
      .select('user_id');

    if (error) {
      r.error('erasure schedule failed', { error: error.message, customer_id: customerId, table });
    } else if (data && data.length > 0) {
      r.info('erasure scheduled: grace period started', {
        customer_id: customerId,
        due_at: dueAt,
        table,
        users: data.map((d) => d.user_id),
      });
    }
  }
}

async function clearScheduledErasure(
  r: RequestLogger,
  supabase: SupabaseClient,
  customerId: string,
) {
  for (const table of BILLING_TABLES) {
    const { data, error } = await supabase
      .from(table)
      .update({ erasure_due_at: null })
      .eq('stripe_customer_id', customerId)
      .not('erasure_due_at', 'is', null)
      .select('user_id');

    if (error) {
      r.error('erasure clear failed', { error: error.message, customer_id: customerId, table });
    } else if (data && data.length > 0) {
      r.info('scheduled erasure cleared (resubscribe within grace period)', {
        customer_id: customerId,
        table,
        users: data.map((d) => d.user_id),
      });
    }
  }
}

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

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(r, supabase, stripe, event.data.object as Stripe.Checkout.Session);
      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await handleSubscriptionEvent(r, supabase, event.data.object as Stripe.Subscription, event.type);
      break;

    default:
      r.info('ignoring unhandled event type', { event_type: event.type });
  }

  r.done(200);
  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
