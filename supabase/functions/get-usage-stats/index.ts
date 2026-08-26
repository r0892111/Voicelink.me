// ── get-usage-stats ───────────────────────────────────────────────────────────
// Default: usage in the current billing window for the authenticated user
// (credits + messages). ?scope=team (admin only): per-member breakdown.
//
// Credits are computed by VLAgent at write time (cost-based, cache-aware —
// core/usage_metering.py) and stored per interaction in usage_events; this
// function only SUMS them via the usage_summary RPC (VLAgent migration 023)
// over the same window the credit gate uses, so the dashboard can never show
// a different number than enforcement charges. No token→credit math here.
// Cap is derived from the active Stripe subscription:
//   is_test_user          → unlimited (no cap)
//   trialing OR free price → TRIAL_CREDITS (100)
//   paid                   → tier.creditsPerUser × seat quantity
//
// Cost figures (USD) are intentionally NOT returned — usage page hides them.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';
import { corsHeaders } from '../_shared/cors.ts';

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

// One row per tenant from usage_summary(p_tenant_ids, p_since).
interface UsageSummaryRow {
  tenant_id: string;
  credits: number | string | null;   // NUMERIC arrives as a string over PostgREST
  messages: number | string | null;
  last_activity: string | null;
}

function json(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
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

interface UsageTotals {
  credits_used: number;
  messages_sent: number;
  last_activity: string | null;
}

const EMPTY_USAGE: UsageTotals = { credits_used: 0, messages_sent: 0, last_activity: null };

// Sum usage_events per tenant since `sinceIso` (the billing-window start —
// identical to credit_check._window_start on the VLAgent side).
async function fetchUsage(
  supabaseAdmin: ReturnType<typeof createClient>,
  tenantIds: string[],
  sinceIso: string,
): Promise<Map<string, UsageTotals>> {
  const out = new Map<string, UsageTotals>();
  if (tenantIds.length === 0) return out;
  // The admin client is built without generated Database types, so
  // supabase-js types .rpc() arguments as `never`; declare the one call shape
  // we use instead of casting to any.
  const rpcClient = supabaseAdmin as unknown as {
    rpc(
      fn: 'usage_summary',
      args: { p_tenant_ids: string[]; p_since: string },
    ): Promise<{ data: unknown; error: { message: string } | null }>;
  };
  const { data, error } = await rpcClient.rpc('usage_summary', {
    p_tenant_ids: tenantIds,
    p_since: sinceIso,
  });
  if (error) throw new Error(`usage_summary failed: ${error.message}`);
  for (const r of (data ?? []) as UsageSummaryRow[]) {
    out.set(r.tenant_id, {
      credits_used: Number(r.credits ?? 0),
      messages_sent: Number(r.messages ?? 0),
      last_activity: r.last_activity,
    });
  }
  return out;
}

interface CreditsContext {
  perSeat: number | null;
  total: number | null;          // base + top-ups, the user-visible cap
  topupCredits: number;          // sum of paid top-ups in the active window
  seats: number;
  isTrial: boolean;
  isUnlimited: boolean;
  windowStartIso: string;        // usage + top-ups are summed from here
}

// Mirror of credit_check._window_start: trial spans the lifetime of the
// subscription (epoch), paid plans refresh on Stripe's billing anniversary.
const EPOCH_ZERO = '1970-01-01T00:00:00Z';

async function sumPaidTopups(
  supabaseAdmin: ReturnType<typeof createClient>,
  customerId: string,
  sinceIso: string,
): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('credit_topups')
    .select('credits_added')
    .eq('customer_id', customerId)
    .eq('status', 'paid')
    .gte('purchased_at', sinceIso);
  if (error || !data) return 0;
  return data.reduce((acc, r) => acc + Number(r.credits_added ?? 0), 0);
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
    return { perSeat: null, total: null, topupCredits: 0, seats: 0, isTrial: false, isUnlimited: true, windowStartIso: EPOCH_ZERO };
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
      return { perSeat: null, total: null, topupCredits: 0, seats: 0, isTrial: false, isUnlimited: true, windowStartIso: EPOCH_ZERO };
    }
    stripeCustomerId = adminRow?.stripe_customer_id ?? null;
  }

  if (!stripeCustomerId) {
    return { perSeat: null, total: null, topupCredits: 0, seats: 0, isTrial: false, isUnlimited: false, windowStartIso: EPOCH_ZERO };
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

  if (!sub) return { perSeat: null, total: null, topupCredits: 0, seats: 0, isTrial: false, isUnlimited: false, windowStartIso: EPOCH_ZERO };

  const item = sub.items.data[0];
  const price = item?.price;
  const seats = item?.quantity ?? 1;

  // Trial: explicit trialing status OR a zero-amount price (free trial product).
  const isTrial =
    sub.status === 'trialing' || (price?.unit_amount ?? 0) === 0;
  if (isTrial) {
    // Trial top-ups never expire (window = epoch), matching credit_check.py.
    const topupCredits = await sumPaidTopups(supabaseAdmin, stripeCustomerId, EPOCH_ZERO);
    return {
      perSeat: TRIAL_CREDITS,
      total: TRIAL_CREDITS + topupCredits,
      topupCredits,
      seats: 1,
      isTrial: true,
      isUnlimited: false,
      windowStartIso: EPOCH_ZERO,
    };
  }

  const priceId = price?.id ?? '';
  const perSeat = TIER_CREDITS_BY_PRICE_ID[priceId] ?? null;
  // Paid plan usage + top-ups reset with the billing period — sum since
  // current_period_start, matching credit_check.py for the gate.
  const periodStartIso = new Date((sub.current_period_start ?? 0) * 1000).toISOString();
  if (perSeat === null) {
    return { perSeat: null, total: null, topupCredits: 0, seats, isTrial: false, isUnlimited: false, windowStartIso: periodStartIso };
  }

  const topupCredits = await sumPaidTopups(supabaseAdmin, stripeCustomerId, periodStartIso);
  return {
    perSeat,
    total: perSeat * seats + topupCredits,
    topupCredits,
    seats,
    isTrial: false,
    isUnlimited: false,
    windowStartIso: periodStartIso,
  };
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

  const credits = await resolveCredits(supabase, userId);

  const tenantId = tl.teamleader_id as string;
  let totals: UsageTotals;
  try {
    totals = (await fetchUsage(supabase, [tenantId], credits.windowStartIso)).get(tenantId) ?? EMPTY_USAGE;
  } catch (err) {
    return json({ success: false, error: err instanceof Error ? err.message : 'usage lookup failed' }, 500);
  }

  return json({
    success: true,
    usage: {
      credits_used: totals.credits_used,
      credits_total: credits.total,
      topup_credits: credits.topupCredits,
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

  const credits = await resolveCredits(supabase, callerUserId);

  let usageByTenant: Map<string, UsageTotals>;
  try {
    usageByTenant = await fetchUsage(supabase, teamleaderIds, credits.windowStartIso);
  } catch (err) {
    return json({ success: false, error: err instanceof Error ? err.message : 'usage lookup failed' }, 500);
  }

  const memberUsage = members.map((m) => {
    const totals = (m.teamleader_id ? usageByTenant.get(m.teamleader_id) : undefined) ?? EMPTY_USAGE;
    return {
      user_id: m.user_id,
      name: m.name,
      credits_used: totals.credits_used,
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
      topup_credits: credits.topupCredits,
      seats: credits.seats,
      is_trial: credits.isTrial,
      is_unlimited: credits.isUnlimited,
      members: memberUsage,
    },
  });
}
