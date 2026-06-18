\n\n-- Drop existing policies\nDROP POLICY IF EXISTS "Users can read own data" ON users;
\nDROP POLICY IF EXISTS "Users can update own data" ON users;
\nDROP POLICY IF EXISTS "Users can insert own data" ON users;
\n\n-- Create new policies that work with API key authentication\nCREATE POLICY "Allow read access for TeamLeader users"\n  ON users\n  FOR SELECT\n  TO anon, authenticated\n  USING (true);
\n\nCREATE POLICY "Allow insert for TeamLeader users"\n  ON users\n  FOR INSERT\n  TO anon, authenticated\n  WITH CHECK (true);
\n\nCREATE POLICY "Allow update for TeamLeader users"\n  ON users\n  FOR UPDATE\n  TO anon, authenticated\n  USING (true)\n  WITH CHECK (true);
\n\n-- Ensure RLS is enabled\nALTER TABLE users ENABLE ROW LEVEL SECURITY;
;
