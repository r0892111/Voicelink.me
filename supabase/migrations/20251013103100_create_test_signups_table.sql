/*
  # Create Test Signups Table

  1. New Tables
    - `test_signups`
      - `id` (uuid, primary key)
      - `first_name` (text, required)
      - `last_name` (text, required)
      - `email` (text, unique, required)
      - `phone` (text, optional)
      - `crm_platform` (text, required) - teamleader, pipedrive, or odoo
      - `status` (text) - pending, contacted, onboarded
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `test_signups` table
    - Allow public insert for new signups
    - Only authenticated admins can read/update signups
*/

CREATE TABLE IF NOT EXISTS test_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  crm_platform text NOT NULL CHECK (crm_platform IN ('teamleader', 'pipedrive', 'odoo')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'onboarded')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE test_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert test signups"
  ON test_signups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can view test signups"
  ON test_signups
  FOR SELECT
  TO authenticated
  USING (true);