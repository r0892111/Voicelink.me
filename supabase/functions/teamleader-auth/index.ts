import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { code, state, redirect_uri } = await req.json();

    if (!code || !state) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing code or state parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Exchange code for access token
    const clientId = Deno.env.get("TEAMLEADER_CLIENT_ID");
    const clientSecret = Deno.env.get("TEAMLEADER_CLIENT_SECRET");

    console.log("Client ID configured:", !!clientId);
    console.log("Client Secret configured:", !!clientSecret);

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ success: false, error: "TeamLeader credentials not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://focus.teamleader.eu/oauth2/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: redirect_uri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("TeamLeader token exchange failed:", errorText);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Token exchange failed: ${tokenResponse.statusText}`
        }),
        {
          status: tokenResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token } = tokenData;

    // Get user info from TeamLeader
    const userResponse = await fetch("https://api.focus.teamleader.eu/users.me", {
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error("TeamLeader user info fetch failed:", errorText);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to fetch user info: ${userResponse.statusText}`
        }),
        {
          status: userResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userData = await userResponse.json();
    const userInfo = userData.data;

    // Create or update user in Supabase Auth using admin API
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Create auth user with email
    const createUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
        "apikey": supabaseServiceKey,
      },
      body: JSON.stringify({
        email: userInfo.email,
        email_confirm: true,
        user_metadata: {
          platform: "teamleader",
          teamleader_user_id: userInfo.id,
          name: userInfo.first_name + " " + userInfo.last_name,
        },
      }),
    });

    let authUserId;
    if (createUserResponse.status === 422) {
      // User already exists, fetch them
      const getUserResponse = await fetch(
        `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(userInfo.email)}`,
        {
          headers: {
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "apikey": supabaseServiceKey,
          },
        }
      );
      const existingUsers = await getUserResponse.json();
      authUserId = existingUsers.users?.[0]?.id;
    } else {
      const newUser = await createUserResponse.json();
      authUserId = newUser.id;
    }

    if (!authUserId) {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create or find user" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Store TeamLeader user info in teamleader_users table
    const { createClient } = await import("jsr:@supabase/supabase-js@2");
    const supabase = createClient(
      supabaseUrl!,
      supabaseServiceKey!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { error: insertError } = await supabase
      .from("teamleader_users")
      .upsert({
        user_id: authUserId,
        teamleader_id: userInfo.id,
        access_token: access_token,
        refresh_token: refresh_token,
        user_info: userInfo,
        is_admin: true,
      }, {
        onConflict: "user_id",
      });

    if (insertError) {
      console.error("Error storing TeamLeader user data:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to store user data" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate session for the user
    const sessionResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
        "apikey": supabaseServiceKey,
      },
      body: JSON.stringify({
        email: userInfo.email,
        password: Math.random().toString(36),
      }),
    });

    // Generate a magic link instead for secure login
    const magicLinkResponse = await fetch(`${supabaseUrl}/auth/v1/magiclink`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
        "apikey": supabaseServiceKey,
      },
      body: JSON.stringify({
        email: userInfo.email,
        type: "magiclink",
      }),
    });

    const magicLinkData = await magicLinkResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authUserId,
          email: userInfo.email,
          name: userInfo.first_name + " " + userInfo.last_name,
        },
        session_url: magicLinkData.action_link || magicLinkData.confirmation_url,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("TeamLeader auth error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
