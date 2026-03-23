// ── Team management types ────────────────────────────────────────────────────

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';
export type MemberRole = 'admin' | 'member';
export type InviteMethod = 'email' | 'whatsapp' | 'both';

export interface TeamMember {
  id: string;                          // platform_users row id
  userId: string | null;               // Supabase auth user ID (null for pending invites)
  name: string;
  email: string;
  role: MemberRole;
  invitationStatus: InvitationStatus;
  invitedAt: string | null;
  whatsappStatus: 'not_set' | 'pending' | 'active';
  teamleaderId: string;
}

export interface TeamleaderEmployee {
  id: string;                          // Teamleader user ID
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  alreadyInvited: boolean;            // true if already a team member or pending invite
}

export interface TeamInfo {
  members: TeamMember[];
  seatsUsed: number;
  seatLimit: number | null;            // null for enterprise (unlimited)
  tierKey: string;
}
