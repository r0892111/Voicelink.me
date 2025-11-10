/*
  # Add WhatsApp Verification Tokens Table

  1. New Tables
    - `whatsapp_verification_tokens`
      - `id` (uuid, primary key) - Unique identifier
      - `auth_user_id` (uuid) - References auth.users for the authenticated user
      - `crm_user_id` (text) - The CRM user ID from the verification link
      - `otp_code` (text) - The OTP code from the verification link
      - `email` (text) - User's email address
      - `name` (text) - User's full name
      - `verified_at` (timestamptz) - When the verification was completed
      - `created_at` (timestamptz) - When the token was created

  2. Security
    - Enable RLS on `whatsapp_verification_tokens` table
    - Add policy for authenticated users to read their own tokens
    - Add policy for authenticated users to update their own tokens

  3. Notes
    - This table stores verification tokens that link auth users to CRM users
    - Tokens are created when users authenticate before WhatsApp verification
    - After successful verification, the `verified_at` timestamp is updated
*/

CREATE TABLE IF NOT EXISTS whatsapp_verification_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  crm_user_id text NOT NULL,
  otp_code text NOT NULL,
  email text NOT NULL,
  name text NOT NULL,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(auth_user_id, crm_user_id)
);

ALTER TABLE whatsapp_verification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own verification tokens"
  ON whatsapp_verification_tokens
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own verification tokens"
  ON whatsapp_verification_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own verification tokens"
  ON whatsapp_verification_tokens
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);
