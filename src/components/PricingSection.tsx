import React, { useCallback, useRef } from 'react';
import { Check, ArrowRight, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { BillingPeriodSwitch, BillingPeriod } from './BillingPeriodSwitch';
import { useI18n } from '../hooks/useI18n';
import { withUTM } from '../utils/utm';
import { usePageTransition } from '../hooks/usePageTransition';
import { markPendingCheckout } from '../utils/pendingCheckout';

interface PricingSectionProps {
  openContactModal: () => void;
}

interface VolumeTier {
  min: number;
  max: number;
  discount: number;
  pricePerUser: number;
}

interface PricingPlan {
  key: string;
  isFreeTrial: boolean;
  highlighted: boolean;
  baseMonthlyPrice: number;
  credits: number;
  creditsApprox: string;
  hasVolumeDiscounts: boolean;
  volumeTiers: VolumeTier[];
  hasAutoTopUp: boolean;
  featureKeys: string[];
}

const PROFESSIONAL_TIERS: VolumeTier[] = [
  { min: 1,  max: 3,  discount: 0,  pricePerUser: 59.00 },
  { min: 4,  max: 6,  discount: 5,  pricePerUser: 56.05 },
  { min: 7,  max: 10, discount: 8,  pricePerUser: 54.28 },
  { min: 11, max: 15, discount: 12, pricePerUser: 51.92 },
  { min: 16, max: 25, discount: 15, pricePerUser: 50.15 },
  { min: 26, max: 50, discount: 18, pricePerUser: 48.38 },
];

const BUSINESS_TIERS: VolumeTier[] = [
  { min: 1,  max: 3,  discount: 0,  pricePerUser: 109.00 },
  { min: 4,  max: 6,  discount: 5,  pricePerUser: 103.55 },
  { min: 7,  max: 10, discount: 8,  pricePerUser: 100.28 },
  { min: 11, max: 15, discount: 12, pricePerUser: 95.92 },
  { min: 16, max: 50, discount: 15, pricePerUser: 92.65 },
];


const plans: PricingPlan[] = [
  {
    key: 'freetrial',
    isFreeTrial: true,
    highlighted: false,
    baseMonthlyPrice: 0,
    credits: 100,
    creditsApprox: '10–14',
    hasVolumeDiscounts: false,
    volumeTiers: [],
    hasAutoTopUp: false,
    featureKeys: [
      'pricing.features.voiceNotes',
      'pricing.features.realtimeCrmSync',
      'pricing.features.multiLanguageSupport',
    ],
  },
  {
    key: 'starter',
    isFreeTrial: false,
    highlighted: false,
    baseMonthlyPrice: 24,
    credits: 350,
    creditsApprox: '35–50',
    hasVolumeDiscounts: false,
    volumeTiers: [],
    hasAutoTopUp: false,
    featureKeys: [
      'pricing.features.voiceNotes',
      'pricing.features.realtimeCrmSync',
      'pricing.features.multiLanguageSupport',
      'pricing.features.emailSupport',
    ],
  },
  {
    key: 'professional',
    isFreeTrial: false,
    highlighted: true,
    baseMonthlyPrice: 59,
    credits: 1000,
    creditsApprox: '100–142',
    hasVolumeDiscounts: true,
    volumeTiers: PROFESSIONAL_TIERS,
    hasAutoTopUp: true,
    featureKeys: [
      'pricing.features.voiceNotes',
      'pricing.features.realtimeCrmSync',
      'pricing.features.multiLanguageSupport',
      'pricing.features.prioritySupport',
      'pricing.features.autoTopUp',
    ],
  },
  {
    key: 'business',
    isFreeTrial: false,
    highlighted: false,
    baseMonthlyPrice: 109,
    credits: 2000,
    creditsApprox: '200–285',
    hasVolumeDiscounts: true,
    volumeTiers: BUSINESS_TIERS,
    hasAutoTopUp: true,
    featureKeys: [
      'pricing.features.voiceNotes',
      'pricing.features.realtimeCrmSync',
      'pricing.features.multiLanguageSupport',
      'pricing.features.prioritySupport',
      'pricing.features.dedicatedAccountManager',
      'pricing.features.autoTopUp',
    ],
  },
];

const TOTAL_PLANS = plans.length;

function getVolumeTier(tiers: VolumeTier[], users: number): VolumeTier {
  return tiers.find(t => users >= t.min && users <= t.max) ?? tiers[tiers.length - 1];
}

function getPricePerUser(plan: PricingPlan, users: number, billingPeriod: BillingPeriod): number {
  if (plan.isFreeTrial) return 0;
  let price = plan.baseMonthlyPrice;
  if (plan.hasVolumeDiscounts && plan.volumeTiers.length > 0) {
    price = getVolumeTier(plan.volumeTiers, users).pricePerUser;
  }
  if (billingPeriod === 'yearly') price = Math.round(price * 0.8 * 100) / 100;
  return price;
}

function formatPrice(price: number): string {
  return price % 1 === 0 ? String(price) : price.toFixed(2);
}


export const PricingSection: React.FC<PricingSectionProps> = ({ openContactModal }) => {
  const { t } = useI18n();
  const { navigateWithTransition } = usePageTransition();
  const [billingPeriod, setBillingPeriod] = React.useState<BillingPeriod>('monthly');
  const [currentCardIdx, setCurrentCardIdx] = React.useState(0);
  const [userCounts, setUserCounts] = React.useState<Record<string, number>>({
    professional: 1,
    business: 1,
  });
  const [inputValues, setInputValues] = React.useState<Record<string, string>>({
    professional: '1',
    business: '1',
  });
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const currentCardIdxRef = useRef(0);
  const isArrowNavRef = useRef(false);
  const arrowNavTimeout = useRef<ReturnType<typeof setTimeout>>();

  const updateUserCount = useCallback((planKey: string, val: number) => {
    const clamped = Math.max(1, Math.min(50, isNaN(val) ? 1 : val));
    setUserCounts(prev => ({ ...prev, [planKey]: clamped }));
    setInputValues(prev => ({ ...prev, [planKey]: String(clamped) }));
  }, []);

  React.useEffect(() => {
    const el = mobileScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (isArrowNavRef.current) return;
      const cardW = (el.firstElementChild as HTMLElement)?.offsetWidth || el.clientWidth;
      const idx = Math.round(el.scrollLeft / (cardW + 16));
      const clamped = Math.max(0, Math.min(TOTAL_PLANS - 1, idx));
      if (clamped !== currentCardIdxRef.current) {
        currentCardIdxRef.current = clamped;
        setCurrentCardIdx(clamped);
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const navigate = useCallback((dir: 1 | -1) => {
    const el = mobileScrollRef.current;
    if (!el) return;
    const cardW = (el.firstElementChild as HTMLElement)?.offsetWidth || el.clientWidth;
    const newIdx = Math.max(0, Math.min(TOTAL_PLANS - 1, currentCardIdxRef.current + dir));
    currentCardIdxRef.current = newIdx;
    setCurrentCardIdx(newIdx);
    isArrowNavRef.current = true;
    clearTimeout(arrowNavTimeout.current);
    arrowNavTimeout.current = setTimeout(() => { isArrowNavRef.current = false; }, 500);
    el.scrollTo({ left: newIdx * (cardW + 16), behavior: 'smooth' });
  }, []);

  // Route a plan-card click:
  //  - Free Trial: /signup as before.
  //  - Paid plan: persist the intent in localStorage and send to /signup so
  //    the user goes through the Teamleader OAuth flow first. AuthCallback
  //    picks up the intent after OAuth and launches Stripe Checkout, so the
  //    user never lands on /dashboard without an active subscription.
  //    Even if they're already authenticated we route via /signup → OAuth
  //    to guarantee the Teamleader connection is in place before billing.
  const handleCtaClick = (plan: PricingPlan) => {
    if (plan.isFreeTrial) {
      navigateWithTransition(withUTM('/signup'));
      return;
    }

    const interval: 'monthly' | 'yearly' =
      billingPeriod === 'yearly' ? 'yearly' : 'monthly';
    const quantity = userCounts[plan.key] ?? 1;

    markPendingCheckout({ tierKey: plan.key, interval, quantity });
    navigateWithTransition(withUTM('/signup'));
  };

  const renderUserControl = (plan: PricingPlan) => {
    if (!plan.hasVolumeDiscounts) return null;
    const count = userCounts[plan.key] ?? 1;
    const displayValue = inputValues[plan.key] ?? String(count);
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateUserCount(plan.key, count - 1)}
            disabled={count <= 1}
            className="w-8 h-8 rounded-full border border-navy/20 bg-white flex items-center justify-center text-navy hover:bg-navy/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Decrease users"
          >
            <Minus size={13} />
          </button>
          <input
            type="text"
            inputMode="numeric"
            value={displayValue}
            onFocus={e => e.target.select()}
            onChange={e => {
              const raw = e.target.value;
              if (raw === '' || /^\d+$/.test(raw)) {
                setInputValues(prev => ({ ...prev, [plan.key]: raw }));
                const num = parseInt(raw, 10);
                if (!isNaN(num) && num >= 1 && num <= 50) {
                  setUserCounts(prev => ({ ...prev, [plan.key]: num }));
                }
              }
            }}
            onBlur={() => {
              const clamped = Math.max(1, Math.min(50, parseInt(displayValue, 10) || 1));
              setUserCounts(prev => ({ ...prev, [plan.key]: clamped }));
              setInputValues(prev => ({ ...prev, [plan.key]: String(clamped) }));
            }}
            className="w-14 text-center text-sm font-semibold text-navy border border-navy/20 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-navy/20"
          />
          <button
            onClick={() => updateUserCount(plan.key, count + 1)}
            disabled={count >= 50}
            className="w-8 h-8 rounded-full border border-navy/20 bg-white flex items-center justify-center text-navy hover:bg-navy/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Increase users"
          >
            <Plus size={13} />
          </button>
          <span className="text-xs text-slate-blue font-instrument">{t('pricing.users')}</span>
        </div>
      </div>
    );
  };

  const renderCardContent = (plan: PricingPlan, desktop: boolean) => {
    const users = userCounts[plan.key] ?? 1;
    const pricePerUser = getPricePerUser(plan, users, billingPeriod);
    const totalDiscountPct = plan.isFreeTrial || plan.baseMonthlyPrice === 0
      ? 0
      : Math.round((1 - pricePerUser / plan.baseMonthlyPrice) * 100);
    const showStrikethrough = totalDiscountPct > 0;

    const padding = desktop ? 'p-6 lg:p-8 2xl:p-10' : 'p-6';
    const titleSize = desktop ? 'text-xl 2xl:text-2xl' : 'text-xl';
    const priceSize = desktop ? 'text-4xl 2xl:text-5xl' : 'text-4xl';

    return (
      <div
        className={`bg-white rounded-2xl ${padding} flex flex-col h-full relative transition-all duration-300 ${
          plan.highlighted
            ? 'shadow-2xl border-2 border-navy'
            : plan.isFreeTrial
            ? 'shadow-sm border border-navy/10'
            : 'shadow-md border border-navy/[0.06] hover:shadow-lg hover:scale-[1.01]'
        }`}
      >
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className={`${titleSize} font-bold text-navy`}>
              {t(`pricing.cards.${plan.key}.name`)}
            </h3>
            {plan.highlighted && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-navy text-white whitespace-nowrap flex-shrink-0">
                {t('pricing.cards.professional.badge')}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-blue font-instrument mt-1">
            {t(`pricing.cards.${plan.key}.description`)}
          </p>
        </div>

        {/* Price */}
        <div className="mb-4">
          {plan.isFreeTrial ? (
            <>
              <span className={`${priceSize} font-bold text-navy`}>€0</span>
              <p className="text-xs text-slate-blue font-instrument mt-1">
                {t('pricing.cards.freetrial.billingNote')}
              </p>
            </>
          ) : (
            <div>
              <div className="flex items-baseline gap-x-2 gap-y-0.5 flex-wrap">
                {showStrikethrough && (
                  <span className="text-xl font-bold text-navy/30 line-through">
                    €{formatPrice(plan.baseMonthlyPrice)}
                  </span>
                )}
                <span className={`${priceSize} font-bold text-navy`}>
                  €{formatPrice(pricePerUser)}
                </span>
                {totalDiscountPct > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 border border-green-200 text-green-700">
                    -{totalDiscountPct}%
                  </span>
                )}
              </div>
              <p className="text-slate-blue text-sm mt-0.5">{t('pricing.perUserPerMonth')}</p>
            </div>
          )}
        </div>

        {/* User count control (Professional & Business only) */}
        {renderUserControl(plan)}

        {/* Credits box */}
        <div className="mb-4 px-3 py-2.5 bg-blue-50/80 rounded-xl">
          <p className="text-sm font-semibold text-navy">
            {plan.isFreeTrial
              ? t('pricing.oneTimeCredits', { count: plan.credits })
              : t('pricing.creditsPerUserPerMonth', { count: plan.credits })}
          </p>
          <p className="text-xs text-slate-blue font-instrument mt-0.5">
            ≈ {plan.creditsApprox} {t('pricing.voiceMessages')}
          </p>
        </div>

        {/* Features */}
        <div className="space-y-2.5 mb-5 flex-grow">
          {plan.featureKeys.map((featureKey, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                plan.highlighted ? 'bg-navy' : 'bg-navy/10'
              }`}>
                <Check className={`w-3 h-3 ${plan.highlighted ? 'text-white' : 'text-navy'}`} />
              </div>
              <span className="text-sm 2xl:text-base text-slate-blue font-instrument">{t(featureKey)}</span>
            </div>
          ))}
        </div>

        {/* Auto top-up info (Professional & Business) */}
        {plan.hasAutoTopUp && (
          <div className="mb-4 px-3 py-2 bg-glow-blue/10 border border-glow-blue/20 rounded-xl">
            <p className="text-xs font-medium text-navy/80">{t('pricing.autoTopUpInfo')}</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => handleCtaClick(plan)}
          className={`w-full font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 group ${
            plan.highlighted
              ? 'bg-navy text-white hover:bg-navy-hover hover:shadow-xl'
              : 'border-2 border-navy text-navy hover:bg-navy hover:text-white'
          }`}
        >
          <span>{t(`pricing.cards.${plan.key}.cta`)}</span>
          {plan.highlighted && (
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          )}
        </button>

        {/* Subtext */}
        {(plan.isFreeTrial || plan.key === 'starter') && (
          <p className="text-center text-xs text-muted-blue mt-3">
            {t(`pricing.cards.${plan.key}.subtext`)}
          </p>
        )}
      </div>
    );
  };

  const renderEnterpriseCard = () => (
    <div className="relative overflow-hidden rounded-2xl bg-navy shadow-xl">
      {/* Decorative circles */}
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/[0.04] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/[0.03] pointer-events-none" />

      <div className="relative px-6 lg:px-10 py-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        {/* Identity */}
        <div className="flex-1">
          <div className="flex items-center gap-2.5 mb-1">
            <h3 className="text-xl font-bold text-white">{t('pricing.cards.enterprise.name')}</h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/15 tracking-wide uppercase">
              {t('pricing.custom')}
            </span>
          </div>
          <p className="text-sm text-white/55 font-instrument">
            {t('pricing.cards.enterprise.contactForPricing')}
          </p>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0">
          <button
            onClick={openContactModal}
            className="whitespace-nowrap w-full md:w-auto font-semibold py-2.5 px-6 rounded-full bg-white text-navy hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
          >
            <span>{t('pricing.getCustomQuote')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] 2xl:max-w-screen-2xl mx-auto px-6">
      <div className="text-center mb-8 2xl:mb-10">
        <h2 className="font-general text-4xl lg:text-5xl 2xl:text-6xl font-bold text-navy mb-4">
          {t('pricing.title')}
        </h2>
        <p className="text-xl 2xl:text-2xl font-instrument text-slate-blue max-w-3xl mx-auto mb-6">
          {t('pricing.subtitle')}
        </p>
      </div>

      <div className="flex items-center justify-center mb-8">
        <BillingPeriodSwitch billingPeriod={billingPeriod} onBillingPeriodChange={setBillingPeriod} />
      </div>

      {/* Mobile carousel controls */}
      <div className="flex items-center gap-4 mb-5 -mx-6 px-5 md:hidden">
        <button
          onClick={() => navigate(-1)}
          aria-label="Previous plan"
          className="flex-shrink-0 w-9 h-9 rounded-full border border-navy/20 bg-white flex items-center justify-center text-navy/60 hover:text-navy hover:border-navy/40 hover:bg-navy/5 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 h-[3px] bg-navy/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-navy rounded-full"
            style={{ width: `${((currentCardIdx + 1) / TOTAL_PLANS) * 100}%`, transition: 'width 0.25s ease-out', willChange: 'width' }}
          />
        </div>
        <button
          onClick={() => navigate(1)}
          aria-label="Next plan"
          className="flex-shrink-0 w-9 h-9 rounded-full border border-navy/20 bg-white flex items-center justify-center text-navy/60 hover:text-navy hover:border-navy/40 hover:bg-navy/5 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Mobile: snap scroll carousel */}
      <div
        ref={mobileScrollRef}
        className="md:hidden overflow-x-auto snap-x snap-mandatory flex gap-4 -mx-6 px-5 pb-4"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {plans.map((plan) => (
          <div key={plan.key} className="snap-center flex-shrink-0 w-[calc(100svw-2.5rem)]">
            {renderCardContent(plan, false)}
          </div>
        ))}
      </div>

      {/* Mobile: Enterprise below carousel */}
      <div className="md:hidden mt-4 flex justify-center">
        <div className="w-full max-w-2xl">
          {renderEnterpriseCard()}
        </div>
      </div>

      {/* Desktop: 4-Card Grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5 2xl:gap-8 items-stretch">
        {plans.map((plan) => (
          <div key={plan.key} className={plan.highlighted ? 'md:scale-[1.03] z-10' : ''}>
            {renderCardContent(plan, true)}
          </div>
        ))}
      </div>

      {/* Desktop: Enterprise horizontal */}
      <div className="hidden md:flex mt-6 2xl:mt-8 justify-center">
        <div className="w-full max-w-2xl">
          {renderEnterpriseCard()}
        </div>
      </div>
    </div>
  );
};
