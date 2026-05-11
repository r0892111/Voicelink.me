import { useState } from 'react';
import { UserCircle, Mail, Building2, Phone, Languages, Check } from 'lucide-react';
import {
  useDashboardContext,
  type SupportedLanguage,
} from '../hooks/useDashboardContext';
import { useI18n } from '../hooks/useI18n';

const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string }[] = [
  { code: 'nl', label: 'Nederlands' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
];

export function DashboardProfile() {
  const { user, wa, language } = useDashboardContext();
  const { t } = useI18n();
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLanguageChange = async (code: SupportedLanguage) => {
    if (code === language.code) return;
    setSaving(true);
    setError(null);
    try {
      await language.update(code, true);
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

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

      <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-6">
        <div className="flex items-center gap-2.5 text-navy/50 mb-2">
          <Languages className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">
            {t('dash.profile.languageEyebrow')}
          </span>
        </div>
        <h3 className="font-general font-semibold text-navy text-lg mb-1">
          {t('dash.profile.languageTitle')}
        </h3>
        <p className="text-navy/60 text-sm mb-5">{t('dash.profile.languageHelp')}</p>

        <div className="grid grid-cols-2 gap-3 max-w-md">
          {LANGUAGE_OPTIONS.map((lang) => {
            const active = language.code === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                disabled={saving}
                className={`relative flex items-center justify-between p-3 rounded-xl border text-sm transition-colors disabled:opacity-60 ${
                  active
                    ? 'bg-navy text-white border-navy'
                    : 'bg-white text-navy border-navy/10 hover:border-navy/30'
                }`}
              >
                <span className="font-medium">{lang.label}</span>
                {active && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>

        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        {savedAt && !error && (
          <p className="text-emerald-600 text-sm mt-3">{t('dash.profile.languageSaved')}</p>
        )}
      </section>
    </div>
  );
}
