-- Create stripe_subscriptions cache table.
-- Populated by the stripe-webhook edge function on subscription lifecycle events.
-- Read by the VLAgent backend to enforce per-seat credit limits.
--
-- customer_id is intentionally NOT a foreign key to teamleader_users.stripe_customer_id —
-- the webhook can fire before that column is updated, and stripe_customer_id is currently
-- nullable and non-unique on teamleader_users. Lookups join logically.

CREATE TABLE IF NOT EXISTS stripe_subscriptions (
    subscription_id        text PRIMARY KEY,                                                  -- Stripe sub ID (sub_…)
    customer_id            text NOT NULL,                                                     -- Stripe customer ID (cus_…)
    price_id               text,                                                              -- Stripe price ID at last sync
    voicelink_key          text REFERENCES plan_limits(voicelink_key) ON UPDATE CASCADE,      -- denormalized from price.metadata.voicelink_key
    status                 text NOT NULL,                                                     -- active | trialing | past_due | canceled | unpaid | incomplete | incomplete_expired
    quantity               integer NOT NULL DEFAULT 1 CHECK (quantity >= 1),                  -- seat count
    current_period_start   timestamptz NOT NULL,
    current_period_end     timestamptz NOT NULL,
    cancel_at_period_end   boolean NOT NULL DEFAULT false,
    canceled_at            timestamptz,
    created_at             timestamptz NOT NULL DEFAULT now(),
    updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer
    ON stripe_subscriptions(customer_id);

CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_status
    ON stripe_subscriptions(status);
