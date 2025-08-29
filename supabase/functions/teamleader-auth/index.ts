const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const state = url.searchParams.get('state') || Math.random().toString(36).substring(2, 15);
    
    const clientId = Deno.env.get('TEAMLEADER_CLIENT_ID') || 'f6d23cd41fad1c1de3471253996c4588';
    const baseUrl = Deno.env.get('TEAMLEADER_BASE_URL') || 'https://focus.teamleader.eu';
    const redirectUri = `${url.protocol}//${url.host}/auth/teamleader/callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      state: state,
      scope: 'read write'
    });

    const authUrl = `${baseUrl}/oauth2/authorize?${params.toString()}`;

    return new Response(
      JSON.stringify({ authUrl }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});