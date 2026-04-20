// ── whatsapp-otp handler ─────────────────────────────────────────────────────
// SRP: only HTTP routing and orchestration — all logic lives in shared modules.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { generateOtp, buildExpiresAt, validateOtp } from '../_shared/whatsapp/otp.ts';
import { createWhatsAppProvider } from '../_shared/whatsapp/providers/factory.ts';
import { SupabaseWhatsAppRepository } from '../_shared/whatsapp/repository.ts';
import type { CrmProvider } from '../_shared/whatsapp/types.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';

const log = createLogger('whatsapp-otp');

const VALID_PROVIDERS: CrmProvider[] = ['teamleader', 'pipedrive', 'odoo', 'test'];

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

  const r = log.withRequest(req);

  try {
    const { action, crm_provider, crm_user_id, phone_number, otp_code } =
      await req.json();

    r.info('request parsed', { action, crm_provider, crm_user_id });

    if (!action || !crm_provider || !crm_user_id) {
      r.warn('missing required fields', { action, crm_provider, crm_user_id });
      r.done(400);
      return fail('Missing required fields: action, crm_provider, crm_user_id');
    }
    if (!VALID_PROVIDERS.includes(crm_provider)) {
      r.warn('invalid crm_provider', { crm_provider });
      r.done(400);
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
      if (!phone_number) {
        r.warn('missing phone_number for send action');
        r.done(400);
        return fail('Missing phone_number');
      }

      // Gate: user must have started their Stripe trial before connecting
      // WhatsApp. `stripe_customer_id` is created by the checkout flow, so a
      // null value means the user has never started a trial or subscribed.
      // For invited members (is_admin=false with admin_user_id), the
      // subscription lives on the admin's row — check that instead so
      // members inherit their admin's trial/paid status. The `test` provider
      // is used during the early-access test flow and is exempt.
      if (crm_provider !== 'test') {
        r.info('checking subscription gate', { crm_user_id });
        const { data: gateRow, error: gateErr } = await supabase
          .from(`${crm_provider}_users`)
          .select('stripe_customer_id, is_admin, admin_user_id')
          .eq('user_id', crm_user_id)
          .maybeSingle();

        if (gateErr) {
          r.error('gate lookup failed', { message: gateErr.message });
          r.done(500);
          return fail('Subscription check failed. Please try again.', 500);
        }

        let gateCustomerId: string | null = gateRow?.stripe_customer_id ?? null;
        if (gateRow && !gateRow.is_admin && gateRow.admin_user_id) {
          r.info('caller is member, resolving admin subscription gate', { admin_user_id: gateRow.admin_user_id });
          const { data: adminRow } = await supabase
            .from(`${crm_provider}_users`)
            .select('stripe_customer_id')
            .eq('user_id', gateRow.admin_user_id)
            .maybeSingle();
          gateCustomerId = adminRow?.stripe_customer_id ?? null;
        }

        if (!gateCustomerId) {
          r.warn('no stripe customer — trial not started', {
            crm_user_id,
            is_member: gateRow && !gateRow.is_admin,
          });
          r.done(402);
          return fail(
            gateRow && !gateRow.is_admin
              ? 'Your workspace admin must start the free trial before you can connect WhatsApp.'
              : 'Start your free trial before connecting WhatsApp.',
            402,
          );
        }
      }

      const code      = generateOtp();
      const expiresAt = buildExpiresAt(10);

      r.info('storing OTP', { crm_user_id, phone: phone_number.trim() });
      await repo.storeOtp(crm_user_id, phone_number.trim(), code, expiresAt);

      r.info('sending OTP via WhatsApp', { phone: phone_number });
      await provider.sendOtp(phone_number, code);

      r.info('OTP sent successfully', { crm_user_id, expires_at: expiresAt });
      r.done(200);
      return ok({ expires_at: expiresAt });
    }

    // ── verify ──────────────────────────────────────────────────────────────
    if (action === 'verify') {
      if (!otp_code) {
        r.warn('missing otp_code for verify action');
        r.done(400);
        return fail('Missing otp_code');
      }

      r.info('fetching OTP record', { crm_user_id });
      const record = await repo.getOtpRecord(crm_user_id);
      if (!record) {
        r.warn('no pending OTP record found', { crm_user_id });
        r.done(400);
        return fail('No pending verification — request a new code.');
      }

      const { valid, error } = validateOtp(record, otp_code);
      if (!valid) {
        r.warn('OTP validation failed', { crm_user_id, reason: error });
        r.done(400);
        return fail(error!);
      }

      r.info('OTP verified, marking as verified', { crm_user_id, phone: record.phone });
      await repo.markVerified(crm_user_id, record.phone);

      r.info('WhatsApp verification complete', { crm_user_id });
      r.done(200);
      return ok({});
    }

    r.warn('unknown action', { action });
    r.done(400);
    return fail(`Unknown action: ${action}`);

  } catch (err) {
    r.error('unhandled error', toErrorDetail(err));
    r.done(500);
    return fail(err instanceof Error ? err.message : 'Unexpected error', 500);
  }
});
