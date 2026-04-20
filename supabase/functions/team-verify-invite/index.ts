// ── team-verify-invite ────────────────────────────────────────────────────────
// Public endpoint (no auth required). Validates an invitation token passed as a
// query parameter. Used by the invite-accept page to check if the link is still
// valid before showing the acceptance form.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';

const log = createLogger('team-verify-invite');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const r = log.withRequest(req);

  const json = (data: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    // Support both query param and POST body
    const url = new URL(req.url);
    let token = url.searchParams.get('token');
    if (!token && req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      token = body.token ?? null;
    }

    if (!token) {
      r.warn('missing token');
      r.done(400);
      return json({ success: false, error: 'Missing token.' }, 400);
    }
    r.info('verifying invitation token', { token_prefix: token.slice(0, 8) });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // ── Look up the invitation ──────────────────────────────────────────────
    r.info('querying invitation by token');
    const { data: row, error: queryErr } = await supabase
      .from('teamleader_users')
      .select(
        'id, invitation_token, invitation_status, invitation_expires_at, admin_user_id, user_info, deleted_at',
      )
      .eq('invitation_token', token)
      .maybeSingle();

    if (queryErr) {
      r.error('invitation query failed', { error: queryErr.message, code: queryErr.code });
      r.done(500);
      return json({ success: false, error: 'Server error.' }, 500);
    }

    // ── Token not found ─────────────────────────────────────────────────────
    if (!row) {
      r.warn('invitation not found', { token_prefix: token.slice(0, 8) });
      r.done(200, { found: false });
      return json({ success: false, error: 'Invitation not found.' });
    }

    r.info('invitation found', {
      invitation_id: row.id,
      status: row.invitation_status,
      admin_user_id: row.admin_user_id,
      is_deleted: !!row.deleted_at,
    });

    // ── Already soft-deleted ────────────────────────────────────────────────
    if (row.deleted_at) {
      r.warn('invitation was cancelled (soft-deleted)', { invitation_id: row.id });
      r.done(200, { reason: 'cancelled' });
      return json({ success: false, error: 'This invitation has been cancelled.' });
    }

    // ── Status is not pending ───────────────────────────────────────────────
    if (row.invitation_status !== 'pending') {
      r.info('invitation is not pending', { invitation_id: row.id, status: row.invitation_status });
      r.done(200, { reason: row.invitation_status });
      return json({
        success: false,
        error:
          row.invitation_status === 'accepted'
            ? 'This invitation has already been accepted.'
            : row.invitation_status === 'declined'
              ? 'This invitation has been declined.'
              : `Invitation status: ${row.invitation_status}`,
      });
    }

    // ── Check expiry ────────────────────────────────────────────────────────
    if (row.invitation_expires_at) {
      const expiresAt = new Date(row.invitation_expires_at).getTime();
      if (Date.now() > expiresAt) {
        r.warn('invitation has expired', { invitation_id: row.id, expired_at: row.invitation_expires_at });
        // Update status in DB so we don't have to check again
        await supabase
          .from('teamleader_users')
          .update({
            invitation_status: 'expired',
            updated_at: new Date().toISOString(),
          })
          .eq('id', row.id);

        r.done(200, { reason: 'expired' });
        return json({ success: false, reason: 'expired' });
      }
    }

    // ── Look up admin name ──────────────────────────────────────────────────
    let adminName = 'Your team admin';
    if (row.admin_user_id) {
      r.info('looking up admin name', { admin_user_id: row.admin_user_id });
      const { data: adminRow } = await supabase
        .from('teamleader_users')
        .select('user_info')
        .eq('user_id', row.admin_user_id)
        .is('deleted_at', null)
        .maybeSingle();

      if (adminRow?.user_info) {
        const info = adminRow.user_info as Record<string, unknown>;
        const first = (info.first_name as string) ?? '';
        const last = (info.last_name as string) ?? '';
        const fullName = `${first} ${last}`.trim();
        if (fullName) adminName = fullName;
      }
      r.info('admin name resolved', { admin_name: adminName });
    }

    // ── Invitee details ─────────────────────────────────────────────────────
    const inviteeInfo = (row.user_info ?? {}) as Record<string, unknown>;
    const inviteeFirst = (inviteeInfo.first_name as string) ?? '';
    const inviteeLast = (inviteeInfo.last_name as string) ?? '';
    const inviteeName = `${inviteeFirst} ${inviteeLast}`.trim();
    const inviteeEmail = (inviteeInfo.email as string) ?? '';

    r.info('invitation valid', { invitee_name: inviteeName, invitee_email: inviteeEmail, admin_name: adminName });
    r.done(200, { valid: true });

    return json({
      success: true,
      admin_name: adminName,
      inviteeName,
      inviteeEmail,
    });
  } catch (err) {
    r.error('unhandled error', toErrorDetail(err));
    r.done(500);
    return json(
      { success: false, error: err instanceof Error ? err.message : 'Unexpected error' },
      500,
    );
  }
});
