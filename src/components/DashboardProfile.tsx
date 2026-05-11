import { UserCircle, Mail, Building2, ShieldCheck } from 'lucide-react';
import { useDashboardContext } from '../hooks/useDashboardContext';
import { useI18n } from '../hooks/useI18n';

export function DashboardProfile() {
  const { user, role } = useDashboardContext();
  const { t } = useI18n();

  const platformLabel = t(`dash.platforms.${user.platform}`, { defaultValue: user.platform });

  const initials =
    user.name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';

  const roleLabel = role.isAdmin
    ? t('dash.profile.roleAdmin')
    : role.isMember
      ? t('dash.profile.roleMember')
      : t('dash.profile.roleSolo');

  return (
    <div className="max-w-4xl mx-auto px-6 pt-10 pb-16">
      <header className="mb-8">
        <div className="flex items-center gap-2.5 text-navy/50 mb-2">
          <UserCircle className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">{t('dash.profile.eyebrow')}</span>
        </div>
        <h1 className="font-general font-bold text-navy text-3xl tracking-tight">{t('dash.profile.title')}</h1>
        <p className="text-navy/60 mt-1.5">{t('dash.profile.subtitle')}</p>
      </header>

      <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-navy text-white flex items-center justify-center font-general font-semibold text-lg">
            {initials}
          </div>
          <div>
            <h2 className="font-general font-bold text-navy text-xl">{user.name}</h2>
            <p className="text-navy/55 text-sm">
              {t('dash.profile.workspaceSuffix', { platform: platformLabel })}
            </p>
          </div>
        </div>

        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
          <div>
            <dt className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-navy/40 mb-1.5">
              <Mail className="w-3.5 h-3.5" />
              {t('dash.profile.email')}
            </dt>
            <dd className="text-navy font-medium break-all">{user.email}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-navy/40 mb-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {t('dash.profile.crm')}
            </dt>
            <dd className="text-navy font-medium">{platformLabel}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-navy/40 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t('dash.profile.role')}
            </dt>
            <dd className="text-navy font-medium">{roleLabel}</dd>
          </div>
        </dl>

        <p className="text-xs text-navy/45 mt-6 pt-5 border-t border-navy/[0.07]">
          {t('dash.profile.editHint')}
        </p>
      </section>
    </div>
  );
}
