import { createClient } from 'npm:@supabase/supabase-js@2.39.0';
import twilio from 'npm:twilio';

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
    const { user_id } = body;

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'Missing user_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find user in CRM tables
    const crmProviders = ['teamleader', 'pipedrive', 'odoo'];
    let foundProvider = null;
    let userData = null;

    for (const provider of crmProviders) {
      console.log(`Checking provider: ${provider}`);
      const { data, error } = await supabaseAdminClient
        .from(`${provider}_users`)
        .select('whatsapp_number, user_info')
        .eq('user_id', user_id)
        .eq('whatsapp_status', 'active')
        .is('deleted_at', null)
        .maybeSingle();

      if (error) {
        console.error(`Error querying ${provider}_users:`, error);
        continue;
      }

      if (data && data.whatsapp_number) {
        console.log(`User found in provider: ${provider}`);
        foundProvider = provider;
        userData = data;
        break;
      }
    }

    if (!foundProvider || !userData) {
      console.warn('User not found or WhatsApp not verified');
      return new Response(JSON.stringify({ error: 'User not found or WhatsApp not verified' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Send WhatsApp welcome message
    const client = twilio(
      Deno.env.get('TWILIO_ACCOUNT_SID'),
      Deno.env.get('TWILIO_AUTH_TOKEN')
    );

    try {
      const userName = userData.user_info?.name || 
                      userData.user_info?.first_name + ' ' + userData.user_info?.last_name || 
                      'there';

      const welcomeMessage = `🎉 Welcome to VoiceLink, ${userName}!

Your WhatsApp is now successfully connected to VoiceLink. You can now:

✅ Record voice notes that automatically sync to your CRM
✅ Get AI-powered insights from your conversations
✅ Schedule follow-ups and tasks automatically
✅ Access everything from your mobile device

Start by recording a voice note about a client or prospect - VoiceLink will handle the rest!

Need help? Reply to this message or contact our support team.

Happy selling! 🚀`;

      const message = await client.messages.create({
        from: `${Deno.env.get('TWILIO_WHATSAPP_NUMBER')}`,
        to: `whatsapp:${userData.whatsapp_number}`,
        body: welcomeMessage
      });

      console.log('WhatsApp welcome message sent:', message.sid);

      return new Response(JSON.stringify({
        success: true,
        message: 'Welcome message sent successfully',
        provider: foundProvider,
        messageSid: message.sid
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (twilioError) {
      console.error('Failed to send WhatsApp welcome message:', twilioError);
      return new Response(JSON.stringify({ error: 'Failed to send welcome message' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('WhatsApp welcome function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

