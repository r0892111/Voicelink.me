-- Add team management columns + invitation token columns.

-- ── Teamleader ────────────────────────────────────────────────────────────────
ALTER TABLE teamleader_users ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT true;
ALTER TABLE teamleader_users ADD COLUMN IF NOT EXISTS admin_user_id uuid;
ALTER TABLE teamleader_users ADD COLUMN IF NOT EXISTS invited_by uuid;
ALTER TABLE teamleader_users ADD COLUMN IF NOT EXISTS invitation_status text DEFAULT 'accepted';
ALTER TABLE teamleader_users ADD COLUMN IF NOT EXISTS invited_at timestamptz;
ALTER TABLE teamleader_users ADD COLUMN IF NOT EXISTS invitation_token text UNIQUE;
ALTER TABLE teamleader_users ADD COLUMN IF NOT EXISTS invitation_expires_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_tl_users_invitation_token
  ON teamleader_users(invitation_token)
  WHERE invitation_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tl_users_admin_user_id
  ON teamleader_users(admin_user_id)
  WHERE admin_user_id IS NOT NULL;

-- Pipedrive and Odoo tables will be added when those integrations are built.
