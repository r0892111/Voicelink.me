@@ .. @@
     // Get admin user's CRM data to copy tokens (for Pipedrive & TeamLeader)
     let adminCrmData = null;
     if (crm_provider === 'pipedrive' || crm_provider === 'teamleader') {
       const { data: adminData, error: adminError } = await supabase
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
@@ .. @@
       case 'teamleader':
         crmUserData = {
           user_id: newUser.id,
           teamleader_id: `invited_${newUser.id}`,
+          access_token: adminCrmData?.access_token || null,
+          refresh_token: adminCrmData?.refresh_token || null,
+          token_expires_at: adminCrmData?.token_expires_at || null,
           user_info: {
             first_name: team_member.name.split(' ')[0],
             last_name: team_member.name.split(' ').slice(1).join(' ') || '',
             email: team_member.email,
           },
@@ .. @@
       case 'pipedrive':
         crmUserData = {
           user_id: newUser.id,
           pipedrive_id: Math.floor(Math.random() * 1000000), // Generate fake ID for invited users
+          access_token: adminCrmData?.access_token || null,
+          refresh_token: adminCrmData?.refresh_token || null,
+          token_expires_at: adminCrmData?.token_expires_at || null,
+          api_domain: adminCrmData?.api_domain || null,
           user_info: {
             name: team_member.name,
             email: team_member.email,
           },