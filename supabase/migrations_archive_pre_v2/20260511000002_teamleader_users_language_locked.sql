-- ── teamleader_users.language_locked ─────────────────────────────────────────
-- Tracks whether the user has explicitly confirmed their language preference.
-- New users start with language_locked=false so the dashboard surfaces a
-- blocking modal forcing them to pick (or confirm the default). Existing
-- users keep locked=false too, since their currently-stored 'nl' default
-- (from migration 20260504000001) may be wrong for non-Dutch speakers.
--
-- VLAgent reads (language, language_locked) at request time: when locked,
-- replies use the stored language regardless of per-message langdetect.
--
-- Rollback: ALTER TABLE teamleader_users DROP COLUMN language_locked;

ALTER TABLE teamleader_users
  ADD COLUMN language_locked boolean NOT NULL DEFAULT false;
