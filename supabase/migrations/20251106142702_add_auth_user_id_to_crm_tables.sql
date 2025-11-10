/*
  # Add auth_user_id to CRM tables

  1. Changes to CRM tables
    - Add `auth_user_id` column to teamleader_users, pipedrive_users, and odoo_users
    - This column links CRM users to auth users who verified their WhatsApp
    - Nullable to support existing users who haven't completed WhatsApp verification yet

  2. Notes
    - Column is populated when users complete WhatsApp verification with authentication
    - Allows tracking which auth user owns each CRM user record
*/

-- Add auth_user_id column to teamleader_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teamleader_users' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE teamleader_users ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add auth_user_id column to pipedrive_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipedrive_users' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE pipedrive_users ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add auth_user_id column to odoo_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'odoo_users' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE odoo_users ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_teamleader_users_auth_user_id ON teamleader_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_pipedrive_users_auth_user_id ON pipedrive_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_odoo_users_auth_user_id ON odoo_users(auth_user_id);
