// ── getOAuthAccessToken ───────────────────────────────────────────────────────
// Returns a valid CRM access token for a user whose tokens are stored in
// oauth_tokens, refreshing transparently when needed. Defaults to teamleader so
// existing callers are unchanged; pass provider for pipedrive/hubspot.
//
// Usage:
//   const token = await getOAuthAccessToken(supabase, userId);              // teamleader
//   const token = await getOAuthAccessToken(supabase, userId, 'pipedrive');

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../logger.ts';
import { refreshProviderToken } from '../crm/refresh.ts';

const log = createLogger('getOAuthAccessToken');

const REFRESH_BUFFER_MS = 5 * 60 * 1000;

interface OAuthRow {
  access_token:  string | null;
  refresh_token: string | null;
  expires_at:    string | null;
}

export async function getOAuthAccessToken(
  supabase: SupabaseClient,
  userId: string,
  provider: string = 'teamleader',
): Promise<string> {
  log.info('fetching OAuth token', { user_id: userId, provider });

  const { data, error } = await supabase
    .from('oauth_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .eq('provider', provider)
    .maybeSingle<OAuthRow>();

  if (error || !data) {
    log.error('no OAuth token found', { user_id: userId, provider, error: error?.message });
    throw new Error('No OAuth token found for user');
  }
  if (!data.access_token || !data.refresh_token) {
    log.error('incomplete token record', { user_id: userId, provider });
    throw new Error('Incomplete token record for user');
  }

  const expiresAt  = data.expires_at ? new Date(data.expires_at).getTime() : 0;
  const needsRefresh = Date.now() >= expiresAt - REFRESH_BUFFER_MS;

  if (!needsRefresh) {
    log.info('token still valid, no refresh needed', { user_id: userId, provider, expires_at: data.expires_at });
    return data.access_token;
  }

  // ── Refresh ───────────────────────────────────────────────────────────────
  log.info('token expired or near expiry, refreshing', { user_id: userId, provider, expires_at: data.expires_at });

  const res = await refreshProviderToken(provider, data.refresh_token);
  if (!res.ok) {
    log.error('token refresh failed', { user_id: userId, provider, status: res.status, response: JSON.stringify(res.body) });
    throw new Error(`Token refresh failed (${res.status})`);
  }

  const tokens = res.body as { access_token: string; refresh_token?: string; expires_in?: number };
  const newAccess  = tokens.access_token;
  const newRefresh = tokens.refresh_token || data.refresh_token;
  const newExpiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null;
  log.info('token refreshed successfully', { user_id: userId, provider, new_expires_at: newExpiresAt });

  await supabase
    .from('oauth_tokens')
    .update({
      access_token:  newAccess,
      refresh_token: newRefresh,
      expires_at:    newExpiresAt,
      updated_at:    new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('provider', provider);

  log.info('refreshed tokens saved to DB', { user_id: userId, provider });
  return newAccess;
}
