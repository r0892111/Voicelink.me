import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface TeamleaderAuthRequest {
  code: string;
  state: string;
  redirect_uri: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: TeamleaderAuthRequest = await req.json();
    const { code, redirect_uri } = body;

    if (!code) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clientId = Deno.env.get('VITE_TEAMLEADER_CLIENT_ID');
    const clientSecret = Deno.env.get('TEAMLEADER_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ success: false, error: 'TeamLeader credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://app.teamleader.eu/oauth2/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirect_uri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return new Response(
        JSON.stringify({ success: false, error: `Failed to exchange code: ${errorText}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch user info from TeamLeader
    const userResponse = await fetch('https://api.teamleader.eu/users.me', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch user info' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userData = await userResponse.json();
    const userInfo = userData.data;

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check if user exists
    const { data: existingUsers } = await supabase
      .from('teamleader_users')
      .select('user_id, user_info')
      .eq('teamleader_user_id', userInfo.id)
      .is('deleted_at', null);

    let userId: string;

    if (existingUsers && existingUsers.length > 0) {
      // User exists
      userId = existingUsers[0].user_id;

      // Update user info
      await supabase
        .from('teamleader_users')
        .update({ user_info: userInfo, updated_at: new Date().toISOString() })
        .eq('teamleader_user_id', userInfo.id);
    } else {
      // Create new user
      const email = userInfo.email || `${userInfo.id}@teamleader.local`;

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: {
          platform: 'teamleader',
          first_name: userInfo.first_name,
          last_name: userInfo.last_name,
        },
      });

      if (authError || !authData.user) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create user' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      userId = authData.user.id;

      // Insert into teamleader_users table
      await supabase.from('teamleader_users').insert({
        user_id: userId,
        teamleader_user_id: userInfo.id,
        user_info: userInfo,
      });

      // Insert into users table
      await supabase.from('users').insert({
        id: userId,
        email: email,
        name: `${userInfo.first_name} ${userInfo.last_name}`,
      });
    }

    // Generate session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userInfo.email || `${userInfo.id}@teamleader.local`,
    });

    if (sessionError || !sessionData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        session_url: sessionData.properties.action_link,
        user_id: userId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('TeamLeader auth error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
