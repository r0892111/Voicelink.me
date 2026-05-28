// ── provision-promo-subscription ──────────────────────────────────────────
// Requires auth (called from AuthCallback after CRM OAuth).
// Sets promo_end_date on teamleader_users so get-subscription returns
// status='active', plan='professional_monthly' without touching Stripe.

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
    // Clamp to reasonable range; prevents abuse via crafted requests
    const months = Math.max(1, Math.min(6, Math.floor(rawMonths)));

    r.info('provisioning promo', { user_id: user.id, months });

    const { error: updateError } = await supabase
      .from('teamleader_users')
      .update({ promo_end_date: `now() + interval '${months} months'` })
      .eq('user_id', user.id)
      .or('promo_end_date.is.null,promo_end_date.lt.now()');

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
