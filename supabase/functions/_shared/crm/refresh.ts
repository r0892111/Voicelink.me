// ── Per-provider OAuth token refresh ────────────────────────────────────────
// Shared by refresh-tokens (cron) and getOAuthAccessToken (on-demand). Providers
// differ in token endpoint and how client credentials are passed:
//   teamleader → form body (client_id/secret in body)
//   pipedrive  → HTTP Basic auth header (creds NOT in body)
//   hubspot    → form body, date-versioned 2026-03 endpoint

export interface RefreshResponse {
  ok: boolean;
  status: number | null;
  body: Record<string, unknown>;
}

export async function refreshProviderToken(
  provider: string,
  refreshToken: string,
): Promise<RefreshResponse> {
  let url: string;
  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' };
  const params = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken });

  if (provider === 'pipedrive') {
    const id = Deno.env.get('PIPEDRIVE_CLIENT_ID');
    const secret = Deno.env.get('PIPEDRIVE_CLIENT_SECRET');
    if (!id || !secret) throw new Error('Pipedrive credentials not configured');
    url = 'https://oauth.pipedrive.com/oauth/token';
    headers['Authorization'] = `Basic ${btoa(`${id}:${secret}`)}`;
  } else if (provider === 'hubspot') {
    const id = Deno.env.get('HUBSPOT_CLIENT_ID');
    const secret = Deno.env.get('HUBSPOT_CLIENT_SECRET');
    if (!id || !secret) throw new Error('HubSpot credentials not configured');
    url = 'https://api.hubapi.com/oauth/2026-03/token';
    params.set('client_id', id);
    params.set('client_secret', secret);
  } else {
    // teamleader (default)
    const id = Deno.env.get('TEAMLEADER_CLIENT_ID');
    const secret = Deno.env.get('TEAMLEADER_CLIENT_SECRET');
    if (!id || !secret) throw new Error('Teamleader credentials not configured');
    const authBase = Deno.env.get('TEAMLEADER_AUTH_BASE_URL') || 'https://app.teamleader.eu';
    url = `${authBase.replace(/\/$/, '')}/oauth2/access_token`;
    params.set('client_id', id);
    params.set('client_secret', secret);
  }

  const resp = await fetch(url, { method: 'POST', headers, body: params.toString() });
  const body = await resp.json().catch(() => ({}));
  return { ok: resp.ok, status: resp.status, body };
}
