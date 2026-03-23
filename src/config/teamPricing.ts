// ── Team pricing configuration ───────────────────────────────────────────────
// Single source of truth for seat-based pricing tiers.
// When tiers change, edit ONLY this file — everything else derives from it.

export interface TeamTier {
  key: string;
  minSeats: number;
  maxSeats: number | null;       // null = contact us (enterprise)
  monthlyPricePerSeat: number;   // display-only — Stripe price IDs are authoritative
  yearlyPricePerSeat: number;
  monthlyPriceId: string;        // Stripe price ID (per-seat, monthly)
  yearlyPriceId: string;         // Stripe price ID (per-seat, yearly)
  messagesPerUser: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// PRICING TIERS — update prices, seat ranges, and Stripe IDs here.
// The Stripe price IDs below are placeholders — replace once created in Stripe.
// ──────────────────────────────────────────────────────────────────────────────
export const TEAM_TIERS: TeamTier[] = [
  {
    key: 'starter',
    minSeats: 1,
    maxSeats: 3,
    monthlyPricePerSeat: 19,
    yearlyPricePerSeat: 15,
    monthlyPriceId: 'price_1S5o6zLPohnizGblsQq7OYCT', // existing starter monthly
    yearlyPriceId: 'price_PLACEHOLDER_starter_yearly',
    messagesPerUser: 30,
  },
  {
    key: 'professional',
    minSeats: 4,
    maxSeats: 10,
    monthlyPricePerSeat: 34,
    yearlyPricePerSeat: 27,
    monthlyPriceId: 'price_PLACEHOLDER_professional_monthly',
    yearlyPriceId: 'price_PLACEHOLDER_professional_yearly',
    messagesPerUser: 60,
  },
  {
    key: 'business',
    minSeats: 11,
    maxSeats: 25,
    monthlyPricePerSeat: 49,
    yearlyPricePerSeat: 39,
    monthlyPriceId: 'price_PLACEHOLDER_business_monthly',
    yearlyPriceId: 'price_PLACEHOLDER_business_yearly',
    messagesPerUser: 100,
  },
  {
    key: 'enterprise',
    minSeats: 26,
    maxSeats: null,
    monthlyPricePerSeat: 0,
    yearlyPricePerSeat: 0,
    monthlyPriceId: '',
    yearlyPriceId: '',
    messagesPerUser: 0,
  },
];

/** Default tier used for single-user signups. */
export const DEFAULT_TIER = TEAM_TIERS[0];

/** Return the tier that fits a given seat count. */
export function getTierForSeatCount(seats: number): TeamTier {
  const tier = TEAM_TIERS.find(
    (t) => seats >= t.minSeats && (t.maxSeats === null || seats <= t.maxSeats),
  );
  return tier ?? TEAM_TIERS[TEAM_TIERS.length - 1];
}

/** Return the max seats allowed for a tier key, or null for enterprise. */
export function getMaxSeatsForTier(tierKey: string): number | null {
  return TEAM_TIERS.find((t) => t.key === tierKey)?.maxSeats ?? null;
}

/** Get the Stripe price ID for a tier + billing interval. */
export function getStripePriceId(
  tierKey: string,
  interval: 'month' | 'year' = 'month',
): string {
  const tier = TEAM_TIERS.find((t) => t.key === tierKey);
  if (!tier) return DEFAULT_TIER.monthlyPriceId;
  return interval === 'year' ? tier.yearlyPriceId : tier.monthlyPriceId;
}
