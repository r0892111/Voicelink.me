/*
  # Add invitation token columns for invited users

  1. Changes to CRM tables
    - Add `invitation_token` column to store unique invitation tokens
    - Add `invitation_token_expires_at` column to track token expiration
    - These columns enable secure invitation flows where users authenticate with their CRM before verifying WhatsApp

  2. Notes
    - Tokens are generated when inviting team members
    - Tokens expire after 24 hours for security
    - Once used, tokens are cleared from the database
*/

-- Add invitation token columns to teamleader_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teamleader_users' AND column_name = 'invitation_token'
  ) THEN
    ALTER TABLE teamleader_users ADD COLUMN invitation_token text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teamleader_users' AND column_name = 'invitation_token_expires_at'
  ) THEN
    ALTER TABLE teamleader_users ADD COLUMN invitation_token_expires_at timestamptz;
  END IF;
END $$;

-- Add invitation token columns to pipedrive_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipedrive_users' AND column_name = 'invitation_token'
  ) THEN
    ALTER TABLE pipedrive_users ADD COLUMN invitation_token text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipedrive_users' AND column_name = 'invitation_token_expires_at'
  ) THEN
    ALTER TABLE pipedrive_users ADD COLUMN invitation_token_expires_at timestamptz;
  END IF;
END $$;

-- Add invitation token columns to odoo_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'odoo_users' AND column_name = 'invitation_token'
  ) THEN
    ALTER TABLE odoo_users ADD COLUMN invitation_token text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'odoo_users' AND column_name = 'invitation_token_expires_at'
  ) THEN
    ALTER TABLE odoo_users ADD COLUMN invitation_token_expires_at timestamptz;
  END IF;
END $$;