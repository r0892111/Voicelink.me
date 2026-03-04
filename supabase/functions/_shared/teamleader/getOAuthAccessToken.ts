// ── getOAuthAccessToken ───────────────────────────────────────────────────────
// Returns a valid Teamleader access token for a regular (paying) user whose
// tokens are stored in oauth_tokens, refreshing transparently when needed.
//
// Usage:
//   const token = await getOAuthAccessToken(supabase, userId);

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

const REFRESH_BUFFER_MS = 5 * 60 * 1000;

interface OAuthRow {
  access_token:  string | null;
  refresh_token: string | null;
  expires_at:    string | null;
}

export async function getOAuthAccessToken(
  supabase: SupabaseClient,
  userId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from('oauth_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .eq('provider', 'teamleader')
    .maybeSingle<OAuthRow>();

  if (error || !data) throw new Error('No OAuth token found for user');
  if (!data.access_token || !data.refresh_token) {
    throw new Error('Incomplete token record for user');
  }

  const expiresAt  = data.expires_at ? new Date(data.expires_at).getTime() : 0;
  const needsRefresh = Date.now() >= expiresAt - REFRESH_BUFFER_MS;

  if (!needsRefresh) return data.access_token;

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
      refresh_token: data.refresh_token,
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
    .from('oauth_tokens')
    .update({
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at:    newExpiresAt,
      updated_at:    new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('provider', 'teamleader');

  return tokens.access_token;
}
