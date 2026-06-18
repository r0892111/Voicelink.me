-- Replace the 500-credit pack with a 250-credit pack at the same €15 price
-- (a deliberate premium per-credit rate over the plan-bundled rate; one-off
-- top-ups are convenience purchases). Same Stripe product, new Stripe price.
--
-- credit_topups.voicelink_key FK has ON UPDATE CASCADE so existing rows
-- migrate; in practice none exist yet (the 500 pack was never sold).

UPDATE credit_packs
   SET voicelink_key   = 'credit_pack_250',
       name            = 'Credit Pack 250',
       credits         = 250,
       amount_cents    = 1500,
       stripe_price_id = 'price_1TSfHkLPohnizGblFWTUfXOg',
       updated_at      = now()
 WHERE voicelink_key IN ('credit_pack_500', 'credit_pack_250');
