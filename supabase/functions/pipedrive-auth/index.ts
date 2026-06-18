import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';
import {
  findOrCreateUser,
  saveOAuthTokens,
  generateSessionLink,
  expiresAtFrom,
} from '../_shared/crm/createOrLinkUser.ts';

const log = createLogger('pipedrive-auth');

// Pipedrive token exchange uses HTTP Basic auth (client creds in the header,
// NOT the body) and returns a per-company `api_domain` that all subsequent API
// calls must use. Docs: https://pipedrive.readme.io/docs/marketplace-oauth-authorization
const TOKEN_URL = 'https://oauth.pipedrive.com/oauth/token';

interface PipedriveTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  api_domain: string;
  token_type: string;
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

    const clientId = Deno.env.get('PIPEDRIVE_CLIENT_ID');
    const clientSecret = Deno.env.get('PIPEDRIVE_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      r.error('Pipedrive credentials not configured');
      return jsonError('Pipedrive credentials not configured', 500, r);
    }

    // 1. Exchange code for tokens (Basic auth header)
    r.info('exchanging auth code for tokens', { token_url: TOKEN_URL });
    const basic = btoa(`${clientId}:${clientSecret}`);
    const tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      r.error('token exchange failed', { status: tokenRes.status, response: errText.slice(0, 500) });
      return jsonError('Failed to exchange authorization code. Check client ID/secret and redirect URI.', 400, r);
    }

    const tokens: PipedriveTokenResponse = await tokenRes.json();
    const { access_token, refresh_token, expires_in, api_domain } = tokens;
    r.info('tokens received', { expires_in, has_api_domain: !!api_domain });

    // 2. Fetch the authenticated user from the company-specific api_domain.
    const apiBase = (api_domain || 'https://api.pipedrive.com').replace(/\/$/, '');
    const meRes = await fetch(`${apiBase}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!meRes.ok) {
      const errText = await meRes.text();
      r.error('pipedrive users/me failed', { status: meRes.status, response: errText.slice(0, 500) });
      return jsonError('Failed to fetch Pipedrive user', 400, r);
    }
    const meJson = await meRes.json();
    const pdUser = meJson.data ?? meJson;
    const pipedriveId = String(pdUser.id);
    const email = pdUser.email || `pipedrive_${pipedriveId}@placeholder.local`;
    const name = pdUser.name || email.split('@')[0];
    r.info('pipedrive user resolved', { pipedrive_id: pipedriveId, email, name, company_id: pdUser.company_id });

    // 3. Supabase admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 4. Find or create the auth user (shared)
    const userId = await findOrCreateUser(
      supabase,
      { provider: 'pipedrive', mappingTable: 'pipedrive_users', idColumn: 'pipedrive_id', crmUserId: pipedriveId, email, name },
      r,
    );

    // 5. Save tokens (shared, generic oauth_tokens)
    await saveOAuthTokens(
      supabase,
      userId,
      'pipedrive',
      { accessToken: access_token, refreshToken: refresh_token, expiresAt: expiresAtFrom(expires_in) },
      r,
    );

    // 6. Upsert pipedrive_users mapping (api_domain is per-company; persist it)
    const { error: mapErr } = await supabase.from('pipedrive_users').upsert(
      {
        user_id: userId,
        pipedrive_id: pipedriveId,
        api_domain: api_domain ?? null,
        user_info: { email, name, pipedrive_id: pipedriveId, company_id: pdUser.company_id ?? null },
      },
      { onConflict: 'pipedrive_id' },
    );
    if (mapErr) r.warn('pipedrive_users upsert failed (non-fatal)', { error: mapErr.message });

    // 7. Magic-link session (shared)
    const sessionUrl = await generateSessionLink(supabase, email, redirect_uri, r);
    r.done(200, { user_id: userId, pipedrive_id: pipedriveId });

    return new Response(JSON.stringify({ success: true, session_url: sessionUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    r.error('unhandled error', toErrorDetail(err));
    return jsonError(err instanceof Error ? err.message : 'Unknown error', 500, r);
  }
});
