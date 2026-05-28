// ── submit-service-lead ────────────────────────────────────────────────────
// Public endpoint (no user auth required). Called from ServiceLeadForm.
// 1. Validates inputs
// 2. Inserts into service_leads
// 3. Creates a Teamleader contact in Voicelink's service pipeline (best-effort)
// 4. Sends a confirmation email via Resend (best-effort)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';

const log = createLogger('submit-service-lead');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const r = log.withRequest(req);

  const json = (data: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const body = await req.json().catch(() => ({}));
    const { naam, bedrijf, telefoonnummer, email } = body as Record<string, string>;

    if (!naam?.trim()) return json({ success: false, error: 'naam is verplicht' }, 400);
    if (!bedrijf?.trim()) return json({ success: false, error: 'bedrijf is verplicht' }, 400);
    if (!telefoonnummer?.trim()) return json({ success: false, error: 'telefoonnummer is verplicht' }, 400);
    if (!email?.trim() || !EMAIL_RE.test(email.trim()))
      return json({ success: false, error: 'Geldig e-mailadres vereist' }, 400);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    r.info('inserting service_lead', { email, bedrijf });
    const { error: insertError } = await supabase
      .from('service_leads')
      .insert({
        naam: naam.trim(),
        bedrijf: bedrijf.trim(),
        telefoonnummer: telefoonnummer.trim(),
        email: email.trim().toLowerCase(),
        source: 'worksmarter_service',
      });

    if (insertError) {
      r.error('insert failed', toErrorDetail(insertError));
      return json({ success: false, error: 'Opslaan mislukt, probeer opnieuw.' }, 500);
    }

    r.info('lead inserted, triggering side-effects');

    // ── Best-effort: create contact in Voicelink's service pipeline ──
    const tlToken = Deno.env.get('TL_INTERNAL_ACCESS_TOKEN');
    const tlServicePipelineId = Deno.env.get('TL_SERVICE_PIPELINE_ID');
    if (tlToken && tlServicePipelineId) {
      fetch('https://api.focus.teamleader.eu/contacts.add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tlToken}`,
        },
        body: JSON.stringify({
          first_name: naam.trim().split(' ')[0],
          last_name: naam.trim().split(' ').slice(1).join(' ') || '',
          emails: [{ type: 'primary', email: email.trim().toLowerCase() }],
          telephones: [{ type: 'phone', number: telefoonnummer.trim() }],
          tags: ['worksmarter_2025', 'service_lead'],
        }),
      }).catch((e) => r.warn('TL contact creation failed', { error: String(e) }));
    }

    // ── Best-effort: send confirmation email via Resend ──
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@voicelink.me';
    if (resendKey) {
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: `VoiceLink <${fromEmail}>`,
          to: [email.trim().toLowerCase()],
          subject: 'We hebben je aanvraag ontvangen',
          html: `
            <p>Hallo ${naam.trim().split(' ')[0]},</p>
            <p>Bedankt voor je interesse in onze service! We hebben je aanvraag ontvangen en nemen zo snel mogelijk contact met je op.</p>
            <p>Vragen? Stuur ons een bericht via <a href="mailto:info@voicelink.me">info@voicelink.me</a>.</p>
            <p>— Het VoiceLink team</p>
          `,
        }),
      }).catch((e) => r.warn('email send failed', { error: String(e) }));
    }

    r.done(200, { inserted: true });
    return json({ success: true });
  } catch (err) {
    r.error('unhandled error', toErrorDetail(err));
    return json({ success: false, error: 'Er is iets misgegaan.' }, 500);
  }
});
