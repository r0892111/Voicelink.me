-- Create plan_limits table — single source of truth for credit allocations and seat caps.
-- Mirrors what previously lived in src/config/teamPricing.ts so the dashboard and
-- the VLAgent backend read the same values.
-- Keyed by Stripe price metadata.voicelink_key.

CREATE TABLE IF NOT EXISTS plan_limits (
    voicelink_key      text PRIMARY KEY,
    tier_key           text NOT NULL,                                              -- 'free_trial' | 'starter' | 'professional' | 'business'
    tier_name          text NOT NULL,                                              -- display name
    credits_per_seat   integer NOT NULL CHECK (credits_per_seat >= 0),
    refresh_policy     text NOT NULL CHECK (refresh_policy IN ('once','monthly')), -- once = trial; monthly = paid plans
    max_seats          integer CHECK (max_seats IS NULL OR max_seats >= 1),        -- null = unlimited (none used in v1)
    has_auto_topup     boolean NOT NULL DEFAULT false,                             -- v2 feature flag
    is_trial           boolean NOT NULL DEFAULT false,
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now()
);

-- Seed canonical values from teamPricing.ts.
INSERT INTO plan_limits (voicelink_key, tier_key, tier_name, credits_per_seat, refresh_policy, max_seats, has_auto_topup, is_trial) VALUES
    ('free_trial_monthly',   'free_trial',   'Free Trial',   100,  'once',    1,  false, true),
    ('starter_monthly',      'starter',      'Starter',      350,  'monthly', 1,  false, false),
    ('starter_yearly',       'starter',      'Starter',      350,  'monthly', 1,  false, false),
    ('professional_monthly', 'professional', 'Professional', 1000, 'monthly', 50, true,  false),
    ('professional_yearly',  'professional', 'Professional', 1000, 'monthly', 50, true,  false),
    ('business_monthly',     'business',     'Business',     2000, 'monthly', 50, true,  false),
    ('business_yearly',      'business',     'Business',     2000, 'monthly', 50, true,  false)
ON CONFLICT (voicelink_key) DO NOTHING;
