// ── get-usage-stats ───────────────────────────────────────────────────────────
// Default: cumulative usage for the authenticated user (credits + messages).
// ?scope=team (admin only): per-member breakdown for the admin's workspace.
//
// Credits are the user-facing unit. 1 credit = 1,000 input tokens.
// Cap is derived from the active Stripe subscription:
//   is_test_user          → unlimited (no cap)
//   trialing OR free price → TRIAL_CREDITS (100)
//   paid                   → tier.creditsPerUser × seat quantity
//
// Cost figures (USD) are intentionally NOT returned — usage page hides them.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';
import { corsHeaders } from '../_shared/cors.ts';

const TOKENS_PER_CREDIT = 1_000;
const TRIAL_CREDITS = 100;

// Mirror of src/config/teamPricing.ts — kept in sync manually.
// Edge functions can't import from src/, so the price-id → credits mapping
// lives here too. When tier prices/credits change, update both files.
const TIER_CREDITS_BY_PRICE_ID: Record<string, number> = {
  'price_1TOZ1cLPohnizGblBAttd82T': 350,    // Starter monthly
  'price_1TOZ1dLPohnizGbl56BBL8BJ': 350,    // Starter yearly
  'price_1TOZ1eLPohnizGbldPFhRy1m': 1000,   // Professional monthly
  'price_1TOZ25LPohnizGbll2UCxFpu': 1000,   // Professional yearly
  'price_1TOZ26LPohnizGblXfd6OqxQ': 2000,   // Business monthly
  'price_1TOZ26LPohnizGblh8BYsGWM': 2000,   // Business yearly
};

interface AnalyticsRow {
  user_id: string;
  messages_sent: number | null;
  input_tokens_spent: number | null;
  last_activity: string | null;
  environment: string | null;
}

function json(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function tokensToCredits(tokens: number): number {
  return tokens / TOKENS_PER_CREDIT;
}

interface MemberInfo {
  user_id: string;
  teamleader_id: string | null;
  name: string;
  isTestUser: boolean;
}

function nameFromUserInfo(info: Record<string, unknown> | null): string {
  if (!info) return 'Member';
  const name = (info.name as string) ?? '';
  if (name) return name;
  const first = (info.first_name as string) ?? '';
  const last = (info.last_name as string) ?? '';
  const joined = [first, last].filter(Boolean).join(' ');
  return joined || (info.email as string) || 'Member';
}

interface AggregatedUsage {
  messages_sent: number;
  input_tokens_spent: number;
  last_activity: string | null;
}

function aggregate(rows: AnalyticsRow[]): AggregatedUsage {
  let lastMs = 0;
  return rows.reduce<AggregatedUsage>(
    (acc, r) => {
      acc.messages_sent += Number(r.messages_sent ?? 0);
      acc.input_tokens_spent += Number(r.input_tokens_spent ?? 0);
      const ts = r.last_activity ? Date.parse(r.last_activity) : 0;
      if (ts && ts > lastMs) {
        lastMs = ts;
        acc.last_activity = r.last_activity;
      }
      return acc;
    },
    { messages_sent: 0, input_tokens_spent: 0, last_activity: null },
  );
}

interface CreditsContext {
  perSeat: number | null;
  total: number | null;
  seats: number;
  isTrial: boolean;
  isUnlimited: boolean;
}

async function resolveCredits(
  supabaseAdmin: ReturnType<typeof createClient>,
  callerUserId: string,
): Promise<CreditsContext> {
  // Resolve which row owns the subscription. Members defer to admin's row.
  const { data: row } = await supabaseAdmin
    .from('teamleader_users')
    .select('stripe_customer_id, is_admin, admin_user_id, is_test_user')
    .eq('user_id', callerUserId)
    .is('deleted_at', null)
    .maybeSingle();

  // Test users always run uncapped — no Stripe lookup needed.
  if (row?.is_test_user) {
    return { perSeat: null, total: null, seats: 0, isTrial: false, isUnlimited: true };
  }

  let stripeCustomerId: string | null = row?.stripe_customer_id ?? null;
  if (row && !row.is_admin && row.admin_user_id) {
    const { data: adminRow } = await supabaseAdmin
      .from('teamleader_users')
      .select('stripe_customer_id, is_test_user')
      .eq('user_id', row.admin_user_id)
      .is('deleted_at', null)
      .maybeSingle();
    if (adminRow?.is_test_user) {
      return { perSeat: null, total: null, seats: 0, isTrial: false, isUnlimited: true };
    }
    stripeCustomerId = adminRow?.stripe_customer_id ?? null;
  }

  if (!stripeCustomerId) {
    return { perSeat: null, total: null, seats: 0, isTrial: false, isUnlimited: false };
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
  const subs = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: 'all',
    limit: 5,
    expand: ['data.items.data.price'],
  });
  const sub =
    subs.data.find((s) => s.status === 'active' || s.status === 'trialing') ??
    subs.data[0];

  if (!sub) return { perSeat: null, total: null, seats: 0, isTrial: false, isUnlimited: false };

  const item = sub.items.data[0];
  const price = item?.price;
  const seats = item?.quantity ?? 1;

  // Trial: explicit trialing status OR a zero-amount price (free trial product).
  const isTrial =
    sub.status === 'trialing' || (price?.unit_amount ?? 0) === 0;
  if (isTrial) {
    return { perSeat: TRIAL_CREDITS, total: TRIAL_CREDITS, seats: 1, isTrial: true, isUnlimited: false };
  }

  const priceId = price?.id ?? '';
  const perSeat = TIER_CREDITS_BY_PRICE_ID[priceId] ?? null;
  if (perSeat === null) {
    return { perSeat: null, total: null, seats, isTrial: false, isUnlimited: false };
  }
  return { perSeat, total: perSeat * seats, seats, isTrial: false, isUnlimited: false };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const scope = url.searchParams.get('scope');

    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } =
      await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return json({ success: false, error: 'Unauthorized' }, 401);
    }

    if (scope === 'team') {
      return await handleTeamScope(supabase, user.id);
    }

    return await handleSelfScope(supabase, user.id);
  } catch (err) {
    return json(
      { success: false, error: err instanceof Error ? err.message : 'Unexpected error' },
      500,
    );
  }
});

async function handleSelfScope(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<Response> {
  const { data: tl, error: tlError } = await supabase
    .from('teamleader_users')
    .select('teamleader_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (tlError) return json({ success: false, error: tlError.message }, 500);
  if (!tl?.teamleader_id) return json({ success: true, usage: null });

  const { data: rows, error: analyticsError } = await supabase
    .from('analytics')
    .select('user_id, messages_sent, input_tokens_spent, last_activity, environment')
    .eq('user_id', tl.teamleader_id);

  if (analyticsError) return json({ success: false, error: analyticsError.message }, 500);

  const credits = await resolveCredits(supabase, userId);

  if (!rows || rows.length === 0) {
    return json({
      success: true,
      usage: {
        credits_used: 0,
        credits_total: credits.total,
        messages_sent: 0,
        last_activity: null,
        is_trial: credits.isTrial,
        is_unlimited: credits.isUnlimited,
      },
    });
  }

  const totals = aggregate(rows as AnalyticsRow[]);

  return json({
    success: true,
    usage: {
      credits_used: tokensToCredits(totals.input_tokens_spent),
      credits_total: credits.total,
      messages_sent: totals.messages_sent,
      last_activity: totals.last_activity,
      is_trial: credits.isTrial,
      is_unlimited: credits.isUnlimited,
    },
  });
}

async function handleTeamScope(
  supabase: ReturnType<typeof createClient>,
  callerUserId: string,
): Promise<Response> {
  // Verify caller is admin.
  const { data: callerRow, error: callerErr } = await supabase
    .from('teamleader_users')
    .select('user_id, is_admin, teamleader_id, user_info')
    .eq('user_id', callerUserId)
    .is('deleted_at', null)
    .maybeSingle();

  if (callerErr) return json({ success: false, error: callerErr.message }, 500);
  if (!callerRow || !callerRow.is_admin) {
    return json({ success: false, error: 'Forbidden: admin only' }, 403);
  }

  // Members linked to this admin + the admin themselves.
  const { data: memberRows, error: memberErr } = await supabase
    .from('teamleader_users')
    .select('user_id, teamleader_id, user_info, is_test_user')
    .or(`admin_user_id.eq.${callerUserId},user_id.eq.${callerUserId}`)
    .is('deleted_at', null);

  if (memberErr) return json({ success: false, error: memberErr.message }, 500);

  const members: MemberInfo[] = (memberRows ?? []).map((r) => ({
    user_id: r.user_id as string,
    teamleader_id: (r.teamleader_id as string | null) ?? null,
    name: nameFromUserInfo(r.user_info as Record<string, unknown> | null),
    isTestUser: !!r.is_test_user,
  }));

  const teamleaderIds = members
    .map((m) => m.teamleader_id)
    .filter((id): id is string => !!id);

  let analyticsRows: AnalyticsRow[] = [];
  if (teamleaderIds.length > 0) {
    const { data: rows, error: analyticsErr } = await supabase
      .from('analytics')
      .select('user_id, messages_sent, input_tokens_spent, last_activity, environment')
      .in('user_id', teamleaderIds);
    if (analyticsErr) return json({ success: false, error: analyticsErr.message }, 500);
    analyticsRows = (rows ?? []) as AnalyticsRow[];
  }

  const credits = await resolveCredits(supabase, callerUserId);

  const memberUsage = members.map((m) => {
    const ownRows = m.teamleader_id
      ? analyticsRows.filter((r) => r.user_id === m.teamleader_id)
      : [];
    const totals = aggregate(ownRows);
    return {
      user_id: m.user_id,
      name: m.name,
      credits_used: tokensToCredits(totals.input_tokens_spent),
      messages_sent: totals.messages_sent,
      last_activity: totals.last_activity,
      is_unlimited: m.isTestUser,
    };
  });

  // Sort: highest usage first.
  memberUsage.sort((a, b) => b.credits_used - a.credits_used);

  return json({
    success: true,
    team: {
      credits_per_seat: credits.perSeat,
      credits_total: credits.total,
      seats: credits.seats,
      is_trial: credits.isTrial,
      is_unlimited: credits.isUnlimited,
      members: memberUsage,
    },
  });
}
