import { useEffect, useState } from 'react';
import { Settings, Phone, CheckCircle2, Lock, ArrowRight, Languages, Check } from 'lucide-react';
import {
  useDashboardContext,
  type SupportedLanguage,
} from '../hooks/useDashboardContext';
import { useI18n } from '../hooks/useI18n';
import { WhatsAppConnectForm } from './WhatsAppConnectForm';

const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string }[] = [
  { code: 'nl', label: 'Nederlands' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
];

export function DashboardSettings() {
  const { wa, subscription, role, language } = useDashboardContext();
  const { t } = useI18n();
  const isConnected = wa.status === 'active';
  const subStatus = subscription.info?.subscription_status;
  const canConnect = subStatus === 'active' || subStatus === 'trialing';

  const [langSaving, setLangSaving] = useState(false);
  const [langSavedAt, setLangSavedAt] = useState<number | null>(null);
  const [langError, setLangError] = useState<string | null>(null);

  const handleLanguageChange = async (code: SupportedLanguage) => {
    if (code === language.code) return;
    setLangSaving(true);
    setLangError(null);
    try {
      await language.update(code, true);
      setLangSavedAt(Date.now());
    } catch (err) {
      setLangError(err instanceof Error ? err.message : String(err));
    } finally {
      setLangSaving(false);
    }
  };

  useEffect(() => {
    if (!isConnected && canConnect && !wa.open) wa.toggle();
  }, [isConnected, canConnect]);

  return (
    <div className="max-w-4xl mx-auto px-6 pt-10 pb-16">
      <header className="mb-8">
        <div className="flex items-center gap-2.5 text-navy/50 mb-2">
          <Settings className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">{t('dash.settings.eyebrow')}</span>
        </div>
        <h1 className="font-general font-bold text-navy text-3xl tracking-tight">{t('dash.settings.title')}</h1>
        <p className="text-navy/60 mt-1.5">{t('dash.settings.subtitle')}</p>
      </header>

      <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy/[0.06] flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-navy/70" />
            </div>
            <div>
              <h2 className="font-general font-semibold text-navy text-lg">{t('dash.settings.whatsappTitle')}</h2>
              <p className="text-navy/55 text-sm">{t('dash.settings.whatsappSubtitle')}</p>
            </div>
          </div>
          {isConnected && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t('dash.settings.activeChip')}
            </span>
          )}
        </div>

        {isConnected ? (
          <div className="bg-navy/[0.03] rounded-xl px-4 py-3">
            <p className="text-xs uppercase tracking-widest font-semibold text-navy/40 mb-0.5">
              {t('dash.settings.connectedNumber')}
            </p>
            <p className="text-navy font-medium font-mono">{wa.number}</p>
          </div>
        ) : !canConnect && role.isMember ? (
          <div className="bg-navy/[0.03] border border-navy/[0.07] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-navy/[0.06] flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-navy/60" />
            </div>
            <div className="flex-1">
              <p className="font-general font-semibold text-navy text-sm">{t('dash.settings.waitingAdminTitle')}</p>
              <p className="text-navy/55 text-sm mt-0.5">
                {role.adminName
                  ? t('dash.settings.waitingAdminBodyWithName', { admin: role.adminName })
                  : t('dash.settings.waitingAdminBodyNoName')}
              </p>
            </div>
          </div>
        ) : !canConnect ? (
          <div className="bg-navy/[0.03] border border-navy/[0.07] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-navy/[0.06] flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-navy/60" />
            </div>
            <div className="flex-1">
              <p className="font-general font-semibold text-navy text-sm">{t('dash.settings.startTrialTitle')}</p>
              <p className="text-navy/55 text-sm mt-0.5">{t('dash.settings.startTrialBody')}</p>
            </div>
            <button
              onClick={subscription.startTrial}
              className="flex-shrink-0 inline-flex items-center gap-2 bg-navy hover:bg-navy-hover text-white font-semibold text-sm py-2.5 px-5 rounded-full transition-colors"
            >
              {t('dash.settings.startTrialCta')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <WhatsAppConnectForm
            open={wa.open}
            step={wa.step}
            phone={wa.phone}
            otp={wa.otp}
            busy={wa.busy}
            error={wa.error}
            success={wa.success}
            onPhoneChange={wa.setPhone}
            onOtpChange={wa.setOtp}
            onSendOtp={wa.sendOtp}
            onVerifyOtp={wa.verifyOtp}
            onBackToPhone={wa.backToPhone}
            onResendOtp={wa.resendOtp}
          />
        )}
      </section>

      <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-navy/[0.06] flex items-center justify-center flex-shrink-0">
            <Languages className="w-5 h-5 text-navy/70" />
          </div>
          <div>
            <h2 className="font-general font-semibold text-navy text-lg">
              {t('dash.settings.languageTitle')}
            </h2>
            <p className="text-navy/55 text-sm">{t('dash.settings.languageHelp')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-md">
          {LANGUAGE_OPTIONS.map((lang) => {
            const active = language.code === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                disabled={langSaving}
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

        {langError && <p className="text-red-600 text-sm mt-3">{langError}</p>}
        {langSavedAt && !langError && (
          <p className="text-emerald-600 text-sm mt-3">{t('dash.settings.languageSaved')}</p>
        )}
      </section>
    </div>
  );
}
