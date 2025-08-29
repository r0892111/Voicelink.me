import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UserData {
  id: string;
  name: string;
  email: string;
  platform?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          // Check all CRM user tables to find the authenticated user
          const [teamleaderData, pipedriveData, odooData, usersData] = await Promise.all([
            supabase.from('teamleader_users').select('user_info').eq('user_id', authUser.id).maybeSingle(),
            supabase.from('pipedrive_users').select('user_info').eq('user_id', authUser.id).maybeSingle(),
            supabase.from('odoo_users').select('user_info').eq('user_id', authUser.id).maybeSingle(),
            supabase.from('users').select('id, name, email').eq('id', authUser.id).maybeSingle()
          ]);

          let userData = null;
          let platform = 'auth';

          // Check which platform the user is from
          if (teamleaderData.data?.user_info) {
            userData = teamleaderData.data.user_info;
            platform = 'teamleader';
          } else if (pipedriveData.data?.user_info) {
            userData = pipedriveData.data.user_info;
            platform = 'pipedrive';
          } else if (odooData.data?.user_info) {
            userData = odooData.data.user_info;
            platform = 'odoo';
          } else if (usersData.data) {
            userData = usersData.data;
            platform = 'custom';
          }

          if (userData) {
            setUser({
              id: authUser.id,
              name: userData.name || userData.first_name || authUser.email?.split('@')[0] || 'User',
              email: userData.email || authUser.email || '',
              platform
            });
          } else {
            // Fallback to auth user data
            setUser({
              id: authUser.id,
              name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
              email: authUser.email || '',
              platform: 'auth'
            });
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // User signed in, fetch their data
          checkAuth();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      // Clear any stored OAuth states
      localStorage.removeItem('teamleader_oauth_state');
      localStorage.removeItem('pipedrive_oauth_state');
      localStorage.removeItem('odoo_oauth_state');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user
  };
};