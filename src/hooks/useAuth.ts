import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  platform: 'teamleader' | 'pipedrive' | 'odoo';
  user_info: any;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isCheckingAuthRef = useRef(false);

  const setUserPlatformStorage = (platform: string | null) => {
    if (platform) {
      localStorage.setItem('userPlatform', platform);
      localStorage.setItem('auth_provider', platform);
    } else {
      localStorage.removeItem('userPlatform');
      localStorage.removeItem('auth_provider');
    }
  };

  const checkAuth = useCallback(async () => {
    if (isCheckingAuthRef.current) {
      return;
    }
    isCheckingAuthRef.current = true;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setUser(null);
        setUserPlatformStorage(null);
        return;
      }

      const platform = (localStorage.getItem('userPlatform') || localStorage.getItem('auth_provider') || 'teamleader') as AuthUser['platform'];
      if (['teamleader', 'pipedrive', 'odoo'].includes(platform)) {
        setUserPlatformStorage(platform);
      }

      const metadata = session.user.user_metadata || {};
      let name: string = metadata.name || '';

      // If the stored name looks like a placeholder (e.g. "teamleader_undefined"),
      // fall back to querying the platform-specific table for the real name.
      const nameIsCorrupt = !name || name.includes('undefined') || /^(teamleader|pipedrive|odoo)_/.test(name);
      if (nameIsCorrupt && ['teamleader', 'pipedrive', 'odoo'].includes(platform)) {
        try {
          const { data: platformRow } = await supabase
            .from(`${platform}_users`)
            .select('user_info')
            .eq('user_id', session.user.id)
            .is('deleted_at', null)
            .maybeSingle();
          const info = platformRow?.user_info;
          if (info?.name && !info.name.includes('undefined')) {
            name = info.name;
          } else if (info?.first_name || info?.last_name) {
            name = [info.first_name, info.last_name].filter(Boolean).join(' ');
          }
        } catch (_) {
          // ignore — we'll fall through to the email fallback
        }
      }

      if (!name || name.includes('undefined')) {
        // The stored email may also be a placeholder (teamleader_undefined@placeholder.local)
        // — fall back to a generic label rather than propagate the bad string.
        const emailPrefix = session.user.email?.split('@')[0] || '';
        const emailIsBad = !emailPrefix || emailPrefix.includes('undefined') || /^(teamleader|pipedrive|odoo)_/.test(emailPrefix);
        name = emailIsBad ? 'there' : emailPrefix;
      }

      setUser({
        id: session.user.id,
        email: session.user.email || '',
        name,
        platform: ['teamleader', 'pipedrive', 'odoo'].includes(platform) ? platform : 'teamleader',
        user_info: metadata,
      });
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setUserPlatformStorage(null);
    } finally {
      setLoading(false);
      isCheckingAuthRef.current = false;
    }
  }, []);

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
  }, [checkAuth]);

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
