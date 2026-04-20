// ── team-members ──────────────────────────────────────────────────────────────
// Returns the team member list for the authenticated user.
// Admins see all members under their admin_user_id; regular members see only
// themselves.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';

const log = createLogger('team-members');

// ── Tier seat limits (mirrors src/config/teamPricing.ts) ─────────────────────
const TIER_SEAT_LIMITS: Record<string, number | null> = {
  starter: 3,
  professional: 10,
  business: 25,
  enterprise: null, // unlimited
};

/** Determine the tier key from the current seat count. */
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

/** Map a DB row to the client-facing TeamMember shape. */
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

    // ── Check if the user is an admin ───────────────────────────────────────
    r.info('checking admin status');
    const { data: adminRow, error: adminErr } = await supabase
      .from('teamleader_users')
      .select('id, is_admin')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (adminErr) {
      r.error('admin check query failed', { error: adminErr.message });
    }
    const isAdmin = adminRow?.is_admin === true;
    r.info('admin check result', { is_admin: isAdmin, row_found: !!adminRow });

    let rows: DbRow[];

    if (isAdmin) {
      // Admin: fetch own row + all team members where admin_user_id = user.id
      r.info('fetching team members (admin view)');
      const { data: adminRows, error: fetchErr } = await supabase
        .from('teamleader_users')
        .select(
          'id, user_id, teamleader_id, user_info, is_admin, admin_user_id, invitation_status, invited_at, whatsapp_status, deleted_at',
        )
        .or(`user_id.eq.${user.id},admin_user_id.eq.${user.id}`)
        .is('deleted_at', null)
        .order('is_admin', { ascending: false })
        .order('invited_at', { ascending: true });

      if (fetchErr) {
        r.error('team query failed (admin)', { error: fetchErr.message, code: fetchErr.code });
        r.done(500);
        return json({ success: false, error: 'Failed to load team members.' }, 500);
      }

      rows = (adminRows ?? []) as DbRow[];
      r.info('admin query returned rows', { count: rows.length });
    } else {
      // Regular member: only their own row
      r.info('fetching team members (member view)');
      const { data: selfRows, error: fetchErr } = await supabase
        .from('teamleader_users')
        .select(
          'id, user_id, teamleader_id, user_info, is_admin, admin_user_id, invitation_status, invited_at, whatsapp_status, deleted_at',
        )
        .eq('user_id', user.id)
        .is('deleted_at', null);

      if (fetchErr) {
        r.error('team query failed (member)', { error: fetchErr.message, code: fetchErr.code });
        r.done(500);
        return json({ success: false, error: 'Failed to load team members.' }, 500);
      }

      rows = (selfRows ?? []) as DbRow[];
      r.info('member query returned rows', { count: rows.length });
    }

    const members = rows.map(toMember);
    const seatsUsed = members.filter(
      (m) => m.invitationStatus === 'accepted' || m.invitationStatus === 'pending',
    ).length;
    const tierKey = determineTier(seatsUsed);
    const seatLimit = TIER_SEAT_LIMITS[tierKey] ?? null;

    r.info('team response built', {
      members_count: members.length,
      seats_used: seatsUsed,
      seat_limit: seatLimit,
      tier: tierKey,
      is_admin: isAdmin,
    });
    r.done(200);

    return json({
      success: true,
      team: {
        members,
        seatsUsed,
        seatLimit,
        tierKey,
      },
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
