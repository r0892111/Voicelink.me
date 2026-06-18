// ── provision-promo-subscription ──────────────────────────────────────────
// Requires auth (called from AuthCallback after CRM OAuth).
// Sets promo_end_date on teamleader_users so get-subscription returns
// status='active', plan='professional_monthly' without touching Stripe.
// Only extends promo if the computed end date is later than the current one —
// prevents a shorter promo from overwriting a longer one.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';

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

    // Resolve which CRM table this user lives in (teamleader/pipedrive/hubspot).
    const metaProvider = user.user_metadata?.provider as string | undefined;
    let provider = ['teamleader', 'pipedrive', 'hubspot'].includes(metaProvider ?? '')
      ? metaProvider!
      : null;
    if (!provider) {
      const { data: pRow } = await supabase
        .from('crm_users')
        .select('provider')
        .eq('user_id', user.id)
        .maybeSingle();
      provider = (pRow?.provider as string) ?? 'teamleader';
    }
    const table = `${provider}_users`;

    // Check current promo_end_date — only extend if new end is later (prevents
    // a 1-month affiliate promo from overwriting a 2-month WorkSmarter promo).
    const { data: currentRow } = await supabase
      .from(table)
      .select('promo_end_date')
      .eq('user_id', user.id)
      .maybeSingle();

    const currentEnd = currentRow?.promo_end_date ? new Date(currentRow.promo_end_date) : null;

    if (currentEnd && currentEnd > newEndDate) {
      r.info('existing promo is longer, skipping', { current_end: currentEnd.toISOString() });
      r.done(200, { months, skipped: true });
      return json({ success: true, months, skipped: true });
    }

    const { error: updateError } = await supabase
      .from(table)
      .update({ promo_end_date: newEndDate.toISOString() })
      .eq('user_id', user.id);

    if (updateError) {
      r.error('update failed', toErrorDetail(updateError));
      return json({ success: false, error: 'Kon promo niet activeren.' }, 500);
    }

    r.done(200, { months });
    return json({ success: true, months });
  } catch (err) {
    r.error('unhandled error', toErrorDetail(err));
    return json({ success: false, error: 'Er is iets misgegaan.' }, 500);
  }
});
