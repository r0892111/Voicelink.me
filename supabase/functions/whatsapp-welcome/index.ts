// ── whatsapp-welcome handler ─────────────────────────────────────────────────
// SRP: only HTTP routing — sending is delegated to the provider abstraction.
// This function is best-effort: failures are logged but never propagated.

import { corsHeaders } from '../_shared/cors.ts';
import { createWhatsAppProvider } from '../_shared/whatsapp/providers/factory.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const respond = (data: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const { phone_number } = await req.json();

    if (!phone_number) {
      return respond({ success: false, error: 'Missing phone_number' }, 400);
    }

    const provider = createWhatsAppProvider();
    await provider.sendWelcome(phone_number);

    return respond({ success: true });

  } catch (err) {
    // Non-fatal — log and return success so the signup flow is never blocked.
    console.error('whatsapp-welcome (non-fatal):', err);
    return respond({ success: true, skipped: true });
  }
});
