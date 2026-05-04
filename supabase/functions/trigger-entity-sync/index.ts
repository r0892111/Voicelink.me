// ── trigger-entity-sync ───────────────────────────────────────────────────────
// Authenticated dashboard endpoint that kicks off VLAgent's pre-warm task
// for the calling user. Looks up the user's teamleader_id + access_token
// (service-role read on teamleader_users + oauth_tokens), then POSTs to
// VLAgent /admin/prewarm. Returns 202 immediately; progress lands on
// teamleader_users.entity_sync_* and in /monitor/events.
//
// Required Supabase Edge Function secrets:
//   VLAGENT_URL    e.g. https://vlagent-dev.<host>      (per env)
//   VLAGENT_SECRET matches VLAGENT_SECRET on VLAgent

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';
import { logEvent } from '../_shared/log_event.ts';

const log = createLogger('trigger-entity-sync');

// Trim — copy-paste into Supabase Dashboard secrets often picks up a
// trailing newline / space, which would otherwise produce
// 'https://logs.finitplatform.be /admin/prewarm' (note the gap) and a
// TypeError("Invalid URL") when fetch parses it.
const VLAGENT_URL    = (Deno.env.get('VLAGENT_URL')    ?? '').trim();
const VLAGENT_SECRET = (Deno.env.get('VLAGENT_SECRET') ?? '').trim();

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const r = log.withRequest(req);

  const json = (data: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  if (!VLAGENT_URL || !VLAGENT_SECRET) {
    r.error('missing VLAGENT_URL or VLAGENT_SECRET in env');
    r.done(500);
    return json({ success: false, error: 'Sync not configured' }, 500);
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } =
      await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      r.warn('auth failed', { error: authError?.message });
      r.done(401);
      return json({ success: false, error: 'Unauthorized' }, 401);
    }
    r.info('authenticated', { user_id: user.id, email: user.email });

    // Resolve teamleader_id. Invited members trigger their own sync (their
    // own teamleader_id), but only admins have an oauth token; for invited
    // members we'd fall back to the admin's token. v1: only allow admins
    // to sync (their own data) — invited members' rows get pre-warmed
    // when the admin triggers, since each user's teamleader_id is the key.
    const { data: tlRow } = await supabase
      .from('teamleader_users')
      .select('id, is_admin, teamleader_id, admin_user_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (!tlRow) {
      r.warn('no teamleader_users row for user', { user_id: user.id });
      r.done(404);
      return json({ success: false, error: 'Teamleader account not connected' }, 404);
    }

    const teamleaderId = tlRow.teamleader_id;
    const tokenOwnerUserId = tlRow.is_admin ? user.id : (tlRow.admin_user_id as string);

    const { data: tokenRow } = await supabase
      .from('oauth_tokens')
      .select('access_token')
      .eq('user_id', tokenOwnerUserId)
      .eq('provider', 'teamleader')
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!tokenRow?.access_token) {
      r.warn('no oauth token', { token_owner_user_id: tokenOwnerUserId });
      r.done(404);
      return json({ success: false, error: 'Teamleader token missing — reconnect your account' }, 404);
    }

    r.info('forwarding to VLAgent /admin/prewarm', { teamleader_id: teamleaderId });
    const vlResp = await fetch(`${VLAGENT_URL.replace(/\/$/, '')}/admin/prewarm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VLAgent-Secret': VLAGENT_SECRET,
      },
      body: JSON.stringify({
        teamleader_id: teamleaderId,
        access_token:  tokenRow.access_token,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (vlResp.status !== 202 && vlResp.status !== 200) {
      const body = await vlResp.text().catch(() => '');
      r.error('VLAgent /admin/prewarm rejected', { status: vlResp.status, body: body.slice(0, 200) });
      await logEvent({
        source: 'edge:trigger-entity-sync',
        event_type: 'sync.kickoff_failed',
        payload: { status: vlResp.status, body: body.slice(0, 200) },
        user_id: teamleaderId,
        severity: 'error',
      });
      r.done(502);
      return json({ success: false, error: 'Sync service unavailable, try again later' }, 502);
    }

    await logEvent({
      source: 'edge:trigger-entity-sync',
      event_type: 'sync.kicked_off',
      payload: { triggered_by: user.id, is_admin: tlRow.is_admin },
      user_id: teamleaderId,
    });

    r.done(202);
    return json({ success: true, status: 'started', teamleader_id: teamleaderId }, 202);
  } catch (err) {
    r.error('unhandled error', toErrorDetail(err));
    r.done(500);
    return json({ success: false, error: 'Unexpected error' }, 500);
  }
});
