// ── Team pricing — Supabase-backed lookup ────────────────────────────────────
// Replaces the old src/config/teamPricing.ts hardcoded constants.
// Source of truth lives in the `plan_limits` table, populated from the
// PricingSection canonical values. The dashboard reads from Supabase so price
// changes don't require a frontend redeploy.
//
// Free Trial is `refresh_policy='once'` (lifetime 100-credit allotment).
// Paid plans are `refresh_policy='monthly'` and credit usage resets on each
// Stripe billing period.

import { supabase } from './supabase';

export interface PlanLimit {
  voicelink_key: string;
  tier_key: string;            // 'free_trial' | 'starter' | 'professional' | 'business'
  tier_name: string;
  credits_per_seat: number;
  refresh_policy: 'once' | 'monthly';
  max_seats: number | null;
  has_auto_topup: boolean;
  is_trial: boolean;
  stripe_price_id: string;
}

let cache: Promise<PlanLimit[]> | null = null;

async function loadPlanLimits(): Promise<PlanLimit[]> {
  if (!cache) {
    cache = (async () => {
      const { data, error } = await supabase
        .from('plan_limits')
        .select(
          'voicelink_key,tier_key,tier_name,credits_per_seat,refresh_policy,max_seats,has_auto_topup,is_trial,stripe_price_id',
        );
      if (error || !data) {
        cache = null; // allow retry on transient failures
        throw error ?? new Error('Failed to load plan_limits');
      }
      return data as PlanLimit[];
    })();
  }
  return cache;
}

function buildKey(tierKey: string, interval: 'month' | 'year'): string {
  const suffix = interval === 'year' ? 'yearly' : 'monthly';
  return `${tierKey}_${suffix}`;
}

/** Resolve the Stripe price ID for a tier + billing interval.
 *  Returns null for unknown tiers (e.g. enterprise — handled via contact form). */
export async function getStripePriceId(
  tierKey: string,
  interval: 'month' | 'year' = 'month',
): Promise<string | null> {
  const plans = await loadPlanLimits();
  const key = buildKey(tierKey, interval);
  return plans.find((p) => p.voicelink_key === key)?.stripe_price_id ?? null;
}

/** Tier new signups land on (Free Trial — €0, 100 credits, no card). */
export async function getTrialTier(): Promise<PlanLimit> {
  const plans = await loadPlanLimits();
  const trial = plans.find((p) => p.voicelink_key === 'free_trial_monthly');
  if (!trial) throw new Error('free_trial_monthly missing from plan_limits');
  return trial;
}

/** Return all plan rows. */
export async function getAllPlans(): Promise<PlanLimit[]> {
  return loadPlanLimits();
}

// ── Credit packs (one-time top-up purchases) ────────────────────────────────

export interface CreditPack {
  voicelink_key: string;       // e.g. 'credit_pack_250'
  name: string;
  credits: number;
  amount_cents: number;
  currency: string;
  stripe_price_id: string;
  active: boolean;
}

let creditPacksCache: Promise<CreditPack[]> | null = null;

/** Active credit packs available for purchase (lowest credits first). */
export async function getActiveCreditPacks(): Promise<CreditPack[]> {
  if (!creditPacksCache) {
    creditPacksCache = (async () => {
      const { data, error } = await supabase
        .from('credit_packs')
        .select('voicelink_key,name,credits,amount_cents,currency,stripe_price_id,active')
        .eq('active', true)
        .order('credits', { ascending: true });
      if (error || !data) {
        creditPacksCache = null;
        throw error ?? new Error('Failed to load credit_packs');
      }
      return data as CreditPack[];
    })();
  }
  return creditPacksCache;
}
