// ── submit-service-lead ────────────────────────────────────────────────────
// Public endpoint (no user auth required). Called from ServiceLeadForm.
// 1. Validates inputs
// 2. Inserts into service_leads
// 3. Creates a Teamleader contact in Voicelink's service pipeline (best-effort)
// 4. Sends a confirmation email via Resend (best-effort)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Fetches the Voicelink admin's TL access token, refreshing if expired.
async function getTLAccessToken(
  supabase: ReturnType<typeof createClient>,
  adminUserId: string,
  clientId: string,
  clientSecret: string,
  authBase: string,
): Promise<string | null> {
  const { data: row, error } = await supabase
    .from('oauth_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', adminUserId)
    .eq('provider', 'teamleader')
    .maybeSingle();

  if (error || !row?.refresh_token) return null;

  if (row.expires_at && new Date(row.expires_at) > new Date(Date.now() + 60_000)) {
    return row.access_token as string;
  }

  const tokenUrl = `${authBase.replace(/\/$/, '')}/oauth2/access_token`;
  const resp = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: row.refresh_token as string,
    }),
  });

  if (!resp.ok) return null;

  const tokens = await resp.json() as { access_token: string; refresh_token?: string; expires_in?: number };
  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null;

  await supabase
    .from('oauth_tokens')
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? row.refresh_token,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', adminUserId)
    .eq('provider', 'teamleader');

  return tokens.access_token;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

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

    console.log(JSON.stringify({ level: 'info', function: 'submit-service-lead', message: 'inserting service_lead', email, bedrijf }));
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
      console.error(JSON.stringify({ level: 'error', function: 'submit-service-lead', message: 'insert failed', error: insertError.message }));
      return json({ success: false, error: 'Opslaan mislukt, probeer opnieuw.' }, 500);
    }

    // ── Best-effort: create contact in Voicelink's service pipeline ──
    const adminUserId    = Deno.env.get('TL_ADMIN_USER_ID');
    const tlClientId     = Deno.env.get('TEAMLEADER_CLIENT_ID');
    const tlClientSecret = Deno.env.get('TEAMLEADER_CLIENT_SECRET');
    const authBase       = Deno.env.get('TEAMLEADER_AUTH_BASE_URL') ?? 'https://app.teamleader.eu';
    const tlPipelineId   = Deno.env.get('TL_SERVICE_PIPELINE_ID');

    if (adminUserId && tlClientId && tlClientSecret && tlPipelineId) {
      getTLAccessToken(supabase, adminUserId, tlClientId, tlClientSecret, authBase)
        .then((tlToken) => {
          if (!tlToken) {
            console.warn(JSON.stringify({ level: 'warn', function: 'submit-service-lead', message: 'TL token unavailable, skipping contact creation' }));
            return;
          }
          return fetch('https://api.focus.teamleader.eu/contacts.add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tlToken}` },
            body: JSON.stringify({
              first_name: naam.trim().split(' ')[0],
              last_name: naam.trim().split(' ').slice(1).join(' ') || '',
              emails: [{ type: 'primary', email: email.trim().toLowerCase() }],
              telephones: [{ type: 'phone', number: telefoonnummer.trim() }],
              tags: ['worksmarter_2025', 'service_lead'],
            }),
          });
        })
        .catch((e) => console.warn(JSON.stringify({ level: 'warn', function: 'submit-service-lead', message: 'TL contact creation failed', error: String(e) })));
    }

    // ── Best-effort: send confirmation email via Resend ──
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@voicelink.me';
    if (resendKey) {
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
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
      }).catch((e) => console.warn(JSON.stringify({ level: 'warn', function: 'submit-service-lead', message: 'email send failed', error: String(e) })));
    }

    console.log(JSON.stringify({ level: 'info', function: 'submit-service-lead', message: 'done', status: 200, inserted: true }));
    return json({ success: true });
  } catch (err) {
    console.error(JSON.stringify({ level: 'error', function: 'submit-service-lead', message: 'unhandled error', error: err instanceof Error ? err.message : String(err) }));
    return json({ success: false, error: 'Er is iets misgegaan.' }, 500);
  }
});
