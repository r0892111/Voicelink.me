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
  const [userPlatform, setUserPlatform] = useState<string | null>(null);

  const setUserPlatformStorage = (platform: string | null) => {
    if (platform) {
      localStorage.setItem('userPlatform', platform);
      setUserPlatform(platform);
    } else {
      localStorage.removeItem('userPlatform');
      localStorage.removeItem('auth_provider');
      setUserPlatform(null);
    }
  };

useEffect(() => {
  // Initialize platform from localStorage
  const storedPlatform = localStorage.getItem('userPlatform') || localStorage.getItem('auth_provider');
  if (storedPlatform) {
    setUserPlatform(storedPlatform);
  }
  
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
          let platform = localStorage.getItem('userPlatform') || localStorage.getItem('auth_provider');
          
          if (platform && ['teamleader', 'pipedrive', 'odoo'].includes(platform)) {
            // Only query the specific platform table
            const tableName = `${platform}_users`;
            const { data: userData } = await supabase
              .from(tableName)
              .select('*')
              .eq('user_id', userId)
              .is('deleted_at', null)
              .single();

            if (userData) {
              // Save the confirmed platform
              setUserPlatformStorage(platform);
              
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
          } else {
            // Platform unknown - check all tables once to determine platform
            const platforms = ['odoo', 'pipedrive', 'teamleader']; // Check Odoo first
            
            for (const platformName of platforms) {
              const tableName = `${platformName}_users`;
              const { data: userData } = await supabase
                .from(tableName)
                .select('*')
                .eq('user_id', userId)
                .is('deleted_at', null)
                .single();

              if (userData) {
                // Found the user's platform - save it and set user
                setUserPlatformStorage(platformName);
                console.log('Platform detected and saved:', platformName);
                
                let userName = '';
                switch (platformName) {
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
                  platform: platformName as 'teamleader' | 'pipedrive' | 'odoo',
                  user_info: userData.user_info
                });
                return;
              }
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
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      
      // Clear all authentication-related localStorage items
      localStorage.removeItem('userPlatform');
      localStorage.removeItem('auth_provider');
      localStorage.removeItem('teamleader_oauth_state');
      localStorage.removeItem('pipedrive_oauth_state');
      localStorage.removeItem('odoo_oauth_state');
      
      // Clear any other potential auth-related items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('oauth') || key.includes('auth') || key.includes('token'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      setUser(null);
      setUserPlatformStorage(null);
      
      // Force a page reload to ensure complete cleanup
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if sign out fails, clear local data
      localStorage.clear();
      setUser(null);
      setUserPlatformStorage(null);
      window.location.href = '/';
    }
  };

  return { user, loading, signOut };
};