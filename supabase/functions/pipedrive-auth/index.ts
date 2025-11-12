import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface PipedriveAuthRequest {
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
    const body: PipedriveAuthRequest = await req.json();
    const { code, redirect_uri } = body;

    if (!code) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clientId = Deno.env.get('VITE_PIPEDRIVE_CLIENT_ID');
    const clientSecret = Deno.env.get('PIPEDRIVE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ success: false, error: 'Pipedrive credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth.pipedrive.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri,
      }).toString(),
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
    const apiDomain = tokenData.api_domain;

    // Fetch user info from Pipedrive
    const userResponse = await fetch(`https://${apiDomain}/v1/users/me`, {
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
      .from('pipedrive_users')
      .select('user_id, user_info')
      .eq('pipedrive_user_id', userInfo.id)
      .is('deleted_at', null);

    let userId: string;

    if (existingUsers && existingUsers.length > 0) {
      // User exists
      userId = existingUsers[0].user_id;

      // Update user info
      await supabase
        .from('pipedrive_users')
        .update({ user_info: userInfo, updated_at: new Date().toISOString() })
        .eq('pipedrive_user_id', userInfo.id);
    } else {
      // Create new user
      const email = userInfo.email || `${userInfo.id}@pipedrive.local`;

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: {
          platform: 'pipedrive',
          name: userInfo.name,
        },
      });

      if (authError || !authData.user) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create user' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      userId = authData.user.id;

      // Insert into pipedrive_users table
      await supabase.from('pipedrive_users').insert({
        user_id: userId,
        pipedrive_user_id: userInfo.id,
        user_info: userInfo,
      });

      // Insert into users table
      await supabase.from('users').insert({
        id: userId,
        email: email,
        name: userInfo.name,
      });
    }

    // Generate session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userInfo.email || `${userInfo.id}@pipedrive.local`,
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
    console.error('Pipedrive auth error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
