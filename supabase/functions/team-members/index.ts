// ── team-members ──────────────────────────────────────────────────────────────
// Returns the team member list + seat usage for the authenticated user.
// Admins see all members under their admin_user_id; regular members see only
// themselves.
//
// Tier and seat limit are read from `plan_limits` joined via the billing
// admin's active `stripe_subscriptions` row. No active subscription → falls
// back to Free Trial (1 seat). This keeps a single source of truth
// (plan_limits) and stops the dashboard from drifting from the credit checker.

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';

const log = createLogger('team-members');

const ACTIVE_STATUSES = new Set(['active', 'trialing']);

// Fallback voicelink_key when the user has no Stripe customer or no active
// subscription — treats the account as Free Trial (1 seat).
const FREE_TRIAL_KEY = 'free_trial_monthly';

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

interface PlanLimitRow {
  voicelink_key: string;
  tier_key: string;
  max_seats: number | null;
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

/** Resolve {tier_key, max_seats} for the given Stripe customer.
 *  Returns Free Trial defaults when no active subscription exists. */
async function resolvePlan(
  supabase: SupabaseClient,
  stripeCustomerId: string | null,
): Promise<PlanLimitRow> {
  if (stripeCustomerId) {
    const { data: subs } = await supabase
      .from('stripe_subscriptions')
      .select('voicelink_key, status, current_period_end')
      .eq('customer_id', stripeCustomerId)
      .order('current_period_end', { ascending: false })
      .limit(5);

    const sub = subs?.find((s) => ACTIVE_STATUSES.has(s.status as string)) ?? null;
    if (sub?.voicelink_key) {
      const { data: plan } = await supabase
        .from('plan_limits')
        .select('voicelink_key, tier_key, max_seats')
        .eq('voicelink_key', sub.voicelink_key)
        .maybeSingle();
      if (plan) return plan as PlanLimitRow;
    }
  }

  const { data: trial } = await supabase
    .from('plan_limits')
    .select('voicelink_key, tier_key, max_seats')
    .eq('voicelink_key', FREE_TRIAL_KEY)
    .maybeSingle();

  return (
    (trial as PlanLimitRow | null) ?? {
      voicelink_key: FREE_TRIAL_KEY,
      tier_key: 'free_trial',
      max_seats: 1,
    }
  );
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

    r.info('authenticating user');
    const { data: { user }, error: authError } =
      await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      r.warn('auth failed', { error: authError?.message });
      r.done(401);
      return json({ success: false, error: 'Unauthorized' }, 401);
    }
    r.info('authenticated', { user_id: user.id, email: user.email });

    // Self-row tells us admin-ness and points us at the billing admin.
    r.info('fetching self row');
    const { data: selfRow, error: selfErr } = await supabase
      .from('teamleader_users')
      .select('id, is_admin, admin_user_id, stripe_customer_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (selfErr) {
      r.error('self lookup failed', { error: selfErr.message });
    }
    const isAdmin = selfRow?.is_admin === true;
    r.info('admin check result', { is_admin: isAdmin, row_found: !!selfRow });

    // Billing admin's stripe_customer_id drives the plan lookup. For invited
    // members, walk to their admin via admin_user_id.
    let billingCustomerId: string | null = selfRow?.stripe_customer_id ?? null;
    if (!isAdmin && selfRow?.admin_user_id) {
      const { data: adminRow } = await supabase
        .from('teamleader_users')
        .select('stripe_customer_id')
        .eq('user_id', selfRow.admin_user_id)
        .eq('is_admin', true)
        .is('deleted_at', null)
        .maybeSingle();
      billingCustomerId = adminRow?.stripe_customer_id ?? null;
    }

    let rows: DbRow[];
    if (isAdmin) {
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

    const plan = await resolvePlan(supabase, billingCustomerId);

    r.info('team response built', {
      members_count: members.length,
      seats_used: seatsUsed,
      seat_limit: plan.max_seats,
      tier: plan.tier_key,
      voicelink_key: plan.voicelink_key,
      is_admin: isAdmin,
    });
    r.done(200);

    return json({
      success: true,
      team: {
        members,
        seatsUsed,
        seatLimit: plan.max_seats, // null = unlimited
        tierKey: plan.tier_key,
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
