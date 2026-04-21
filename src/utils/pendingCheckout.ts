// ── Pending Stripe checkout intent ───────────────────────────────────────────
// When a logged-out visitor clicks a paid plan CTA on the homepage's pricing
// section, we want them to: (1) land on /signup, (2) complete OAuth, and (3)
// get dropped straight into the Stripe Checkout for the plan they picked —
// not on the dashboard with a generic "start trial" banner.
//
// This module persists the user's plan choice across the OAuth roundtrip via
// localStorage, with a TTL so a stale intent from yesterday doesn't hijack a
// later unrelated signup.

const KEY = 'pending_stripe_checkout';
const TTL_MS = 60 * 60 * 1000; // 1 hour

export type BillingInterval = 'monthly' | 'yearly';

export interface PendingCheckout {
  tierKey: string;
  interval: BillingInterval;
  quantity: number;
}

interface StoredPendingCheckout extends PendingCheckout {
  ts: number;
}

export function markPendingCheckout(data: PendingCheckout): void {
  const record: StoredPendingCheckout = { ...data, ts: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(record));
}

/** Read the pending choice if it's still fresh. Does NOT remove it —
 *  call clearPendingCheckout() once the Stripe session has been created. */
export function consumePendingCheckout(): PendingCheckout | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredPendingCheckout>;
    const fresh =
      typeof parsed?.ts === 'number' && Date.now() - parsed.ts < TTL_MS;
    if (!fresh) {
      localStorage.removeItem(KEY);
      return null;
    }
    if (
      typeof parsed.tierKey !== 'string' ||
      (parsed.interval !== 'monthly' && parsed.interval !== 'yearly') ||
      typeof parsed.quantity !== 'number'
    ) {
      return null;
    }
    return {
      tierKey: parsed.tierKey,
      interval: parsed.interval,
      quantity: parsed.quantity,
    };
  } catch {
    return null;
  }
}

export function clearPendingCheckout(): void {
  localStorage.removeItem(KEY);
}
