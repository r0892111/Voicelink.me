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
    
    const clientId = Deno.env.get('PIPEDRIVE_CLIENT_ID') || '';
    const baseUrl = Deno.env.get('PIPEDRIVE_BASE_URL') || 'https://oauth.pipedrive.com';
    const redirectUri = `${url.protocol}//${url.host}/auth/pipedrive/callback`;

    if (!clientId) {
      throw new Error('Pipedrive client ID not configured');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      state: state,
      scope: 'deals:read deals:write persons:read persons:write'
    });

    const authUrl = `${baseUrl}/oauth/authorize?${params.toString()}`;

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