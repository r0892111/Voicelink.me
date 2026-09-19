// ── odoo-connect ─────────────────────────────────────────────────────────────
// Turns an Odoo API key into a portal account + session (VoiceLink repo
// docs/crm-onboarding/odoo/specs/D3-portal.md, OD-18) — the same job
// catermonkey-mcp-auth does for Catermonkey, with a credentials form instead
// of an OAuth handoff. Odoo has no OAuth for third parties: the customer
// creates a dedicated VoiceLink user in Odoo and gives it an API key.
//
// Flow:
//   AuthPage.renderOdooConnect POSTs { url, db, login, api_key, redirect_uri,
//   language } here (anon key, before any session exists)
//   here   → POST VoiceLink /oauth/odoo/connect (server-to-server, shared
//            secret): VoiceLink proves the key against the instance (version,
//            transport, whoami, CRM app installed), stores the key on ITS
//            odoo_users row keyed by host/db/uid, and answers with identity
//            only — { odoo_user_id, env, name, login, company_name, version,
//            transport }. The key never comes back and is never stored here.
//          → find-or-create the auth user keyed by odoo_user_id
//          → link odoo_users.user_id (the row VoiceLink just wrote, same
//            database) → magic link → { success, session_url }
//
// Identity rules (D3 revised, as for Catermonkey): one portal account per
// Odoo USER per env (odoo_user_id, env). The Odoo login is usually an e-mail
// but nobody verified it: it is NEVER the auth.users / public.users e-mail
// (takeover primitive — see _shared/auth/linking.ts). The account e-mail is
// the deterministic placeholder odoo-<sha256(odoo_user_id)[:16]>@placeholder.local;
// the login lives in user_metadata for display only. A placeholder hit can
// only be our own earlier, half-finished signup for the same tenant.
//
// Error bodies carry a `code` the form maps to i18n copy (auth.odoo.errors.*).
// Never log the key, the URL or the login together: the URL + login identify
// the tenant and the key is a credential.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';

const log = createLogger('odoo-connect');

const PROVIDER = 'odoo';
const TABLE = 'odoo_users';
const SUPPORTED_LANGUAGES = new Set(['nl', 'en', 'fr', 'de']);
const GENERIC_FAIL = 'Sign-in failed. Please try again.';

// VoiceLink's connect codes (app/adapters/odoo/oauth.py connect_probe) →
// this function's codes = the form's i18n keys.
const CODE_MAP: Record<string, string> = {
  odoo_key_rejected: 'odoo_bad_credentials',
  odoo_db_unknown: 'odoo_db_unknown',
  odoo_crm_missing: 'odoo_crm_missing',
  odoo_online_plan: 'odoo_plan_gate',
  odoo_unreachable: 'odoo_unreachable',
  odoo_error: 'odoo_error',
};

interface ConnectRecord {
  success: boolean;
  odoo_user_id: string;
  env: string;
  name: string | null;
  login: string | null;
  company_name: string | null;
  version: string | null;
  transport: string | null;
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const looksLikeEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const r = log.withRequest(req);

  try {
    const body = await req.json().catch(() => null);
    const url = String(body?.url ?? '').trim().replace(/\/+$/, '');
    const db = String(body?.db ?? '').trim();
    const login = String(body?.login ?? '').trim();
    const apiKey = String(body?.api_key ?? '').replace(/\s+/g, ''); // pasted with spaces / line breaks
    const redirectUri = String(body?.redirect_uri ?? '').trim();
    const langCode = String(body?.language ?? '').trim().toLowerCase().slice(0, 2);
    r.info('connect request received', { has_url: !!url, has_db: !!db, has_login: !!login, has_key: !!apiKey });

    if (!url || !db || !login || !apiKey || !redirectUri) {
      r.warn('missing fields');
      r.done(400);
      return json({ success: false, code: 'bad_request', error: 'Missing url, db, login, api_key or redirect_uri' }, 400);
    }
    if (!/^https:\/\/[^/?#\s]+$/i.test(url)) {
      r.warn('url rejected client-side rule');
      r.done(400);
      return json({ success: false, code: 'odoo_bad_url', error: 'The address must be https://<host>, without a path' }, 400);
    }
    if (db.length > 128 || login.length > 320 || apiKey.length > 512) {
      r.warn('field too long');
      r.done(400);
      return json({ success: false, code: 'bad_request', error: 'A field is too long' }, 400);
    }

    // The VoiceLink instance the connect goes to decides the row's env
    // (staging during acceptance, prod at go-live) and reports it back.
    // VLAGENT_MCP_URL / VLAGENT_URL: same split as catermonkey-mcp-auth.
    const vlagentUrl = (Deno.env.get('VLAGENT_MCP_URL') ?? Deno.env.get('VLAGENT_URL') ?? '')
      .trim()
      .replace(/\/$/, '');
    const vlagentSecret = (Deno.env.get('VLAGENT_SECRET') ?? '').trim();
    if (!vlagentUrl || !vlagentSecret) {
      r.error('VLAGENT_MCP_URL/VLAGENT_URL or VLAGENT_SECRET not configured');
      r.done(500);
      return json({ success: false, code: 'not_configured', error: 'Sign-in backend not configured' }, 500);
    }

    // 1. VoiceLink proves the key, stores it, returns identity — never the key.
    r.info('proving the key with VoiceLink');
    const connectRes = await fetch(`${vlagentUrl}/oauth/odoo/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-VLAgent-Secret': vlagentSecret },
      body: JSON.stringify({ url, db, login, api_key: apiKey }),
      signal: AbortSignal.timeout(30000),
    });
    let connect: Record<string, unknown> | null = null;
    try {
      connect = (await connectRes.json()) as Record<string, unknown>;
    } catch {
      connect = null;
    }
    if (!connectRes.ok || !connect?.success) {
      const vlCode = typeof connect?.code === 'string' ? connect.code : '';
      if (connectRes.status === 400) {
        // FastAPI validation: the URL is not an acceptable Odoo base URL
        // (http, a path, a private host) or a field is missing.
        const detail = typeof connect?.detail === 'string' ? connect.detail : 'Invalid request';
        r.warn('VoiceLink rejected the request', { detail });
        r.done(400);
        return json({ success: false, code: 'odoo_bad_url', error: detail }, 400);
      }
      const code = CODE_MAP[vlCode] ?? 'odoo_error';
      // 401 (key) and 422 (database / plan / CRM app) are the user's to fix;
      // everything else is the instance or VoiceLink not answering.
      const status = connectRes.status === 401 || connectRes.status === 422 ? 400 : 502;
      r.warn('VoiceLink refused the connection', { vl_code: vlCode, vl_status: connectRes.status, code });
      r.done(status);
      const message = typeof connect?.message === 'string' ? connect.message : GENERIC_FAIL;
      return json({ success: false, code, error: message }, status);
    }
    const record = connect as unknown as ConnectRecord;
    if (typeof record.odoo_user_id !== 'string' || !record.odoo_user_id || typeof record.env !== 'string' || !record.env) {
      r.error('connect returned an unexpected record', { has_id: !!record.odoo_user_id, has_env: !!record.env });
      r.done(502);
      return json({ success: false, code: 'claim_failed', error: GENERIC_FAIL }, 502);
    }
    r.info('key proven', { env: record.env, version: record.version, transport: record.transport });

    // 2. Identity fields. The ACCOUNT e-mail is always the placeholder (see
    // header); the Odoo login is asserted, display-only.
    const accountEmail = `odoo-${(await sha256Hex(record.odoo_user_id)).slice(0, 16)}@placeholder.local`;
    const assertedLogin = (record.login ?? login).trim();
    const contactEmail = looksLikeEmail(assertedLogin) ? assertedLogin.toLowerCase() : null;
    const name = (record.name ?? '').trim() || contactEmail?.split('@')[0] || 'there';
    const language = SUPPORTED_LANGUAGES.has(langCode) ? langCode : 'nl';
    const userMetadata = {
      name,
      provider: PROVIDER,
      contact_email: contactEmail,
      odoo_login: assertedLogin,
      odoo_company: record.company_name ?? null,
    };

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // 3. The row VoiceLink just wrote (same database), keyed by
    // (odoo_user_id, env) — never by e-mail. Returning user = it already
    // carries a user_id.
    const { data: row, error: rowErr } = await supabase
      .from(TABLE)
      .select('user_id, language, language_locked')
      .eq('odoo_user_id', record.odoo_user_id)
      .eq('env', record.env)
      .is('deleted_at', null)
      .maybeSingle();
    if (rowErr) {
      r.error('identity row lookup failed', { error: rowErr.message, code: rowErr.code });
      r.done(500);
      return json({ success: false, code: 'db_error', error: GENERIC_FAIL }, 500);
    }
    if (!row) {
      // VoiceLink reported success but this database holds no row for that
      // env: the portal and this VoiceLink instance are not on one database.
      r.error('no odoo_users row for the proven identity', { env: record.env });
      r.done(500);
      return json({ success: false, code: 'db_error', error: GENERIC_FAIL }, 500);
    }

    let userId: string;
    let sessionEmail: string;

    if (row.user_id) {
      userId = row.user_id;
      r.info('existing account found', { user_id: userId });
      // The session is minted for the account's CURRENT auth e-mail, read
      // from auth.users — never from the vendor record.
      const { data: authUser, error: authErr } = await supabase.auth.admin.getUserById(userId);
      if (authErr || !authUser?.user?.email) {
        r.error('auth user lookup failed for existing account', { error: authErr?.message, user_id: userId });
        r.done(500);
        return json({ success: false, code: 'db_error', error: GENERIC_FAIL }, 500);
      }
      sessionEmail = authUser.user.email;
      await supabase.auth.admin.updateUserById(userId, { user_metadata: userMetadata });
      if (!row.language && !row.language_locked) {
        const { error: langErr } = await supabase.from(TABLE).update({ language }).eq('odoo_user_id', record.odoo_user_id).eq('env', record.env);
        if (langErr) r.warn('language stamp failed (non-fatal)', { error: langErr.message });
      }
    } else {
      // 4. New signup, or our own earlier partial signup (auth user created,
      // row link failed). The placeholder e-mail encodes this very tenant,
      // so a hit here can only be ours.
      const { data: byEmail, error: byEmailErr } = await supabase
        .from('users')
        .select('id')
        .eq('email', accountEmail)
        .maybeSingle();
      if (byEmailErr) {
        r.error('users lookup failed', { error: byEmailErr.message });
        r.done(500);
        return json({ success: false, code: 'db_error', error: GENERIC_FAIL }, 500);
      }

      if (byEmail?.id) {
        userId = byEmail.id;
        r.info('reusing earlier partial signup', { user_id: userId });
        await supabase.auth.admin.updateUserById(userId, { user_metadata: userMetadata });
      } else {
        r.info('creating new account');
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
          email: accountEmail,
          email_confirm: true,
          user_metadata: userMetadata,
        });
        if (createErr || !created?.user) {
          const msg = (createErr?.message ?? '').toLowerCase();
          const alreadyExists = msg.includes('already') || msg.includes('registered') || msg.includes('duplicate');
          if (!alreadyExists) {
            r.error('user creation failed', { error: createErr?.message });
            r.done(500);
            return json({ success: false, code: 'db_error', error: GENERIC_FAIL }, 500);
          }
          // auth.users has it but public.users doesn't (or two tabs raced
          // on the same tenant): resolve the id by e-mail — generateLink
          // returns the user and sends nothing for a magic link.
          const { data: existing, error: existingErr } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: accountEmail,
          });
          if (existingErr || !existing?.user?.id) {
            r.error('placeholder user exists but could not be resolved', { error: existingErr?.message ?? createErr?.message });
            r.done(500);
            return json({ success: false, code: 'db_error', error: GENERIC_FAIL }, 500);
          }
          userId = existing.user.id;
          r.info('reusing earlier partial signup (auth only)', { user_id: userId });
        } else {
          userId = created.user.id;
          r.info('auth user created', { user_id: userId });
        }
      }

      await supabase.from('users').upsert({ id: userId, email: accountEmail, name }, { onConflict: 'id' });

      // 5. Link the identity row to the account. The key and the WhatsApp
      // columns are VoiceLink's / the OTP flow's — only user_id and the
      // language are ours here.
      const { data: linked, error: linkErr } = await supabase
        .from(TABLE)
        .update({ user_id: userId, ...(row.language_locked ? {} : { language }) })
        .eq('odoo_user_id', record.odoo_user_id)
        .eq('env', record.env)
        .is('user_id', null)
        .select('user_id');
      if (linkErr) {
        r.error('identity row link failed', { error: linkErr.message, code: linkErr.code });
        r.done(500);
        return json({ success: false, code: 'db_error', error: GENERIC_FAIL }, 500);
      }
      if (!linked || linked.length === 0) {
        // Another request linked the row first (two tabs): continue on the
        // account it chose — the placeholder e-mail makes it the same one.
        const { data: winner } = await supabase
          .from(TABLE)
          .select('user_id')
          .eq('odoo_user_id', record.odoo_user_id)
          .eq('env', record.env)
          .maybeSingle();
        if (winner?.user_id && winner.user_id !== userId) {
          r.info('lost signup race, continuing on the winning row', { user_id: winner.user_id });
          userId = winner.user_id;
        }
      }
      const { data: authUser, error: authErr } = await supabase.auth.admin.getUserById(userId);
      if (authErr || !authUser?.user?.email) {
        r.error('auth user lookup failed after link', { error: authErr?.message, user_id: userId });
        r.done(500);
        return json({ success: false, code: 'db_error', error: GENERIC_FAIL }, 500);
      }
      sessionEmail = authUser.user.email;
      r.info('identity row linked', { user_id: userId, env: record.env });
    }

    // 6. Session via magic link, landing on the dashboard of the origin the
    // form was on (dev vs prod). The link is returned to the browser and
    // followed directly — never e-mailed.
    let postAuthRedirect: string;
    try {
      postAuthRedirect = `${new URL(redirectUri).origin}/dashboard`;
    } catch {
      postAuthRedirect = `${Deno.env.get('SITE_URL') ?? 'https://voicelink.me'}/dashboard`;
    }
    const { data: linkData, error: magicErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: sessionEmail,
      options: { redirectTo: postAuthRedirect },
    });
    if (magicErr || !linkData?.properties?.action_link) {
      r.error('generateLink failed', { error: magicErr?.message });
      r.done(500);
      return json({ success: false, code: 'session_failed', error: 'Failed to create session' }, 500);
    }

    r.done(200, { user_id: userId, env: record.env });
    return json({ success: true, session_url: linkData.properties.action_link });
  } catch (err) {
    r.error('unhandled error', toErrorDetail(err));
    r.done(500);
    // Fixed text: an exception message could carry the backend host.
    return json({ success: false, code: 'unexpected', error: GENERIC_FAIL }, 500);
  }
});
