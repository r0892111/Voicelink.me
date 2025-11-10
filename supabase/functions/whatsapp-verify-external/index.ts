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
    const { user_id, otp_code, auth_user_id } = body;

    if (!user_id || !otp_code) {
      return new Response(JSON.stringify({ error: 'Missing user_id or otp_code' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify auth_user_id is provided
    if (!auth_user_id) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check all CRM tables to find the user
    const crmProviders = ['teamleader', 'pipedrive', 'odoo'];
    let userData = null;
    let foundProvider = null;

    for (const provider of crmProviders) {
      const { data, error } = await supabaseAdminClient
        .from(`${provider}_users`)
        .select('id, whatsapp_otp_code, whatsapp_otp_expires_at, whatsapp_otp_phone')
        .eq('user_id', user_id)
        .is('deleted_at', null)
        .maybeSingle();

      if (!error && data) {
        userData = data;
        foundProvider = provider;
        break;
      }
    }

    if (!userData || !foundProvider) {
      return new Response(JSON.stringify({ error: 'User not found or invalid user ID' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if OTP exists and is not expired
    if (!userData.whatsapp_otp_code) {
      return new Response(JSON.stringify({ error: 'No pending verification found for this user' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (new Date() > new Date(userData.whatsapp_otp_expires_at)) {
      return new Response(JSON.stringify({ error: 'Verification code has expired' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify OTP
    if (userData.whatsapp_otp_code !== otp_code) {
      return new Response(JSON.stringify({ error: 'Invalid verification code' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update user as verified
    const { error: verifyError } = await supabaseAdminClient
      .from(`${foundProvider}_users`)
      .update({
        whatsapp_number: userData.whatsapp_otp_phone,
        whatsapp_status: 'active',
        whatsapp_otp_code: null,
        whatsapp_otp_expires_at: null,
        whatsapp_otp_phone: null,
        auth_user_id: auth_user_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', userData.id);

    if (verifyError) {
      console.error('Error verifying WhatsApp:', verifyError);
      return new Response(JSON.stringify({ error: 'Failed to complete verification' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update the verification token
    const { error: tokenError } = await supabaseAdminClient
      .from('whatsapp_verification_tokens')
      .update({
        verified_at: new Date().toISOString()
      })
      .eq('auth_user_id', auth_user_id)
      .eq('crm_user_id', user_id);

    if (tokenError) {
      console.error('Error updating verification token:', tokenError);
      // Don't fail the request if token update fails
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'WhatsApp number verified successfully',
      provider: foundProvider
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in whatsapp-verify-external function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});