// ── catermonkey-mcp-auth ─────────────────────────────────────────────────────
// Turns a finished Catermonkey login (done by VoiceLink's backend over MCP
// OAuth) into a portal account + session — the same job teamleader-auth does
// for Teamleader, minus token storage: the Catermonkey tokens never come
// here, they stay in VoiceLink's mcp_connections.
//
// Flow (VoiceLink repo docs/crm-onboarding/mcp/PLAN-selfserve-signup.md):
//   browser → VLAgent /oauth/mcp/start?server=catermonkey&return_to=<origin>
//          → Catermonkey login → VLAgent callback → 302 to
//            <origin>/auth/catermonkey_mcp/callback?handoff=<single-use token>
//   AuthCallback.tsx POSTs { handoff, redirect_uri } here
//   here   → POST VLAgent /oauth/mcp/claim (server-to-server, shared secret)
//            → { vendor_subject, env, email?, first_name?, last_name?, role?,
//                company_id?, language? }   (identity only, never tokens)
//          → find-or-create the auth user → catermonkey_mcp_users row
//          → magic link → { success, session_url }
//
// Identity rules (plan decisions D1/D3 — D3 REVISED 2026-09-10 in review):
//   - one portal account per Catermonkey USER per env (vendor_subject, env);
//   - the vendor's email is ASSERTED, not verified (Catermonkey reports it
//     "unverified", VERIFIED.md #30). It is therefore NEVER used as the
//     auth.users / public.users email. Doing so would let an attacker who
//     sets a victim's address on their own Catermonkey staff profile
//     pre-create an auth user with that email, which teamleader-auth's
//     find-by-email would later attach the victim's Teamleader login to.
//     The account email is always the deterministic placeholder
//     catermonkey-mcp-<vendor_subject>@placeholder.local; the asserted
//     address lives in user_info / user_metadata for display only.
//     Nothing is lost: these accounts sign in through Catermonkey (no
//     password to recover) and Stripe collects its own receipt email.
//   - a placeholder collision can only be our own earlier, half-finished
//     signup for the same vendor_subject — safe to reuse.
//
// The handoff token is single-use and 5-min; VoiceLink deletes it on redeem.
// Never log it. Error bodies carry a `code` the frontend maps to i18n text.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';

const log = createLogger('catermonkey-mcp-auth');

const PROVIDER = 'catermonkey_mcp';
const TABLE = `${PROVIDER}_users`;
const SUPPORTED_LANGUAGES = new Set(['nl', 'en', 'fr', 'de']);

interface ClaimRecord {
  server_key: string;
  env: string;
  vendor_subject: string;
  platform: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  company_id: number | null;
  language: string | null;
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const GENERIC_FAIL = 'Sign-in failed. Please try again.';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const r = log.withRequest(req);

  try {
    const { handoff, redirect_uri } = await req.json();
    r.info('auth request received', { has_handoff: !!handoff, has_redirect_uri: !!redirect_uri });

    if (typeof handoff !== 'string' || !handoff || handoff.length > 256 || !redirect_uri) {
      r.warn('missing handoff or redirect_uri');
      r.done(400);
      return json({ success: false, code: 'bad_request', error: 'Missing handoff or redirect_uri' }, 400);
    }

    const vlagentUrl = (Deno.env.get('VLAGENT_URL') ?? '').trim().replace(/\/$/, '');
    const vlagentSecret = (Deno.env.get('VLAGENT_SECRET') ?? '').trim();
    if (!vlagentUrl || !vlagentSecret) {
      r.error('VLAGENT_URL / VLAGENT_SECRET not configured');
      r.done(500);
      return json({ success: false, code: 'not_configured', error: 'Sign-in backend not configured' }, 500);
    }

    // 1. Redeem the handoff with VoiceLink — identity only, single use.
    r.info('redeeming handoff with VLAgent');
    const claimRes = await fetch(`${vlagentUrl}/oauth/mcp/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-VLAgent-Secret': vlagentSecret },
      body: JSON.stringify({ handoff }),
      signal: AbortSignal.timeout(15000),
    });

    if (claimRes.status === 404) {
      r.warn('handoff unknown, expired or already used');
      r.done(400);
      return json(
        {
          success: false,
          code: 'handoff_invalid',
          error: 'This sign-in link is invalid or has expired. Please connect Catermonkey again.',
        },
        400,
      );
    }
    if (!claimRes.ok) {
      r.error('claim failed', { status: claimRes.status });
      r.done(502);
      return json({ success: false, code: 'claim_failed', error: GENERIC_FAIL }, 502);
    }

    const record = (await claimRes.json()) as ClaimRecord;
    if (record.platform !== PROVIDER || !record.vendor_subject || !record.env) {
      r.error('claim returned an unexpected record', { platform: record.platform, has_subject: !!record.vendor_subject });
      r.done(502);
      return json({ success: false, code: 'claim_failed', error: GENERIC_FAIL }, 502);
    }
    r.info('handoff redeemed', {
      vendor_subject: record.vendor_subject,
      env: record.env,
      email_present: !!record.email,
      company_id: record.company_id,
    });

    // 2. Identity fields. The ACCOUNT email is always the placeholder (see
    // header); the vendor's asserted address is display-only. The subject
    // is interpolated into an email address, so its shape is pinned: today
    // it is a numeric Catermonkey user id ("8770").
    if (!/^[A-Za-z0-9._-]{1,64}$/.test(record.vendor_subject)) {
      r.error('vendor_subject has an unexpected shape');
      r.done(502);
      return json({ success: false, code: 'claim_failed', error: GENERIC_FAIL }, 502);
    }
    const accountEmail = `catermonkey-mcp-${record.vendor_subject}@placeholder.local`.toLowerCase();
    const assertedEmail = (record.email ?? '').trim().toLowerCase() || null;
    const firstName = (record.first_name ?? '').trim();
    const lastName = (record.last_name ?? '').trim();
    const name = [firstName, lastName].filter(Boolean).join(' ') || assertedEmail?.split('@')[0] || 'there';
    const langCode = (record.language ?? '').trim().toLowerCase().slice(0, 2);
    const language = SUPPORTED_LANGUAGES.has(langCode) ? langCode : 'nl';
    const userInfo = {
      email: assertedEmail,
      name,
      first_name: firstName || null,
      last_name: lastName || null,
      role: record.role ?? null,
      vendor_subject: record.vendor_subject,
    };
    const userMetadata = {
      name,
      provider: PROVIDER,
      first_name: firstName || null,
      last_name: lastName || null,
      contact_email: assertedEmail,
    };

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // 3. Returning user? Keyed by (vendor_subject, env) — never by email.
    const { data: existingRow, error: rowErr } = await supabase
      .from(TABLE)
      .select('user_id')
      .eq('vendor_subject', record.vendor_subject)
      .eq('env', record.env)
      .is('deleted_at', null)
      .maybeSingle();
    if (rowErr) {
      r.error('identity row lookup failed', { error: rowErr.message });
      r.done(500);
      return json({ success: false, code: 'db_error', error: GENERIC_FAIL }, 500);
    }

    let userId: string;
    let sessionEmail: string;

    if (existingRow?.user_id) {
      userId = existingRow.user_id;
      r.info('existing account found', { user_id: userId });
      // The session is minted for the account's CURRENT auth email, read
      // from auth.users — never from the vendor record. A lookup failure is
      // a hard stop, not a fallback (review finding: falling back to the
      // asserted email would mint a session for whoever owns that address).
      const { data: authUser, error: authErr } = await supabase.auth.admin.getUserById(userId);
      if (authErr || !authUser?.user?.email) {
        r.error('auth user lookup failed for existing account', { error: authErr?.message, user_id: userId });
        r.done(500);
        return json({ success: false, code: 'db_error', error: GENERIC_FAIL }, 500);
      }
      sessionEmail = authUser.user.email;
      await supabase.auth.admin.updateUserById(userId, { user_metadata: userMetadata });
      const { error: refreshErr } = await supabase
        .from(TABLE)
        .update({ user_info: userInfo, company_id: record.company_id ?? null })
        .eq('user_id', userId);
      if (refreshErr) r.warn('identity row refresh failed (non-fatal)', { error: refreshErr.message });
    } else {
      // 4. New signup, or our own earlier partial signup (auth user created,
      // identity row insert failed). The placeholder email encodes this very
      // vendor_subject, so a hit here can only be ours.
      let createdThisRequest = false;
      const { data: byEmail, error: byEmailErr } = await supabase
        .from('users')
        .select('id')
        .eq('email', accountEmail)
        .maybeSingle();
      if (byEmailErr) {
        r.error('users lookup failed', { error: byEmailErr.message });
        r.done(500);
        return json({ success: false, code: 'db_error', error: GENERIC_FAIL }, 500);
      }

      if (byEmail?.id) {
        userId = byEmail.id;
        r.info('reusing earlier partial signup', { user_id: userId });
        await supabase.auth.admin.updateUserById(userId, { user_metadata: userMetadata });
      } else {
        r.info('creating new account');
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
          email: accountEmail,
          email_confirm: true,
          user_metadata: userMetadata,
        });
        if (createErr || !created?.user) {
          const msg = (createErr?.message ?? '').toLowerCase();
          const alreadyExists = msg.includes('already') || msg.includes('registered') || msg.includes('duplicate');
          if (!alreadyExists) {
            r.error('user creation failed', { error: createErr?.message });
            r.done(500);
            return json({ success: false, code: 'db_error', error: GENERIC_FAIL }, 500);
          }
          // auth.users has it but public.users doesn't (the on_auth_user_created
          // trigger row was removed, or the earlier run died before its upsert).
          // Resolve the id by email without paging through listUsers (which
          // silently caps at one page): generateLink returns the user and
          // sends nothing for a magic link.
          const { data: existing, error: existingErr } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: accountEmail,
          });
          if (existingErr || !existing?.user?.id) {
            r.error('placeholder user exists but could not be resolved', { error: existingErr?.message ?? createErr?.message });
            r.done(500);
            return json({ success: false, code: 'db_error', error: GENERIC_FAIL }, 500);
          }
          userId = existing.user.id;
          r.info('reusing earlier partial signup (auth only)', { user_id: userId });
        } else {
          userId = created.user.id;
          createdThisRequest = true;
          r.info('auth user created', { user_id: userId });
        }
      }

      await supabase.from('users').upsert({ id: userId, email: accountEmail, name }, { onConflict: 'id' });

      // 5. Identity row. env comes from the claim record — nothing in the
      // portal sets env otherwise, and the VoiceLink join to
      // mcp_connections is on (server_key, env, vendor_subject).
      const { error: insertErr } = await supabase.from(TABLE).insert({
        user_id: userId,
        vendor_subject: record.vendor_subject,
        company_id: record.company_id ?? null,
        user_info: userInfo,
        env: record.env,
        language,
      });
      if (insertErr && insertErr.code === '23505') {
        // Two handoffs for the same vendor_subject raced (two tabs within
        // the 5-min window): the other request won the UNIQUE
        // (vendor_subject, env). Continue as a returning user on ITS row —
        // and never delete the auth user it just signed in.
        const { data: winner } = await supabase
          .from(TABLE)
          .select('user_id')
          .eq('vendor_subject', record.vendor_subject)
          .eq('env', record.env)
          .maybeSingle();
        if (!winner?.user_id) {
          r.error('unique violation but no winning row found');
          r.done(500);
          return json({ success: false, code: 'db_error', error: GENERIC_FAIL }, 500);
        }
        if (winner.user_id !== userId && createdThisRequest) {
          // Our own, now-orphaned auth user from THIS request only.
          const { error: delErr } = await supabase.auth.admin.deleteUser(userId);
          if (delErr) r.error('orphan auth user cleanup failed', { error: delErr.message, user_id: userId });
        }
        userId = winner.user_id;
        const { data: authUser, error: authErr } = await supabase.auth.admin.getUserById(userId);
        if (authErr || !authUser?.user?.email) {
          r.error('auth user lookup failed after race', { error: authErr?.message, user_id: userId });
          r.done(500);
          return json({ success: false, code: 'db_error', error: GENERIC_FAIL }, 500);
        }
        sessionEmail = authUser.user.email;
        r.info('lost signup race, continuing on the winning row', { user_id: userId });
      } else if (insertErr) {
        r.error('identity row insert failed', { error: insertErr.message, code: insertErr.code });
        // Leave no orphan behind ONLY if this request created the auth user
        // — a reused earlier signup is left for the next retry.
        if (createdThisRequest) {
          const { error: delErr } = await supabase.auth.admin.deleteUser(userId);
          if (delErr) r.error('orphan auth user cleanup failed', { error: delErr.message, user_id: userId });
        }
        r.done(500);
        return json({ success: false, code: 'db_error', error: GENERIC_FAIL }, 500);
      } else {
        sessionEmail = accountEmail;
        r.info('identity row created', { user_id: userId, env: record.env });
      }
    }

    // 6. Session via magic link, landing on the dashboard of the origin the
    // flow started from (dev vs prod), like teamleader-auth. The link is
    // returned to the browser and followed directly — never emailed.
    let postAuthRedirect: string;
    try {
      postAuthRedirect = `${new URL(redirect_uri).origin}/dashboard`;
    } catch {
      postAuthRedirect = `${Deno.env.get('SITE_URL') ?? 'https://voicelink.me'}/dashboard`;
    }
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: sessionEmail,
      options: { redirectTo: postAuthRedirect },
    });
    if (linkErr || !linkData?.properties?.action_link) {
      r.error('generateLink failed', { error: linkErr?.message });
      r.done(500);
      return json({ success: false, code: 'session_failed', error: 'Failed to create session' }, 500);
    }

    r.done(200, { user_id: userId, vendor_subject: record.vendor_subject });
    return json({ success: true, session_url: linkData.properties.action_link });
  } catch (err) {
    r.error('unhandled error', toErrorDetail(err));
    r.done(500);
    // Fixed text: an exception message could carry the backend host.
    return json({ success: false, code: 'unexpected', error: GENERIC_FAIL }, 500);
  }
});
