-- Credit pack catalog (one-time top-up products) + purchase history.
-- credit_packs is the catalog (what's for sale). Seeded with credit_pack_500.
-- credit_topups is the per-purchase ledger written by stripe-webhook on a
-- successful Stripe Checkout in mode=payment.

CREATE TABLE IF NOT EXISTS credit_packs (
    voicelink_key   text PRIMARY KEY,                              -- e.g. 'credit_pack_500'
    name            text NOT NULL,
    credits         integer NOT NULL CHECK (credits > 0),
    amount_cents    integer NOT NULL CHECK (amount_cents > 0),
    currency        text NOT NULL DEFAULT 'eur',
    stripe_price_id text NOT NULL UNIQUE,
    active          boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

INSERT INTO credit_packs (voicelink_key, name, credits, amount_cents, currency, stripe_price_id) VALUES
    ('credit_pack_500', 'Credit Pack 500', 500, 1500, 'eur', 'price_1TSdu0LPohnizGblGaG8h5vK')
ON CONFLICT (voicelink_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS credit_topups (
    id                 bigserial PRIMARY KEY,
    customer_id        text NOT NULL,                              -- Stripe customer ID
    teamleader_id      text,                                       -- buyer (nullable: not all flows resolve it)
    stripe_payment_id  text NOT NULL UNIQUE,                       -- Stripe payment_intent ID
    voicelink_key      text NOT NULL REFERENCES credit_packs(voicelink_key) ON UPDATE CASCADE,
    credits_added      integer NOT NULL CHECK (credits_added > 0),
    amount_cents       integer NOT NULL,
    currency           text NOT NULL DEFAULT 'eur',
    status             text NOT NULL,                              -- 'paid' | 'failed' | 'refunded'
    purchased_at       timestamptz NOT NULL DEFAULT now(),
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_topups_customer
    ON credit_topups(customer_id, status);

CREATE INDEX IF NOT EXISTS idx_credit_topups_purchased_at
    ON credit_topups(purchased_at DESC);
