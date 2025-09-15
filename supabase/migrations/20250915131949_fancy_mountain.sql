/*
  # Add team member support to CRM tables

  1. Schema Changes
    - Add `is_admin` boolean field to all CRM provider tables
    - Add `admin_user_id` field to link team members to admin account
    - Add `invited_by` field to track who invited the user
    - Add `invitation_status` field to track invitation state
    - Add `invited_at` timestamp for invitation tracking

  2. Security
    - Update RLS policies to allow admin users to manage their team members
    - Allow team members to read their own data and admin's shared data

  3. Indexes
    - Add indexes for efficient team member queries
*/

-- Add team member fields to teamleader_users table
ALTER TABLE teamleader_users 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS invitation_status text DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'accepted', 'declined')),
ADD COLUMN IF NOT EXISTS invited_at timestamptz DEFAULT now();

-- Add team member fields to pipedrive_users table
ALTER TABLE pipedrive_users 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS invitation_status text DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'accepted', 'declined')),
ADD COLUMN IF NOT EXISTS invited_at timestamptz DEFAULT now();

-- Add team member fields to odoo_users table
ALTER TABLE odoo_users 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS invitation_status text DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'accepted', 'declined')),
ADD COLUMN IF NOT EXISTS invited_at timestamptz DEFAULT now();

-- Update existing users to be admins (users who created their own accounts)
UPDATE teamleader_users SET is_admin = true WHERE admin_user_id IS NULL;
UPDATE pipedrive_users SET is_admin = true WHERE admin_user_id IS NULL;
UPDATE odoo_users SET is_admin = true WHERE admin_user_id IS NULL;

-- Create indexes for efficient team member queries
CREATE INDEX IF NOT EXISTS idx_teamleader_users_admin_user_id ON teamleader_users(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_teamleader_users_is_admin ON teamleader_users(is_admin);
CREATE INDEX IF NOT EXISTS idx_teamleader_users_invitation_status ON teamleader_users(invitation_status);

CREATE INDEX IF NOT EXISTS idx_pipedrive_users_admin_user_id ON pipedrive_users(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_pipedrive_users_is_admin ON pipedrive_users(is_admin);
CREATE INDEX IF NOT EXISTS idx_pipedrive_users_invitation_status ON pipedrive_users(invitation_status);

CREATE INDEX IF NOT EXISTS idx_odoo_users_admin_user_id ON odoo_users(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_odoo_users_is_admin ON odoo_users(is_admin);
CREATE INDEX IF NOT EXISTS idx_odoo_users_invitation_status ON odoo_users(invitation_status);

-- Update RLS policies for teamleader_users
DROP POLICY IF EXISTS "Users can view their own TeamLeader data" ON teamleader_users;
DROP POLICY IF EXISTS "Users can insert their own TeamLeader data" ON teamleader_users;
DROP POLICY IF EXISTS "Users can update their own TeamLeader data" ON teamleader_users;

CREATE POLICY "Users can view their own and team data" ON teamleader_users
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    admin_user_id = auth.uid() OR
    user_id IN (
      SELECT user_id FROM teamleader_users 
      WHERE admin_user_id = auth.uid() AND deleted_at IS NULL
    )
  );

CREATE POLICY "Admins can insert team members" ON teamleader_users
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR 
    (admin_user_id = auth.uid() AND invited_by = auth.uid())
  );

CREATE POLICY "Users can update their own data, admins can update team data" ON teamleader_users
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid() OR 
    admin_user_id = auth.uid()
  )
  WITH CHECK (
    user_id = auth.uid() OR 
    admin_user_id = auth.uid()
  );

-- Update RLS policies for pipedrive_users
DROP POLICY IF EXISTS "Users can view their own Pipedrive data" ON pipedrive_users;
DROP POLICY IF EXISTS "Users can insert their own Pipedrive data" ON pipedrive_users;
DROP POLICY IF EXISTS "Users can update their own Pipedrive data" ON pipedrive_users;

CREATE POLICY "Users can view their own and team data" ON pipedrive_users
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    admin_user_id = auth.uid() OR
    user_id IN (
      SELECT user_id FROM pipedrive_users 
      WHERE admin_user_id = auth.uid() AND deleted_at IS NULL
    )
  );

CREATE POLICY "Admins can insert team members" ON pipedrive_users
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR 
    (admin_user_id = auth.uid() AND invited_by = auth.uid())
  );

CREATE POLICY "Users can update their own data, admins can update team data" ON pipedrive_users
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid() OR 
    admin_user_id = auth.uid()
  )
  WITH CHECK (
    user_id = auth.uid() OR 
    admin_user_id = auth.uid()
  );

-- Update RLS policies for odoo_users
DROP POLICY IF EXISTS "Users can view their own Odoo data" ON odoo_users;
DROP POLICY IF EXISTS "Users can insert their own Odoo data" ON odoo_users;
DROP POLICY IF EXISTS "Users can update their own Odoo data" ON odoo_users;

CREATE POLICY "Users can view their own and team data" ON odoo_users
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    admin_user_id = auth.uid() OR
    user_id IN (
      SELECT user_id FROM odoo_users 
      WHERE admin_user_id = auth.uid() AND deleted_at IS NULL
    )
  );

CREATE POLICY "Admins can insert team members" ON odoo_users
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR 
    (admin_user_id = auth.uid() AND invited_by = auth.uid())
  );

CREATE POLICY "Users can update their own data, admins can update team data" ON odoo_users
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid() OR 
    admin_user_id = auth.uid()
  )
  WITH CHECK (
    user_id = auth.uid() OR 
    admin_user_id = auth.uid()
  );