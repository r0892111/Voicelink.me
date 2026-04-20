// ── whatsapp-welcome handler ─────────────────────────────────────────────────
// SRP: only HTTP routing — sending is delegated to the provider abstraction.
// Failures are non-fatal (signup flow never blocks), but the provider error
// detail is surfaced in the response body so operators can debug template /
// approval issues without needing access to the runtime log stream.

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
    const body = await req.json();
    const { phone_number } = body;

    if (!phone_number) {
      r.warn('missing phone_number', { received_keys: Object.keys(body ?? {}) });
      r.done(400);
      return respond({ success: false, error: 'Missing phone_number' }, 400);
    }

    r.info('sending welcome message', {
      phone: phone_number,
      provider: Deno.env.get('WHATSAPP_PROVIDER') ?? 'meta',
      template: Deno.env.get('META_WHATSAPP_WELCOME_TEMPLATE_NAME') ?? 'voicelink_welcome',
      lang: Deno.env.get('META_WHATSAPP_WELCOME_TEMPLATE_LANG') ?? 'en_US',
    });

    const provider = createWhatsAppProvider();

    try {
      await provider.sendWelcome(phone_number);
      const meta = (provider as unknown as { lastResult?: Record<string, unknown> }).lastResult;
      const providerClass = (provider as object).constructor?.name ?? 'unknown';
      r.info('welcome message sent successfully', { phone: phone_number, meta, providerClass });
      r.done(200, { meta, providerClass });
      return respond({
        success: true,
        meta: meta ?? null,
        debug: {
          providerClass,
          provider: Deno.env.get('WHATSAPP_PROVIDER') ?? 'meta',
          template: Deno.env.get('META_WHATSAPP_WELCOME_TEMPLATE_NAME') ?? 'voicelink_welcome',
          lang: Deno.env.get('META_WHATSAPP_WELCOME_TEMPLATE_LANG') ?? 'en_US',
        },
      });
    } catch (sendErr) {
      // Capture the provider error with maximum fidelity and surface it in
      // the response body. We still return 200 + success:true so the signup
      // flow never blocks, but the `debug` field exposes what Meta/Twilio
      // actually said so we can diagnose template/approval issues.
      const detail = toErrorDetail(sendErr);
      r.error('welcome provider send failed', detail);
      r.done(200, { skipped: true, ...detail });
      return respond({
        success: true,
        skipped: true,
        debug: {
          phase: 'provider_send',
          provider: Deno.env.get('WHATSAPP_PROVIDER') ?? 'meta',
          template: Deno.env.get('META_WHATSAPP_WELCOME_TEMPLATE_NAME') ?? 'voicelink_welcome',
          lang: Deno.env.get('META_WHATSAPP_WELCOME_TEMPLATE_LANG') ?? 'en_US',
          ...detail,
        },
      });
    }

  } catch (err) {
    // Outer catch — covers JSON parse, missing env, provider-factory throw.
    const detail = toErrorDetail(err);
    r.error('welcome handler crashed', detail);
    r.done(200, { skipped: true, ...detail });
    return respond({
      success: true,
      skipped: true,
      debug: { phase: 'handler', ...detail },
    });
  }
});
