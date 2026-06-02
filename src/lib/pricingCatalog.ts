// ── Pricing catalog — single source of truth for plans + price math ──────────
// Extracted from PricingSection.tsx so the get-started page renders the exact
// same plans and prices without forking the numbers. PricingSection and
// GetStarted both import from here.

import type { BillingPeriod } from '../components/BillingPeriodSwitch';

export interface VolumeTier {
  min: number;
  max: number;
  discount: number;
  pricePerUser: number;
}

export interface PricingPlan {
  key: string;
  isFreeTrial: boolean;
  highlighted: boolean;
  baseMonthlyPrice: number;
  credits: number;
  creditsApprox: string;
  hasVolumeDiscounts: boolean;
  volumeTiers: VolumeTier[];
  hasAutoTopUp: boolean;
  featureKeys: string[];
}

const PROFESSIONAL_TIERS: VolumeTier[] = [
  { min: 1,  max: 3,  discount: 0,  pricePerUser: 59.00 },
  { min: 4,  max: 6,  discount: 5,  pricePerUser: 56.05 },
  { min: 7,  max: 10, discount: 8,  pricePerUser: 54.28 },
  { min: 11, max: 15, discount: 12, pricePerUser: 51.92 },
  { min: 16, max: 25, discount: 15, pricePerUser: 50.15 },
  { min: 26, max: 50, discount: 18, pricePerUser: 48.38 },
];

const BUSINESS_TIERS: VolumeTier[] = [
  { min: 1,  max: 3,  discount: 0,  pricePerUser: 109.00 },
  { min: 4,  max: 6,  discount: 5,  pricePerUser: 103.55 },
  { min: 7,  max: 10, discount: 8,  pricePerUser: 100.28 },
  { min: 11, max: 15, discount: 12, pricePerUser: 95.92 },
  { min: 16, max: 50, discount: 15, pricePerUser: 92.65 },
];


export const plans: PricingPlan[] = [
  {
    key: 'freetrial',
    isFreeTrial: true,
    highlighted: false,
    baseMonthlyPrice: 0,
    credits: 100,
    creditsApprox: '20–30',
    hasVolumeDiscounts: false,
    volumeTiers: [],
    hasAutoTopUp: false,
    featureKeys: [
      'pricing.features.voiceNotes',
      'pricing.features.realtimeCrmSync',
      'pricing.features.multiLanguageSupport',
    ],
  },
  {
    key: 'starter',
    isFreeTrial: false,
    highlighted: false,
    baseMonthlyPrice: 24,
    credits: 350,
    creditsApprox: '35–50',
    hasVolumeDiscounts: false,
    volumeTiers: [],
    hasAutoTopUp: false,
    featureKeys: [
      'pricing.features.voiceNotes',
      'pricing.features.realtimeCrmSync',
      'pricing.features.multiLanguageSupport',
      'pricing.features.emailSupport',
    ],
  },
  {
    key: 'professional',
    isFreeTrial: false,
    highlighted: true,
    baseMonthlyPrice: 59,
    credits: 1000,
    creditsApprox: '100–142',
    hasVolumeDiscounts: true,
    volumeTiers: PROFESSIONAL_TIERS,
    hasAutoTopUp: true,
    featureKeys: [
      'pricing.features.voiceNotes',
      'pricing.features.realtimeCrmSync',
      'pricing.features.multiLanguageSupport',
      'pricing.features.prioritySupport',
      'pricing.features.autoTopUp',
    ],
  },
  {
    key: 'business',
    isFreeTrial: false,
    highlighted: false,
    baseMonthlyPrice: 109,
    credits: 2000,
    creditsApprox: '200–285',
    hasVolumeDiscounts: true,
    volumeTiers: BUSINESS_TIERS,
    hasAutoTopUp: true,
    featureKeys: [
      'pricing.features.voiceNotes',
      'pricing.features.realtimeCrmSync',
      'pricing.features.multiLanguageSupport',
      'pricing.features.prioritySupport',
      'pricing.features.dedicatedAccountManager',
      'pricing.features.autoTopUp',
    ],
  },
];

export function getVolumeTier(tiers: VolumeTier[], users: number): VolumeTier {
  return tiers.find(t => users >= t.min && users <= t.max) ?? tiers[tiers.length - 1];
}

export function getPricePerUser(plan: PricingPlan, users: number, billingPeriod: BillingPeriod): number {
  if (plan.isFreeTrial) return 0;
  let price = plan.baseMonthlyPrice;
  if (plan.hasVolumeDiscounts && plan.volumeTiers.length > 0) {
    price = getVolumeTier(plan.volumeTiers, users).pricePerUser;
  }
  if (billingPeriod === 'yearly') price = Math.round(price * 0.8 * 100) / 100;
  return price;
}

export function formatPrice(price: number): string {
  return price % 1 === 0 ? String(price) : price.toFixed(2);
}

// Format a euro amount with NL-style decimals (€57,60). Used for the yearly
// savings badge so it reads naturally for the Belgian/NL audience.
export function formatEuro(amount: number): string {
  return '€' + amount.toFixed(2).replace('.', ',');
}
