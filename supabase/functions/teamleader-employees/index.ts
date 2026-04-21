// ── teamleader-employees ──────────────────────────────────────────────────────
// Fetches the employee list from the Teamleader API so the admin can pick
// which colleagues to invite. Cross-references with teamleader_users to mark
// employees that have already been invited or are active members.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { getOAuthAccessToken } from '../_shared/teamleader/getOAuthAccessToken.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';
import { normalizePhone } from '../_shared/phone.ts';

const log = createLogger('teamleader-employees');

const TEAMLEADER_API_BASE = 'https://api.focus.teamleader.eu';

interface TLUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  telephones?: { number: string; type: string }[];
  avatar_url?: string;
}

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

    // ── Authenticate ────────────────────────────────────────────────────────
    r.info('authenticating user');
    const { data: { user }, error: authError } =
      await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      r.warn('auth failed', { error: authError?.message });
      r.done(401);
      return json({ success: false, error: 'Unauthorized' }, 401);
    }
    r.info('authenticated', { user_id: user.id, email: user.email });

    // ── Must be admin ───────────────────────────────────────────────────────
    r.info('checking admin status');
    const { data: adminRow, error: adminErr } = await supabase
      .from('teamleader_users')
      .select('id, is_admin, teamleader_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .eq('is_admin', true)
      .maybeSingle();

    if (adminErr) {
      r.error('admin check query failed', { error: adminErr.message });
    }
    r.info('admin check result', { found: !!adminRow, is_admin: !!adminRow });

    if (!adminRow) {
      r.warn('non-admin user attempted to list employees', { user_id: user.id });
      r.done(403);
      return json({ success: false, error: 'Only admins can list employees.' }, 403);
    }

    // ── Get a valid Teamleader access token ─────────────────────────────────
    r.info('fetching OAuth access token');
    const accessToken = await getOAuthAccessToken(supabase, user.id);
    r.info('OAuth token retrieved', { token_length: accessToken?.length });

    // ── Fetch users from Teamleader ─────────────────────────────────────────
    r.info('calling Teamleader users.list API');
    const tlRes = await fetch(`${TEAMLEADER_API_BASE}/users.list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        page: { size: 100, number: 1 },
      }),
    });

    if (!tlRes.ok) {
      const text = await tlRes.text();
      r.error('Teamleader users.list failed', { status: tlRes.status, response: text });
      r.done(502);
      return json({ success: false, error: 'Failed to fetch Teamleader employees.' }, 502);
    }

    const tlBody = await tlRes.json() as { data: TLUser[] };
    const tlUsers: TLUser[] = tlBody.data ?? [];
    r.info('Teamleader API returned users', { count: tlUsers.length });

    // ── Cross-reference with existing team members ──────────────────────────
    r.info('cross-referencing with existing team members');
    const { data: existingMembers } = await supabase
      .from('teamleader_users')
      .select('teamleader_id')
      .or(`user_id.eq.${user.id},admin_user_id.eq.${user.id}`)
      .is('deleted_at', null);

    const existingTlIds = new Set(
      (existingMembers ?? []).map((m: { teamleader_id: string }) => m.teamleader_id),
    );
    r.info('existing team members found', { existing_count: existingTlIds.size });

    // ── Map to response shape ───────────────────────────────────────────────
    // Teamleader returns phones in whatever format users typed them — normalise
    // to E.164 before sending to the client so downstream WhatsApp OTP calls
    // don't fail on "0473..." local numbers.
    const employees = tlUsers.map((u) => {
      const rawPhone = u.telephones?.find((t) => t.type === 'mobile')?.number
        ?? u.telephones?.[0]?.number
        ?? undefined;
      const phone = normalizePhone(rawPhone) ?? undefined;

      return {
        id: u.id,
        firstName: u.first_name,
        lastName: u.last_name,
        email: u.email,
        phone,
        avatarUrl: u.avatar_url ?? undefined,
        alreadyInvited: existingTlIds.has(u.id),
      };
    });

    const alreadyInvitedCount = employees.filter((e) => e.alreadyInvited).length;
    r.info('employees response built', {
      total: employees.length,
      already_invited: alreadyInvitedCount,
      available: employees.length - alreadyInvitedCount,
    });
    r.done(200);
    return json({ success: true, employees });
  } catch (err) {
    r.error('unhandled error', toErrorDetail(err));
    r.done(500);
    return json(
      { success: false, error: err instanceof Error ? err.message : 'Unexpected error' },
      500,
    );
  }
});
