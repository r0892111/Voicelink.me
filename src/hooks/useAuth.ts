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

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const setUserPlatformStorage = (platform: string | null) => {
    if (platform) {
      localStorage.setItem('userPlatform', platform);
      localStorage.setItem('auth_provider', platform);
    } else {
      localStorage.removeItem('userPlatform');
      localStorage.removeItem('auth_provider');
    }
  };

  useEffect(() => {
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

      if (!session?.user) {
        setUser(null);
        setUserPlatformStorage(null);
        return;
      }

      const userId = session.user.id;

      // 1️⃣ Trust platform from localStorage first
      let platform = localStorage.getItem('userPlatform') || localStorage.getItem('auth_provider');

      if (platform && ['teamleader', 'pipedrive', 'odoo'].includes(platform)) {
        // Only query the platform-specific table
        const { data: userData } = await supabase
          .from(`${platform}_users`)
          .select('*')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .single();

        if (userData) {
          setUserPlatformStorage(platform);

          const userName = getUserName(platform, userData.user_info);
          setUser({
            id: userId,
            email: session.user.email || '',
            name: userName,
            platform: platform as 'teamleader' | 'pipedrive' | 'odoo',
            user_info: userData.user_info,
          });

          setLoading(false);
          return;
        }
      }

      // 2️⃣ Fallback: determine platform by scanning tables in safe order
      const platforms: AuthUser['platform'][] = ['teamleader', 'pipedrive', 'odoo'];

      for (const platformName of platforms) {
        const { data: userData } = await supabase
          .from(`${platformName}_users`)
          .select('*')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .single();

        if (userData) {
          setUserPlatformStorage(platformName);

          const userName = getUserName(platformName, userData.user_info);
          setUser({
            id: userId,
            email: session.user.email || '',
            name: userName,
            platform: platformName,
            user_info: userData.user_info,
          });

          setLoading(false);
          return;
        }
      }

      // 3️⃣ No user found
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

  const getUserName = (platform: AuthUser['platform'], userInfo: any) => {
    switch (platform) {
      case 'teamleader':
        return userInfo?.user?.first_name && userInfo?.user?.last_name
          ? `${userInfo.user.first_name} ${userInfo.user.last_name}`
          : userInfo?.user?.email || 'TeamLeader User';
      case 'pipedrive':
        return userInfo?.name || userInfo?.email || 'Pipedrive User';
      case 'odoo':
        return userInfo?.name || 'Odoo User';
      default:
        return 'User';
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();

      // Clear all authentication-related localStorage
      localStorage.removeItem('userPlatform');
      localStorage.removeItem('auth_provider');
      localStorage.removeItem('teamleader_oauth_state');
      localStorage.removeItem('pipedrive_oauth_state');
      localStorage.removeItem('odoo_oauth_state');

      setUser(null);
      setUserPlatformStorage(null);

      // Force reload
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      localStorage.clear();
      setUser(null);
      setUserPlatformStorage(null);
      window.location.href = '/';
    }
  };

  return { user, loading, signOut };
};
