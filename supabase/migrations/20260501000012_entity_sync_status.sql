-- Entity-sync status tracking on teamleader_users.
-- Populated by VLAgent's prewarm.py at each phase; read by the dashboard
-- BusinessSyncTile to show "synced N entities at T" or "failed — retry".
-- Service-role-only writes (VLAgent uses SUPABASE_KEY/service_role);
-- frontend reads via the existing own-row SELECT policy on teamleader_users.

ALTER TABLE teamleader_users
    ADD COLUMN IF NOT EXISTS entity_sync_status        text,
    ADD COLUMN IF NOT EXISTS entity_sync_started_at    timestamptz,
    ADD COLUMN IF NOT EXISTS entity_sync_completed_at  timestamptz,
    ADD COLUMN IF NOT EXISTS entity_sync_companies     integer,
    ADD COLUMN IF NOT EXISTS entity_sync_contacts      integer,
    ADD COLUMN IF NOT EXISTS entity_sync_products      integer,
    ADD COLUMN IF NOT EXISTS entity_sync_aliases_written integer,
    ADD COLUMN IF NOT EXISTS entity_sync_error         text;

-- Constrain the status to known states. NULL allowed = never-synced.
ALTER TABLE teamleader_users
    DROP CONSTRAINT IF EXISTS teamleader_users_entity_sync_status_check;
ALTER TABLE teamleader_users
    ADD CONSTRAINT teamleader_users_entity_sync_status_check
    CHECK (entity_sync_status IS NULL
           OR entity_sync_status IN ('pending', 'in_progress', 'completed', 'failed'));
