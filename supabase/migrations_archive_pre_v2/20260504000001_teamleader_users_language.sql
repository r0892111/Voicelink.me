-- ── teamleader_users.language ────────────────────────────────────────────────
-- Adds an explicit language column so service-update broadcasts can match
-- per-user language without falling back to country-code heuristics.
--
-- Default 'nl' reflects the current Belgium/Flemish-leaning user base. New
-- columns elsewhere (TL OAuth, signup form) should populate this on insert
-- once they're wired up.

ALTER TABLE teamleader_users
  ADD COLUMN language text NOT NULL DEFAULT 'nl'
  CHECK (language IN ('nl','en','fr','de'));

-- Backfill the one French-speaking active user identified during the
-- 2026-05-04 broadcast. All other 7 active rows keep the 'nl' default.
UPDATE teamleader_users
SET language = 'fr'
WHERE whatsapp_number = '+33637905823';
