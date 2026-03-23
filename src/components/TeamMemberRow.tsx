import React from 'react';
import { Crown, RotateCw, X, Loader2, Wifi, WifiOff } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import type { TeamMember } from '../types/team';

interface TeamMemberRowProps {
  member: TeamMember;
  isCurrentUser: boolean;
  removing: boolean;
  resending: boolean;
  onRemove: (id: string) => void;
  onCancel: (id: string) => void;
  onResend: (id: string) => void;
}

const statusConfig: Record<
  TeamMember['invitationStatus'],
  { label: string; bg: string; text: string; dot: string }
> = {
  accepted: {
    label: 'teamManagement.statusAccepted',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  pending: {
    label: 'teamManagement.statusPending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  declined: {
    label: 'teamManagement.statusDeclined',
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
  expired: {
    label: 'teamManagement.statusExpired',
    bg: 'bg-gray-50',
    text: 'text-gray-500',
    dot: 'bg-gray-400',
  },
};

const whatsappDotColor: Record<TeamMember['whatsappStatus'], string> = {
  active: 'bg-emerald-500',
  pending: 'bg-amber-400',
  not_set: 'bg-gray-300',
};

export const TeamMemberRow: React.FC<TeamMemberRowProps> = ({
  member,
  isCurrentUser,
  removing,
  resending,
  onRemove,
  onCancel,
  onResend,
}) => {
  const { t } = useI18n();
  const isAdmin = member.role === 'admin';
  const status = statusConfig[member.invitationStatus];
  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isPending = member.invitationStatus === 'pending';
  const isExpired = member.invitationStatus === 'expired';
  const isDeclined = member.invitationStatus === 'declined';
  const canResend = isPending || isExpired || isDeclined;
  const canRemove = !isAdmin && member.invitationStatus === 'accepted';
  const canCancel = !isAdmin && isPending;

  return (
    <div className="group flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-navy/[0.02] transition-colors">
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold font-general ${
          isAdmin
            ? 'bg-navy text-white'
            : 'bg-navy/[0.07] text-navy/70'
        }`}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-navy font-general truncate">
            {member.name}
          </span>

          {isAdmin && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-navy/[0.06] text-navy/70 text-xs font-medium font-instrument">
              <Crown className="w-3 h-3" />
              {t('teamManagement.accountOwner')}
            </span>
          )}

          {isCurrentUser && !isAdmin && (
            <span className="text-xs text-navy/40 font-instrument">
              ({t('teamManagement.you')})
            </span>
          )}
        </div>

        <p className="text-xs text-navy/50 font-instrument truncate mt-0.5">
          {member.email}
        </p>
      </div>

      {/* WhatsApp status dot */}
      <div className="flex items-center gap-1.5" title={`WhatsApp: ${member.whatsappStatus}`}>
        {member.whatsappStatus === 'active' ? (
          <Wifi className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-gray-300" />
        )}
        <div
          className={`w-2 h-2 rounded-full ${whatsappDotColor[member.whatsappStatus]}`}
        />
      </div>

      {/* Status pill */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium font-instrument ${status.bg} ${status.text}`}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
        {t(status.label)}
      </div>

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {canResend && (
          <button
            onClick={() => onResend(member.id)}
            disabled={resending}
            className="p-1.5 rounded-lg text-navy/40 hover:text-navy hover:bg-navy/[0.06] transition-colors disabled:opacity-50"
            title={t('teamManagement.resendInvitation')}
          >
            {resending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCw className="w-4 h-4" />
            )}
          </button>
        )}

        {canCancel && (
          <button
            onClick={() => onCancel(member.id)}
            disabled={removing}
            className="p-1.5 rounded-lg text-navy/40 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            title={t('teamManagement.cancelInvitation')}
          >
            {removing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </button>
        )}

        {canRemove && (
          <button
            onClick={() => onRemove(member.id)}
            disabled={removing}
            className="p-1.5 rounded-lg text-navy/40 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            title={t('teamManagement.removeMember')}
          >
            {removing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
