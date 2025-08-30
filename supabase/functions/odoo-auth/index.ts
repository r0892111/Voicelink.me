import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface OdooUserInfo {
  uid: number;
  name: string;
  email: string;
  partner_id: number;
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

    const { access_token, state } = await req.json();

    if (!access_token) {
      throw new Error('Access token is required');
    }

    // Get user info from Odoo using the access token
    const userResponse = await fetch('https://accounts.odoo.com/oauth2/tokeninfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        access_token: access_token,
      }),
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      throw new Error(`Failed to get user info: ${errorText}`);
    }

    const userInfo: OdooUserInfo = await userResponse.json();

    if (!userInfo.email) {
      throw new Error('No email found in Odoo user info');
    }

    // Create or get Supabase user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userInfo.email,
      email_confirm: true,
      user_metadata: {
        name: userInfo.name,
        odoo_id: userInfo.uid.toString(),
      }
    });

    if (authError && !authError.message.includes('already registered')) {
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    // Get the user (either newly created or existing)
    let userId = authData?.user?.id;

    if (!userId && authError?.message.includes('already registered')) {
      const { data: userByEmail } = await supabase.auth.admin.listUsers();
      const foundUser = userByEmail.users.find(u => u.email === userInfo.email);
      userId = foundUser?.id;
    }

    if (!userId) {
      throw new Error('Failed to get user ID');
    }

    // Store Odoo user data
    const { error: insertError } = await supabase
      .from('odoo_users')
      .upsert({
        user_id: userId,
        odoo_user_id: userInfo.uid.toString(),
        access_token: access_token,
        user_info: userInfo,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'odoo_user_id'
      });

    if (insertError) {
      throw new Error(`Failed to store user data: ${insertError.message}`);
    }

    // Generate session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userInfo.email,
    });

    if (sessionError) {
      throw new Error(`Failed to generate session: ${sessionError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: userInfo,
        session_url: sessionData.properties?.action_link,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Odoo auth error:', error);
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