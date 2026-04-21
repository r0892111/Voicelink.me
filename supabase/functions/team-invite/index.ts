// ── team-invite ───────────────────────────────────────────────────────────────
// Handles all invite-related actions: send, cancel, remove, resend.
// Every action returns the updated team so the client can simply replace its
// local state with the server response.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { createWhatsAppProvider } from '../_shared/whatsapp/providers/factory.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';
import { normalizePhone } from '../_shared/phone.ts';

const log = createLogger('team-invite');

// ── Tier seat limits (mirrors src/config/teamPricing.ts) ─────────────────────
const TIER_SEAT_LIMITS: Record<string, number | null> = {
  starter: 3,
  professional: 10,
  business: 25,
  enterprise: null,
};

function determineTier(seats: number): string {
  if (seats <= 3) return 'starter';
  if (seats <= 10) return 'professional';
  if (seats <= 25) return 'business';
  return 'enterprise';
}

interface DbRow {
  id: string;
  user_id: string | null;
  teamleader_id: string;
  user_info: Record<string, unknown> | null;
  is_admin: boolean;
  admin_user_id: string | null;
  invitation_status: string | null;
  invited_at: string | null;
  whatsapp_status: string | null;
  deleted_at: string | null;
}

function toMember(row: DbRow) {
  const info = row.user_info ?? {};
  const firstName = (info.first_name as string) ?? '';
  const lastName = (info.last_name as string) ?? '';
  const name = `${firstName} ${lastName}`.trim() || ((info.email as string) ?? '');
  const email = (info.email as string) ?? '';

  return {
    id: row.id,
    userId: row.user_id ?? null,
    name,
    email,
    role: row.is_admin ? 'admin' : 'member',
    invitationStatus: row.invitation_status ?? 'accepted',
    invitedAt: row.invited_at ?? null,
    whatsappStatus: row.whatsapp_status ?? 'not_set',
    teamleaderId: row.teamleader_id,
  };
}

// deno-lint-ignore no-explicit-any
type SupabaseClient = any;


/** Build the standard team response object for the authenticated admin. */
async function getTeamResponse(supabase: SupabaseClient, adminUserId: string) {
  const { data: rows, error } = await supabase
    .from('teamleader_users')
    .select(
      'id, user_id, teamleader_id, user_info, is_admin, admin_user_id, invitation_status, invited_at, whatsapp_status, deleted_at',
    )
    .or(`user_id.eq.${adminUserId},admin_user_id.eq.${adminUserId}`)
    .is('deleted_at', null)
    .order('is_admin', { ascending: false })
    .order('invited_at', { ascending: true });

  if (error) throw new Error('Failed to load team members.');

  const members = ((rows ?? []) as DbRow[]).map(toMember);
  const seatsUsed = members.filter(
    (m) => m.invitationStatus === 'accepted' || m.invitationStatus === 'pending',
  ).length;
  const tierKey = determineTier(seatsUsed);
  const seatLimit = TIER_SEAT_LIMITS[tierKey] ?? null;

  return { members, seatsUsed, seatLimit, tierKey };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const r = log.withRequest(req);

  const json = (data: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // ── Authenticate ────────────────────────────────────────────────────────
    r.info('authenticating user');
    const { data: { user }, error: authError } =
      await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      r.warn('auth failed', { error: authError?.message });
      r.done(401);
      return json({ success: false, error: 'Unauthorized' }, 401);
    }
    r.info('authenticated', { user_id: user.id, email: user.email });

    // ── Must be admin ───────────────────────────────────────────────────────
    r.info('checking admin status');
    const { data: adminRow, error: adminErr } = await supabase
      .from('teamleader_users')
      .select('id, is_admin, user_info')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .eq('is_admin', true)
      .maybeSingle();

    if (adminErr) {
      r.error('admin check query failed', { error: adminErr.message });
    }
    r.info('admin check result', { found: !!adminRow });

    if (!adminRow) {
      r.warn('non-admin user attempted invite action', { user_id: user.id });
      r.done(403);
      return json({ success: false, error: 'Only admins can manage invitations.' }, 403);
    }

    // ── Parse body ──────────────────────────────────────────────────────────
    const body = await req.json();
    const action: string = body.action;
    r.info('action requested', { action });

    if (!action) {
      r.warn('missing action');
      r.done(400);
      return json({ success: false, error: 'Missing action.' }, 400);
    }

    // ── SEND ────────────────────────────────────────────────────────────────
    if (action === 'send') {
      const { teamleader_id, name, email, phone: rawPhone, invite_method } = body as {
        teamleader_id: string;
        name: string;
        email: string;
        phone?: string;
        invite_method?: string;
      };

      // Normalise before store / send so downstream WhatsApp OTP receives a
      // valid E.164 number regardless of how the TL API returned it.
      const phone = normalizePhone(rawPhone) ?? undefined;

      r.info('send invite requested', { teamleader_id, email, phone: phone ? '***' : undefined, method: invite_method });

      if (!teamleader_id || !email) {
        r.warn('missing teamleader_id or email');
        r.done(400);
        return json({ success: false, error: 'Missing teamleader_id or email.' }, 400);
      }

      // Check for duplicate (already invited or active, not soft-deleted)
      r.info('checking for duplicate invite', { teamleader_id });
      const { data: existing } = await supabase
        .from('teamleader_users')
        .select('id')
        .eq('teamleader_id', teamleader_id)
        .is('deleted_at', null)
        .maybeSingle();

      if (existing) {
        r.warn('duplicate invite detected', { teamleader_id, existing_id: existing.id });
        r.done(409);
        return json({ success: false, error: 'This employee has already been invited.' }, 409);
      }

      // Check seat limit
      r.info('checking seat limit');
      const currentTeam = await getTeamResponse(supabase, user.id);
      const currentSeats = currentTeam.seatsUsed;
      r.info('current seat usage', { seats_used: currentSeats, members: currentTeam.members.length });
      const tierKey = determineTier(currentSeats + 1);
      const limit = TIER_SEAT_LIMITS[tierKey];
      if (limit !== null && currentSeats >= limit) {
        r.warn('seat limit reached', { seats_used: currentSeats, limit, tier: tierKey });
        r.done(403);
        return json({
          success: false,
          error: `Seat limit reached (${limit}). Upgrade your plan to add more members.`,
        }, 403);
      }

      // Generate invitation token
      const invitationToken = crypto.randomUUID();
      const invitationExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      r.info('generated invitation token', { token_prefix: invitationToken.slice(0, 8), expires_at: invitationExpiresAt });

      // Parse name into first_name / last_name for user_info
      const nameParts = (name ?? '').trim().split(/\s+/);
      const firstName = nameParts[0] ?? '';
      const lastName = nameParts.slice(1).join(' ') ?? '';

      // Insert the invited member row
      r.info('inserting invited member row');
      const { error: insertErr } = await supabase
        .from('teamleader_users')
        .insert({
          teamleader_id,
          admin_user_id: user.id,
          invited_by: user.id,
          is_admin: false,
          invitation_status: 'pending',
          invited_at: new Date().toISOString(),
          invitation_token: invitationToken,
          invitation_expires_at: invitationExpiresAt,
          user_info: {
            first_name: firstName,
            last_name: lastName,
            email,
          },
          phone: phone ?? null,
          whatsapp_status: 'not_set',
        });

      if (insertErr) {
        r.error('insert failed', { error: insertErr.message, code: insertErr.code });
        r.done(500);
        return json({ success: false, error: 'Failed to create invitation.' }, 500);
      }
      r.info('member row inserted successfully');

      // ── Send invitation email via Supabase Auth ─────────────────────────
      const method = invite_method ?? (phone ? 'both' : 'email');
      r.info('sending invitation notifications', { method });
      if (method === 'email' || method === 'both') {
        try {
          const siteUrl = Deno.env.get('SITE_URL') ?? 'https://voicelink.me';
          // `/invite?token=…` is the actual mounted route (InviteAccept.tsx).
          // `/invite/accept` was a typo — landed the user on the 404 fallback.
          const redirectTo = `${siteUrl}/invite?token=${invitationToken}`;

          r.info('sending invitation email', { email, redirect_to: redirectTo });
          const emailResult = await supabase.auth.admin.inviteUserByEmail(email, {
            data: {
              invitation_token: invitationToken,
              invited_by: user.id,
              role: 'member',
            },
            redirectTo,
          });
          r.info('email invitation result', { error: emailResult.error?.message ?? null });
        } catch (emailErr) {
          r.warn('email send failed (non-fatal)', toErrorDetail(emailErr));
        }
      }

      // ── Send WhatsApp invite (best-effort) ────────────────────────────
      if ((method === 'whatsapp' || method === 'both') && phone) {
        const siteUrl = Deno.env.get('SITE_URL') ?? 'https://voicelink.me';
        const inviteUrl = `${siteUrl}/invite?token=${invitationToken}`;
        const adminInfo = adminRow.user_info as Record<string, unknown> | null;
        const adminName = (adminInfo?.name as string)
          || [adminInfo?.first_name, adminInfo?.last_name].filter(Boolean).join(' ')
          || 'Your manager';
        try {
          r.info('sending WhatsApp invite to recipient', { admin_name: adminName });
          const provider = createWhatsAppProvider();
          await provider.sendTeamInvite(phone, adminName, inviteUrl);
          r.info('WhatsApp invite sent successfully');
        } catch (waErr) {
          r.warn('WhatsApp send failed (non-fatal)', toErrorDetail(waErr));
        }
      }

      r.info('building team response after send');
      const team = await getTeamResponse(supabase, user.id);
      r.done(200, { action: 'send', new_seats: team.seatsUsed });
      return json({ success: true, team });
    }

    // ── CANCEL ──────────────────────────────────────────────────────────────
    if (action === 'cancel') {
      const { member_id } = body as { member_id: string };
      r.info('cancel invite requested', { member_id });

      if (!member_id) {
        r.warn('missing member_id');
        r.done(400);
        return json({ success: false, error: 'Missing member_id.' }, 400);
      }

      // Verify the member belongs to this admin's team
      r.info('verifying member ownership', { member_id });
      const { data: memberRow } = await supabase
        .from('teamleader_users')
        .select('id, admin_user_id, invitation_status')
        .eq('id', member_id)
        .is('deleted_at', null)
        .maybeSingle();

      if (!memberRow || memberRow.admin_user_id !== user.id) {
        r.warn('member not found or access denied', { member_id, owner: memberRow?.admin_user_id });
        r.done(404);
        return json({ success: false, error: 'Member not found or access denied.' }, 404);
      }

      if (memberRow.invitation_status !== 'pending') {
        r.warn('cannot cancel non-pending invitation', { member_id, status: memberRow.invitation_status });
        r.done(400);
        return json({ success: false, error: 'Only pending invitations can be cancelled.' }, 400);
      }

      // Hard-delete the pending invite row so the teamleader_id slot is freed
      r.info('deleting pending invite row', { member_id });
      const { error: deleteErr } = await supabase
        .from('teamleader_users')
        .delete()
        .eq('id', member_id);

      if (deleteErr) {
        r.error('cancel delete failed', { error: deleteErr.message, member_id });
        r.done(500);
        return json({ success: false, error: 'Failed to cancel invitation.' }, 500);
      }

      r.info('invite cancelled successfully', { member_id });
      const team = await getTeamResponse(supabase, user.id);
      r.done(200, { action: 'cancel' });
      return json({ success: true, team });
    }

    // ── REMOVE ──────────────────────────────────────────────────────────────
    if (action === 'remove') {
      const { member_id } = body as { member_id: string };
      r.info('remove member requested', { member_id });

      if (!member_id) {
        r.warn('missing member_id');
        r.done(400);
        return json({ success: false, error: 'Missing member_id.' }, 400);
      }

      // Verify the member belongs to this admin's team
      r.info('verifying member ownership', { member_id });
      const { data: memberRow } = await supabase
        .from('teamleader_users')
        .select('id, admin_user_id, is_admin')
        .eq('id', member_id)
        .is('deleted_at', null)
        .maybeSingle();

      if (!memberRow || memberRow.admin_user_id !== user.id) {
        r.warn('member not found or access denied', { member_id, owner: memberRow?.admin_user_id });
        r.done(404);
        return json({ success: false, error: 'Member not found or access denied.' }, 404);
      }

      // Prevent admin from removing themselves
      if (memberRow.is_admin) {
        r.warn('admin attempted to remove themselves', { member_id });
        r.done(400);
        return json({ success: false, error: 'Admins cannot remove themselves.' }, 400);
      }

      // Hard-delete the member row so the teamleader_id slot is freed
      r.info('deleting member row', { member_id });
      const { error: deleteErr } = await supabase
        .from('teamleader_users')
        .delete()
        .eq('id', member_id);

      if (deleteErr) {
        r.error('remove delete failed', { error: deleteErr.message, member_id });
        r.done(500);
        return json({ success: false, error: 'Failed to remove member.' }, 500);
      }

      r.info('member removed successfully', { member_id });
      const team = await getTeamResponse(supabase, user.id);
      r.done(200, { action: 'remove' });
      return json({ success: true, team });
    }

    // ── RESEND ──────────────────────────────────────────────────────────────
    if (action === 'resend') {
      const { member_id, invite_method } = body as {
        member_id: string;
        invite_method?: string;
      };
      r.info('resend invite requested', { member_id, method: invite_method });

      if (!member_id) {
        r.warn('missing member_id');
        r.done(400);
        return json({ success: false, error: 'Missing member_id.' }, 400);
      }

      // Verify the member belongs to this admin's team and is pending
      r.info('verifying member for resend', { member_id });
      const { data: memberRow } = await supabase
        .from('teamleader_users')
        .select('id, admin_user_id, invitation_status, user_info, phone')
        .eq('id', member_id)
        .is('deleted_at', null)
        .maybeSingle();

      if (!memberRow || memberRow.admin_user_id !== user.id) {
        r.warn('member not found or access denied', { member_id });
        r.done(404);
        return json({ success: false, error: 'Member not found or access denied.' }, 404);
      }

      if (memberRow.invitation_status !== 'pending') {
        r.warn('cannot resend non-pending invitation', { member_id, status: memberRow.invitation_status });
        r.done(400);
        return json({ success: false, error: 'Only pending invitations can be resent.' }, 400);
      }

      // Generate new token + expiry
      const newToken = crypto.randomUUID();
      const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      r.info('generated new invitation token', { token_prefix: newToken.slice(0, 8), expires_at: newExpiry });

      const { error: updateErr } = await supabase
        .from('teamleader_users')
        .update({
          invitation_token: newToken,
          invitation_expires_at: newExpiry,
          updated_at: new Date().toISOString(),
        })
        .eq('id', member_id);

      if (updateErr) {
        r.error('resend token update failed', { error: updateErr.message, member_id });
        r.done(500);
        return json({ success: false, error: 'Failed to resend invitation.' }, 500);
      }

      // Re-send email and/or WhatsApp. Re-normalise on read in case older
      // pending-invite rows were stored before we added the insert-side
      // normaliser.
      const info = memberRow.user_info ?? {};
      const email = (info as Record<string, unknown>).email as string | undefined;
      const phone = normalizePhone(memberRow.phone as string | undefined) ?? undefined;
      const method = invite_method ?? (phone ? 'both' : 'email');
      r.info('resending notifications', { method, has_email: !!email, has_phone: !!phone });

      if ((method === 'email' || method === 'both') && email) {
        try {
          const siteUrl = Deno.env.get('SITE_URL') ?? 'https://voicelink.me';
          const redirectTo = `${siteUrl}/invite?token=${newToken}`;

          r.info('resending invitation email', { email });
          await supabase.auth.admin.inviteUserByEmail(email, {
            data: {
              invitation_token: newToken,
              invited_by: user.id,
              role: 'member',
            },
            redirectTo,
          });
          r.info('resend email sent successfully');
        } catch (emailErr) {
          r.warn('resend email failed (non-fatal)', toErrorDetail(emailErr));
        }
      }

      if ((method === 'whatsapp' || method === 'both') && phone) {
        try {
          const siteUrl = Deno.env.get('SITE_URL') ?? 'https://voicelink.me';
          const inviteUrl = `${siteUrl}/invite?token=${newToken}`;
          const adminInfo = adminRow.user_info as Record<string, unknown> | null;
          const adminName = (adminInfo?.name as string)
            || [adminInfo?.first_name, adminInfo?.last_name].filter(Boolean).join(' ')
            || 'Your manager';

          r.info('resending WhatsApp invite');
          const provider = createWhatsAppProvider();
          await provider.sendTeamInvite(phone, adminName, inviteUrl);
          r.info('resend WhatsApp sent successfully');
        } catch (waErr) {
          r.warn('resend WhatsApp failed (non-fatal)', toErrorDetail(waErr));
        }
      }

      r.info('building team response after resend');
      const team = await getTeamResponse(supabase, user.id);
      r.done(200, { action: 'resend' });
      return json({ success: true, team });
    }

    // ── Unknown action ──────────────────────────────────────────────────────
    r.warn('unknown action', { action });
    r.done(400);
    return json({ success: false, error: `Unknown action: ${action}` }, 400);
  } catch (err) {
    r.error('unhandled error', toErrorDetail(err));
    r.done(500);
    return json(
      { success: false, error: err instanceof Error ? err.message : 'Unexpected error' },
      500,
    );
  }
});
