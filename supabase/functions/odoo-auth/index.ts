import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface OdooAuthRequest {
  code: string;
  state: string;
  redirect_uri: string;
  odoo_oauth_url?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: OdooAuthRequest = await req.json();
    const { code, redirect_uri, odoo_oauth_url } = body;

    if (!code) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clientId = Deno.env.get('VITE_ODOO_CLIENT_ID');
    const clientSecret = Deno.env.get('ODOO_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ success: false, error: 'Odoo credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use custom Odoo URL if provided, otherwise default to accounts.odoo.com
    const oauthBaseUrl = odoo_oauth_url || 'https://accounts.odoo.com';

    // Exchange code for access token
    const tokenResponse = await fetch(`${oauthBaseUrl}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
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

    // Fetch user info from Odoo
    const userResponse = await fetch(`${oauthBaseUrl}/oauth2/userinfo`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch user info' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userInfo = await userResponse.json();

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check if user exists (use sub which is the unique Odoo user ID)
    const odooUserId = userInfo.sub || userInfo.user_id;
    const { data: existingUsers } = await supabase
      .from('odoo_users')
      .select('user_id, user_info')
      .eq('odoo_user_id', odooUserId)
      .is('deleted_at', null);

    let userId: string;

    if (existingUsers && existingUsers.length > 0) {
      // User exists
      userId = existingUsers[0].user_id;

      // Update user info
      await supabase
        .from('odoo_users')
        .update({ user_info: userInfo, updated_at: new Date().toISOString() })
        .eq('odoo_user_id', odooUserId);
    } else {
      // Create new user
      const email = userInfo.email || `${odooUserId}@odoo.local`;

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: {
          platform: 'odoo',
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

      // Insert into odoo_users table
      await supabase.from('odoo_users').insert({
        user_id: userId,
        odoo_user_id: odooUserId,
        user_info: userInfo,
      });

      // Insert into users table
      await supabase.from('users').insert({
        id: userId,
        email: email,
        name: userInfo.name || email.split('@')[0],
      });
    }

    // Generate session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userInfo.email || `${odooUserId}@odoo.local`,
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
    console.error('Odoo auth error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
