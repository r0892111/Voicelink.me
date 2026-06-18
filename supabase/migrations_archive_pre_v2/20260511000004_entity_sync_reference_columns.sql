-- Track per-entity counts for the reference-data prewarm phase.
-- Populated by VLAgent's prewarm.py alongside the existing entity_sync_*
-- columns; read by the dashboard BusinessSyncTile to show the user which
-- lookup tables (pipelines, phases, tax rates, work types) are cached.
--
-- Rollback:
--   ALTER TABLE teamleader_users DROP COLUMN entity_sync_deal_pipelines,
--                                 DROP COLUMN entity_sync_deal_phases,
--                                 DROP COLUMN entity_sync_tax_rates,
--                                 DROP COLUMN entity_sync_work_types;

ALTER TABLE teamleader_users
    ADD COLUMN IF NOT EXISTS entity_sync_deal_pipelines integer,
    ADD COLUMN IF NOT EXISTS entity_sync_deal_phases    integer,
    ADD COLUMN IF NOT EXISTS entity_sync_tax_rates      integer,
    ADD COLUMN IF NOT EXISTS entity_sync_work_types     integer;
