-- Track which Projects API version each tenant uses (v1 legacy or v2 / Project
-- Tracker). VLAgent calls /accounts.projects-v2-status once per tenant per
-- day and caches the result here. When projects_version != 'projects-v2',
-- the project tools are filtered out of the extraction toolset so we don't
-- send v2 calls to legacy tenants.
--
-- Rollback:
--   ALTER TABLE teamleader_users DROP COLUMN projects_version,
--                                 DROP COLUMN projects_version_checked_at;

ALTER TABLE teamleader_users
  ADD COLUMN IF NOT EXISTS projects_version text
    CHECK (projects_version IS NULL OR projects_version IN ('projects-v1', 'projects-v2')),
  ADD COLUMN IF NOT EXISTS projects_version_checked_at timestamptz;
