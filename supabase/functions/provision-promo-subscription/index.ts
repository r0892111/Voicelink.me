// ── provision-promo-subscription ──────────────────────────────────────────
// Requires auth (called from AuthCallback / Dashboard after sign-up).
// Sets promo_end_date on the caller's billing row — whichever platform table
// it lives on (_shared/billing/users.ts: Teamleader, Catermonkey, Odoo) — so
// get-subscription returns status='active', plan='professional_monthly'
// without touching Stripe. It used to write teamleader_users only, so a
// promo for an Odoo or Catermonkey account silently granted nothing.
// Only extends promo if the computed end date is later than the current one —
// prevents a shorter promo from overwriting a longer one.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';
import { findBillingRow } from '../_shared/billing/users.ts';

const log = createLogger('provision-promo-subscription');

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

    const body = await req.json().catch(() => ({}));
    const rawMonths = Number((body as Record<string, unknown>).months ?? 2);
    const months = Math.max(1, Math.min(6, Math.floor(rawMonths)));

    // Compute end date in JS — PostgREST cannot evaluate SQL expressions like
    // "now() + interval '1 months'" as a column value; it treats them as literal
    // strings which fail timestamptz casting.
    const MS_PER_MONTH = 30 * 24 * 60 * 60 * 1000;
    const newEndDate = new Date(Date.now() + months * MS_PER_MONTH);

    r.info('provisioning promo', { user_id: user.id, months, new_end: newEndDate.toISOString() });

    // The caller's billing row, whichever platform table it lives on. None yet
    // (an Odoo account whose placeholder row odoo-account has not written) →
    // 409 so the browser keeps its promo intent and retries, instead of a 200
    // for an update that touched nothing.
    const billing = await findBillingRow(supabase, user.id);
    if (!billing) {
      r.warn('no billing row for user yet', { user_id: user.id });
      r.done(409);
      return json({ success: false, code: 'no_billing_row', error: 'Account nog niet klaar.' }, 409);
    }

    // Only extend if the new end is later (prevents a 1-month affiliate promo
    // from overwriting a 2-month event promo).
    const currentEnd = billing.row.promo_end_date ? new Date(billing.row.promo_end_date) : null;

    if (currentEnd && currentEnd > newEndDate) {
      r.info('existing promo is longer, skipping', { current_end: currentEnd.toISOString() });
      r.done(200, { months, skipped: true });
      return json({ success: true, months, skipped: true });
    }

    const { error: updateError } = await supabase
      .from(billing.table)
      .update({ promo_end_date: newEndDate.toISOString() })
      .eq('user_id', user.id);

    if (updateError) {
      r.error('update failed', toErrorDetail(updateError));
      return json({ success: false, error: 'Kon promo niet activeren.' }, 500);
    }

    r.done(200, { months, table: billing.table });
    return json({ success: true, months });
  } catch (err) {
    r.error('unhandled error', toErrorDetail(err));
    return json({ success: false, error: 'Er is iets misgegaan.' }, 500);
  }
});
