-- GDPR retention schedule: when a tenant's last subscription ends, the
-- stripe-webhook stamps erasure_due_at = now() + 30 days and nulls the
-- OAuth tokens (processing stops immediately; data survives the grace
-- period so resubscribers lose nothing). VLAgent's daily erasure sweep
-- runs the full Art. 17 cascade for rows whose stamp has lapsed.
-- Resubscribing (subscription active/trialing) clears the stamp.

ALTER TABLE teamleader_users
  ADD COLUMN IF NOT EXISTS erasure_due_at timestamptz;

COMMENT ON COLUMN teamleader_users.erasure_due_at IS
  'GDPR grace-period deadline set when the last subscription ends; cleared on resubscribe; consumed by VLAgent''s erasure sweep (full Art. 17 cascade).';

CREATE INDEX IF NOT EXISTS idx_teamleader_users_erasure_due_at
  ON teamleader_users (erasure_due_at)
  WHERE erasure_due_at IS NOT NULL;
