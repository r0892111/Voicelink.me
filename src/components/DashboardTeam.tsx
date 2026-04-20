import { Users, Lock } from 'lucide-react';
import { useDashboardContext } from '../hooks/useDashboardContext';
import { useI18n } from '../hooks/useI18n';
import { TeamManagement } from './TeamManagement';

export function DashboardTeam() {
  const { user, role } = useDashboardContext();
  const { t } = useI18n();

  if (role.loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-16">
        <div className="flex items-center justify-center py-20">
          <div className="dot-loader" />
        </div>
      </div>
    );
  }

  if (!role.isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-16">
        <header className="mb-8">
          <h1 className="font-general font-bold text-navy text-3xl tracking-tight">{t('dash.team.title')}</h1>
          <p className="text-navy/60 mt-1.5">{t('dash.team.subtitleMember')}</p>
        </header>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-navy/[0.06] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5 text-navy/50" />
          </div>
          <h2 className="font-general font-semibold text-navy text-lg mb-2">{t('dash.team.memberLockedTitle')}</h2>
          <p className="text-navy/60 text-sm max-w-md mx-auto">
            {role.adminName
              ? t('dash.team.memberLockedBodyWithName', { admin: role.adminName })
              : t('dash.team.memberLockedBodyNoName')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">
      <header className="mb-8">
        <div className="flex items-center gap-2.5 text-navy/50 mb-2">
          <Users className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">{t('dash.team.eyebrow')}</span>
        </div>
        <h1 className="font-general font-bold text-navy text-3xl tracking-tight">{t('dash.team.title')}</h1>
        <p className="text-navy/60 mt-1.5">{t('dash.team.subtitleAdmin')}</p>
      </header>

      <TeamManagement user={user} />
    </div>
  );
}
