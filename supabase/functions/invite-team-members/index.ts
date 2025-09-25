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

    // 5. Send WhatsApp OTP if phone number is provided
    let whatsappOtpSent = false;
    let otpCode = null;
    if (team_member.whatsapp_number) {
      try {
        // Generate 6-digit OTP
        otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Update the user record with OTP details
        const { error: otpError } = await supabaseAdminClient
          .from(`${crm_provider}_users`)
          .update({
            whatsapp_otp_code: otpCode,
            whatsapp_otp_expires_at: expiresAt.toISOString(),
            whatsapp_otp_phone: team_member.whatsapp_number,
            whatsapp_status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', insertedUser.id);

        if (!otpError) {
          // Send WhatsApp OTP message
          try {
            const whatsappMessage = `🔐 VoiceLink Verification Code: ${otpCode}\n\nClick here to verify instantly: ${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/verify-whatsapp?userid=${authUser.user.id}&otpcode=${otpCode}\n\nOr enter the code manually in the app.\n\nCode expires in 10 minutes.`;
            
            // TODO: Replace with actual WhatsApp API integration (Twilio, etc.)
            console.log(`WhatsApp message to ${team_member.whatsapp_number}:`);
            console.log(whatsappMessage);
            console.log(`Verification URL: ${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/verify-whatsapp?userid=${authUser.user.id}&otpcode=${otpCode}`);
            
            whatsappOtpSent = true;
          } catch (whatsappError) {
            console.error('Error sending WhatsApp message:', whatsappError);
            // Don't fail the invitation if WhatsApp sending fails
          }
          whatsappOtpSent = true;
        } else {
          console.error('Error setting up WhatsApp OTP:', otpError);
        }
      } catch (otpError) {
        console.error('Error sending WhatsApp OTP:', otpError);
        // Don't fail the entire invitation if OTP fails
      }
    }

    return new Response(JSON.stringify({
      success: true,
      authUser,
      crmUser: insertedUser,
      whatsappOtpSent,
      verificationUrl: otpCode ? `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/verify-whatsapp?userid=${authUser.user.id}&otpcode=${otpCode}` : null
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
