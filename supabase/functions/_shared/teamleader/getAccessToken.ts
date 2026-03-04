// ── getAccessToken ────────────────────────────────────────────────────────────
// Returns a valid Teamleader access token for a test user, refreshing it
// transparently when it is expired or within 5 minutes of expiry.
//
// Usage:
//   const token = await getTestUserAccessToken(supabase, phone);
//   // use token in Teamleader API calls

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

const REFRESH_BUFFER_MS = 5 * 60 * 1000; // refresh 5 min before expiry

interface TokenRow {
  tl_access_token:     string | null;
  tl_refresh_token:    string | null;
  tl_token_expires_at: string | null;
}

export async function getTestUserAccessToken(
  supabase: SupabaseClient,
  phone: string,
): Promise<string> {
  const { data, error } = await supabase
    .from('test_users')
    .select('tl_access_token, tl_refresh_token, tl_token_expires_at')
    .eq('phone', phone)
    .maybeSingle<TokenRow>();

  if (error || !data) throw new Error('Test user not found');
  if (!data.tl_access_token || !data.tl_refresh_token) {
    throw new Error('Teamleader not connected for this test user');
  }

  const expiresAt = data.tl_token_expires_at
    ? new Date(data.tl_token_expires_at).getTime()
    : 0;
  const needsRefresh = Date.now() >= expiresAt - REFRESH_BUFFER_MS;

  if (!needsRefresh) return data.tl_access_token;

  // ── Refresh ───────────────────────────────────────────────────────────────
  const clientId     = Deno.env.get('TEAMLEADER_CLIENT_ID')!;
  const clientSecret = Deno.env.get('TEAMLEADER_CLIENT_SECRET')!;
  const authBase     = Deno.env.get('TEAMLEADER_AUTH_BASE_URL') || 'https://app.teamleader.eu';
  const tokenUrl     = `${authBase.replace(/\/$/, '')}/oauth2/access_token`;

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: data.tl_refresh_token,
      client_id:     clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }

  const tokens = await res.json() as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  await supabase
    .from('test_users')
    .update({
      tl_access_token:     tokens.access_token,
      tl_refresh_token:    tokens.refresh_token,
      tl_token_expires_at: newExpiresAt,
      updated_at:          new Date().toISOString(),
    })
    .eq('phone', phone);

  return tokens.access_token;
}
