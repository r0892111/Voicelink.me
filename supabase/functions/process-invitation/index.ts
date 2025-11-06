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
    const { invitation_token, provider } = body;

    if (!invitation_token || !provider) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authenticated user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdminClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Find the invited user record with this invitation token
    const { data: invitedUser, error: findError } = await supabaseAdminClient
      .from(`${provider}_users`)
      .select('*')
      .eq('invitation_token', invitation_token)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (findError || !invitedUser) {
      return new Response(JSON.stringify({ error: 'Invalid invitation token or user mismatch' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if token is expired
    if (new Date() > new Date(invitedUser.invitation_token_expires_at)) {
      return new Response(JSON.stringify({ error: 'Invitation token has expired' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate WhatsApp OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update the user record - clear invitation token and set WhatsApp OTP
    const { error: updateError } = await supabaseAdminClient
      .from(`${provider}_users`)
      .update({
        invitation_token: null,
        invitation_token_expires_at: null,
        invitation_status: 'accepted',
        whatsapp_otp_code: otpCode,
        whatsapp_otp_expires_at: otpExpiresAt.toISOString(),
        whatsapp_status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', invitedUser.id);

    if (updateError) {
      console.error('Error updating user:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to process invitation' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Send WhatsApp OTP message
    if (invitedUser.whatsapp_otp_phone) {
      try {
        const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '') || '';
        const verificationUrl = `${baseUrl}/verify-whatsapp?userid=${user.id}&otpcode=${otpCode}`;

        const whatsappMessage = `🔐 VoiceLink Verification Code: ${otpCode}\n\nClick here to verify instantly:\n${verificationUrl}\n\nOr enter the code manually in the app.\n\nCode expires in 10 minutes.`;

        // TODO: Replace with actual WhatsApp API integration (Twilio, etc.)
        console.log(`WhatsApp message to ${invitedUser.whatsapp_otp_phone}:`);
        console.log(whatsappMessage);
        console.log(`Verification URL: ${verificationUrl}`);
      } catch (whatsappError) {
        console.error('Error sending WhatsApp message:', whatsappError);
        // Don't fail the entire process if WhatsApp sending fails
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Invitation processed successfully',
      whatsapp_verification_url: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/verify-whatsapp?userid=${user.id}&otpcode=${otpCode}`
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in process-invitation function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
