/*
  # Add Language Preference Columns

  1. Changes
    - Add `language_preference` column to `odoo_users` table
    - Add `language_preference` column to `pipedrive_users` table
    - Column will store language codes: 'en', 'nl', 'fr', 'de'

  2. Notes
    - The column is added with lowercase naming convention for consistency
    - Default value is NULL to allow users to set their preference
*/

-- Add language_preference column to odoo_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'odoo_users' AND column_name = 'language_preference'
  ) THEN
    ALTER TABLE odoo_users ADD COLUMN language_preference text;
  END IF;
END $$;

-- Add language_preference column to pipedrive_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipedrive_users' AND column_name = 'language_preference'
  ) THEN
    ALTER TABLE pipedrive_users ADD COLUMN language_preference text;
  END IF;
END $$;

-- Rename Language_Preference to language_preference in teamleader_users for consistency
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teamleader_users' AND column_name = 'Language_Preference'
  ) THEN
    ALTER TABLE teamleader_users RENAME COLUMN "Language_Preference" TO language_preference;
  END IF;
END $$;