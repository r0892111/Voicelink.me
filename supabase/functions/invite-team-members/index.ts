import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      )
    }

    const { team_member, crm_provider } = await req.json()

    if (!team_member || !team_member.name || !team_member.email || !crm_provider) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: corsHeaders }
      )
    }

    const adminUserId = user.id

    // Create new user in auth
    const { data: newUser, error: authError } = await supabaseClient.auth.admin.createUser({
      email: team_member.email,
      password: Math.random().toString(36).slice(-8), // Generate random password
      email_confirm: true,
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return new Response(
        JSON.stringify({ error: 'Failed to create user account' }),
        { status: 500, headers: corsHeaders }
      )
    }

    // Get admin user's CRM data to copy tokens (for Pipedrive & TeamLeader)
    let adminCrmData = null;
    if (crm_provider === 'pipedrive' || crm_provider === 'teamleader') {
      const { data: adminData, error: adminError } = await supabaseClient
        .from(`${crm_provider}_users`)
        .select('access_token, refresh_token, token_expires_at, api_domain')
        .eq('user_id', adminUserId)
        .is('deleted_at', null)
        .single();

      if (adminError) {
        console.error('Error fetching admin CRM data:', adminError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch admin CRM data' }),
          { status: 500, headers: corsHeaders }
        );
      }

      adminCrmData = adminData;
    }

    // Create CRM-specific user record
    let crmUserData: any = {
      admin_user_id: adminUserId,
      invited_by: adminUserId,
      invitation_status: 'pending',
      whatsapp_number: team_member.whatsapp_number || null,
      whatsapp_status: 'not_set',
    }

    switch (crm_provider) {
      case 'teamleader':
        crmUserData = {
          ...crmUserData,
          user_id: newUser.user.id,
          teamleader_id: `invited_${newUser.user.id}`,
          access_token: adminCrmData?.access_token || null,
          refresh_token: adminCrmData?.refresh_token || null,
          token_expires_at: adminCrmData?.token_expires_at || null,
          user_info: {
            first_name: team_member.name.split(' ')[0],
            last_name: team_member.name.split(' ').slice(1).join(' ') || '',
            email: team_member.email,
          },
        }
        break

      case 'pipedrive':
        crmUserData = {
          ...crmUserData,
          user_id: newUser.user.id,
          pipedrive_id: Math.floor(Math.random() * 1000000), // Generate fake ID for invited users
          access_token: adminCrmData?.access_token || null,
          refresh_token: adminCrmData?.refresh_token || null,
          token_expires_at: adminCrmData?.token_expires_at || null,
          api_domain: adminCrmData?.api_domain || null,
          user_info: {
            name: team_member.name,
            email: team_member.email,
          },
        }
        break

      case 'odoo':
        crmUserData = {
          ...crmUserData,
          user_id: newUser.user.id,
          odoo_user_id: `invited_${newUser.user.id}`,
          user_info: {
            name: team_member.name,
            email: team_member.email,
          },
        }
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid CRM provider' }),
          { status: 400, headers: corsHeaders }
        )
    }

    // Insert CRM user record
    const { data: crmUser, error: crmError } = await supabaseClient
      .from(`${crm_provider}_users`)
      .insert(crmUserData)
      .select()
      .single()

    if (crmError) {
      console.error('Error creating CRM user:', crmError)
      // Clean up auth user if CRM creation fails
      await supabaseClient.auth.admin.deleteUser(newUser.user.id)
      return new Response(
        JSON.stringify({ error: 'Failed to create CRM user record' }),
        { status: 500, headers: corsHeaders }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          name: team_member.name,
          whatsapp_number: team_member.whatsapp_number,
          invitation_status: 'pending',
        },
      }),
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Error in invite-team-members function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    )
  }
})