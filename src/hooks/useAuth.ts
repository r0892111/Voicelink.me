import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
interface AuthUser {
  id: string;
  email: string;
  name: string;
  platform: 'teamleader' | 'pipedrive' | 'odoo';
  user_info: any;
}
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
 const setUserPlatform = (platform: string | null) => {
            if (platform) {
              localStorage.setItem('userPlatform', platform);
            } else {
              localStorage.removeItem('userPlatform');
            }
          };


export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  // Run once on mount
  checkAuth();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkAuth();
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);

const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userId = session.user.id;
          const userPlatform = localStorage.getItem('userPlatform');
          
      
          
          // Determine platform from stored state or check all platforms once
          let platform = userPlatform;
          
          
          if (platform) {
            // Only query the specific platform table
            const tableName = `${platform}_users`;
            const { data: userData } = await supabase
              .from(tableName)
              .select('*')
              .eq('user_id', userId)
              .is('deleted_at', null)
              .single();

            if (userData) {
              let userName = '';
              
              switch (platform) {
                case 'teamleader':
                  userName = userData.user_info?.user?.first_name && userData.user_info?.user?.last_name 
                    ? `${userData.user_info.user.first_name} ${userData.user_info.user.last_name}`
                    : userData.user_info?.user?.email || 'TeamLeader User';
                  break;
                case 'pipedrive':
                  userName = userData.user_info?.name || userData.user_info?.email || 'Pipedrive User';
                  break;
                case 'odoo':
                  userName = userData.user_info?.name || 'Odoo User';
                  break;
                default:
                  userName = 'User';
              }

              setUser({
                id: userId,
                email: session.user.email || '',
                name: userName,
                platform: platform as 'teamleader' | 'pipedrive' | 'odoo',
                user_info: userData.user_info
              });
              return;
            }
          }
        }
        
        setUser(null);
        setUserPlatform(null);
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        setUserPlatform(null);
      } finally {
        setLoading(false);
      }
    };
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserPlatform(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return { user, loading, signOut };
};