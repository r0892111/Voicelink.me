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
  const [userPlatform, setUserPlatform] = useState<string | null>(null);

  // Platform helper functions
  const setUserPlatformStorage = (platform: string | null) => {
    if (platform) {
      localStorage.setItem('userPlatform', platform);
    } else {
      localStorage.removeItem('userPlatform');
    }
    setUserPlatform(platform);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userId = session.user.id;
          
          // Use cached platform if available, otherwise detect it
          let platform = userPlatform || localStorage.getItem('userPlatform');
          
          if (!platform) {
            // First time check - determine which platform this user belongs to
            const platforms = ['teamleader', 'pipedrive', 'odoo'];
            
            for (const p of platforms) {
              const tableName = `${p}_users`;
              const { data } = await supabase
                .from(tableName)
                .select('*')
                .eq('user_id', userId)
                .is('deleted_at', null)
                .single();
              
              if (data) {
                platform = p;
                setUserPlatformStorage(p);
                break;
              }
            }
          }
          
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
        setUserPlatformStorage(null);
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        setUserPlatformStorage(null);
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
  }, [userPlatform]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserPlatformStorage(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return { user, loading, signOut };
};