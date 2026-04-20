import { UserCircle, Mail, Building2, Phone } from 'lucide-react';
import { useDashboardContext } from '../hooks/useDashboardContext';
import { useI18n } from '../hooks/useI18n';

export function DashboardProfile() {
  const { user, wa } = useDashboardContext();
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

      <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-6 mb-6">
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
              <Phone className="w-3.5 h-3.5" />
              {t('dash.profile.whatsapp')}
            </dt>
            <dd className="text-navy font-medium">
              {wa.number || (
                <span className="text-navy/45 font-normal">{t('dash.profile.notConnectedYet')}</span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section className="bg-white/60 backdrop-blur-sm rounded-2xl border border-dashed border-navy/15 p-6">
        <p className="text-xs uppercase tracking-widest font-semibold text-navy/40 mb-2">
          {t('dash.profile.comingSoonLabel')}
        </p>
        <h3 className="font-general font-semibold text-navy text-lg mb-1">{t('dash.profile.comingSoonTitle')}</h3>
        <p className="text-navy/60 text-sm">{t('dash.profile.comingSoonBody')}</p>
      </section>
    </div>
  );
}
