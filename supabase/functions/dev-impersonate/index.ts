// ── dev-impersonate ───────────────────────────────────────────────────────────
// Dev-only: mints a magic-link token for a whitelisted test user so the local
// dashboard can exercise real DB/edge-function paths against a known fixture.
//
// Triple-gated:
//   1. Env var `DEV_IMPERSONATE_KEY` must be set (unset in prod).
//   2. Request header `X-Dev-Key` must match `DEV_IMPERSONATE_KEY`.
//   3. Requested email must be in `ALLOWED_EMAILS`.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const ALLOWED_EMAILS = new Set<string>([
  'karel.vanransbeeck@outlook.be',
]);

interface ImpersonateBody {
  email?: unknown;
}

function json(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Access-Control-Allow-Headers':
        'authorization, x-client-info, apikey, content-type, x-dev-key',
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Headers':
          'authorization, x-client-info, apikey, content-type, x-dev-key',
      },
    });
  }

  const devKey = Deno.env.get('DEV_IMPERSONATE_KEY');
  if (!devKey) {
    return json({ success: false, error: 'Impersonation disabled' }, 403);
  }

  const providedKey = req.headers.get('x-dev-key');
  if (providedKey !== devKey) {
    return json({ success: false, error: 'Unauthorized' }, 401);
  }

  let body: ImpersonateBody;
  try {
    body = await req.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON' }, 400);
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email || !ALLOWED_EMAILS.has(email)) {
    return json({ success: false, error: 'Email not in impersonation whitelist' }, 403);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });

  if (error || !data.properties?.hashed_token) {
    return json(
      { success: false, error: error?.message ?? 'Failed to generate link' },
      500,
    );
  }

  return json({
    success: true,
    email,
    token_hash: data.properties.hashed_token,
  });
});
