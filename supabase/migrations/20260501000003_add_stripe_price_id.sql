-- Add stripe_price_id to plan_limits and backfill from teamPricing.ts.
-- Each voicelink_key maps 1:1 to a Stripe price ID; storing it here lets the
-- frontend resolve checkout price IDs without a config file.

ALTER TABLE plan_limits ADD COLUMN IF NOT EXISTS stripe_price_id text;

UPDATE plan_limits SET stripe_price_id = 'price_1TOfEzLPohnizGblm61hDXFF' WHERE voicelink_key = 'free_trial_monthly';
UPDATE plan_limits SET stripe_price_id = 'price_1TOZ1cLPohnizGblBAttd82T' WHERE voicelink_key = 'starter_monthly';
UPDATE plan_limits SET stripe_price_id = 'price_1TOZ1dLPohnizGbl56BBL8BJ' WHERE voicelink_key = 'starter_yearly';
UPDATE plan_limits SET stripe_price_id = 'price_1TOZ1eLPohnizGbldPFhRy1m' WHERE voicelink_key = 'professional_monthly';
UPDATE plan_limits SET stripe_price_id = 'price_1TOZ25LPohnizGbll2UCxFpu' WHERE voicelink_key = 'professional_yearly';
UPDATE plan_limits SET stripe_price_id = 'price_1TOZ26LPohnizGblXfd6OqxQ' WHERE voicelink_key = 'business_monthly';
UPDATE plan_limits SET stripe_price_id = 'price_1TOZ26LPohnizGblh8BYsGWM' WHERE voicelink_key = 'business_yearly';

ALTER TABLE plan_limits ALTER COLUMN stripe_price_id SET NOT NULL;
ALTER TABLE plan_limits ADD CONSTRAINT plan_limits_stripe_price_id_unique UNIQUE (stripe_price_id);
