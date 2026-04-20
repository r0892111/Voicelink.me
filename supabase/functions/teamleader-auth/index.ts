import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { createWhatsAppProvider } from '../_shared/whatsapp/providers/factory.ts';
import { createLogger, toErrorDetail } from '../_shared/logger.ts';

const log = createLogger('teamleader-auth');

interface TeamleaderTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface TeamleaderUser {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight - MUST be first
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const r = log.withRequest(req);

  try {
    const { code, state, redirect_uri, is_test_user, test_phone, invitation_token } = await req.json();
    r.info('auth request received', {
      has_code: !!code,
      has_redirect_uri: !!redirect_uri,
      is_test_user: !!is_test_user,
      has_invitation_token: !!invitation_token,
      state,
    });

    if (!code || !redirect_uri) {
      r.warn('missing code or redirect_uri');
      r.done(400);
      return new Response(
        JSON.stringify({ success: false, error: 'Missing code or redirect_uri' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clientId = Deno.env.get('TEAMLEADER_CLIENT_ID');
    const clientSecret = Deno.env.get('TEAMLEADER_CLIENT_SECRET');
    // Apps from marketplace.focus.teamleader.eu use focus.teamleader.eu; else app.teamleader.eu
    const authBase = Deno.env.get('TEAMLEADER_AUTH_BASE_URL') || 'https://app.teamleader.eu';
    const tokenUrl = `${authBase.replace(/\/$/, '')}/oauth2/access_token`;

    if (!clientId || !clientSecret) {
      r.error('Teamleader credentials not configured');
      r.done(500);
      return new Response(
        JSON.stringify({ success: false, error: 'Teamleader credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Exchange code for Teamleader tokens
    r.info('exchanging auth code for tokens', { token_url: tokenUrl });
    const tokenBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri,
    });

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody,
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      let hint = '';
      try {
        const errJson = JSON.parse(errText);
        hint = errJson?.errors?.[0]?.meta?.hint || errJson?.error_description || '';
      } catch (_) {}
      r.error('token exchange failed', {
        status: tokenRes.status,
        hint,
        client_id_prefix: clientId?.slice(0, 8),
      });
      const userMessage = hint
        ? `Failed to exchange authorization code. ${hint}`
        : 'Failed to exchange authorization code. Check that client ID/secret match the app used for login, and redirect URI matches exactly.';
      r.done(400);
      return new Response(
        JSON.stringify({ success: false, error: userMessage }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokens: TeamleaderTokenResponse = await tokenRes.json();
    const { access_token: tlAccessToken, refresh_token: tlRefreshToken, expires_in } = tokens;
    r.info('tokens received', { expires_in });

    const expiresAt = expires_in
      ? new Date(Date.now() + expires_in * 1000).toISOString()
      : null;

    // 2. Get Teamleader user info (users.me)
    const apiBase = authBase.includes('focus') ? 'https://api.focus.teamleader.eu' : 'https://api.teamleader.eu';
    r.info('fetching Teamleader user info', { api_base: apiBase });
    const meRes = await fetch(`${apiBase}/users.me`, {
      headers: { Authorization: `Bearer ${tlAccessToken}` },
    });

    if (!meRes.ok) {
      const errText = await meRes.text();
      r.error('Teamleader users.me failed', { status: meRes.status, response: errText });
      r.done(400);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch Teamleader user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Teamleader API wraps the user object in a "data" envelope
    const meJson = await meRes.json();
    const tlUser: TeamleaderUser = meJson.data ?? meJson;
    const email = tlUser.email || `teamleader_${tlUser.id}@placeholder.local`;
    const name = tlUser.name || [tlUser.first_name, tlUser.last_name].filter(Boolean).join(' ') || email.split('@')[0];
    r.info('Teamleader user resolved', { tl_id: tlUser.id, email, name });

    // 3. Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 4. Find or create Supabase user
    r.info('looking up existing teamleader_users row', { tl_id: tlUser.id });
    const { data: tlUserRow } = await supabase
      .from('teamleader_users')
      .select('user_id')
      .eq('teamleader_id', tlUser.id)
      .maybeSingle();

    let userId: string;

    if (tlUserRow?.user_id) {
      userId = tlUserRow.user_id;
      r.info('existing user found via teamleader_users', { user_id: userId });
      // Keep name + metadata fresh on every login
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { name, provider: 'teamleader' },
      });
    } else {
      // Check users table by email (might have signed up via another provider)
      r.info('checking users table by email', { email });
      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (userRow?.id) {
        userId = userRow.id;
        r.info('existing user found via email', { user_id: userId });
      } else {
        r.info('creating new Supabase user', { email });
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { name, provider: 'teamleader' },
        });

        if (createError || !newUser?.user) {
          // User may already exist (e.g. from email signup) - look up by email and log them in
          const isAlreadyRegistered = createError?.message?.toLowerCase().includes('already') ||
            createError?.message?.toLowerCase().includes('registered') ||
            createError?.message?.toLowerCase().includes('duplicate');

          if (isAlreadyRegistered) {
            r.info('user already registered, looking up by email', { error: createError?.message });
            const { data: listData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
            const existingUser = listData?.users?.find((u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase());
            if (existingUser) {
              userId = existingUser.id;
              r.info('found existing user via admin list', { user_id: userId });
              await supabase.from('users').upsert({ id: userId, email, name }, { onConflict: 'id' });
            } else {
              r.error('user exists but could not find by email', { email });
              r.done(500);
              return new Response(
                JSON.stringify({ success: false, error: createError?.message || 'Failed to create user' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          } else {
            r.error('user creation failed', { error: createError?.message });
            r.done(500);
            return new Response(
              JSON.stringify({ success: false, error: createError?.message || 'Failed to create user' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          userId = newUser!.user.id;
          r.info('new user created', { user_id: userId });
          await supabase.from('users').upsert({ id: userId, email, name }, { onConflict: 'id' });
        }
      }
    }

    // 5. Save tokens to oauth_tokens (user_id is text in this table)
    r.info('saving OAuth tokens', { user_id: userId });
    const { error: tokenError } = await supabase.from('oauth_tokens').upsert(
      {
        user_id: userId,
        provider: 'teamleader',
        access_token: tlAccessToken,
        refresh_token: tlRefreshToken,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,provider' }
    );

    if (tokenError) {
      r.warn('oauth_tokens upsert failed (non-fatal)', { error: tokenError.message });
      // Continue - user is created, we can still return session
    } else {
      r.info('OAuth tokens saved successfully');
    }

    // 6. Upsert teamleader_users for mapping (teamleader_id, user_info)
    r.info('upserting teamleader_users row', { user_id: userId, tl_id: tlUser.id, is_test_user: !!is_test_user });
    const tlUserPayload: Record<string, unknown> = {
      user_id:       userId,
      teamleader_id: tlUser.id,
      user_info:     { email, name, teamleader_id: tlUser.id },
    };
    if (is_test_user) tlUserPayload.is_test_user = true;
    if (test_phone) {
      tlUserPayload.whatsapp_number = test_phone;
      tlUserPayload.whatsapp_status = 'active';
    }

    const { error: tlUserError } = await supabase.from('teamleader_users').upsert(
      tlUserPayload,
      { onConflict: 'teamleader_id' }
    );

    if (tlUserError) {
      r.warn('teamleader_users upsert failed (non-fatal)', { error: tlUserError.message });
    } else {
      r.info('teamleader_users row saved successfully');
    }

    // 6b. If test user, link back to test_users via tl_user_id
    if (is_test_user && test_phone) {
      r.info('linking test user', { phone: test_phone });
      const { error: testUserLinkError } = await supabase
        .from('test_users')
        .update({ tl_user_id: userId })
        .eq('phone', test_phone);
      if (testUserLinkError) {
        r.warn('test_users link failed', { error: testUserLinkError.message });
      } else {
        r.info('test user linked successfully');
      }
    }

    // 6c. If this is an invite acceptance, mark accepted & send welcome WhatsApp
    if (invitation_token) {
      r.info('processing invitation acceptance', { token_prefix: invitation_token.slice(0, 8) });
      const { data: inviteRow, error: invLookupErr } = await supabase
        .from('teamleader_users')
        .select('id, whatsapp_number, invitation_status')
        .eq('invitation_token', invitation_token)
        .maybeSingle();

      if (invLookupErr) {
        r.error('invite lookup failed', { error: invLookupErr.message });
      } else if (inviteRow && inviteRow.invitation_status === 'pending') {
        r.info('marking invitation as accepted', { invite_row_id: inviteRow.id });
        // Mark invitation as accepted and link to the authenticated user
        const { error: invUpdateErr } = await supabase
          .from('teamleader_users')
          .update({
            invitation_status: 'accepted',
            user_id: userId,
            teamleader_id: tlUser.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', inviteRow.id);

        if (invUpdateErr) {
          r.error('invite accept update failed', { error: invUpdateErr.message });
        } else {
          r.info('invitation marked as accepted');
        }

        // Send welcome WhatsApp to the invited member
        if (inviteRow.whatsapp_number) {
          try {
            r.info('sending welcome WhatsApp to invited member', { phone: inviteRow.whatsapp_number });
            const provider = createWhatsAppProvider();
            await provider.sendWelcome(inviteRow.whatsapp_number);
            r.info('welcome WhatsApp sent to invited member');
          } catch (waErr) {
            r.warn('welcome WhatsApp to invited member failed', toErrorDetail(waErr));
          }
        }
      } else {
        r.info('invite not pending or not found', {
          found: !!inviteRow,
          status: inviteRow?.invitation_status,
        });
      }
    }

    // 7. Generate magic link for session (avoids password)
    // Derive the post-verification redirect from the caller's redirect_uri
    // origin. Test users go to /test-dashboard; everyone else lands on
    // /dashboard. Without an explicit redirectTo the magic link falls back to
    // the Supabase project's Site URL, which dumps users on the homepage.
    let postAuthRedirect: string;
    try {
      const origin = new URL(redirect_uri).origin;
      postAuthRedirect = is_test_user ? `${origin}/test-dashboard` : `${origin}/dashboard`;
    } catch {
      const fallback = Deno.env.get('SITE_URL') ?? 'https://voicelink.me';
      postAuthRedirect = is_test_user ? `${fallback}/test-dashboard` : `${fallback}/dashboard`;
    }
    r.info('generating magic link session', { email, redirect_to: postAuthRedirect });
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: postAuthRedirect },
    });

    if (linkError || !linkData?.properties?.action_link) {
      r.error('generateLink failed', { error: linkError?.message });
      r.done(500);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const actionLink = linkData.properties.action_link as string;
    r.info('magic link generated successfully', { user_id: userId });
    r.done(200, { user_id: userId, tl_id: tlUser.id });

    return new Response(
      JSON.stringify({
        success: true,
        session_url: actionLink,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    r.error('unhandled error', toErrorDetail(err));
    r.done(500);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
