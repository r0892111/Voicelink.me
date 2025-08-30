const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

interface OdooUserInfo {
  uid: number;
  name: string;
  email: string;
  login: string;
  partner_id: number;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { access_token, state } = await req.json();

    if (!access_token) {
      return new Response(
        JSON.stringify({ success: false, error: "Access token is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user info from Odoo using the access token
    const userInfoResponse = await fetch('https://accounts.odoo.com/oauth2/tokeninfo', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      console.error('Odoo API error:', errorText);
      
      // Check if response is HTML (error page)
      if (errorText.includes('<!doctype html>') || errorText.includes('<html')) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Odoo session expired or invalid token. Please try authenticating again.' 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to get user info: ${errorText}` 
        }),
        {
          status: userInfoResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userInfo: OdooUserInfo = await userInfoResponse.json();

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create or get user in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userInfo.email,
      email_confirm: true,
      user_metadata: {
        name: userInfo.name,
        platform: 'odoo'
      }
    });

    if (authError && !authError.message.includes('already registered')) {
      return new Response(
        JSON.stringify({ success: false, error: `Failed to create user: ${authError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the user ID (either from creation or existing user)
    let userId = authUser?.user?.id;
    
    if (!userId) {
      // User already exists, get their ID
      const { data: existingUser } = await supabase.auth.admin.getUserByEmail(userInfo.email);
      userId = existingUser?.user?.id;
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to get user ID' }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Store Odoo user data
    const { error: odooUserError } = await supabase
      .from('odoo_users')
      .upsert({
        user_id: userId,
        odoo_user_id: userInfo.uid.toString(),
        access_token: access_token,
        user_info: userInfo,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (odooUserError) {
      return new Response(
        JSON.stringify({ success: false, error: `Failed to store Odoo user: ${odooUserError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userInfo.email,
    });

    if (sessionError) {
      return new Response(
        JSON.stringify({ success: false, error: `Failed to generate session: ${sessionError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          email: userInfo.email,
          name: userInfo.name,
          platform: 'odoo',
          user_info: userInfo
        },
        session: {
          access_token: sessionData.properties?.access_token,
          refresh_token: sessionData.properties?.refresh_token,
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Odoo auth error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});