// ── team-invite ───────────────────────────────────────────────────────────────
// Handles all invite-related actions: send, cancel, remove, resend.
// Every action returns the updated team so the client can simply replace its
// local state with the server response.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { createWhatsAppProvider } from '../_shared/whatsapp/providers/factory.ts';

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
    const { data: { user }, error: authError } =
      await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return json({ success: false, error: 'Unauthorized' }, 401);
    }

    // ── Must be admin ───────────────────────────────────────────────────────
    const { data: adminRow } = await supabase
      .from('teamleader_users')
      .select('id, is_admin, user_info')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .eq('is_admin', true)
      .maybeSingle();

    if (!adminRow) {
      return json({ success: false, error: 'Only admins can manage invitations.' }, 403);
    }

    // ── Parse body ──────────────────────────────────────────────────────────
    const body = await req.json();
    const action: string = body.action;

    if (!action) {
      return json({ success: false, error: 'Missing action.' }, 400);
    }

    // ── SEND ────────────────────────────────────────────────────────────────
    if (action === 'send') {
      const { teamleader_id, name, email, phone, invite_method } = body as {
        teamleader_id: string;
        name: string;
        email: string;
        phone?: string;
        invite_method?: string;
      };

      if (!teamleader_id || !email) {
        return json({ success: false, error: 'Missing teamleader_id or email.' }, 400);
      }

      // Check for duplicate (already invited or active, not soft-deleted)
      const { data: existing } = await supabase
        .from('teamleader_users')
        .select('id')
        .eq('teamleader_id', teamleader_id)
        .is('deleted_at', null)
        .maybeSingle();

      if (existing) {
        return json({ success: false, error: 'This employee has already been invited.' }, 409);
      }

      // Check seat limit
      const currentTeam = await getTeamResponse(supabase, user.id);
      const currentSeats = currentTeam.seatsUsed;
      const tierKey = determineTier(currentSeats + 1);
      const limit = TIER_SEAT_LIMITS[tierKey];
      if (limit !== null && currentSeats >= limit) {
        return json({
          success: false,
          error: `Seat limit reached (${limit}). Upgrade your plan to add more members.`,
        }, 403);
      }

      // Generate invitation token
      const invitationToken = crypto.randomUUID();
      const invitationExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      // Parse name into first_name / last_name for user_info
      const nameParts = (name ?? '').trim().split(/\s+/);
      const firstName = nameParts[0] ?? '';
      const lastName = nameParts.slice(1).join(' ') ?? '';

      // Insert the invited member row
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
        console.error('team-invite: insert error', insertErr);
        return json({ success: false, error: 'Failed to create invitation.' }, 500);
      }

      // ── Send invitation email via Supabase Auth ─────────────────────────
      const method = invite_method ?? 'email';
      if (method === 'email' || method === 'both') {
        try {
          const siteUrl = Deno.env.get('SITE_URL') ?? 'https://voicelink.me';
          const redirectTo = `${siteUrl}/invite/accept?token=${invitationToken}`;

          await supabase.auth.admin.inviteUserByEmail(email, {
            data: {
              invitation_token: invitationToken,
              invited_by: user.id,
              role: 'member',
            },
            redirectTo,
          });
        } catch (emailErr) {
          // Non-fatal: the invite row exists, email delivery is best-effort
          console.error('team-invite: email send error (non-fatal)', emailErr);
        }
      }

      // ── Send WhatsApp invite (best-effort) ────────────────────────────
      if ((method === 'whatsapp' || method === 'both') && phone) {
        try {
          const siteUrl = Deno.env.get('SITE_URL') ?? 'https://voicelink.me';
          const inviteUrl = `${siteUrl}/invite?token=${invitationToken}`;
          const adminInfo = adminRow.user_info as Record<string, unknown> | null;
          const adminName = (adminInfo?.name as string)
            || [adminInfo?.first_name, adminInfo?.last_name].filter(Boolean).join(' ')
            || 'Your manager';

          const provider = createWhatsAppProvider();
          await provider.sendTeamInvite(phone, adminName, inviteUrl);
        } catch (waErr) {
          console.error('team-invite: whatsapp send error (non-fatal)', waErr);
        }
      }

      const team = await getTeamResponse(supabase, user.id);
      return json({ success: true, team });
    }

    // ── CANCEL ──────────────────────────────────────────────────────────────
    if (action === 'cancel') {
      const { member_id } = body as { member_id: string };
      if (!member_id) {
        return json({ success: false, error: 'Missing member_id.' }, 400);
      }

      // Verify the member belongs to this admin's team
      const { data: memberRow } = await supabase
        .from('teamleader_users')
        .select('id, admin_user_id, invitation_status')
        .eq('id', member_id)
        .is('deleted_at', null)
        .maybeSingle();

      if (!memberRow || memberRow.admin_user_id !== user.id) {
        return json({ success: false, error: 'Member not found or access denied.' }, 404);
      }

      if (memberRow.invitation_status !== 'pending') {
        return json({ success: false, error: 'Only pending invitations can be cancelled.' }, 400);
      }

      // Hard-delete the pending invite row so the teamleader_id slot is freed
      const { error: deleteErr } = await supabase
        .from('teamleader_users')
        .delete()
        .eq('id', member_id);

      if (deleteErr) {
        console.error('team-invite: cancel error', deleteErr);
        return json({ success: false, error: 'Failed to cancel invitation.' }, 500);
      }

      const team = await getTeamResponse(supabase, user.id);
      return json({ success: true, team });
    }

    // ── REMOVE ──────────────────────────────────────────────────────────────
    if (action === 'remove') {
      const { member_id } = body as { member_id: string };
      if (!member_id) {
        return json({ success: false, error: 'Missing member_id.' }, 400);
      }

      // Verify the member belongs to this admin's team
      const { data: memberRow } = await supabase
        .from('teamleader_users')
        .select('id, admin_user_id, is_admin')
        .eq('id', member_id)
        .is('deleted_at', null)
        .maybeSingle();

      if (!memberRow || memberRow.admin_user_id !== user.id) {
        return json({ success: false, error: 'Member not found or access denied.' }, 404);
      }

      // Prevent admin from removing themselves
      if (memberRow.is_admin) {
        return json({ success: false, error: 'Admins cannot remove themselves.' }, 400);
      }

      // Hard-delete the member row so the teamleader_id slot is freed
      const { error: deleteErr } = await supabase
        .from('teamleader_users')
        .delete()
        .eq('id', member_id);

      if (deleteErr) {
        console.error('team-invite: remove error', deleteErr);
        return json({ success: false, error: 'Failed to remove member.' }, 500);
      }

      const team = await getTeamResponse(supabase, user.id);
      return json({ success: true, team });
    }

    // ── RESEND ──────────────────────────────────────────────────────────────
    if (action === 'resend') {
      const { member_id, invite_method } = body as {
        member_id: string;
        invite_method?: string;
      };

      if (!member_id) {
        return json({ success: false, error: 'Missing member_id.' }, 400);
      }

      // Verify the member belongs to this admin's team and is pending
      const { data: memberRow } = await supabase
        .from('teamleader_users')
        .select('id, admin_user_id, invitation_status, user_info, phone')
        .eq('id', member_id)
        .is('deleted_at', null)
        .maybeSingle();

      if (!memberRow || memberRow.admin_user_id !== user.id) {
        return json({ success: false, error: 'Member not found or access denied.' }, 404);
      }

      if (memberRow.invitation_status !== 'pending') {
        return json({ success: false, error: 'Only pending invitations can be resent.' }, 400);
      }

      // Generate new token + expiry
      const newToken = crypto.randomUUID();
      const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const { error: updateErr } = await supabase
        .from('teamleader_users')
        .update({
          invitation_token: newToken,
          invitation_expires_at: newExpiry,
          updated_at: new Date().toISOString(),
        })
        .eq('id', member_id);

      if (updateErr) {
        console.error('team-invite: resend update error', updateErr);
        return json({ success: false, error: 'Failed to resend invitation.' }, 500);
      }

      // Re-send email and/or WhatsApp
      const info = memberRow.user_info ?? {};
      const email = (info as Record<string, unknown>).email as string | undefined;
      const phone = memberRow.phone as string | undefined;
      const method = invite_method ?? 'email';

      if ((method === 'email' || method === 'both') && email) {
        try {
          const siteUrl = Deno.env.get('SITE_URL') ?? 'https://voicelink.me';
          const redirectTo = `${siteUrl}/invite/accept?token=${newToken}`;

          await supabase.auth.admin.inviteUserByEmail(email, {
            data: {
              invitation_token: newToken,
              invited_by: user.id,
              role: 'member',
            },
            redirectTo,
          });
        } catch (emailErr) {
          console.error('team-invite: resend email error (non-fatal)', emailErr);
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

          const provider = createWhatsAppProvider();
          await provider.sendTeamInvite(phone, adminName, inviteUrl);
        } catch (waErr) {
          console.error('team-invite: resend whatsapp error (non-fatal)', waErr);
        }
      }

      const team = await getTeamResponse(supabase, user.id);
      return json({ success: true, team });
    }

    // ── Unknown action ──────────────────────────────────────────────────────
    return json({ success: false, error: `Unknown action: ${action}` }, 400);
  } catch (err) {
    console.error('team-invite:', err);
    return json(
      { success: false, error: err instanceof Error ? err.message : 'Unexpected error' },
      500,
    );
  }
});
