/*
  # Fix RLS Infinite Recursion

  1. Problem
    - The team member RLS policies are causing infinite recursion
    - Circular references in policy definitions
    
  2. Solution
    - Simplify RLS policies to avoid circular references
    - Use direct user_id checks instead of complex subqueries
    - Separate admin and team member access patterns
    
  3. Security
    - Users can only access their own data
    - Admins can access their team members' data
    - No circular policy dependencies
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own and team data" ON teamleader_users;
DROP POLICY IF EXISTS "Users can update their own data, admins can update team data" ON teamleader_users;
DROP POLICY IF EXISTS "Admins can insert team members" ON teamleader_users;
DROP POLICY IF EXISTS "allow user insert own teamleader record" ON teamleader_users;
DROP POLICY IF EXISTS "allow user update own teamleader record" ON teamleader_users;

DROP POLICY IF EXISTS "Users can view their own and team data" ON pipedrive_users;
DROP POLICY IF EXISTS "Users can update their own data, admins can update team data" ON pipedrive_users;
DROP POLICY IF EXISTS "Admins can insert team members" ON pipedrive_users;
DROP POLICY IF EXISTS "allow user insert own pipedrive record" ON pipedrive_users;
DROP POLICY IF EXISTS "allow user update own pipedrive record" ON pipedrive_users;
DROP POLICY IF EXISTS "allow_postgres_inserts" ON pipedrive_users;

DROP POLICY IF EXISTS "Users can view their own and team data" ON odoo_users;
DROP POLICY IF EXISTS "Users can update their own data, admins can update team data" ON odoo_users;
DROP POLICY IF EXISTS "Admins can insert team members" ON odoo_users;

-- Create simplified, non-recursive policies for teamleader_users
CREATE POLICY "teamleader_users_select_own_data"
  ON teamleader_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "teamleader_users_select_admin_team"
  ON teamleader_users
  FOR SELECT
  TO authenticated
  USING (admin_user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "teamleader_users_insert_own"
  ON teamleader_users
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "teamleader_users_insert_team_member"
  ON teamleader_users
  FOR INSERT
  TO authenticated
  WITH CHECK (admin_user_id = auth.uid() AND invited_by = auth.uid());

CREATE POLICY "teamleader_users_update_own"
  ON teamleader_users
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "teamleader_users_update_team_member"
  ON teamleader_users
  FOR UPDATE
  TO authenticated
  USING (admin_user_id = auth.uid())
  WITH CHECK (admin_user_id = auth.uid());

-- Create simplified, non-recursive policies for pipedrive_users
CREATE POLICY "pipedrive_users_select_own_data"
  ON pipedrive_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "pipedrive_users_select_admin_team"
  ON pipedrive_users
  FOR SELECT
  TO authenticated
  USING (admin_user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "pipedrive_users_insert_own"
  ON pipedrive_users
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "pipedrive_users_insert_team_member"
  ON pipedrive_users
  FOR INSERT
  TO authenticated
  WITH CHECK (admin_user_id = auth.uid() AND invited_by = auth.uid());

CREATE POLICY "pipedrive_users_update_own"
  ON pipedrive_users
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "pipedrive_users_update_team_member"
  ON pipedrive_users
  FOR UPDATE
  TO authenticated
  USING (admin_user_id = auth.uid())
  WITH CHECK (admin_user_id = auth.uid());

-- Create simplified, non-recursive policies for odoo_users
CREATE POLICY "odoo_users_select_own_data"
  ON odoo_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "odoo_users_select_admin_team"
  ON odoo_users
  FOR SELECT
  TO authenticated
  USING (admin_user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "odoo_users_insert_own"
  ON odoo_users
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "odoo_users_insert_team_member"
  ON odoo_users
  FOR INSERT
  TO authenticated
  WITH CHECK (admin_user_id = auth.uid() AND invited_by = auth.uid());

CREATE POLICY "odoo_users_update_own"
  ON odoo_users
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "odoo_users_update_team_member"
  ON odoo_users
  FOR UPDATE
  TO authenticated
  USING (admin_user_id = auth.uid())
  WITH CHECK (admin_user_id = auth.uid());