import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { team_member_id, crm_provider, admin_user_id } = body;

    if (!team_member_id || !crm_provider || !admin_user_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Get the team member's auth user ID before deleting
    const { data: teamMemberData, error: fetchError } = await supabaseAdminClient
      .from(`${crm_provider}_users`)
      .select('user_id')
      .eq('id', team_member_id)
      .eq('admin_user_id', admin_user_id)
      .single();

    if (fetchError || !teamMemberData) {
      console.error('Error fetching team member data:', fetchError);
      return new Response(JSON.stringify({ error: 'Team member not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. Delete the team member from database (hard delete)
    const { error: deleteError } = await supabaseAdminClient
      .from(`${crm_provider}_users`)
      .delete()
      .eq('id', team_member_id)
      .eq('admin_user_id', admin_user_id);

    if (deleteError) {
      console.error('Error removing team member from database:', deleteError);
      return new Response(JSON.stringify({ error: 'Failed to remove team member from database' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. Delete the auth user
    const { error: authDeleteError } = await supabaseAdminClient.auth.admin.deleteUser(
      teamMemberData.user_id
    );

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError);
      // Don't fail the request as the team member is already removed from database
      console.warn('Team member removed from database but auth user deletion failed');
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Team member and auth user removed successfully'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in remove-team-member function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
