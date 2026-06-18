-- Add a hidden 'admin_grant' credit pack so the monitor's grant form can
-- insert credit_topups rows (credit_topups.voicelink_key has an FK to
-- credit_packs). active=false keeps it out of the dashboard pricing UI;
-- the RLS select policy on credit_packs requires active=true.

INSERT INTO credit_packs (voicelink_key, name, credits, amount_cents, currency, stripe_price_id, active) VALUES
    ('admin_grant', 'Admin Grant (manual)', 1, 1, 'eur', 'admin_grant_no_price', false)
ON CONFLICT (voicelink_key) DO NOTHING;
