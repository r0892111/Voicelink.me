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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get the user from the JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    const { crm_provider, team_member } = await req.json()

    if (!crm_provider || !team_member) {
      throw new Error('Missing required fields')
    }

    // Validate team member data
    if (!team_member.name || !team_member.email || !team_member.whatsapp_number) {
      throw new Error('All team member fields are required')
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(team_member.email)) {
      throw new Error('Invalid email format')
    }

    // Validate WhatsApp number format (should start with +)
    if (!team_member.whatsapp_number.startsWith('+')) {
      throw new Error('WhatsApp number must include country code (e.g., +32)')
    }

    // Get the admin user's record from the appropriate CRM table
    const tableName = `${crm_provider}_users`
    
    const { data: adminUser, error: adminError } = await supabaseClient
      .from(tableName)
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (adminError || !adminUser) {
      throw new Error('Admin user not found')
    }

    // Create a new auth user for the team member
    const { data: newAuthUser, error: createUserError } = await supabaseClient.auth.admin.createUser({
      email: team_member.email,
      email_confirm: true,
      user_metadata: {
        name: team_member.name,
        invited_by: user.id,
        crm_provider: crm_provider
      }
    })

    if (createUserError || !newAuthUser.user) {
      throw new Error(`Failed to create auth user: ${createUserError?.message}`)
    }

    // Create the team member record in the CRM table
    const teamMemberData = {
      user_id: newAuthUser.user.id,
      whatsapp_number: team_member.whatsapp_number,
      whatsapp_status: 'not_set',
      is_admin: false,
      admin_user_id: user.id,
      invited_by: user.id,
      invitation_status: 'pending',
      invited_at: new Date().toISOString(),
      user_info: {
        name: team_member.name,
        email: team_member.email,
        invited: true
      }
    }

    // Add CRM-specific fields based on provider
    if (crm_provider === 'teamleader') {
      teamMemberData.teamleader_id = `invited_${newAuthUser.user.id}`
    } else if (crm_provider === 'pipedrive') {
      teamMemberData.pipedrive_id = parseInt(`999${newAuthUser.user.id.slice(-6)}`) // Generate a fake ID for invited users
    } else if (crm_provider === 'odoo') {
      teamMemberData.odoo_user_id = `invited_${newAuthUser.user.id}`
    }

    const { data: teamMember, error: teamMemberError } = await supabaseClient
      .from(tableName)
      .insert(teamMemberData)
      .select()
      .single()

    if (teamMemberError) {
      // Clean up the auth user if team member creation fails
      await supabaseClient.auth.admin.deleteUser(newAuthUser.user.id)
      throw new Error(`Failed to create team member: ${teamMemberError.message}`)
    }

    // TODO: Send invitation email to the team member
    // This would typically involve sending an email with setup instructions
    console.log(`Invitation should be sent to ${team_member.email}`)

    return new Response(
      JSON.stringify({
        success: true,
        team_member: {
          id: teamMember.id,
          name: team_member.name,
          email: team_member.email,
          whatsapp_number: team_member.whatsapp_number,
          invitation_status: 'pending'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Team member invitation error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})