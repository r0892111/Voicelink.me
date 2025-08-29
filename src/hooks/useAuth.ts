import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface AuthUser {
  id: string;
  email: string;
  name: string;
  platform: 'teamleader' | 'pipedrive' | 'odoo';
  user_info: any;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Check all CRM user tables to find the authenticated user
          const userId = session.user.id;
          
          // Check TeamLeader users
          const { data: teamleaderUser } = await supabase
            .from('teamleader_users')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .single();

          if (teamleaderUser) {
            setUser({
              id: userId,
              email: session.user.email || '',
              name: teamleaderUser.user_info?.name || 'TeamLeader User',
              platform: 'teamleader',
              user_info: teamleaderUser.user_info
            });
            setLoading(false);
            return;
          }

          // Check Pipedrive users
          const { data: pipedriveUser } = await supabase
            .from('pipedrive_users')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .single();

          if (pipedriveUser) {
            setUser({
              id: userId,
              email: session.user.email || '',
              name: pipedriveUser.user_info?.name || 'Pipedrive User',
              platform: 'pipedrive',
              user_info: pipedriveUser.user_info
            });
            setLoading(false);
            return;
          }

          // Check Odoo users
          const { data: odooUser } = await supabase
            .from('odoo_users')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .single();

          if (odooUser) {
            setUser({
              id: userId,
              email: session.user.email || '',
              name: odooUser.user_info?.name || 'Odoo User',
              platform: 'odoo',
              user_info: odooUser.user_info
            });
            setLoading(false);
            return;
          }
        }
        
        setUser(null);
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, signOut };
};