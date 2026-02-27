// ── whatsapp-otp handler ─────────────────────────────────────────────────────
// SRP: only HTTP routing and orchestration — all logic lives in shared modules.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { generateOtp, buildExpiresAt, validateOtp } from '../_shared/whatsapp/otp.ts';
import { createWhatsAppProvider } from '../_shared/whatsapp/providers/factory.ts';
import { SupabaseWhatsAppRepository } from '../_shared/whatsapp/repository.ts';
import type { CrmProvider } from '../_shared/whatsapp/types.ts';

const VALID_PROVIDERS: CrmProvider[] = ['teamleader', 'pipedrive', 'odoo'];

function ok(data: Record<string, unknown>) {
  return new Response(JSON.stringify({ success: true, ...data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function fail(message: string, status = 400) {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { action, crm_provider, crm_user_id, phone_number, otp_code } =
      await req.json();

    if (!action || !crm_provider || !crm_user_id) {
      return fail('Missing required fields: action, crm_provider, crm_user_id');
    }
    if (!VALID_PROVIDERS.includes(crm_provider)) {
      return fail(`Invalid crm_provider: ${crm_provider}`);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const repo     = new SupabaseWhatsAppRepository(supabase, `${crm_provider}_users`);
    const provider = createWhatsAppProvider();

    // ── send ────────────────────────────────────────────────────────────────
    if (action === 'send') {
      if (!phone_number) return fail('Missing phone_number');

      const code      = generateOtp();
      const expiresAt = buildExpiresAt(10);

      await repo.storeOtp(crm_user_id, phone_number.trim(), code, expiresAt);
      await provider.sendOtp(phone_number, code);

      return ok({ expires_at: expiresAt });
    }

    // ── verify ──────────────────────────────────────────────────────────────
    if (action === 'verify') {
      if (!otp_code) return fail('Missing otp_code');

      const record = await repo.getOtpRecord(crm_user_id);
      if (!record) return fail('No pending verification — request a new code.');

      const { valid, error } = validateOtp(record, otp_code);
      if (!valid) return fail(error!);

      await repo.markVerified(crm_user_id, record.phone);

      return ok({});
    }

    return fail(`Unknown action: ${action}`);

  } catch (err) {
    console.error('whatsapp-otp:', err);
    return fail(err instanceof Error ? err.message : 'Unexpected error', 500);
  }
});
