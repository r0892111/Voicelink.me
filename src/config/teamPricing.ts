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
  creditsPerUser: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// PRICING TIERS — update prices, seat ranges, and Stripe IDs here.
// The Stripe price IDs below are placeholders — replace once created in Stripe.
// ──────────────────────────────────────────────────────────────────────────────
// Tier base prices and credit quotas mirror PricingSection.tsx.
// Seat ranges are informational only — the per-seat price comes from the
// Stripe volume-tier ladder attached to each priceId below.
export const TEAM_TIERS: TeamTier[] = [
  {
    key: 'starter',
    minSeats: 1,
    maxSeats: 1,
    monthlyPricePerSeat: 24,
    yearlyPricePerSeat: 19.20,
    monthlyPriceId: 'price_1TOZ1cLPohnizGblBAttd82T',
    yearlyPriceId:  'price_1TOZ1dLPohnizGbl56BBL8BJ',
    creditsPerUser: 350,
  },
  {
    key: 'professional',
    minSeats: 1,
    maxSeats: 50,
    monthlyPricePerSeat: 59,
    yearlyPricePerSeat: 47.20,
    monthlyPriceId: 'price_1TOZ1eLPohnizGbldPFhRy1m',
    yearlyPriceId:  'price_1TOZ25LPohnizGbll2UCxFpu',
    creditsPerUser: 1000,
  },
  {
    key: 'business',
    minSeats: 1,
    maxSeats: 50,
    monthlyPricePerSeat: 109,
    yearlyPricePerSeat: 87.20,
    monthlyPriceId: 'price_1TOZ26LPohnizGblXfd6OqxQ',
    yearlyPriceId:  'price_1TOZ26LPohnizGblh8BYsGWM',
    creditsPerUser: 2000,
  },
  {
    key: 'enterprise',
    minSeats: 51,
    maxSeats: null,
    monthlyPricePerSeat: 0,
    yearlyPricePerSeat: 0,
    monthlyPriceId: '',
    yearlyPriceId: '',
    creditsPerUser: 0,
  },
];

/** Credits granted by the 1-month free trial product. */
export const TRIAL_CREDITS = 100;

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
