import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  api_domain: string;
}

interface UserResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    email: string;
    company_id: number;
    company_name: string;
    company_domain: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { code, redirect_uri } = await req.json();

    if (!code) {
      throw new Error('Authorization code is required');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth.pipedrive.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri,
        client_id: Deno.env.get('PIPEDRIVE_CLIENT_ID') ?? '',
        client_secret: Deno.env.get('PIPEDRIVE_CLIENT_SECRET') ?? '',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokens: TokenResponse = await tokenResponse.json();

    // Get user info
    const userResponse = await fetch(`https://${tokens.api_domain}/api/v1/users/me`, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userInfo: UserResponse = await userResponse.json();

    if (!userInfo.success) {
      throw new Error('Failed to get user data from Pipedrive');
    }

    // Create or get Supabase user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userInfo.data.email,
      email_confirm: true,
      user_metadata: {
        name: userInfo.data.name,
        pipedrive_id: userInfo.data.id.toString(),
      }
    });

    if (authError && !authError.message.includes('already registered')) {
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    // Get the user (either newly created or existing)
    const { data: existingUser } = await supabase.auth.admin.getUserById(
      authData?.user?.id || ''
    );

    if (!existingUser.user && authError?.message.includes('already registered')) {
      const { data: userByEmail } = await supabase.auth.admin.listUsers();
      const foundUser = userByEmail.users.find(u => u.email === userInfo.data.email);
      if (foundUser) {
        existingUser.user = foundUser;
      }
    }

    const userId = existingUser.user?.id || authData?.user?.id;

    if (!userId) {
      throw new Error('Failed to get user ID');
    }

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Store Pipedrive user data
    const { error: insertError } = await supabase
      .from('pipedrive_users')
      .upsert({
        user_id: userId,
        pipedrive_user_id: userInfo.data.id.toString(),
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt.toISOString(),
        api_domain: tokens.api_domain,
        user_info: userInfo.data,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'pipedrive_user_id'
      });

    if (insertError) {
      throw new Error(`Failed to store user data: ${insertError.message}`);
    }

    // Generate session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userInfo.data.email,
    });

    if (sessionError) {
      throw new Error(`Failed to generate session: ${sessionError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: userInfo.data,
        session_url: sessionData.properties?.action_link,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Pipedrive auth error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});