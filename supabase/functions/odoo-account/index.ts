// ── odoo-account ─────────────────────────────────────────────────────────────
// Trial-first sign-up for Odoo (VoiceLink docs/crm-onboarding/odoo/specs/
// D3-portal.md, revised 2026-09-20): the customer creates a portal account
// with e-mail + password, starts the trial, verifies WhatsApp, and connects
// their Odoo whenever they are ready. Until that connect there is no real
// odoo_users row (its key is host/db/uid and its credential columns are NOT
// NULL), yet billing, the OTP flow and the dashboard all read the account's
// row on odoo_users. So this function ensures a PLACEHOLDER row:
//
//   odoo_user_id = "pending:<auth uid>", api_domain/odoo_db/odoo_login/
//   access_token = "", odoo_uid NULL, user_id = the caller, env = the env the
//   later connect will land in.
//
// VoiceLink never routes it (its inbound filter needs odoo_uid) and its
// erasure sweep handles it like any row. odoo-connect merges it into the
// real row once the key is proven. Idempotent; called after sign-up and by
// the dashboard on every load for an Odoo account.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';

const log = createLogger('odoo-account');
const TABLE = 'odoo_users';
const SUPPORTED_LANGUAGES = new Set(['nl', 'en', 'fr', 'de']);

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

/** The env the connect will write to: VLAGENT_ENV when set, else read off
 *  the VoiceLink base the portal talks to (…/staging → staging, …/dev → dev,
 *  a bare host → prod). One place for both functions. */
export function targetEnv(): string {
  const explicit = (Deno.env.get('VLAGENT_ENV') ?? '').trim().toLowerCase();
  if (explicit === 'dev' || explicit === 'staging' || explicit === 'prod') return explicit;
  const base = (Deno.env.get('VLAGENT_MCP_URL') ?? Deno.env.get('VLAGENT_URL') ?? '').trim().replace(/\/$/, '');
  if (/\/staging$/.test(base)) return 'staging';
  if (/\/dev$/.test(base)) return 'dev';
  return 'prod';
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
      return json({ success: false, code: 'unauthorized', error: 'Unauthorized' }, 401);
    }
    const body = await req.json().catch(() => ({}));
    const langCode = String(body?.language ?? '').trim().toLowerCase().slice(0, 2);
    const language = SUPPORTED_LANGUAGES.has(langCode) ? langCode : null;
    const env = targetEnv();

    const { data: rows, error: rowErr } = await supabase
      .from(TABLE)
      .select('odoo_user_id, odoo_uid, api_domain, odoo_login, whatsapp_status')
      .eq('user_id', user.id)
      .eq('env', env)
      .is('deleted_at', null)
      .limit(2);
    if (rowErr) {
      r.error('row lookup failed', { error: rowErr.message, code: rowErr.code });
      r.done(500);
      return json({ success: false, code: 'db_error', error: 'Account lookup failed' }, 500);
    }
    const real = (rows ?? []).find((x) => x.odoo_uid !== null);
    const placeholder = (rows ?? []).find((x) => String(x.odoo_user_id).startsWith('pending:'));
    if (real) {
      r.done(200, { user_id: user.id, status: 'connected' });
      return json({ success: true, status: 'connected', env, instance: real.api_domain, login: real.odoo_login });
    }
    if (placeholder) {
      r.done(200, { user_id: user.id, status: 'pending' });
      return json({ success: true, status: 'pending', env });
    }

    const base = {
      odoo_user_id: `pending:${user.id}`,
      api_domain: '',
      odoo_db: '',
      odoo_login: '',
      access_token: '',
      refresh_token: '',
      env,
      user_id: user.id,
      // the account owner is its own admin (useTeamRole reads !is_admin as a
      // team member: no trial banner, "awaiting admin") — explicit, whatever
      // the column default on this env
      is_admin: true,
      ...(language ? { language } : {}),
    };
    // 'not_set' is the portal's "nothing started" (migration 032 relaxes the
    // 029 check); until that migration is applied the check refuses it —
    // fall back to the old default so sign-up never breaks on it.
    let { error: insErr } = await supabase.from(TABLE).insert({ ...base, whatsapp_status: 'not_set' });
    if (insErr && insErr.code === '23514') {
      r.warn('whatsapp_status not_set refused — migration 032 not applied yet, inserting pending');
      ({ error: insErr } = await supabase.from(TABLE).insert({ ...base, whatsapp_status: 'pending' }));
    }
    if (insErr && insErr.code === '23505') {
      // Two dashboard tabs raced: the other insert won — same row.
      r.info('placeholder already inserted by a concurrent request');
    } else if (insErr) {
      r.error('placeholder insert failed', { error: insErr.message, code: insErr.code });
      r.done(500);
      return json({ success: false, code: 'db_error', error: 'Account setup failed' }, 500);
    }
    r.done(200, { user_id: user.id, status: 'pending', created: true });
    return json({ success: true, status: 'pending', env, created: true });
  } catch (err) {
    r.error('unhandled error', toErrorDetail(err));
    r.done(500);
    return json({ success: false, code: 'unexpected', error: 'Something went wrong' }, 500);
  }
});
