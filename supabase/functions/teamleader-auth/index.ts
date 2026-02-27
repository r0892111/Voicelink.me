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

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ success: false, error: 'Teamleader credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Exchange code for Teamleader tokens
    const tokenRes = await fetch('https://app.teamleader.eu/oauth2/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Teamleader token exchange failed:', tokenRes.status, errText);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to exchange authorization code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokens: TeamleaderTokenResponse = await tokenRes.json();
    const { access_token: tlAccessToken, refresh_token: tlRefreshToken, expires_in } = tokens;

    // 2. Get Teamleader user info (users.me)
    const meRes = await fetch('https://api.teamleader.eu/users.me', {
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

    const tlUser: TeamleaderUser = await meRes.json();
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
        console.error('Supabase user creation failed:', createError);
        return new Response(
          JSON.stringify({ success: false, error: createError?.message || 'Failed to create user' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      userId = newUser.user.id;

        // Insert into users table
        await supabase.from('users').upsert(
          { id: userId, email, name },
          { onConflict: 'id' }
        );
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
