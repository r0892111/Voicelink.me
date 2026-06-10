// ── affiliate-overview ────────────────────────────────────────────────────────
// Owner-only: every affiliate with their referred accounts and live
// subscription state. The caller must have a row in platform_admins
// (added via plain INSERT, service-role only) — fail-closed, and NOT the
// per-tenant is_admin flag, which every workspace admin has.
// ?probe=1 returns right after the gate — the dashboard sidebar uses it to
// decide whether to show the owner section without paying for Stripe calls.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';
import { classifyReferredAccount } from '../_shared/affiliates.ts';

const log = createLogger('affiliate-overview');

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

    const { data: { user }, error: authError } =
      await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      r.warn('auth failed', { error: authError?.message });
      r.done(401);
      return json({ success: false, error: 'Unauthorized' }, 401);
    }

    const { data: adminRow } = await supabase
      .from('platform_admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!adminRow) {
      r.warn('caller is not a platform admin', { user_id: user.id });
      r.done(403);
      return json({ success: false, error: 'Forbidden' }, 403);
    }

    if (new URL(req.url).searchParams.get('probe') === '1') {
      r.done(200, { probe: true });
      return json({ success: true, admin: true });
    }

    const { data: affiliates, error: affErr } = await supabase
      .from('affiliates')
      .select('id, ref_code, company_name, contact_name, contact_email, status, commission_rate, auth_user_id, created_at')
      .order('created_at', { ascending: true });
    if (affErr) throw affErr;

    const { data: referred, error: refErr } = await supabase
      .from('teamleader_users')
      .select('ref_code, ref_attributed_at, ref_source, created_at, user_info, stripe_customer_id, promo_end_date')
      .not('ref_code', 'is', null)
      .is('deleted_at', null);
    if (refErr) throw refErr;

    r.info('classifying referred accounts', { affiliates: affiliates?.length ?? 0, referred: referred?.length ?? 0 });
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

    const users = await Promise.all(
      (referred ?? []).map(async (row) => {
        const cls = await classifyReferredAccount(stripe, row);
        const info = (row.user_info ?? {}) as { name?: string; email?: string };
        return {
          name: info.name ?? null,
          email: info.email ?? null,
          ref_code: row.ref_code as string,
          ref_source: row.ref_source,
          attributed_at: row.ref_attributed_at,
          signed_up_at: row.created_at,
          status: cls.status,
          net_monthly_cents: cls.netMonthlyCents,
          currency: cls.currency,
        };
      }),
    );

    const knownCodes = new Set((affiliates ?? []).map((a) => a.ref_code));
    const overview = (affiliates ?? []).map((a) => {
      const own = users.filter((u) => u.ref_code === a.ref_code);
      const paying = own.filter((u) => u.status === 'paying');
      return {
        id: a.id,
        ref_code: a.ref_code,
        company_name: a.company_name,
        contact_name: a.contact_name,
        contact_email: a.contact_email,
        status: a.status,
        commission_rate: Number(a.commission_rate),
        portal_claimed: Boolean(a.auth_user_id),
        signups: own.length,
        trials: own.filter((u) => u.status === 'trial').length,
        paying: paying.length,
        monthly_commission_cents: Math.round(
          paying.reduce((sum, u) => sum + u.net_monthly_cents * Number(a.commission_rate), 0),
        ),
      };
    });

    r.done(200, { affiliates: overview.length, referred_users: users.length });
    return json({
      success: true,
      affiliates: overview,
      users,
      unmatched_codes: [...new Set(users.map((u) => u.ref_code).filter((c) => !knownCodes.has(c)))],
    });
  } catch (err) {
    r.error('unhandled error', toErrorDetail(err));
    r.done(500);
    return json({ success: false, error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
