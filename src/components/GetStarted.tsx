import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Minus, Plus, Loader2, ShieldCheck } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { withUTM } from '../utils/utm';
import { plans, getPricePerUser, formatPrice } from '../lib/pricingCatalog';
import type { BillingPeriod } from './BillingPeriodSwitch';
import { markPendingCheckout } from '../utils/pendingCheckout';
import { AuthService } from '../services/authService';

const PAID_KEYS = ['starter', 'professional', 'business'];
const MAX_SEATS = 50;

// Plan-aware "get started" page. Paid pricing CTAs route here with the choice
// in the URL (?plan=&interval=&seats=). Shows an order summary, then stamps the
// pendingCheckout bridge and starts Teamleader OAuth — AuthCallback resolves the
// Stripe Checkout after OAuth. The free trial keeps its own /signup entry.
export function GetStarted() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const planKey = searchParams.get('plan') ?? '';
  const interval: BillingPeriod = searchParams.get('interval') === 'yearly' ? 'yearly' : 'monthly';
  const plan = plans.find((p) => p.key === planKey);
  const valid = !!plan && !plan.isFreeTrial && PAID_KEYS.includes(plan.key);

  // Single-seat plans (Starter) lock to 1; Professional/Business get a counter.
  const allowSeats = plan?.key === 'professional' || plan?.key === 'business';
  const initialSeats = allowSeats
    ? Math.max(1, Math.min(MAX_SEATS, parseInt(searchParams.get('seats') ?? '1', 10) || 1))
    : 1;
  const [seats, setSeats] = useState(initialSeats);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bad/absent plan → back to pricing.
  useEffect(() => {
    if (!valid) navigate(withUTM('/#pricing'), { replace: true });
  }, [valid, navigate]);

  if (!valid || !plan) return null;

  const updateSeats = (next: number) => {
    const clamped = Math.max(1, Math.min(MAX_SEATS, next));
    setSeats(clamped);
    const params = new URLSearchParams(searchParams);
    params.set('seats', String(clamped));
    setSearchParams(params, { replace: true });
  };

  const pricePerUser = getPricePerUser(plan, seats, interval);
  const total = pricePerUser * seats;
  const monthlyPerUser = getPricePerUser(plan, seats, 'monthly');
  const yearlySavings = interval === 'yearly' ? monthlyPerUser * 12 * 0.2 * seats : 0;

  const handleContinue = async () => {
    if (starting) return;
    setStarting(true);
    setError(null);
    // Mirror AuthPage: cache platform before OAuth so AuthCallback resolves the
    // right table. Re-stamp the checkout intent here so its TTL starts now.
    localStorage.setItem('userPlatform', 'teamleader');
    localStorage.setItem('auth_provider', 'teamleader');
    markPendingCheckout({ tierKey: plan.key, interval, quantity: seats });
    const result = await AuthService.createTeamleaderAuth().initiateAuth();
    if (!result.success) {
      localStorage.removeItem('userPlatform');
      localStorage.removeItem('auth_provider');
      setStarting(false);
      setError(result.error ?? t('getStarted.error'));
    }
    // On success initiateAuth redirects the page away.
  };

  const planName = t(`pricing.cards.${plan.key}.name`);
  const intervalLabel = interval === 'yearly' ? t('pricing.yearly') : t('pricing.monthly');

  return (
    <div className="min-h-screen bg-porcelain font-instrument flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-black/5 border border-navy/5 p-8 sm:p-10">
        <button
          onClick={() => navigate(withUTM('/#pricing'))}
          className="text-sm text-slate-blue hover:text-navy transition-colors mb-6"
        >
          ← {t('getStarted.backToPlans')}
        </button>

        <h1 className="text-2xl sm:text-3xl font-general font-bold text-navy">
          {t('getStarted.title', { plan: planName })}
        </h1>
        <p className="text-slate-blue mt-2">{t('getStarted.subtitle')}</p>

        {/* Order summary */}
        <div className="mt-8 rounded-2xl border border-navy/10 overflow-hidden">
          <div className="px-5 py-3 bg-navy/[0.03] border-b border-navy/10">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-blue/70">
              {t('getStarted.orderSummary')}
            </span>
          </div>

          <div className="px-5 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-blue">{t('getStarted.plan')}</span>
              <span className="font-semibold text-navy">{planName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-blue">{t('getStarted.billing')}</span>
              <span className="font-semibold text-navy">{intervalLabel}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-blue">{t('getStarted.seats')}</span>
              {allowSeats ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateSeats(seats - 1)}
                    disabled={seats <= 1}
                    className="w-7 h-7 rounded-full border border-navy/20 bg-white flex items-center justify-center text-navy hover:bg-navy/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Decrease seats"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-navy">{seats}</span>
                  <button
                    onClick={() => updateSeats(seats + 1)}
                    disabled={seats >= MAX_SEATS}
                    className="w-7 h-7 rounded-full border border-navy/20 bg-white flex items-center justify-center text-navy hover:bg-navy/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Increase seats"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              ) : (
                <span className="font-semibold text-navy">{seats}</span>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-slate-blue">
              <span>{t('getStarted.perSeat')}</span>
              <span>€{formatPrice(pricePerUser)}</span>
            </div>

            <div className="border-t border-navy/10 pt-4 flex items-end justify-between">
              <span className="font-semibold text-navy">{t('getStarted.total')}</span>
              <span className="text-2xl font-bold text-navy">
                €{formatPrice(total)}
                <span className="text-sm font-medium text-slate-blue ml-1">{t('getStarted.perMonth')}</span>
              </span>
            </div>

            {interval === 'yearly' && (
              <p className="text-xs text-emerald-700">
                {t('pricing.totalBilledAnnually', { total: formatPrice(total) })}
                {yearlySavings > 0 && ` · ${t('getStarted.yearlySavings', { amount: formatPrice(yearlySavings) })}`}
              </p>
            )}
          </div>
        </div>

        {/* Included features */}
        <ul className="mt-6 space-y-2">
          {plan.featureKeys.map((key) => (
            <li key={key} className="flex items-center gap-2.5 text-[15px] text-slate-blue">
              <Check className="w-4 h-4 text-navy/70 flex-shrink-0" strokeWidth={2.5} />
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>

        {/* Connect note */}
        <div className="mt-6 flex items-start gap-2 rounded-xl bg-navy/[0.03] px-4 py-3">
          <ShieldCheck className="w-4 h-4 text-navy/70 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-blue">{t('getStarted.connectNote')}</p>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        {/* CTA */}
        <button
          onClick={handleContinue}
          disabled={starting}
          className="mt-6 w-full bg-navy text-white font-semibold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-navy-hover transition-colors shadow-lg shadow-black/10 disabled:opacity-60"
        >
          {starting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t('getStarted.starting')}</span>
            </>
          ) : (
            <>
              <span>{t('getStarted.continueCta')}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <button
          onClick={() => navigate(withUTM('/signup'))}
          className="mt-4 w-full text-center text-sm text-slate-blue hover:text-navy transition-colors"
        >
          {t('getStarted.tryFreeInstead')}
        </button>
      </div>
    </div>
  );
}

export default GetStarted;
