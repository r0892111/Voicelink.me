import { useState, useCallback, useEffect } from 'react';
import { teamService } from '../services/teamService';
import type { TeamMember, TeamleaderEmployee, InviteMethod } from '../types/team';
import type { AuthUser } from './useAuth';

interface TeamManagementState {
  // Team data
  members: TeamMember[];
  seatsUsed: number;
  seatLimit: number | null;
  tierKey: string;

  // Employee list (for invite panel)
  employees: TeamleaderEmployee[];
  searchQuery: string;

  // Operation states
  loadingMembers: boolean;
  loadingEmployees: boolean;
  inviting: boolean;
  removing: string | null;    // member ID being removed/cancelled
  resending: string | null;   // member ID being resent
  error: string | null;
  successMessage: string | null;
}

export interface UseTeamManagement extends TeamManagementState {
  fetchMembers: () => Promise<void>;
  fetchEmployees: () => Promise<void>;
  setSearchQuery: (q: string) => void;
  invite: (employee: TeamleaderEmployee, method: InviteMethod) => Promise<void>;
  cancel: (memberId: string) => Promise<void>;
  remove: (memberId: string) => Promise<void>;
  resend: (memberId: string, method: InviteMethod) => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
  filteredEmployees: TeamleaderEmployee[];
}

export function useTeamManagement(user: AuthUser | null): UseTeamManagement {
  const [state, setState] = useState<TeamManagementState>({
    members: [],
    seatsUsed: 0,
    seatLimit: null,
    tierKey: 'starter',
    employees: [],
    searchQuery: '',
    loadingMembers: true,
    loadingEmployees: false,
    inviting: false,
    removing: null,
    resending: null,
    error: null,
    successMessage: null,
  });

  const patch = (p: Partial<TeamManagementState>) => setState((s) => ({ ...s, ...p }));

  const applyTeamInfo = (team: { members: TeamMember[]; seatsUsed: number; seatLimit: number | null; tierKey: string }) => {
    patch({
      members: team.members,
      seatsUsed: team.seatsUsed,
      seatLimit: team.seatLimit,
      tierKey: team.tierKey,
    });
  };

  // ── Fetch members on mount ─────────────────────────────────────────────────
  const fetchMembers = useCallback(async () => {
    patch({ loadingMembers: true, error: null });
    try {
      const team = await teamService.getTeamMembers();
      applyTeamInfo(team);
    } catch (err) {
      patch({ error: err instanceof Error ? err.message : 'Failed to load team.' });
    } finally {
      patch({ loadingMembers: false });
    }
  }, []);

  useEffect(() => {
    if (user) fetchMembers();
  }, [user?.id]);

  // ── Fetch Teamleader employees (on demand) ────────────────────────────────
  const fetchEmployees = useCallback(async () => {
    patch({ loadingEmployees: true, error: null });
    try {
      const employees = await teamService.getTeamleaderEmployees();
      patch({ employees });
    } catch (err) {
      patch({ error: err instanceof Error ? err.message : 'Failed to load employees.' });
    } finally {
      patch({ loadingEmployees: false });
    }
  }, []);

  // ── Invite ─────────────────────────────────────────────────────────────────
  const invite = useCallback(async (employee: TeamleaderEmployee, method: InviteMethod) => {
    patch({ inviting: true, error: null, successMessage: null });
    try {
      const team = await teamService.inviteMember(
        {
          teamleaderId: employee.id,
          name: `${employee.firstName} ${employee.lastName}`.trim(),
          email: employee.email,
          phone: employee.phone,
        },
        method,
      );
      applyTeamInfo(team);

      // Mark employee as already invited in local list
      setState((s) => ({
        ...s,
        employees: s.employees.map((e) =>
          e.id === employee.id ? { ...e, alreadyInvited: true } : e,
        ),
        successMessage: `Invitation sent to ${employee.email}`,
        inviting: false,
      }));
    } catch (err) {
      patch({ error: err instanceof Error ? err.message : 'Failed to invite.', inviting: false });
    }
  }, []);

  // ── Cancel ─────────────────────────────────────────────────────────────────
  const cancel = useCallback(async (memberId: string) => {
    patch({ removing: memberId, error: null, successMessage: null });
    try {
      const team = await teamService.cancelInvitation(memberId);
      applyTeamInfo(team);
      patch({ successMessage: 'Invitation cancelled', removing: null });
    } catch (err) {
      patch({ error: err instanceof Error ? err.message : 'Failed to cancel.', removing: null });
    }
  }, []);

  // ── Remove ─────────────────────────────────────────────────────────────────
  const remove = useCallback(async (memberId: string) => {
    patch({ removing: memberId, error: null, successMessage: null });
    try {
      const team = await teamService.removeMember(memberId);
      applyTeamInfo(team);
      patch({ successMessage: 'Member removed', removing: null });
    } catch (err) {
      patch({ error: err instanceof Error ? err.message : 'Failed to remove.', removing: null });
    }
  }, []);

  // ── Resend ─────────────────────────────────────────────────────────────────
  const resend = useCallback(async (memberId: string, method: InviteMethod) => {
    patch({ resending: memberId, error: null, successMessage: null });
    try {
      const team = await teamService.resendInvitation(memberId, method);
      applyTeamInfo(team);
      patch({ successMessage: 'Invitation resent', resending: null });
    } catch (err) {
      patch({ error: err instanceof Error ? err.message : 'Failed to resend.', resending: null });
    }
  }, []);

  // ── Filtered employees (client-side search) ───────────────────────────────
  const q = state.searchQuery.toLowerCase();
  const filteredEmployees = q
    ? state.employees.filter(
        (e) =>
          e.firstName.toLowerCase().includes(q) ||
          e.lastName.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q),
      )
    : state.employees;

  return {
    ...state,
    fetchMembers,
    fetchEmployees,
    setSearchQuery: (searchQuery: string) => patch({ searchQuery }),
    invite,
    cancel,
    remove,
    resend,
    clearError: () => patch({ error: null }),
    clearSuccess: () => patch({ successMessage: null }),
    filteredEmployees,
  };
}
