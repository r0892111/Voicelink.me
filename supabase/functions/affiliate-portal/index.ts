// ── affiliate-portal ──────────────────────────────────────────────────────────
// Partner-facing stats: signups, trials running, paying customers, and the
// projected commission this month — computed from live Stripe data on the
// partner's referred accounts only.
//
// Access: the caller logs in via Supabase magic link. On first login the
// affiliates row is claimed by matching the verified email; afterwards the
// row is found by auth_user_id. Anyone without a matching row gets 403 —
// completing a magic-link login grants nothing by itself.
//
// Per the published terms (§3/§7) the partner must not see customer data:
// referral rows are anonymized (date + status + commission only).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';
import { classifyReferredAccount } from '../_shared/affiliates.ts';

const log = createLogger('affiliate-portal');

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

    // Pre-auth email check for the login page: only emails on an active
    // affiliates row may log in at all (no magic link is sent otherwise).
    // Callable with the anon key — reveals partner-email membership, which
    // is acceptable for this small, low-sensitivity list.
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      if (body?.action === 'precheck') {
        const email = typeof body.email === 'string' ? body.email.trim() : '';
        if (!email) {
          r.done(400, { precheck: true });
          return json({ success: false, error: 'missing_email' }, 400);
        }
        const { data: match } = await supabase
          .from('affiliates')
          .select('id')
          .ilike('contact_email', email.replace(/[%_]/g, '\\$&'))
          .eq('status', 'active')
          .maybeSingle();
        r.done(200, { precheck: true, exists: !!match });
        return json({ success: true, exists: !!match });
      }
    }

    const { data: { user }, error: authError } =
      await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      r.warn('auth failed', { error: authError?.message });
      r.done(401);
      return json({ success: false, error: 'Unauthorized' }, 401);
    }

    // Find the partner row — by prior claim first, then claim by email.
    let { data: affiliate } = await supabase
      .from('affiliates')
      .select('id, ref_code, company_name, status, commission_rate')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (!affiliate && user.email) {
      const { data: claimed, error: claimErr } = await supabase
        .from('affiliates')
        .update({ auth_user_id: user.id, updated_at: new Date().toISOString() })
        .is('auth_user_id', null)
        .ilike('contact_email', user.email.replace(/[%_]/g, '\\$&'))
        .select('id, ref_code, company_name, status, commission_rate')
        .maybeSingle();
      if (claimErr) {
        r.warn('claim by email failed', { error: claimErr.message });
      } else if (claimed) {
        r.info('affiliate row claimed', { affiliate_id: claimed.id, user_id: user.id });
        affiliate = claimed;
      }
    }

    if (!affiliate || affiliate.status !== 'active') {
      r.warn('no active affiliate for caller', { user_id: user.id, found: !!affiliate, status: affiliate?.status });
      r.done(403);
      return json({ success: false, error: 'not_a_partner' }, 403);
    }

    const { data: referred, error: refErr } = await supabase
      .from('teamleader_users')
      .select('created_at, stripe_customer_id, promo_end_date')
      .eq('ref_code', affiliate.ref_code)
      .is('deleted_at', null);
    if (refErr) throw refErr;

    r.info('classifying referred accounts', { affiliate_id: affiliate.id, referred: referred?.length ?? 0 });
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
    const rate = Number(affiliate.commission_rate);

    const referrals = await Promise.all(
      (referred ?? []).map(async (row) => {
        const cls = await classifyReferredAccount(stripe, row);
        return {
          signed_up_at: row.created_at,
          status: cls.status,
          monthly_commission_cents:
            cls.status === 'paying' ? Math.round(cls.netMonthlyCents * rate) : 0,
          currency: cls.currency,
        };
      }),
    );

    const paying = referrals.filter((x) => x.status === 'paying');
    const summary = {
      signups: referrals.length,
      trials: referrals.filter((x) => x.status === 'trial').length,
      paying: paying.length,
      projected_commission_cents: paying.reduce((s, x) => s + x.monthly_commission_cents, 0),
      currency: paying[0]?.currency ?? 'eur',
      commission_rate: rate,
    };

    r.done(200, { affiliate_id: affiliate.id, ...summary });
    return json({
      success: true,
      partner: { company_name: affiliate.company_name, ref_code: affiliate.ref_code },
      summary,
      referrals: referrals.sort((a, b) => (a.signed_up_at < b.signed_up_at ? 1 : -1)),
    });
  } catch (err) {
    r.error('unhandled error', toErrorDetail(err));
    r.done(500);
    return json({ success: false, error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
