#!/usr/bin/env node
// ── VoiceLink Stripe product setup ───────────────────────────────────────────
// Creates the four public plans (Starter, Professional, Business, plus the
// Free-Trial placeholder) and their monthly/yearly prices in Stripe, with the
// volume tiers defined on the public pricing page. Idempotent by metadata key:
// re-running the script will re-use existing products and prices instead of
// duplicating them.
//
// Enterprise is intentionally NOT created — it is contact-sales only.
//
// Usage:
//   # dry-run: shows what would be created / reused, touches nothing
//   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup-products.mjs
//
//   # actually create/update in Stripe
//   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup-products.mjs --apply
//
// Output:
//   - prints a summary table of products + price IDs
//   - writes scripts/stripe-manifest.json with the same data so it can be
//     consumed by the app config (gitignored by default).
//
// Required deps:
//   npm i -D stripe@^17

import Stripe from 'stripe';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');

const SECRET = process.env.STRIPE_SECRET_KEY;
if (!SECRET) {
  console.error('✗ STRIPE_SECRET_KEY is not set.');
  console.error('  Export it first, e.g.:   export STRIPE_SECRET_KEY=sk_test_...');
  process.exit(1);
}
const VALID_PREFIXES = ['sk_test_', 'sk_live_', 'rk_test_', 'rk_live_'];
if (!VALID_PREFIXES.some((p) => SECRET.startsWith(p))) {
  console.error('✗ STRIPE_SECRET_KEY does not look like a Stripe key.');
  console.error('  Expected one of: sk_test_, sk_live_, rk_test_, rk_live_');
  process.exit(1);
}

const stripe = new Stripe(SECRET);
const MODE = SECRET.includes('_live_') ? 'LIVE' : 'TEST';
const VLNS = 'voicelink';                 // metadata namespace
const YEARLY_DISCOUNT = 0.8;              // 20% off annual

// ─── Volume tiers (all amounts in EUR cents) ─────────────────────────────────
// Keep in sync with src/components/PricingSection.tsx
const PRO_TIERS_MONTHLY = [
  { upTo:  3, amount: 5900 },   // €59.00
  { upTo:  6, amount: 5605 },   // €56.05 (-5%)
  { upTo: 10, amount: 5428 },   // €54.28 (-8%)
  { upTo: 15, amount: 5192 },   // €51.92 (-12%)
  { upTo: 25, amount: 5015 },   // €50.15 (-15%)
  { upTo: 50, amount: 4838 },   // €48.38 (-18%)
];

const BIZ_TIERS_MONTHLY = [
  { upTo:  3, amount: 10900 },  // €109.00
  { upTo:  6, amount: 10355 },  // €103.55 (-5%)
  { upTo: 10, amount: 10028 },  // €100.28 (-8%)
  { upTo: 15, amount:  9592 },  // €95.92 (-12%)
  { upTo: 50, amount:  9265 },  // €92.65 (-15%)
];

function yearlyOf(tiers) {
  // Stripe expects an integer amount in cents. 20% off, rounded to nearest cent.
  return tiers.map((t) => ({
    upTo: t.upTo,
    amount: Math.round(t.amount * YEARLY_DISCOUNT),
  }));
}

const STARTER_MONTHLY = 2400;              // €24.00
const STARTER_YEARLY  = Math.round(STARTER_MONTHLY * YEARLY_DISCOUNT); // €19.20 = 1920

// ─── Products we manage ──────────────────────────────────────────────────────
const PRODUCTS = [
  {
    key: 'free_trial',
    name: 'VoiceLink Free Trial',
    description: '100 credits · 1 month · no charge, upgrade anytime.',
    prices: [
      {
        key: 'free_trial_monthly',
        nickname: 'Free Trial · Monthly',
        interval: 'month',
        billing_scheme: 'per_unit',
        unit_amount: 0,
      },
    ],
  },
  {
    key: 'starter',
    name: 'VoiceLink Starter',
    description: 'For solo operators. 350 credits/user/month (~35–50 voice messages).',
    prices: [
      {
        key: 'starter_monthly',
        nickname: 'Starter · Monthly',
        interval: 'month',
        billing_scheme: 'per_unit',
        unit_amount: STARTER_MONTHLY,
      },
      {
        key: 'starter_yearly',
        nickname: 'Starter · Yearly',
        interval: 'year',
        billing_scheme: 'per_unit',
        unit_amount: STARTER_YEARLY * 12, // annual charge per seat
      },
    ],
  },
  {
    key: 'professional',
    name: 'VoiceLink Professional',
    description: 'Teams up to 50. 1000 credits/user/month with volume discounts and auto top-up.',
    prices: [
      {
        key: 'professional_monthly',
        nickname: 'Professional · Monthly',
        interval: 'month',
        billing_scheme: 'tiered',
        tiers_mode: 'volume',
        tiers: PRO_TIERS_MONTHLY,
      },
      {
        key: 'professional_yearly',
        nickname: 'Professional · Yearly',
        interval: 'year',
        billing_scheme: 'tiered',
        tiers_mode: 'volume',
        // yearly tiers = monthly tier × 12 × 0.8
        tiers: PRO_TIERS_MONTHLY.map((t) => ({
          upTo: t.upTo,
          amount: Math.round(t.amount * YEARLY_DISCOUNT * 12),
        })),
      },
    ],
  },
  {
    key: 'business',
    name: 'VoiceLink Business',
    description: 'Up to 50 seats. 2000 credits/user/month, priority support, dedicated account manager.',
    prices: [
      {
        key: 'business_monthly',
        nickname: 'Business · Monthly',
        interval: 'month',
        billing_scheme: 'tiered',
        tiers_mode: 'volume',
        tiers: BIZ_TIERS_MONTHLY,
      },
      {
        key: 'business_yearly',
        nickname: 'Business · Yearly',
        interval: 'year',
        billing_scheme: 'tiered',
        tiers_mode: 'volume',
        tiers: BIZ_TIERS_MONTHLY.map((t) => ({
          upTo: t.upTo,
          amount: Math.round(t.amount * YEARLY_DISCOUNT * 12),
        })),
      },
    ],
  },
];

// ─── Idempotency helpers ─────────────────────────────────────────────────────
async function findProduct(key) {
  // Stripe search is fastest, but needs `products:read` — fall back to list.
  try {
    const res = await stripe.products.search({
      query: `active:'true' AND metadata['${VLNS}_key']:'${key}'`,
      limit: 1,
    });
    return res.data[0] ?? null;
  } catch {
    const list = await stripe.products.list({ active: true, limit: 100 });
    return list.data.find((p) => p.metadata?.[`${VLNS}_key`] === key) ?? null;
  }
}

async function findPrice(productId, priceKey) {
  const list = await stripe.prices.list({ product: productId, active: true, limit: 100 });
  return list.data.find((p) => p.metadata?.[`${VLNS}_key`] === priceKey) ?? null;
}

function describePrice(p) {
  if (p.billing_scheme === 'tiered') {
    // `tiers` on a newly-created Price isn't expanded by default; fall back
    // to our local definition when the API response doesn't include it.
    const n = Array.isArray(p.tiers) ? p.tiers.length : undefined;
    return n != null ? `tiered (volume, ${n} brackets)` : 'tiered (volume)';
  }
  return `€${(p.unit_amount / 100).toFixed(2)}`;
}

async function ensureProduct(def) {
  const existing = await findProduct(def.key);
  if (existing) {
    console.log(`  product  ✓ reused    ${existing.id}   (${def.name})`);
    return existing;
  }
  if (!APPLY) {
    console.log(`  product  · would create  ${def.name}`);
    return { id: `<would-create:${def.key}>`, metadata: { [`${VLNS}_key`]: def.key } };
  }
  const created = await stripe.products.create({
    name: def.name,
    description: def.description,
    metadata: { [`${VLNS}_key`]: def.key },
  });
  console.log(`  product  ✚ created    ${created.id}   (${def.name})`);
  return created;
}

async function ensurePrice(productId, def) {
  // Skip lookup for dry-run placeholder productIds
  if (productId.startsWith('<')) {
    console.log(`    price  · would create  ${def.key}   ${describePrice(def)}`);
    return { id: `<would-create:${def.key}>` };
  }
  const existing = await findPrice(productId, def.key);
  if (existing) {
    console.log(`    price  ✓ reused    ${existing.id}   ${def.key}   ${describePrice(existing)}`);
    return existing;
  }
  if (!APPLY) {
    console.log(`    price  · would create  ${def.key}   ${describePrice(def)}`);
    return { id: `<would-create:${def.key}>` };
  }

  const base = {
    product: productId,
    currency: 'eur',
    recurring: { interval: def.interval },
    billing_scheme: def.billing_scheme,
    nickname: def.nickname,
    metadata: { [`${VLNS}_key`]: def.key },
  };

  let priceParams;
  if (def.billing_scheme === 'per_unit') {
    priceParams = { ...base, unit_amount: def.unit_amount };
  } else {
    priceParams = {
      ...base,
      tiers_mode: def.tiers_mode,
      tiers: def.tiers.map((t, i) => ({
        up_to: i === def.tiers.length - 1 ? 'inf' : t.upTo,
        unit_amount: t.amount,
      })),
    };
  }

  const created = await stripe.prices.create(priceParams);
  console.log(`    price  ✚ created    ${created.id}   ${def.key}   ${describePrice(created)}`);
  return created;
}

// ─── Main ────────────────────────────────────────────────────────────────────
console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN'} — mode: ${MODE}\n`);

const manifest = { mode: MODE, products: {} };

for (const def of PRODUCTS) {
  console.log(`◆ ${def.name}`);
  const product = await ensureProduct(def);
  const prices = {};
  for (const pDef of def.prices) {
    const price = await ensurePrice(product.id, pDef);
    prices[pDef.key] = price.id;
  }
  manifest.products[def.key] = {
    id: product.id,
    name: def.name,
    prices,
  };
  console.log();
}

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log('─── Manifest ─────────────────────────────────────────────────');
for (const [key, info] of Object.entries(manifest.products)) {
  console.log(`\n${key}:`);
  console.log(`  product  ${info.id}`);
  for (const [pk, pid] of Object.entries(info.prices)) {
    console.log(`  ${pk.padEnd(22)}  ${pid}`);
  }
}
console.log();

// Write manifest file
const manifestPath = resolve(__dirname, 'stripe-manifest.json');
mkdirSync(dirname(manifestPath), { recursive: true });
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`✓ manifest written: ${manifestPath}`);

if (!APPLY) {
  console.log('\n(dry-run — re-run with --apply to actually create in Stripe)');
}
