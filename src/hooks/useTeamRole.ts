import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { AuthUser } from './useAuth';
import type { MemberRole } from '../types/team';

interface TeamRoleState {
  role: MemberRole | null;
  isAdmin: boolean;
  isMember: boolean;
  adminUserId: string | null;
  adminName: string | null;
  loading: boolean;
}

/**
 * Determines whether the current user is an admin (manager) or a member (invitee).
 * Queries the platform-specific users table for is_admin / admin_user_id.
 */
export function useTeamRole(user: AuthUser | null): TeamRoleState {
  const [state, setState] = useState<TeamRoleState>({
    role: null,
    isAdmin: false,
    isMember: false,
    adminUserId: null,
    adminName: null,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setState({ role: null, isAdmin: false, isMember: false, adminUserId: null, adminName: null, loading: false });
      return;
    }

    let cancelled = false;

    const resolve = async () => {
      try {
        const table = `${user.platform}_users`;

        const { data, error } = await supabase
          .from(table)
          .select('is_admin, admin_user_id')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error('useTeamRole: query failed:', error.message);
          setState({ role: null, isAdmin: false, isMember: false, adminUserId: null, adminName: null, loading: false });
          return;
        }

        if (!data) {
          // No row yet — treat as admin (standalone signup creates the row later)
          setState({ role: 'admin', isAdmin: true, isMember: false, adminUserId: null, adminName: null, loading: false });
          return;
        }

        const isAdmin = !!data.is_admin;
        let adminName: string | null = null;

        // If member, fetch admin's name for "Managed by" display
        if (!isAdmin && data.admin_user_id) {
          const { data: adminRow } = await supabase
            .from(table)
            .select('user_info')
            .eq('user_id', data.admin_user_id)
            .is('deleted_at', null)
            .maybeSingle();

          if (!cancelled && adminRow?.user_info) {
            const info = adminRow.user_info;
            adminName = info.name || [info.first_name, info.last_name].filter(Boolean).join(' ') || null;
          }
        }

        if (cancelled) return;

        setState({
          role: isAdmin ? 'admin' : 'member',
          isAdmin,
          isMember: !isAdmin,
          adminUserId: data.admin_user_id ?? null,
          adminName,
          loading: false,
        });
      } catch (err) {
        console.error('useTeamRole error:', err);
        if (!cancelled) {
          setState({ role: null, isAdmin: false, isMember: false, adminUserId: null, adminName: null, loading: false });
        }
      }
    };

    resolve();
    return () => { cancelled = true; };
  }, [user?.id, user?.platform]);

  return state;
}
