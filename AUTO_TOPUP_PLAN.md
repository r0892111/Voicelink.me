# Auto-Top-Up — Phase 2 Plan

Deferred from the v1 credit-checker rollout (Apr 2026). v1 hard-blocks at quota
exhaustion and surfaces a "buy more" link to the Customer Portal. Auto-top-up
charges users automatically when their credits dip below a threshold so heavy
users on Professional/Business don't have to manually re-up.

## Status

- `plan_limits.has_auto_topup` is already set: `true` for Professional and
  Business, `false` for Free Trial and Starter. **Informational only today** —
  no enforcement reads this column yet.
- Stripe has no credit-pack product/price. Has to be created.
- Webhook only handles `customer.subscription.*` and `checkout.session.completed`.
  Doesn't yet act on `invoice.paid` for one-time purchases.
- No UI: dashboard has no toggle, no threshold control, no purchase history view.

## Stripe artefacts to create

1. **One-time price** under a new product "VoiceLink Credit Pack":
   - `unit_amount`: TBD (suggestion: €15 for 500 credits = €0.03/credit, ~25%
     premium over the per-seat blended rate to discourage routing all spend
     through top-ups). Adjust to match unit economics.
   - `type: one_time`, `currency: eur`.
   - `metadata.voicelink_key = 'credit_pack_500'`.
   - `metadata.credits = '500'` (drives the credit grant on `invoice.paid`).
2. (Optional) Multiple pack sizes (`credit_pack_500`, `credit_pack_2000`,
   `credit_pack_10000`) so heavy users self-select. v1 of auto-top-up can ship
   with one pack; multi-pack is a small follow-up.
3. Customer Portal: enable one-off purchases via the Portal (Settings →
   Customer Portal → "Allow customers to buy additional products"). Or use a
   bespoke Checkout session per top-up — cleaner UX.

## Schema changes

Add a new table for top-ups and a per-account opt-in flag.

```sql
-- 20260601000001_create_credit_topups.sql
CREATE TABLE credit_topups (
    id              bigserial PRIMARY KEY,
    customer_id     text NOT NULL,             -- Stripe customer ID (joins to teamleader_users.stripe_customer_id)
    teamleader_id   text NOT NULL,             -- which seat consumed credits when threshold tripped
    stripe_invoice  text NOT NULL UNIQUE,      -- Stripe invoice ID for the charge
    voicelink_key   text NOT NULL,             -- e.g. 'credit_pack_500'
    credits_added   integer NOT NULL CHECK (credits_added > 0),
    amount_cents    integer NOT NULL,
    currency        text NOT NULL DEFAULT 'eur',
    status          text NOT NULL,             -- 'pending' | 'paid' | 'failed' | 'refunded'
    purchased_at    timestamptz NOT NULL DEFAULT now(),
    consumed_at     timestamptz                -- nullable; set when balance fully drawn down
);

CREATE INDEX idx_credit_topups_customer ON credit_topups(customer_id, status);
```

```sql
-- 20260601000002_add_auto_topup_to_teamleader_users.sql
ALTER TABLE teamleader_users
    ADD COLUMN auto_topup_enabled boolean NOT NULL DEFAULT false,
    ADD COLUMN auto_topup_threshold_pct integer NOT NULL DEFAULT 10
        CHECK (auto_topup_threshold_pct BETWEEN 1 AND 50),
    ADD COLUMN auto_topup_pack text;  -- e.g. 'credit_pack_500'
```

Why three columns instead of one JSON blob: each is queried independently and
the column types let Postgres enforce ranges. Three columns is cheap.

## Webhook expansion

`supabase/functions/stripe-webhook/index.ts` adds a handler:

```ts
case 'invoice.paid':
  await handleInvoicePaid(r, supabase, event.data.object as Stripe.Invoice);
  break;
```

`handleInvoicePaid`:

1. If invoice has no `subscription` — it's a one-off charge. Look at the
   line items for a price with `metadata.voicelink_key` starting with
   `credit_pack_`.
2. Insert/upsert a `credit_topups` row keyed on `stripe_invoice`.
3. Status = `'paid'`.

The credit-check function (`credit_check.py`) reads available top-up credits
on top of the per-seat allotment:

```
allowed = (used < limit + sum(top_ups_paid_this_period))
```

(Trial and `refresh_policy='once'` plans don't accumulate top-ups; auto-top-up
only kicks in when `plan_limits.has_auto_topup = true`.)

## Trigger logic

When `_enforce_credits` is about to block:

1. Load the billing user's `auto_topup_enabled`, `auto_topup_pack`, and the
   plan's `has_auto_topup`.
2. If all three are truthy and `remaining < limit * threshold_pct/100`,
   call a new edge function `stripe-topup-charge` that creates an invoice
   item + finalises the invoice on the customer's default payment method.
3. The webhook fires `invoice.paid`, the `credit_topups` row lands, and the
   re-check passes on the user's next request.

For v1 of auto-top-up, do **not** retry from inside `_enforce_credits` —
returning 402 with a "topping up, retry in a sec" message is fine. Synchronous
charge-and-retry is a v3 polish.

## Frontend

Dashboard → Billing tab:

- New section: "Auto top-up" (visible only when current plan has
  `has_auto_topup = true`).
- Toggle: enabled/disabled (writes `auto_topup_enabled`).
- Slider: threshold (5%, 10%, 20%, 30%) — writes `auto_topup_threshold_pct`.
- Dropdown: pack size — writes `auto_topup_pack`.
- Past top-ups list: read from `credit_topups` filtered by `customer_id`.

i18n keys to add (en, nl, fr, de):
`dashboard.billing.autoTopup.{title,description,enable,threshold,packSize,history}`.

## Notification

When a top-up fires, email the admin: "We charged you €X for 500 extra
credits. Manage in your dashboard." Use whatever transactional email channel
already exists (no new infra in this plan).

## Open questions

1. Pack size + price — needs unit-economics input. Default suggestion above
   is illustrative.
2. Should top-up credits roll over across billing periods, or expire at
   period end like the per-seat allotment? Default proposal: roll over until
   consumed (FIFO).
3. Refund policy on cancellation (do we return unused top-up balance?).
4. Per-seat vs admin-pool semantics for top-ups: trail the per-seat-individual
   model from v1, or pool top-ups across the team? Defaulting to admin-pool
   (top-ups benefit whichever seat hits the limit first) is operationally
   simpler.

## Estimate

Phase 2 build: ~1–1.5 days once the questions above are answered.
- Stripe product + price configuration (15m).
- 2 migrations (15m).
- Webhook expansion + tests (2h).
- credit_check.py update + tests (1.5h).
- Dashboard UI + i18n (4h).
- Manual end-to-end smoke against Stripe test mode (1h).
