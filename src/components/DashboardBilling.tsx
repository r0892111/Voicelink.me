import { CreditCard, ExternalLink, Loader2, Lock } from 'lucide-react';
import { useDashboardContext } from '../hooks/useDashboardContext';
import { useI18n } from '../hooks/useI18n';

const STATUS_TONE: Record<string, 'positive' | 'warning' | 'neutral'> = {
  active: 'positive',
  trialing: 'positive',
  past_due: 'warning',
  canceled: 'warning',
  incomplete: 'warning',
  unpaid: 'warning',
};

function formatCurrency(amount: number | null, currency: string | null): string {
  if (amount == null || !currency) return '—';
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  });
  return formatter.format(amount / 100);
}

function formatDate(timestamp: number | null, locale: string): string {
  if (!timestamp) return '—';
  return new Date(timestamp * 1000).toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function DashboardBilling() {
  const { role, subscription } = useDashboardContext();
  const { t, currentLanguage } = useI18n();

  if (!role.isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-16">
        <header className="mb-8">
          <h1 className="font-general font-bold text-navy text-3xl tracking-tight">{t('dash.billing.title')}</h1>
          <p className="text-navy/60 mt-1.5">{t('dash.billing.memberLockedSubtitle')}</p>
        </header>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-navy/[0.06] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5 text-navy/50" />
          </div>
          <h2 className="font-general font-semibold text-navy text-lg mb-2">
            {t('dash.billing.memberLockedTitle')}
          </h2>
          <p className="text-navy/60 text-sm max-w-md mx-auto">
            {role.adminName
              ? t('dash.billing.memberLockedBodyWithName', { admin: role.adminName })
              : t('dash.billing.memberLockedBodyNoName')}
          </p>
        </div>
      </div>
    );
  }

  const info = subscription.info;
  const status = info?.subscription_status ?? null;
  const statusLabel = status ? t(`dash.billing.status.${status}`, { defaultValue: status }) : null;
  const statusTone = status ? STATUS_TONE[status] ?? 'neutral' : null;

  return (
    <div className="max-w-4xl mx-auto px-6 pt-10 pb-16">
      <header className="mb-8">
        <div className="flex items-center gap-2.5 text-navy/50 mb-2">
          <CreditCard className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">{t('dash.billing.eyebrow')}</span>
        </div>
        <h1 className="font-general font-bold text-navy text-3xl tracking-tight">{t('dash.billing.title')}</h1>
        <p className="text-navy/60 mt-1.5">{t('dash.billing.subtitle')}</p>
      </header>

      <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-6 mb-6">
        {subscription.checking ? (
          <div className="flex items-center justify-center py-8">
            <div className="dot-loader" />
          </div>
        ) : info ? (
          <>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold text-navy/40 mb-1">
                  {t('dash.billing.currentPlan')}
                </p>
                <h2 className="font-general font-bold text-navy text-2xl">
                  {info.plan_name ?? 'VoiceLink'}
                </h2>
                <p className="text-navy/60 text-sm mt-1">
                  {formatCurrency(info.amount, info.currency)}
                  {info.interval ? ` / ${info.interval}` : ''}
                </p>
              </div>
              {statusLabel && statusTone && (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    statusTone === 'positive'
                      ? 'bg-emerald-50 text-emerald-700'
                      : statusTone === 'warning'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-navy/[0.06] text-navy/70'
                  }`}
                >
                  {statusLabel}
                </span>
              )}
            </div>

            <dl className="grid sm:grid-cols-2 gap-4 mb-6">
              {info.trial_end && (
                <div>
                  <dt className="text-xs uppercase tracking-widest font-semibold text-navy/40 mb-1">
                    {t('dash.billing.trialEnds')}
                  </dt>
                  <dd className="text-navy font-medium">{formatDate(info.trial_end, currentLanguage)}</dd>
                </div>
              )}
              {info.current_period_end && (
                <div>
                  <dt className="text-xs uppercase tracking-widest font-semibold text-navy/40 mb-1">
                    {t('dash.billing.nextRenewal')}
                  </dt>
                  <dd className="text-navy font-medium">{formatDate(info.current_period_end, currentLanguage)}</dd>
                </div>
              )}
            </dl>

            <button
              onClick={subscription.openPortal}
              disabled={subscription.portalLoading}
              className="inline-flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-full font-semibold hover:bg-navy-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {subscription.portalLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              {t('dash.billing.managePortal')}
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-navy/60 mb-4">{t('dash.billing.noSubscription')}</p>
            <button
              onClick={subscription.startTrial}
              className="inline-flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-full font-semibold hover:bg-navy-hover transition-colors"
            >
              {t('dash.billing.startTrial')}
            </button>
          </div>
        )}
      </section>

      <section className="bg-white/60 backdrop-blur-sm rounded-2xl border border-dashed border-navy/15 p-6">
        <p className="text-xs uppercase tracking-widest font-semibold text-navy/40 mb-2">
          {t('dash.billing.comingSoonLabel')}
        </p>
        <h3 className="font-general font-semibold text-navy text-lg mb-1">
          {t('dash.billing.comingSoonTitle')}
        </h3>
        <p className="text-navy/60 text-sm">{t('dash.billing.comingSoonBody')}</p>
      </section>
    </div>
  );
}
