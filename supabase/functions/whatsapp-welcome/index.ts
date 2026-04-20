// ── whatsapp-welcome handler ─────────────────────────────────────────────────
// SRP: only HTTP routing — sending is delegated to the provider abstraction.
// This function is best-effort: failures are logged but never propagated.

import { corsHeaders } from '../_shared/cors.ts';
import { createWhatsAppProvider } from '../_shared/whatsapp/providers/factory.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';

const log = createLogger('whatsapp-welcome');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const r = log.withRequest(req);

  const respond = (data: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const { phone_number } = await req.json();

    if (!phone_number) {
      r.warn('missing phone_number');
      r.done(400);
      return respond({ success: false, error: 'Missing phone_number' }, 400);
    }

    r.info('sending welcome message', { phone: phone_number });
    const provider = createWhatsAppProvider();
    await provider.sendWelcome(phone_number);

    r.info('welcome message sent successfully', { phone: phone_number });
    r.done(200);
    return respond({ success: true });

  } catch (err) {
    // Non-fatal — log and return success so the signup flow is never blocked.
    r.warn('welcome message failed (non-fatal)', toErrorDetail(err));
    r.done(200, { skipped: true });
    return respond({ success: true, skipped: true });
  }
});
