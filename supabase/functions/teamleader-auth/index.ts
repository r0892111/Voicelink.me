import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

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

  try {
    const { code, state, redirect_uri } = await req.json();

    if (!code || !redirect_uri) {
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
      return new Response(
        JSON.stringify({ success: false, error: 'Teamleader credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Exchange code for Teamleader tokens
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
      console.error('Teamleader token exchange failed:', tokenRes.status, errText, { redirect_uri, client_id_prefix: clientId?.slice(0, 8) });
      const userMessage = hint
        ? `Failed to exchange authorization code. ${hint}`
        : 'Failed to exchange authorization code. Check that client ID/secret match the app used for login, and redirect URI matches exactly.';
      return new Response(
        JSON.stringify({ success: false, error: userMessage }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokens: TeamleaderTokenResponse = await tokenRes.json();
    const { access_token: tlAccessToken, refresh_token: tlRefreshToken, expires_in } = tokens;

    // 2. Get Teamleader user info (users.me)
    // Use api.focus.teamleader.eu if auth was via focus
    const apiBase = authBase.includes('focus') ? 'https://api.focus.teamleader.eu' : 'https://api.teamleader.eu';
    const meRes = await fetch(`${apiBase}/users.me`, {
      headers: { Authorization: `Bearer ${tlAccessToken}` },
    });

    if (!meRes.ok) {
      const errText = await meRes.text();
      console.error('Teamleader users.me failed:', meRes.status, errText);
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

    // 3. Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 4. Find or create Supabase user
    // Check teamleader_users first (existing Teamleader user)
    // Remote schema uses teamleader_id (from divine_heart migration)
    const { data: tlUserRow } = await supabase
      .from('teamleader_users')
      .select('user_id')
      .eq('teamleader_id', tlUser.id)
      .maybeSingle();

    let userId: string;

    if (tlUserRow?.user_id) {
      userId = tlUserRow.user_id;
      // Keep name + metadata fresh on every login
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { name, provider: 'teamleader' },
      });
    } else {
      // Check users table by email (might have signed up via another provider)
      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (userRow?.id) {
        userId = userRow.id;
      } else {
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
            const { data: listData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
            const existingUser = listData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
            if (existingUser) {
              userId = existingUser.id;
              await supabase.from('users').upsert({ id: userId, email, name }, { onConflict: 'id' });
            } else {
              console.error('User exists but could not find by email:', email);
              return new Response(
                JSON.stringify({ success: false, error: createError?.message || 'Failed to create user' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          } else {
            console.error('Supabase user creation failed:', createError);
            return new Response(
              JSON.stringify({ success: false, error: createError?.message || 'Failed to create user' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          userId = newUser!.user.id;
          await supabase.from('users').upsert({ id: userId, email, name }, { onConflict: 'id' });
        }
      }
    }

    // 5. Save tokens to oauth_tokens (user_id is text in this table)
    const expiresAt = expires_in
      ? new Date(Date.now() + expires_in * 1000).toISOString()
      : null;

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
      console.error('oauth_tokens upsert failed:', tokenError);
      // Continue - user is created, we can still return session
    }

    // 6. Upsert teamleader_users for mapping (teamleader_id, user_info)
    // Remote schema: teamleader_id UNIQUE, tokens in oauth_tokens
    const { error: tlUserError } = await supabase.from('teamleader_users').upsert(
      {
        user_id: userId,
        teamleader_id: tlUser.id,
        user_info: { email, name, teamleader_id: tlUser.id },
      },
      { onConflict: 'teamleader_id' }
    );

    if (tlUserError) {
      console.error('teamleader_users upsert failed:', tlUserError);
      // Continue - tokens are saved, we can still return session
    }

    // 7. Generate magic link for session (avoids password)
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error('generateLink failed:', linkError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const actionLink = linkData.properties.action_link as string;

    return new Response(
      JSON.stringify({
        success: true,
        session_url: actionLink,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('teamleader-auth error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
