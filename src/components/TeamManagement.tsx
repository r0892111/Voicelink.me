import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Plus,
  ChevronDown,
  Search,
  Send,
  Mail,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { useTeamManagement } from '../hooks/useTeamManagement';
import { TeamMemberRow } from './TeamMemberRow';
import { ConfirmDialog } from './ui/ConfirmDialog';
import type { AuthUser } from '../hooks/useAuth';
import type { TeamleaderEmployee, InviteMethod } from '../types/team';

interface TeamManagementProps {
  user: AuthUser;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ user }) => {
  const { t } = useI18n();
  const team = useTeamManagement(user);

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<TeamleaderEmployee | null>(null);
  const [inviteMethod, setInviteMethod] = useState<InviteMethod>('email');

  // Confirm dialog
  const [confirmTarget, setConfirmTarget] = useState<{
    action: 'remove' | 'cancel';
    memberId: string;
    memberName: string;
  } | null>(null);

  // Auto-clear success message
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (team.successMessage) {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => team.clearSuccess(), 4000);
    }
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, [team.successMessage]);

  // Fetch employees when invite panel opens
  useEffect(() => {
    if (showInvitePanel && team.employees.length === 0 && !team.loadingEmployees) {
      team.fetchEmployees();
    }
  }, [showInvitePanel]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const seatLimitReached =
    team.seatLimit !== null && team.seatsUsed >= team.seatLimit;

  const seatPercent =
    team.seatLimit !== null && team.seatLimit > 0
      ? Math.min((team.seatsUsed / team.seatLimit) * 100, 100)
      : 0;

  const handleInvite = async () => {
    if (!selectedEmployee) return;
    await team.invite(selectedEmployee, inviteMethod);
    setSelectedEmployee(null);
    setInviteMethod('email');
  };

  const handleConfirmAction = async () => {
    if (!confirmTarget) return;
    if (confirmTarget.action === 'remove') {
      await team.remove(confirmTarget.memberId);
    } else {
      await team.cancel(confirmTarget.memberId);
    }
    setConfirmTarget(null);
  };

  const handleResend = async (memberId: string) => {
    await team.resend(memberId, 'email');
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section className="px-6 pb-8">
      <div className="max-w-4xl mx-auto">
      <div
        className="bg-white/80 backdrop-blur-sm rounded-3xl border border-navy/[0.07] shadow-sm overflow-hidden"
        style={{
          animation: 'hero-fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both',
        }}
      >
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-navy/[0.06] flex items-center justify-center">
                <Users className="w-4.5 h-4.5 text-navy" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-navy font-general">
                  {t('teamManagement.title')}
                </h2>
                <p className="text-xs text-navy/50 font-instrument">
                  {t('teamManagement.subtitle')}
                </p>
              </div>
            </div>

            {/* Seat counter */}
            {team.seatLimit !== null && (
              <div className="text-right">
                <p className="text-xs font-medium text-navy/60 font-instrument mb-1">
                  {team.seatsUsed} / {team.seatLimit} {t('teamManagement.seatsUsed')}
                </p>
                <div className="w-32 h-1.5 bg-navy/[0.06] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      seatLimitReached ? 'bg-amber-500' : 'bg-navy'
                    }`}
                    style={{ width: `${seatPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Seat limit warning */}
          {seatLimitReached && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200/60 mb-4"
              style={{
                animation: 'hero-fade-up 0.3s cubic-bezier(0.22,1,0.36,1) both',
              }}
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700 font-instrument flex-1">
                {t('teamManagement.seatLimitReached')}
              </p>
              <a
                href="/dashboard?tab=billing"
                className="text-xs font-semibold text-navy hover:text-navy-hover underline underline-offset-2 font-instrument"
              >
                {t('teamManagement.upgradePlan')}
              </a>
            </div>
          )}
        </div>

        {/* ── Success toast ─────────────────────────────────────────────────── */}
        {team.successMessage && (
          <div
            className="mx-6 mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200/60"
            style={{
              animation: 'hero-fade-up 0.25s cubic-bezier(0.22,1,0.36,1) both',
            }}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-xs text-emerald-700 font-instrument flex-1">
              {team.successMessage}
            </p>
            <button
              onClick={team.clearSuccess}
              className="p-0.5 rounded text-emerald-400 hover:text-emerald-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── Error toast ───────────────────────────────────────────────────── */}
        {team.error && (
          <div
            className="mx-6 mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200/60"
            style={{
              animation: 'hero-fade-up 0.25s cubic-bezier(0.22,1,0.36,1) both',
            }}
          >
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600 font-instrument flex-1">
              {team.error}
            </p>
            <button
              onClick={team.clearError}
              className="p-0.5 rounded text-red-300 hover:text-red-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── Member list ───────────────────────────────────────────────────── */}
        <div className="px-6 pb-2">
          {team.loadingMembers ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl"
                  style={{
                    animation: `hero-fade-up 0.4s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s both`,
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-navy/[0.06] animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-32 bg-navy/[0.06] rounded animate-pulse" />
                    <div className="h-3 w-48 bg-navy/[0.04] rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-20 bg-navy/[0.04] rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : team.members.length === 0 ? (
            <div
              className="text-center py-8"
              style={{
                animation: 'hero-fade-up 0.4s cubic-bezier(0.22,1,0.36,1) both',
              }}
            >
              <Users className="w-10 h-10 text-navy/20 mx-auto mb-3" />
              <p className="text-sm text-navy/50 font-instrument">
                {t('teamManagement.noMembers')}
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {team.members.map((member, i) => (
                <div
                  key={member.id}
                  style={{
                    animation: `hero-fade-up 0.4s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s both`,
                  }}
                >
                  <TeamMemberRow
                    member={member}
                    isCurrentUser={member.userId === user.id}
                    removing={team.removing === member.id}
                    resending={team.resending === member.id}
                    onRemove={(id) => {
                      const m = team.members.find((m) => m.id === id);
                      if (m) setConfirmTarget({ action: 'remove', memberId: id, memberName: m.name });
                    }}
                    onCancel={(id) => {
                      const m = team.members.find((m) => m.id === id);
                      if (m) setConfirmTarget({ action: 'cancel', memberId: id, memberName: m.name });
                    }}
                    onResend={handleResend}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Divider ───────────────────────────────────────────────────────── */}
        <div className="mx-6 border-t border-navy/[0.06]" />

        {/* ── Add member toggle ─────────────────────────────────────────────── */}
        <div className="px-6 py-4">
          <button
            onClick={() => setShowInvitePanel((p) => !p)}
            disabled={seatLimitReached}
            className={`flex items-center gap-2 text-sm font-semibold font-instrument transition-colors ${
              seatLimitReached
                ? 'text-navy/30 cursor-not-allowed'
                : 'text-navy hover:text-navy-hover'
            }`}
          >
            <Plus className="w-4 h-4" />
            {t('teamManagement.addNewMember')}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showInvitePanel ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* ── Invite panel ──────────────────────────────────────────────────── */}
        {showInvitePanel && !seatLimitReached && (
          <div
            className="px-6 pb-6 space-y-4"
            style={{
              animation: 'hero-fade-up 0.3s cubic-bezier(0.22,1,0.36,1) both',
            }}
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/30" />
              <input
                type="text"
                value={team.searchQuery}
                onChange={(e) => team.setSearchQuery(e.target.value)}
                placeholder={t('teamManagement.searchEmployees')}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-navy/[0.03] border border-navy/[0.08] text-sm text-navy placeholder:text-navy/30 font-instrument focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy/20 transition-all"
              />
            </div>

            {/* Employee list */}
            {team.loadingEmployees ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 text-navy/30 animate-spin" />
              </div>
            ) : team.filteredEmployees.length === 0 ? (
              <p className="text-xs text-navy/40 font-instrument text-center py-4">
                {team.searchQuery
                  ? t('teamManagement.noEmployeesFound')
                  : t('teamManagement.noEmployeesAvailable')}
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-navy/[0.06] p-1">
                {team.filteredEmployees.map((emp) => {
                  const isSelected = selectedEmployee?.id === emp.id;
                  return (
                    <button
                      key={emp.id}
                      onClick={() =>
                        setSelectedEmployee(isSelected ? null : emp)
                      }
                      disabled={emp.alreadyInvited}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        emp.alreadyInvited
                          ? 'opacity-40 cursor-not-allowed'
                          : isSelected
                          ? 'bg-navy/[0.06]'
                          : 'hover:bg-navy/[0.03]'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-navy/[0.07] flex items-center justify-center text-xs font-semibold text-navy/60 font-general flex-shrink-0">
                        {emp.firstName[0]}
                        {emp.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy font-instrument truncate">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-xs text-navy/40 font-instrument truncate">
                          {emp.email}
                        </p>
                      </div>
                      {emp.alreadyInvited && (
                        <span className="text-xs text-navy/30 font-instrument flex-shrink-0">
                          {t('teamManagement.alreadyInvited')}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected employee card + invite method */}
            {selectedEmployee && (
              <div
                className="rounded-xl bg-navy/[0.03] border border-navy/[0.08] p-4 space-y-3"
                style={{
                  animation:
                    'hero-fade-up 0.25s cubic-bezier(0.22,1,0.36,1) both',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-navy/[0.07] flex items-center justify-center text-sm font-semibold text-navy/60 font-general">
                    {selectedEmployee.firstName[0]}
                    {selectedEmployee.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy font-general truncate">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </p>
                    <p className="text-xs text-navy/50 font-instrument truncate">
                      {selectedEmployee.email}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedEmployee(null)}
                    className="p-1 rounded-lg text-navy/30 hover:text-navy hover:bg-navy/[0.06] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Invite method selector */}
                <div>
                  <p className="text-xs font-medium text-navy/50 font-instrument mb-2">
                    {t('teamManagement.inviteVia')}
                  </p>
                  <div className="flex gap-1.5">
                    {(
                      [
                        { key: 'email', icon: Mail, label: t('teamManagement.methodEmail') },
                        { key: 'whatsapp', icon: MessageSquare, label: t('teamManagement.methodWhatsApp') },
                        { key: 'both', icon: Send, label: t('teamManagement.methodBoth') },
                      ] as const
                    ).map(({ key, icon: Icon, label }) => (
                      <button
                        key={key}
                        onClick={() => setInviteMethod(key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-instrument transition-all ${
                          inviteMethod === key
                            ? 'bg-navy text-white shadow-sm'
                            : 'bg-white text-navy/60 hover:text-navy hover:bg-navy/[0.04] border border-navy/[0.08]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Send button */}
                <button
                  onClick={handleInvite}
                  disabled={team.inviting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-navy text-white text-sm font-semibold rounded-full hover:bg-navy-hover transition-colors font-instrument disabled:opacity-70"
                >
                  {team.inviting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {t('teamManagement.sendInvitation')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Confirm dialog ──────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmTarget !== null}
        title={
          confirmTarget?.action === 'remove'
            ? t('teamManagement.removeMember')
            : t('teamManagement.cancelInvite')
        }
        message={
          confirmTarget?.action === 'remove'
            ? t('teamManagement.confirmRemove', { name: confirmTarget?.memberName ?? '' })
            : t('teamManagement.confirmCancel', { name: confirmTarget?.memberName ?? '' })
        }
        confirmLabel={
          confirmTarget?.action === 'remove'
            ? t('teamManagement.removeMember')
            : t('teamManagement.cancelInvite')
        }
        cancelLabel={t('common.cancel')}
        destructive
        loading={team.removing !== null}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmTarget(null)}
      />
      </div>
    </section>
  );
};
