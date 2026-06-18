import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';
import {
  findOrCreateUser,
  saveOAuthTokens,
  generateSessionLink,
  expiresAtFrom,
} from '../_shared/crm/createOrLinkUser.ts';

const log = createLogger('hubspot-auth');

// HubSpot uses date-versioned OAuth endpoints (2026-03). Token exchange is a
// standard form-body grant; identity comes from token introspection (there is no
// classic "users/me"). Docs: developers.hubspot.com /authentication/oauth.
const TOKEN_URL = 'https://api.hubapi.com/oauth/2026-03/token';
const INTROSPECT_URL = 'https://api.hubapi.com/oauth/2026-03/token/introspect';

interface HubSpotTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface HubSpotIntrospect {
  hub_id?: number | string;
  user?: string;      // the connecting user's email
  user_id?: number | string;
  scopes?: string[];
}

function jsonError(message: string, status: number, r: ReturnType<typeof log.withRequest>) {
  r.done(status);
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const r = log.withRequest(req);

  try {
    const { code, redirect_uri } = await req.json();
    r.info('auth request received', { has_code: !!code, has_redirect_uri: !!redirect_uri });

    if (!code || !redirect_uri) {
      return jsonError('Missing code or redirect_uri', 400, r);
    }

    const clientId = Deno.env.get('HUBSPOT_CLIENT_ID');
    const clientSecret = Deno.env.get('HUBSPOT_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      r.error('HubSpot credentials not configured');
      return jsonError('HubSpot credentials not configured', 500, r);
    }

    // 1. Exchange code for tokens (form body)
    r.info('exchanging auth code for tokens', { token_url: TOKEN_URL });
    const tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri,
        code,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      r.error('token exchange failed', { status: tokenRes.status, response: errText.slice(0, 500) });
      return jsonError('Failed to exchange authorization code. Check client ID/secret and redirect URI.', 400, r);
    }

    const tokens: HubSpotTokenResponse = await tokenRes.json();
    const { access_token, refresh_token, expires_in } = tokens;
    r.info('tokens received', { expires_in });

    // 2. Identity via token introspection (no users/me on HubSpot).
    const introspectRes = await fetch(INTROSPECT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        token_type_hint: 'access_token',
        token: access_token,
      }),
    });
    if (!introspectRes.ok) {
      const errText = await introspectRes.text();
      r.error('hubspot introspect failed', { status: introspectRes.status, response: errText.slice(0, 500) });
      return jsonError('Failed to fetch HubSpot account', 400, r);
    }
    const meta: HubSpotIntrospect = await introspectRes.json();
    const hubId = meta.hub_id != null ? String(meta.hub_id) : null;
    // Unique key for the connection: HubSpot user id, falling back to hub id.
    const hubspotUserId = String(meta.user_id ?? meta.hub_id ?? '');
    const email = meta.user || (hubId ? `hubspot_${hubId}@placeholder.local` : `hubspot_${hubspotUserId}@placeholder.local`);
    const name = email.split('@')[0];
    r.info('hubspot account resolved', { hub_id: hubId, hubspot_user_id: hubspotUserId, email });

    if (!hubspotUserId) {
      return jsonError('HubSpot introspection returned no user/hub id', 400, r);
    }

    // 3. Supabase admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 4. Find or create the auth user (shared)
    const userId = await findOrCreateUser(
      supabase,
      { provider: 'hubspot', mappingTable: 'hubspot_users', idColumn: 'hubspot_user_id', crmUserId: hubspotUserId, email, name },
      r,
    );

    // 5. Save tokens (shared)
    await saveOAuthTokens(
      supabase,
      userId,
      'hubspot',
      { accessToken: access_token, refreshToken: refresh_token, expiresAt: expiresAtFrom(expires_in) },
      r,
    );

    // 6. Upsert hubspot_users mapping
    const { error: mapErr } = await supabase.from('hubspot_users').upsert(
      {
        user_id: userId,
        hubspot_user_id: hubspotUserId,
        hub_id: hubId,
        user_info: { email, name, hub_id: hubId, hubspot_user_id: hubspotUserId },
      },
      { onConflict: 'hubspot_user_id' },
    );
    if (mapErr) r.warn('hubspot_users upsert failed (non-fatal)', { error: mapErr.message });

    // 7. Magic-link session (shared)
    const sessionUrl = await generateSessionLink(supabase, email, redirect_uri, r);
    r.done(200, { user_id: userId, hub_id: hubId });

    return new Response(JSON.stringify({ success: true, session_url: sessionUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    r.error('unhandled error', toErrorDetail(err));
    return jsonError(err instanceof Error ? err.message : 'Unknown error', 500, r);
  }
});
