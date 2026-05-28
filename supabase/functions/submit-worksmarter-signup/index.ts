// ── submit-worksmarter-signup ──────────────────────────────────────────────
// Public endpoint (no user auth required). Called from the WorkSmarterOnboard
// form before the visitor connects their CRM.
// 1. Validates inputs
// 2. Inserts into worksmarter_leads
// 3. Creates a Teamleader contact in Voicelink's own user pipeline (best-effort)
// 4. Sends a confirmation email via Resend (best-effort)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';

const log = createLogger('submit-worksmarter-signup');

const E164_RE = /^\+[1-9]\d{6,14}$/;
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
    const { naam, telefoonnummer, email, bedrijf } = body as Record<string, string>;

    if (!naam?.trim()) return json({ success: false, error: 'naam is verplicht' }, 400);
    if (!telefoonnummer?.trim() || !E164_RE.test(telefoonnummer.trim()))
      return json({ success: false, error: 'Geldig telefoonnummer vereist (bijv. +32471234567)' }, 400);
    if (!email?.trim() || !EMAIL_RE.test(email.trim()))
      return json({ success: false, error: 'Geldig e-mailadres vereist' }, 400);
    if (!bedrijf?.trim()) return json({ success: false, error: 'bedrijf is verplicht' }, 400);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    r.info('inserting worksmarter_lead', { email, bedrijf });
    const { error: insertError } = await supabase
      .from('worksmarter_leads')
      .insert({
        naam: naam.trim(),
        telefoonnummer: telefoonnummer.trim(),
        email: email.trim().toLowerCase(),
        bedrijf: bedrijf.trim(),
        source: 'worksmarter_voicelink',
      });

    if (insertError) {
      r.error('insert failed', toErrorDetail(insertError));
      return json({ success: false, error: 'Opslaan mislukt, probeer opnieuw.' }, 500);
    }

    r.info('lead inserted, triggering side-effects');

    // ── Best-effort: create contact in Voicelink's own Teamleader pipeline ──
    const tlToken = Deno.env.get('TL_INTERNAL_ACCESS_TOKEN');
    const tlPipelineId = Deno.env.get('TL_USER_PIPELINE_ID');
    if (tlToken && tlPipelineId) {
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
          tags: ['worksmarter_2025', 'voicelink_lead'],
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
          subject: 'Welkom bij VoiceLink — jouw 2 maanden starten nu',
          html: `
            <p>Hallo ${naam.trim().split(' ')[0]},</p>
            <p>Bedankt voor je registratie op WorkSmarter! Zodra je jouw CRM koppelt, wordt jouw 2 maanden Professional plan automatisch geactiveerd — zonder betaalscherm.</p>
            <p>Klik op de link hieronder om te starten:</p>
            <p><a href="https://voicelink.me/onboard/worksmarter" style="background:#1A2D63;color:#fff;padding:12px 24px;border-radius:24px;text-decoration:none;font-weight:600;display:inline-block">CRM koppelen &rarr;</a></p>
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
