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
    const { team_member, crm_provider, admin_user_id } = body;

    if (!team_member || !team_member.name || !team_member.email || !crm_provider) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!admin_user_id) {
      return new Response(JSON.stringify({ error: 'Missing admin_user_id for invited user' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Fetch admin CRM record
    const { data: adminRecord, error: adminError } = await supabaseAdminClient
      .from(`${crm_provider}_users`)
      .select('*')
      .eq('user_id', admin_user_id)
      .single();

    if (adminError || !adminRecord) {
      console.error('Error fetching admin CRM record:', adminError);
      return new Response(JSON.stringify({ error: 'Admin CRM record not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. Create Auth user
    const { data: authUser, error: authError } = await supabaseAdminClient.auth.admin.createUser({
      email: team_member.email,
      email_confirm: true,
      user_metadata: {
        name: team_member.name,
        invited_by_crm: crm_provider,
        invited_by: admin_user_id
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return new Response(JSON.stringify({ error: 'Failed to create auth user' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. Build CRM-specific data
    let crmUserData: Record<string, any> = {
      user_id: authUser.user.id,
      invited_by: admin_user_id,
      admin_user_id,
      invitation_status: 'pending',
      whatsapp_number: team_member.whatsapp_number || null,
      whatsapp_status: 'not_set',
      is_admin: false,
      // Inherit admin's tokens & API domain
      access_token: adminRecord.access_token,
      refresh_token: adminRecord.refresh_token,
      token_expires_at: adminRecord.token_expires_at,
      api_domain: adminRecord.api_domain
    };

    switch (crm_provider) {
      case 'teamleader':
        crmUserData = {
          ...crmUserData,
          teamleader_id: `invited_${Date.now()}`,
          user_info: {
            first_name: team_member.name.split(' ')[0],
            last_name: team_member.name.split(' ').slice(1).join(' ') || '',
            email: team_member.email
          }
        };
        break;

      case 'pipedrive':
        crmUserData = {
          ...crmUserData,
          pipedrive_id: Math.floor(Math.random() * 1000000),
          user_info: {
            name: team_member.name,
            email: team_member.email
          }
        };
        break;

      case 'odoo':
        crmUserData = {
          ...crmUserData,
          odoo_user_id: `invited_${Date.now()}`,
          user_info: {
            name: team_member.name,
            email: team_member.email
          }
        };
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid CRM provider' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // 4. Insert invited user into CRM table
    const { error: crmError, data: insertedUser } = await supabaseAdminClient
      .from(`${crm_provider}_users`)
      .insert(crmUserData)
      .select()
      .single();

    if (crmError) {
      console.error('Error creating CRM user:', crmError);
      return new Response(JSON.stringify({ error: 'Failed to create CRM user record' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 5. Generate invitation token and send invitation link
    let whatsappOtpSent = false;
    let invitationToken = null;
    if (team_member.whatsapp_number) {
      try {
        // Generate secure invitation token
        invitationToken = `${authUser.user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        // Update the user record with invitation token
        const { error: tokenError } = await supabaseAdminClient
          .from(`${crm_provider}_users`)
          .update({
            invitation_token: invitationToken,
            invitation_token_expires_at: expiresAt.toISOString(),
            whatsapp_otp_phone: team_member.whatsapp_number,
            whatsapp_status: 'not_set',
            updated_at: new Date().toISOString()
          })
          .eq('id', insertedUser.id);

        if (!tokenError) {
          // Get the base URL from environment
          const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '') || 'https://your-domain.com';

          // Create invitation link that requires CRM authentication first
          const invitationLink = `${baseUrl}/invite-accept?token=${invitationToken}&provider=${crm_provider}`;

          // Send WhatsApp invitation message
          try {
            const whatsappMessage = `👋 Welcome to VoiceLink!\n\nYou've been invited to join your team on VoiceLink.\n\nClick here to accept your invitation and set up your account:\n${invitationLink}\n\n⚠️ This link expires in 24 hours.\n\nYou'll need to authenticate with your ${crm_provider.charAt(0).toUpperCase() + crm_provider.slice(1)} account to complete the setup.`;

            // TODO: Replace with actual WhatsApp API integration (Twilio, etc.)
            console.log(`WhatsApp message to ${team_member.whatsapp_number}:`);
            console.log(whatsappMessage);
            console.log(`Invitation URL: ${invitationLink}`);

            whatsappOtpSent = true;
          } catch (whatsappError) {
            console.error('Error sending WhatsApp message:', whatsappError);
            // Don't fail the invitation if WhatsApp sending fails
          }
        } else {
          console.error('Error setting up invitation token:', tokenError);
        }
      } catch (inviteError) {
        console.error('Error sending invitation:', inviteError);
        // Don't fail the entire invitation if sending fails
      }
    }

    return new Response(JSON.stringify({
      success: true,
      authUser,
      crmUser: insertedUser,
      invitationSent: whatsappOtpSent,
      invitationUrl: invitationToken ? `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/invite-accept?token=${invitationToken}&provider=${crm_provider}` : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in invite-team-members function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
