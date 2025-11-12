import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const user_id = url.searchParams.get('user_id');

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'Missing user_id parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check all CRM tables to find which provider this user belongs to
    const crmProviders = ['teamleader', 'pipedrive', 'odoo'];
    let foundProvider = null;

    for (const provider of crmProviders) {
      const { data, error } = await supabaseAdminClient
        .from(`${provider}_users`)
        .select('id')
        .eq('user_id', user_id)
        .is('deleted_at', null)
        .maybeSingle();

      if (!error && data) {
        foundProvider = provider;
        break;
      }
    }

    if (!foundProvider) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'User not found in any CRM provider' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      provider: foundProvider
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in get-user-provider function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});