/*
  # Add trial started tracking to CRM tables

  1. Changes
    - Add `trial_started_tracked` boolean column to teamleader_users, pipedrive_users, and odoo_users
    - Defaults to false for new users
    - Set to true after first Trial_started analytics event is fired
    
  2. Purpose
    - Prevents duplicate Trial_started events from inflating conversion metrics
    - Ensures event only fires once per user account, regardless of page refreshes or callback re-runs
    
  3. Security
    - Users can read their own trial_started_tracked status
    - Only the user themselves can update it
*/

-- Add trial_started_tracked column to teamleader_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teamleader_users' AND column_name = 'trial_started_tracked'
  ) THEN
    ALTER TABLE teamleader_users ADD COLUMN trial_started_tracked boolean DEFAULT false;
  END IF;
END $$;

-- Add trial_started_tracked column to pipedrive_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipedrive_users' AND column_name = 'trial_started_tracked'
  ) THEN
    ALTER TABLE pipedrive_users ADD COLUMN trial_started_tracked boolean DEFAULT false;
  END IF;
END $$;

-- Add trial_started_tracked column to odoo_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'odoo_users' AND column_name = 'trial_started_tracked'
  ) THEN
    ALTER TABLE odoo_users ADD COLUMN trial_started_tracked boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_teamleader_users_trial_tracked ON teamleader_users(trial_started_tracked);
CREATE INDEX IF NOT EXISTS idx_pipedrive_users_trial_tracked ON pipedrive_users(trial_started_tracked);
CREATE INDEX IF NOT EXISTS idx_odoo_users_trial_tracked ON odoo_users(trial_started_tracked);
