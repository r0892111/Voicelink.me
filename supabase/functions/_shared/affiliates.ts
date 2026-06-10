// Shared classification for affiliate-referred accounts.
// Used by affiliate-portal (partner view) and affiliate-overview (owner view).
//
// Buckets follow the published partner terms: commission accrues only on
// customers who are active AND paying ("paying"), at the net amount after
// Stripe discounts, monthly-normalized. Stripe `trialing` and accounts with
// no subscription at all (product-side free trial, promo access) count as
// "trial". Everything else (canceled, past_due, unpaid, incomplete) is
// "churned" — no commission projected on money not being collected.

import type Stripe from 'npm:stripe@17';

export type ReferralStatus = 'trial' | 'paying' | 'churned';

export interface ReferralClassification {
  status: ReferralStatus;
  /** Net monthly subscription value in cents (after discounts, yearly ÷ 12). 0 unless paying. */
  netMonthlyCents: number;
  currency: string;
}

export interface ReferredAccountRow {
  stripe_customer_id: string | null;
  promo_end_date: string | null;
}

function monthlyItemCents(item: Stripe.SubscriptionItem): number {
  const unit = item.price?.unit_amount ?? 0;
  const qty = item.quantity ?? 1;
  const interval = item.price?.recurring?.interval;
  const count = item.price?.recurring?.interval_count ?? 1;
  const gross = unit * qty;
  if (interval === 'year') return gross / (12 * count);
  if (interval === 'month') return gross / count;
  return gross; // week/day intervals don't exist in our catalog; treat as monthly
}

function applyDiscounts(monthlyCents: number, sub: Stripe.Subscription): number {
  // stripe@17 exposes discounts as Array<string | Discount>; only expanded
  // objects carry the coupon. Older API shapes had a single `discount`.
  const discounts: Stripe.Discount[] = [];
  for (const d of (sub.discounts ?? []) as Array<string | Stripe.Discount>) {
    if (typeof d === 'object' && d?.coupon) discounts.push(d);
  }
  const legacy = (sub as unknown as { discount?: Stripe.Discount }).discount;
  if (legacy?.coupon && discounts.length === 0) discounts.push(legacy);

  let net = monthlyCents;
  for (const d of discounts) {
    if (!d.coupon.valid) continue;
    if (d.coupon.percent_off) net *= 1 - d.coupon.percent_off / 100;
    // amount_off applies per invoice; normalize yearly invoices to monthly.
    if (d.coupon.amount_off) {
      const yearly = sub.items.data[0]?.price?.recurring?.interval === 'year';
      net -= yearly ? d.coupon.amount_off / 12 : d.coupon.amount_off;
    }
  }
  return Math.max(0, Math.round(net));
}

export async function classifyReferredAccount(
  stripe: Stripe,
  row: ReferredAccountRow,
): Promise<ReferralClassification> {
  // No Stripe customer yet: product-side free trial or promo access — not paying.
  if (!row.stripe_customer_id) {
    return { status: 'trial', netMonthlyCents: 0, currency: 'eur' };
  }

  const subs = await stripe.subscriptions.list({
    customer: row.stripe_customer_id,
    status: 'all',
    limit: 5,
    expand: ['data.items.data.price', 'data.discounts'],
  });

  const sub =
    subs.data.find((s) => s.status === 'active' || s.status === 'trialing') ?? subs.data[0];

  if (!sub) {
    return { status: 'trial', netMonthlyCents: 0, currency: 'eur' };
  }
  if (sub.status === 'trialing') {
    return { status: 'trial', netMonthlyCents: 0, currency: sub.currency ?? 'eur' };
  }
  if (sub.status !== 'active') {
    // Promo access (time-limited free Professional, no Stripe involvement)
    // outranks a stale canceled subscription — still an active, non-paying user.
    const promoActive = row.promo_end_date && new Date(row.promo_end_date) > new Date();
    return {
      status: promoActive ? 'trial' : 'churned',
      netMonthlyCents: 0,
      currency: sub.currency ?? 'eur',
    };
  }

  const gross = sub.items.data.reduce((sum, item) => sum + monthlyItemCents(item), 0);
  // The €0/month Free Trial product is a real "active" subscription — a
  // customer paying nothing is a trial, not a paying customer.
  const net = applyDiscounts(gross, sub);
  if (net === 0) {
    return { status: 'trial', netMonthlyCents: 0, currency: sub.currency ?? 'eur' };
  }
  return { status: 'paying', netMonthlyCents: net, currency: sub.currency ?? 'eur' };
}
