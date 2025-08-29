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
          // Try to get user data from our custom tables
          const { data: userData } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('id', authUser.id)
            .single();

          if (userData) {
            setUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              platform: 'custom'
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