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
    const { action, crm_provider, crm_user_id, phone_number, otp_code } = body;

    if (!action || !crm_provider || !crm_user_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (action === 'send') {
      if (!phone_number) {
        return new Response(JSON.stringify({ error: 'Phone number is required for sending OTP' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Update the user record with OTP details
      const { error: updateError } = await supabaseAdminClient
        .from(`${crm_provider}_users`)
        .update({
          whatsapp_otp_code: otpCode,
          whatsapp_otp_expires_at: expiresAt.toISOString(),
          whatsapp_otp_phone: phone_number,
          whatsapp_status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', crm_user_id);

      if (updateError) {
        console.error('Error updating user with OTP:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to generate OTP' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // TODO: Here you would integrate with your WhatsApp service (Twilio, etc.)
      // For now, we'll just log the OTP (in production, send via WhatsApp)
      console.log(`WhatsApp OTP for ${phone_number}: ${otpCode}`);

      return new Response(JSON.stringify({
        success: true,
        message: 'OTP sent successfully',
        expires_at: expiresAt.toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'verify') {
      if (!otp_code) {
        return new Response(JSON.stringify({ error: 'OTP code is required for verification' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get user's OTP details
      const { data: userData, error: fetchError } = await supabaseAdminClient
        .from(`${crm_provider}_users`)
        .select('whatsapp_otp_code, whatsapp_otp_expires_at, whatsapp_otp_phone')
        .eq('id', crm_user_id)
        .single();

      if (fetchError || !userData) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check if OTP is expired
      if (new Date() > new Date(userData.whatsapp_otp_expires_at)) {
        return new Response(JSON.stringify({ error: 'OTP has expired' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Verify OTP
      if (userData.whatsapp_otp_code !== otp_code) {
        return new Response(JSON.stringify({ error: 'Invalid OTP code' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Update user as verified
      const { error: verifyError } = await supabaseAdminClient
        .from(`${crm_provider}_users`)
        .update({
          whatsapp_number: userData.whatsapp_otp_phone,
          whatsapp_status: 'active',
          whatsapp_otp_code: null,
          whatsapp_otp_expires_at: null,
          whatsapp_otp_phone: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', crm_user_id);

      if (verifyError) {
        console.error('Error verifying OTP:', verifyError);
        return new Response(JSON.stringify({ error: 'Failed to verify OTP' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'WhatsApp number verified successfully'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error in whatsapp-otp function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
