import { useEffect, useState } from 'react';
import { CreditCard, ExternalLink, Loader2, Lock, Plus, Sparkles } from 'lucide-react';
import { useDashboardContext } from '../hooks/useDashboardContext';
import { useI18n } from '../hooks/useI18n';
import { StripeService } from '../services/stripeService';
import { getStripePriceId, getActiveCreditPacks, type CreditPack } from '../lib/teamPricing';
import { withUTM } from '../utils/utm';

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

  const handleUpgradeToStarter = async () => {
    const priceId = await getStripePriceId('starter', 'month');
    if (!priceId) return;
    await StripeService.createCheckoutSession({
      priceId,
      quantity: 1,
      successUrl: `${window.location.origin}/dashboard`,
      cancelUrl: `${window.location.origin}/dashboard/billing`,
    });
  };

  const [creditPacks, setCreditPacks] = useState<CreditPack[]>([]);
  useEffect(() => {
    getActiveCreditPacks().then(setCreditPacks).catch(() => setCreditPacks([]));
  }, []);

  const handleBuyCreditPack = async (pack: CreditPack) => {
    await StripeService.createCheckoutSession({
      priceId: pack.stripe_price_id,
      quantity: 1,
      mode: 'payment',
      successUrl: `${window.location.origin}/dashboard/billing`,
      cancelUrl: `${window.location.origin}/dashboard/billing`,
    });
  };

  const formatPackPrice = (pack: CreditPack) => {
    const amount = pack.amount_cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: pack.currency.toUpperCase(),
    }).format(amount);
  };

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

            <div className="flex flex-wrap gap-2">
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
              {info.voicelink_key === 'free_trial_monthly' && (
                <button
                  onClick={handleUpgradeToStarter}
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-emerald-700 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  {t('dash.billing.upgradeCta')}
                </button>
              )}
            </div>

            {info.voicelink_key === 'free_trial_monthly' && (
              <div className="mt-6 p-4 rounded-xl bg-amber-50/60 border border-amber-200/60">
                <p className="text-sm font-semibold text-navy mb-1">
                  {t('dash.billing.upgradeBannerTitle')}
                </p>
                <p className="text-xs text-navy/60 mb-2">
                  {t('dash.billing.upgradeBannerBody')}
                </p>
                <a
                  href={withUTM('/')}
                  className="text-xs font-semibold text-navy hover:text-navy-hover underline underline-offset-2"
                >
                  {t('dash.billing.compareAllPlans')}
                </a>
              </div>
            )}
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

      {info && creditPacks.length > 0 && (
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-6">
          <div className="flex items-center gap-2.5 text-navy/50 mb-2">
            <Plus className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-semibold">
              {t('dash.billing.creditPacksEyebrow')}
            </span>
          </div>
          <h3 className="font-general font-semibold text-navy text-lg mb-1">
            {t('dash.billing.creditPacksTitle')}
          </h3>
          <p className="text-navy/60 text-sm mb-5">
            {t('dash.billing.creditPacksBody')}
          </p>
          <ul className="grid sm:grid-cols-2 gap-3">
            {creditPacks.map((pack) => (
              <li
                key={pack.voicelink_key}
                className="flex items-center justify-between gap-3 p-4 rounded-xl border border-navy/[0.07] bg-white"
              >
                <div>
                  <p className="font-general font-semibold text-navy text-sm">
                    {t('dash.billing.creditPackQty', { count: pack.credits })}
                  </p>
                  <p className="text-xs text-navy/55">{formatPackPrice(pack)}</p>
                </div>
                <button
                  onClick={() => handleBuyCreditPack(pack)}
                  className="inline-flex items-center gap-1.5 bg-navy text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-navy-hover transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t('dash.billing.buyPack')}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
