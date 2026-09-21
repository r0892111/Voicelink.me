// ── odoo-connect ─────────────────────────────────────────────────────────────
// Connects a signed-in portal account to its Odoo with an API key (VoiceLink
// docs/crm-onboarding/odoo/specs/D3-portal.md, revised 2026-09-20: trial
// first, the key comes later from the dashboard). Odoo has no OAuth for third
// parties: the customer creates a dedicated VoiceLink user in Odoo and gives
// it an API key.
//
// Flow:
//   Dashboard "Connect Odoo" card POSTs { url, db, login, api_key, language }
//   here with the user's session JWT (verify_jwt on)
//   here   → POST VoiceLink /oauth/odoo/connect (server-to-server, shared
//            secret): VoiceLink proves the key against the instance (version,
//            transport, whoami, CRM app installed), stores the key on ITS
//            odoo_users row keyed by host/db/uid, and answers identity + env
//            only. The key never comes back and is never stored here.
//          → the account's PLACEHOLDER row ("pending:<uid>", made by
//            odoo-account at sign-up) is merged into the real row: billing,
//            WhatsApp, language and test-user columns move over, user_id is
//            linked, the placeholder is deleted
//          → { success, name, company_name, version }
//
// One portal account per Odoo USER per env: a real row already linked to a
// different account is refused (odoo_already_linked), never re-linked.
// Never log the key, the URL or the login together.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';

const log = createLogger('odoo-connect');
const TABLE = 'odoo_users';
const SUPPORTED_LANGUAGES = new Set(['nl', 'en', 'fr', 'de']);
const GENERIC_FAIL = 'Connecting failed. Please try again.';

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

// Columns the portal owns on the placeholder row and carries over.
const CARRY = [
  'stripe_customer_id', 'is_admin', 'admin_user_id', 'promo_end_date', 'trial_started_tracked',
  'whatsapp_number', 'whatsapp_status', 'whatsapp_otp_code', 'whatsapp_otp_expires_at', 'whatsapp_otp_phone',
  'language', 'language_locked', 'is_test_user',
] as const;

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
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const r = log.withRequest(req);
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const authHeader = req.headers.get('Authorization') ?? '';
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      r.warn('auth failed', { error: authError?.message });
      r.done(401);
      return json({ success: false, code: 'unauthorized', error: 'Please sign in again.' }, 401);
    }

    const body = await req.json().catch(() => null);
    const url = String(body?.url ?? '').trim().replace(/\/+$/, '');
    const db = String(body?.db ?? '').trim();
    const login = String(body?.login ?? '').trim();
    const apiKey = String(body?.api_key ?? '').replace(/\s+/g, ''); // pasted with spaces / line breaks
    const langCode = String(body?.language ?? '').trim().toLowerCase().slice(0, 2);
    r.info('connect request received', { user_id: user.id, has_url: !!url, has_db: !!db, has_login: !!login, has_key: !!apiKey });

    if (!url || !db || !login || !apiKey) {
      r.done(400);
      return json({ success: false, code: 'bad_request', error: 'Missing url, db, login or api_key' }, 400);
    }
    if (!/^https:\/\/[^/?#\s]+$/i.test(url)) {
      r.done(400);
      return json({ success: false, code: 'odoo_bad_url', error: 'The address must be https://<host>, without a path' }, 400);
    }
    if (db.length > 128 || login.length > 320 || apiKey.length > 512) {
      r.done(400);
      return json({ success: false, code: 'bad_request', error: 'A field is too long' }, 400);
    }

    const vlagentUrl = (Deno.env.get('VLAGENT_MCP_URL') ?? Deno.env.get('VLAGENT_URL') ?? '').trim().replace(/\/$/, '');
    const vlagentSecret = (Deno.env.get('VLAGENT_SECRET') ?? '').trim();
    if (!vlagentUrl || !vlagentSecret) {
      r.error('VLAGENT_MCP_URL/VLAGENT_URL or VLAGENT_SECRET not configured');
      r.done(500);
      return json({ success: false, code: 'not_configured', error: 'Connect backend not configured' }, 500);
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
      // No JSON body at all means VoiceLink never saw the request: something in
      // front of it answered — nginx basic auth on the /oauth/odoo/ prefix, a
      // proxy error page, a gateway timeout. Blaming Odoo there is a lie the
      // user cannot act on ("Odoo gaf een fout terug" while Odoo was never
      // contacted — Alex's first real connect attempt, 2026-09-21).
      if (connect === null) {
        r.error('the connect backend did not answer with JSON', { status: connectRes.status });
        r.done(502);
        return json(
          { success: false, code: 'connect_unavailable', error: 'The connection service did not answer.' },
          502,
        );
      }
      if (connectRes.status === 400) {
        const detail = typeof connect?.detail === 'string' ? connect.detail : 'Invalid request';
        r.warn('VoiceLink rejected the request', { detail });
        r.done(400);
        return json({ success: false, code: 'odoo_bad_url', error: detail }, 400);
      }
      const code = CODE_MAP[vlCode] ?? 'odoo_error';
      const status = connectRes.status === 401 || connectRes.status === 422 ? 400 : 502;
      r.warn('VoiceLink refused the connection', { vl_code: vlCode, vl_status: connectRes.status, code });
      r.done(status);
      const message = typeof connect?.message === 'string' ? connect.message : GENERIC_FAIL;
      return json({ success: false, code, error: message }, status);
    }
    const record = connect as unknown as ConnectRecord;
    if (typeof record.odoo_user_id !== 'string' || !record.odoo_user_id || typeof record.env !== 'string' || !record.env) {
      r.error('connect returned an unexpected record');
      r.done(502);
      return json({ success: false, code: 'claim_failed', error: GENERIC_FAIL }, 502);
    }
    r.info('key proven', { env: record.env, version: record.version, transport: record.transport });

    // 2. The real row VoiceLink just wrote, and the account's placeholder.
    const { data: real, error: realErr } = await supabase
      .from(TABLE)
      .select('odoo_user_id, user_id')
      .eq('odoo_user_id', record.odoo_user_id)
      .eq('env', record.env)
      .is('deleted_at', null)
      .maybeSingle();
    if (realErr || !real) {
      r.error('real row not found after connect', { error: realErr?.message, env: record.env });
      r.done(500);
      return json({ success: false, code: 'db_error', error: GENERIC_FAIL }, 500);
    }
    if (real.user_id && real.user_id !== user.id) {
      r.warn('odoo user already linked to another account', { env: record.env });
      r.done(409);
      return json({ success: false, code: 'odoo_already_linked', error: 'This Odoo user is already connected to another VoiceLink account.' }, 409);
    }

    const { data: placeholder, error: phErr } = await supabase
      .from(TABLE)
      .select(['odoo_user_id', ...CARRY].join(', '))
      .eq('odoo_user_id', `pending:${user.id}`)
      .eq('env', record.env)
      .maybeSingle();
    if (phErr) r.warn('placeholder lookup failed (continuing without merge)', { error: phErr.message });

    // 3. Link (and merge the placeholder's portal-owned columns).
    const patch: Record<string, unknown> = { user_id: user.id };
    if (placeholder) {
      const ph = placeholder as unknown as Record<string, unknown>;
      for (const col of CARRY) {
        if (ph[col] !== null && ph[col] !== undefined) patch[col] = ph[col];
      }
    }
    if (!('language' in patch)) {
      const language = SUPPORTED_LANGUAGES.has(langCode) ? langCode : null;
      if (language) patch.language = language;
    }
    const { error: linkErr } = await supabase
      .from(TABLE)
      .update(patch)
      .eq('odoo_user_id', record.odoo_user_id)
      .eq('env', record.env);
    if (linkErr) {
      r.error('link/merge failed', { error: linkErr.message, code: linkErr.code });
      r.done(500);
      return json({ success: false, code: 'db_error', error: GENERIC_FAIL }, 500);
    }
    if (placeholder) {
      const { error: delErr } = await supabase.from(TABLE).delete().eq('odoo_user_id', `pending:${user.id}`).eq('env', record.env);
      if (delErr) r.warn('placeholder delete failed (non-fatal, the sweep never routes it)', { error: delErr.message });
      else r.info('placeholder merged and removed');
    }

    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { ...meta, provider: 'odoo', odoo_login: record.login ?? login, odoo_company: record.company_name ?? null },
    });

    r.done(200, { user_id: user.id, env: record.env });
    return json({
      success: true,
      name: record.name,
      company_name: record.company_name,
      version: record.version,
      transport: record.transport,
      instance: url,
      login: record.login ?? login,
    });
  } catch (err) {
    r.error('unhandled error', toErrorDetail(err));
    r.done(500);
    return json({ success: false, code: 'unexpected', error: GENERIC_FAIL }, 500);
  }
});
