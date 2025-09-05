/*
  # Add Odoo database name column

  1. Changes
    - Add `odoo_database` column to `odoo_users` table
    - Column stores the Odoo database name for API connections
    - Nullable text field with index for performance

  2. Security
    - No RLS changes needed (inherits existing policies)
*/

-- Add odoo_database column to odoo_users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'odoo_users' AND column_name = 'odoo_database'
  ) THEN
    ALTER TABLE odoo_users ADD COLUMN odoo_database text;
  END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_odoo_users_database ON odoo_users(odoo_database);