// ── team-verify-invite ────────────────────────────────────────────────────────
// Public endpoint (no auth required). Validates an invitation token passed as a
// query parameter. Used by the invite-accept page to check if the link is still
// valid before showing the acceptance form.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const json = (data: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return json({ valid: false, reason: 'Missing token.' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // ── Look up the invitation ──────────────────────────────────────────────
    const { data: row, error: queryErr } = await supabase
      .from('teamleader_users')
      .select(
        'id, invitation_token, invitation_status, invitation_expires_at, admin_user_id, user_info, deleted_at',
      )
      .eq('invitation_token', token)
      .maybeSingle();

    if (queryErr) {
      console.error('team-verify-invite: query error', queryErr);
      return json({ valid: false, reason: 'Server error.' }, 500);
    }

    // ── Token not found ─────────────────────────────────────────────────────
    if (!row) {
      return json({ valid: false, reason: 'Invitation not found.' });
    }

    // ── Already soft-deleted ────────────────────────────────────────────────
    if (row.deleted_at) {
      return json({ valid: false, reason: 'This invitation has been cancelled.' });
    }

    // ── Status is not pending ───────────────────────────────────────────────
    if (row.invitation_status !== 'pending') {
      return json({
        valid: false,
        reason:
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
        // Update status in DB so we don't have to check again
        await supabase
          .from('teamleader_users')
          .update({
            invitation_status: 'expired',
            updated_at: new Date().toISOString(),
          })
          .eq('id', row.id);

        return json({ valid: false, reason: 'This invitation has expired.' });
      }
    }

    // ── Look up admin name ──────────────────────────────────────────────────
    let adminName = 'Your team admin';
    if (row.admin_user_id) {
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
    }

    // ── Invitee details ─────────────────────────────────────────────────────
    const inviteeInfo = (row.user_info ?? {}) as Record<string, unknown>;
    const inviteeFirst = (inviteeInfo.first_name as string) ?? '';
    const inviteeLast = (inviteeInfo.last_name as string) ?? '';
    const inviteeName = `${inviteeFirst} ${inviteeLast}`.trim();
    const inviteeEmail = (inviteeInfo.email as string) ?? '';

    return json({
      valid: true,
      adminName,
      inviteeName,
      inviteeEmail,
    });
  } catch (err) {
    console.error('team-verify-invite:', err);
    return json(
      { valid: false, reason: err instanceof Error ? err.message : 'Unexpected error' },
      500,
    );
  }
});
