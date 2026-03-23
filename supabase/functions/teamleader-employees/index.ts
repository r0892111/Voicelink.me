// ── teamleader-employees ──────────────────────────────────────────────────────
// Fetches the employee list from the Teamleader API so the admin can pick
// which colleagues to invite. Cross-references with teamleader_users to mark
// employees that have already been invited or are active members.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { getOAuthAccessToken } from '../_shared/teamleader/getOAuthAccessToken.ts';

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
    const { data: { user }, error: authError } =
      await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return json({ success: false, error: 'Unauthorized' }, 401);
    }

    // ── Must be admin ───────────────────────────────────────────────────────
    const { data: adminRow } = await supabase
      .from('teamleader_users')
      .select('id, is_admin, teamleader_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .eq('is_admin', true)
      .maybeSingle();

    if (!adminRow) {
      return json({ success: false, error: 'Only admins can list employees.' }, 403);
    }

    // ── Get a valid Teamleader access token ─────────────────────────────────
    const accessToken = await getOAuthAccessToken(supabase, user.id);

    // ── Fetch users from Teamleader ─────────────────────────────────────────
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
      console.error('Teamleader users.list failed:', tlRes.status, text);
      return json({ success: false, error: 'Failed to fetch Teamleader employees.' }, 502);
    }

    const tlBody = await tlRes.json() as { data: TLUser[] };
    const tlUsers: TLUser[] = tlBody.data ?? [];

    // ── Cross-reference with existing team members ──────────────────────────
    // Fetch all teamleader_ids that belong to this admin's team (including the admin)
    const { data: existingMembers } = await supabase
      .from('teamleader_users')
      .select('teamleader_id')
      .or(`user_id.eq.${user.id},admin_user_id.eq.${user.id}`)
      .is('deleted_at', null);

    const existingTlIds = new Set(
      (existingMembers ?? []).map((m: { teamleader_id: string }) => m.teamleader_id),
    );

    // ── Map to response shape ───────────────────────────────────────────────
    const employees = tlUsers.map((u) => {
      const phone = u.telephones?.find((t) => t.type === 'mobile')?.number
        ?? u.telephones?.[0]?.number
        ?? undefined;

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

    return json({ success: true, employees });
  } catch (err) {
    console.error('teamleader-employees:', err);
    return json(
      { success: false, error: err instanceof Error ? err.message : 'Unexpected error' },
      500,
    );
  }
});
