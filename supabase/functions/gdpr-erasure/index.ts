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

  // Catermonkey-via-MCP accounts: their CRM tokens live in VoiceLink's
  // mcp_connections, which this function's cascade (/oauth/teamleader/
  // disconnect) does not cover yet. Deleting the auth user would cascade the
  // identity row away and strand a live vendor grant + tokens — so refuse
  // self-serve erasure for this platform until VoiceLink's erasure covers
  // it (plan Phase 4/5), rather than report account_deleted while data
  // remains. Nothing is deleted on this path.
  const { data: cmRow, error: cmErr } = await service
    .from('catermonkey_mcp_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  // 42P01 = relation does not exist: this function deployed ahead of the
  // catermonkey_mcp_users migration. Treat as "no row" so Teamleader
  // erasure keeps working; every other error is a hard stop.
  if (cmErr && cmErr.code !== '42P01') {
    r.error('catermonkey_mcp_users lookup failed', { error: cmErr.message, code: cmErr.code });
    r.done(500);
    return json(500, { error: 'lookup failed — nothing was deleted' });
  }
  if (cmRow) {
    r.warn('erasure refused: Catermonkey-via-MCP account, cascade not wired yet', { user_id: user.id });
    r.done(501);
    return json(501, {
      error: 'Account deletion for Catermonkey accounts is handled by support for now — nothing was deleted. Please contact support@voicelink.me.',
    });
  }

  // CRM-connected tenants get the full VLAgent cascade first.
  const { data: tlRow, error: tlErr } = await service
    .from('teamleader_users')
    .select('teamleader_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (tlErr) {
    r.error('teamleader_users lookup failed', { error: tlErr.message });
    r.done(500);
    return json(500, { error: 'lookup failed — nothing was deleted' });
  }

  let erased: Record<string, unknown> | null = null;
  if (tlRow?.teamleader_id) {
    const vlagentUrl = Deno.env.get('VLAGENT_API_URL');
    const vlagentSecret = Deno.env.get('VLAGENT_SECRET');
    if (!vlagentUrl || !vlagentSecret) {
      r.error('VLAGENT_API_URL / VLAGENT_SECRET not configured');
      r.done(500);
      return json(500, { error: 'erasure backend not configured — nothing was deleted' });
    }
    const tenantId = tlRow.teamleader_id as string;
    const resp = await fetch(`${vlagentUrl}/oauth/teamleader/disconnect`, {
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
    r.info('VLAgent cascade complete', { tenant_id: tenantId });
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
