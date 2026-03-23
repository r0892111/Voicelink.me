// ── Team management service ──────────────────────────────────────────────────
// SRP: only knows how to call team-related edge functions over HTTP.
// Follows the same pattern as whatsappService.ts.

import { supabase } from '../lib/supabase';
import type { TeamMember, TeamleaderEmployee, TeamInfo, InviteMethod } from '../types/team';

export interface ITeamService {
  getTeamMembers(): Promise<TeamInfo>;
  getTeamleaderEmployees(): Promise<TeamleaderEmployee[]>;
  inviteMember(
    employee: { teamleaderId: string; name: string; email: string; phone?: string },
    method: InviteMethod,
  ): Promise<TeamInfo>;
  cancelInvitation(memberId: string): Promise<TeamInfo>;
  removeMember(memberId: string): Promise<TeamInfo>;
  resendInvitation(memberId: string, method: InviteMethod): Promise<TeamInfo>;
}

class TeamServiceImpl implements ITeamService {
  private readonly base: string;

  constructor(supabaseUrl: string) {
    this.base = supabaseUrl;
  }

  async getTeamMembers(): Promise<TeamInfo> {
    const data = await this.call('team-members', 'GET');
    if (!data.success) throw new Error(data.error as string ?? 'Failed to fetch team members.');
    return data.team as TeamInfo;
  }

  async getTeamleaderEmployees(): Promise<TeamleaderEmployee[]> {
    const data = await this.call('teamleader-employees', 'GET');
    if (!data.success) throw new Error(data.error as string ?? 'Failed to fetch employees.');
    return data.employees as TeamleaderEmployee[];
  }

  async inviteMember(
    employee: { teamleaderId: string; name: string; email: string; phone?: string },
    method: InviteMethod,
  ): Promise<TeamInfo> {
    const data = await this.call('team-invite', 'POST', {
      action: 'send',
      teamleader_id: employee.teamleaderId,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      invite_method: method,
    });
    if (!data.success) throw new Error(data.error as string ?? 'Failed to send invitation.');
    return data.team as TeamInfo;
  }

  async cancelInvitation(memberId: string): Promise<TeamInfo> {
    const data = await this.call('team-invite', 'POST', {
      action: 'cancel',
      member_id: memberId,
    });
    if (!data.success) throw new Error(data.error as string ?? 'Failed to cancel invitation.');
    return data.team as TeamInfo;
  }

  async removeMember(memberId: string): Promise<TeamInfo> {
    const data = await this.call('team-invite', 'POST', {
      action: 'remove',
      member_id: memberId,
    });
    if (!data.success) throw new Error(data.error as string ?? 'Failed to remove member.');
    return data.team as TeamInfo;
  }

  async resendInvitation(memberId: string, method: InviteMethod): Promise<TeamInfo> {
    const data = await this.call('team-invite', 'POST', {
      action: 'resend',
      member_id: memberId,
      invite_method: method,
    });
    if (!data.success) throw new Error(data.error as string ?? 'Failed to resend invitation.');
    return data.team as TeamInfo;
  }

  // ── internal ───────────────────────────────────────────────────────────────

  private async call(
    fn: string,
    method: 'GET' | 'POST',
    body?: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error('Not authenticated.');

    const opts: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    if (method === 'POST' && body) {
      opts.body = JSON.stringify(body);
    }

    const res = await fetch(`${this.base}/functions/v1/${fn}`, opts);
    return res.json();
  }
}

// Singleton — imported by hooks, never instantiated by components directly.
export const teamService: ITeamService = new TeamServiceImpl(
  import.meta.env.VITE_SUPABASE_URL,
);
