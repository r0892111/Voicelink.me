// ── gdpr-erasure ─────────────────────────────────────────────────────────────
// Self-service right-to-erasure (GDPR Art. 17), called by the dashboard's
// "Delete my data" button. Authenticated by the user's own session JWT —
// a user can only ever erase themself.
//
// Flow:
//   1. Resolve the caller from the Authorization header (auth.getUser).
//   2. Look up their teamleader_id (if they ever connected a CRM).
//   3. Call VLAgent's disconnect cascade (tokens, entity memory, history,
//      message logs, analytics, feedback) server-to-server with the shared
//      secret. If the cascade fails we STOP — deleting the login while the
//      data lingers would be the worst outcome.
//   4. Delete the auth account (their login + email).
//
// Required function secrets: VLAGENT_API_URL (e.g. https://logs.finitplatform.be),
// VLAGENT_SECRET (shared with the VLAgent service).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';

const log = createLogger('gdpr-erasure');

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  const r = log.withRequest(req);

  if (req.method !== 'POST') {
    r.done(405);
    return json(405, { error: 'POST only' });
  }

  let body: { confirm?: string };
  try {
    body = await req.json();
  } catch {
    r.done(400);
    return json(400, { error: 'JSON body required' });
  }
  if (body.confirm !== 'DELETE') {
    r.done(400);
    return json(400, { error: "confirm must be the literal string 'DELETE' — erasure is irreversible" });
  }

  // Caller identity from their own JWT — never from the body.
  const authHeader = req.headers.get('Authorization') ?? '';
  const anon = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await anon.auth.getUser();
  if (userErr || !userData?.user) {
    r.warn('unauthenticated erasure attempt', toErrorDetail(userErr));
    r.done(401);
    return json(401, { error: 'Not authenticated' });
  }
  const user = userData.user;
  r.info('erasure requested', { user_id: user.id });

  const service = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // A CRM-connected tenant gets VoiceLink's full cascade before the account
  // is deleted: it revokes at the vendor where that is possible, deletes the
  // token/identity row and purges entity memory, history, monitor logs and
  // analytics. One entry per platform the portal sells self-serve; the first
  // match wins (an account only ever has one). Keep this list next to
  // VoiceLink's `core.erasure.supported_vendors()` — a platform missing here
  // would have its auth user deleted while the vendor grant stayed live.
  //   teamleader — since the beginning
  //   odoo       — 2026-09-19 (API key revoked on 19+, spec D2 OD-15)
  //   catermonkey_mcp — 2026-09-21 (tokens in mcp_connections; VoiceLink
  //     revokes the grant by RFC 7009 and deletes by the full
  //     (server_key, env, vendor_subject) key). Before this date the function
  //     REFUSED erasure for these accounts because that cascade did not exist.
  const CASCADES: ReadonlyArray<{ table: string; idColumn: string; vendor: string; softDeleted: boolean }> = [
    { table: 'teamleader_users', idColumn: 'teamleader_id', vendor: 'teamleader', softDeleted: false },
    { table: 'catermonkey_mcp_users', idColumn: 'vendor_subject', vendor: 'catermonkey_mcp', softDeleted: true },
    { table: 'odoo_users', idColumn: 'odoo_user_id', vendor: 'odoo', softDeleted: true },
  ];

  let cascade: { vendor: string; tenantId: string } | null = null;
  for (const c of CASCADES) {
    let q = service.from(c.table).select(c.idColumn).eq('user_id', user.id);
    if (c.softDeleted) q = q.is('deleted_at', null);
    const { data, error } = await q.maybeSingle();
    // 42P01 = relation does not exist: this function deployed ahead of that
    // platform's migration. Treat as "no row" so the others keep working;
    // every other error is a hard stop — never delete on an unknown state.
    if (error && error.code !== '42P01') {
      r.error('platform row lookup failed', { table: c.table, error: error.message, code: error.code });
      r.done(500);
      return json(500, { error: 'lookup failed — nothing was deleted' });
    }
    const tenantId = (data as Record<string, unknown> | null)?.[c.idColumn];
    if (typeof tenantId === 'string' && tenantId) {
      cascade = { vendor: c.vendor, tenantId };
      break;
    }
  }

  let erased: Record<string, unknown> | null = null;
  if (cascade) {
    const vlagentUrl = Deno.env.get('VLAGENT_API_URL');
    const vlagentSecret = Deno.env.get('VLAGENT_SECRET');
    if (!vlagentUrl || !vlagentSecret) {
      r.error('VLAGENT_API_URL / VLAGENT_SECRET not configured');
      r.done(500);
      return json(500, { error: 'erasure backend not configured — nothing was deleted' });
    }
    const tenantId = cascade.tenantId;
    const resp = await fetch(`${vlagentUrl}/oauth/${cascade.vendor}/disconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VLAgent-Secret': vlagentSecret,
      },
      body: JSON.stringify({ tenant_id: tenantId, confirm: tenantId }),
    });
    if (!resp.ok) {
      const detail = await resp.text();
      r.error('VLAgent cascade failed — aborting before account deletion', {
        status: resp.status,
        detail: detail.slice(0, 300),
      });
      r.done(502);
      return json(502, { error: 'erasure cascade failed — nothing was deleted, please contact support' });
    }
    erased = await resp.json();
    r.info('VLAgent cascade complete', { vendor: cascade.vendor, tenant_id: tenantId });
  } else {
    r.info('no connected CRM tenant — erasing auth account only', { user_id: user.id });
  }

  // Login + email last, so a cascade failure never strands orphaned data
  // behind a deleted account.
  let accountDeleted = false;
  const { error: delErr } = await service.auth.admin.deleteUser(user.id);
  if (delErr) {
    r.error('auth account deletion failed', { error: delErr.message });
  } else {
    accountDeleted = true;
  }

  r.done(200, { account_deleted: accountDeleted });
  return json(200, { erased, account_deleted: accountDeleted });
});
