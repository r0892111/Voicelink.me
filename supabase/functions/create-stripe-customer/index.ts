import Stripe from 'npm:stripe@17.7.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    });

    const token = authHeader.replace('Bearer ', '');

    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'APIKey': supabaseServiceKey,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user');
    }

    const userData = await userResponse.json();
    const userId = userData.id;
    const userEmail = userData.email;

    const { provider } = await req.json();

    if (!provider) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing provider parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let tableName: string;
    switch (provider) {
      case 'teamleader':
        tableName = 'teamleader_users';
        break;
      case 'pipedrive':
        tableName = 'pipedrive_users';
        break;
      case 'odoo':
        tableName = 'odoo_users';
        break;
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid provider' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    const userDataResponse = await fetch(
      `${supabaseUrl}/rest/v1/${tableName}?user_id=eq.${userId}&select=stripe_customer_id`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!userDataResponse.ok) {
      throw new Error(`Failed to fetch user data from ${tableName}`);
    }

    const users = await userDataResponse.json();

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not found in database' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const existingCustomerId = users[0].stripe_customer_id;

    if (existingCustomerId && existingCustomerId !== '') {
      return new Response(
        JSON.stringify({
          success: true,
          customer_id: existingCustomerId,
          message: 'Customer already exists'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: {
        supabase_user_id: userId,
        crm_provider: provider,
      },
    });

    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/${tableName}?user_id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          stripe_customer_id: customer.id,
        }),
      }
    );

    if (!updateResponse.ok) {
      console.error('Failed to update user with Stripe customer ID');
      throw new Error('Failed to update user record');
    }

    return new Response(
      JSON.stringify({
        success: true,
        customer_id: customer.id,
        message: 'Stripe customer created successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-stripe-customer:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});