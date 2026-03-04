import React, { useCallback, useRef } from 'react';
import { Check, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { BillingPeriodSwitch, BillingPeriod } from './BillingPeriodSwitch';
import { useI18n } from '../hooks/useI18n';
import { withUTM } from '../utils/utm';
import { usePageTransition } from '../hooks/usePageTransition';

interface PricingSectionProps {
  openContactModal: () => void;
}

interface PricingPlan {
  key: string;
  minUsers: number;
  maxUsers: number | null;
  monthlyPrice: number;
  yearlyPrice: number;
  messagesPerUser: number;
  topUp: { messages: number; price: number } | null;
  featureKeys: string[];
  highlighted: boolean;
  isEnterprise: boolean;
}

const plans: PricingPlan[] = [
  {
    key: 'starter',
    minUsers: 1,
    maxUsers: 3,
    monthlyPrice: 19,
    yearlyPrice: 15,
    messagesPerUser: 30,
    topUp: { messages: 25, price: 15 },
    featureKeys: [
      'pricing.features.voiceNotes',
      'pricing.features.realtimeCrmSync',
      'pricing.features.multiLanguageSupport',
      'pricing.features.topUpAvailable',
    ],
    highlighted: false,
    isEnterprise: false,
  },
  {
    key: 'professional',
    minUsers: 4,
    maxUsers: 10,
    monthlyPrice: 34,
    yearlyPrice: 27,
    messagesPerUser: 60,
    topUp: { messages: 25, price: 14 },
    featureKeys: [
      'pricing.features.voiceNotes',
      'pricing.features.realtimeCrmSync',
      'pricing.features.multiLanguageSupport',
      'pricing.features.prioritySupport',
      'pricing.features.discountedTopUp',
    ],
    highlighted: true,
    isEnterprise: false,
  },
  {
    key: 'business',
    minUsers: 11,
    maxUsers: 25,
    monthlyPrice: 49,
    yearlyPrice: 39,
    messagesPerUser: 100,
    topUp: { messages: 50, price: 28 },
    featureKeys: [
      'pricing.features.voiceNotes',
      'pricing.features.realtimeCrmSync',
      'pricing.features.multiLanguageSupport',
      'pricing.features.prioritySupport',
      'pricing.features.dedicatedAccountManager',
      'pricing.features.largerTopUps',
    ],
    highlighted: false,
    isEnterprise: false,
  },
  {
    key: 'enterprise',
    minUsers: 25,
    maxUsers: null,
    monthlyPrice: 0,
    yearlyPrice: 0,
    messagesPerUser: 0,
    topUp: null,
    featureKeys: [
      'pricing.features.voiceNotes',
      'pricing.features.realtimeCrmSync',
      'pricing.features.multiLanguageSupport',
      'pricing.features.prioritySupport',
      'pricing.features.dedicatedAccountManager',
      'pricing.features.customIntegrations',
      'pricing.features.sla',
    ],
    highlighted: false,
    isEnterprise: true,
  },
];

const TOTAL_PLANS = plans.length;

export const PricingSection: React.FC<PricingSectionProps> = ({
  openContactModal
}) => {
  const { t } = useI18n();
  const { navigateWithTransition } = usePageTransition();
  const [billingPeriod, setBillingPeriod] = React.useState<BillingPeriod>('monthly');
  const [currentCardIdx, setCurrentCardIdx] = React.useState(0);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const currentCardIdxRef = useRef(0);
  const isArrowNavRef = useRef(false);
  const arrowNavTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Mobile scroll → update progress bar
  React.useEffect(() => {
    const el = mobileScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (isArrowNavRef.current) return;
      const cardW = (el.firstElementChild as HTMLElement)?.offsetWidth || el.clientWidth;
      const gap = 16; // gap-4
      const idx = Math.round(el.scrollLeft / (cardW + gap));
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
        <BillingPeriodSwitch
          billingPeriod={billingPeriod}
          onBillingPeriodChange={setBillingPeriod}
        />
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
        {plans.map((plan) => {
          const price = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          return (
            <div
              key={plan.key}
              className={`snap-center flex-shrink-0 w-[calc(100svw-2.5rem)] bg-white rounded-2xl p-6 flex flex-col relative transition-all duration-300 ${
                plan.highlighted
                  ? 'shadow-md border-2 border-navy'
                  : 'shadow-md border border-navy/[0.06]'
              }`}
            >
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-navy">{t(`pricing.cards.${plan.key}.name`)}</h3>
                  {plan.highlighted && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-navy text-white whitespace-nowrap">
                      {t('pricing.cards.professional.badge')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-blue font-instrument mt-1">{t(`pricing.cards.${plan.key}.description`)}</p>
              </div>
              <div className="mb-6">
                {plan.isEnterprise ? (
                  <div>
                    <span className="text-3xl font-bold text-navy">{t('pricing.custom')}</span>
                    <p className="text-sm text-slate-blue font-instrument mt-1">{t('pricing.cards.enterprise.contactForPricing')}</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-4xl font-bold text-navy">€{price}</span>
                      <span className="text-slate-blue text-sm">{t('pricing.perUserPerMonth')}</span>
                    </div>
                    {billingPeriod === 'yearly' && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 border border-green-200 text-green-800">
                          {t('pricing.save20')}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
              {!plan.isEnterprise && (
                <div className="mb-4 px-3 py-2 bg-navy/[0.04] rounded-xl">
                  <p className="text-sm font-medium text-navy">{t('pricing.messagesPerMonth', { count: plan.messagesPerUser })}</p>
                </div>
              )}
              {plan.isEnterprise && (
                <div className="mb-4 px-3 py-2 bg-navy/[0.04] rounded-xl">
                  <p className="text-sm font-medium text-navy">{t('pricing.negotiatedVolume')}</p>
                </div>
              )}
              <div className="space-y-3 mb-6 flex-grow">
                {plan.featureKeys.map((featureKey, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlighted ? 'bg-navy' : 'bg-navy/10'}`}>
                      <Check className={`w-3 h-3 ${plan.highlighted ? 'text-white' : 'text-navy'}`} />
                    </div>
                    <span className="text-sm text-slate-blue font-instrument">{t(featureKey)}</span>
                  </div>
                ))}
              </div>
              {plan.topUp && (
                <div className="mb-6 px-3 py-2.5 bg-glow-blue/10 border border-glow-blue/20 rounded-xl text-center">
                  <p className="text-xs font-semibold text-navy">{t('pricing.topUpLabel')}</p>
                  <p className="text-sm font-medium text-navy mt-0.5">+{plan.topUp.messages} {t('pricing.topUpMessages')} — €{plan.topUp.price}</p>
                </div>
              )}
              {plan.isEnterprise ? (
                <button
                  onClick={openContactModal}
                  className="w-full font-semibold py-3 px-6 rounded-full border-2 border-navy text-navy hover:bg-navy hover:text-white transition-all duration-300 flex items-center justify-center space-x-2 group"
                >
                  <span>{t('pricing.getCustomQuote')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={() => navigateWithTransition(withUTM('/signup'))}
                  className={`w-full font-semibold py-3 px-6 rounded-full transition-all duration-300 flex items-center justify-center space-x-2 group ${
                    plan.highlighted
                      ? 'bg-navy text-white hover:bg-navy-hover'
                      : 'border-2 border-navy text-navy hover:bg-navy hover:text-white'
                  }`}
                >
                  <span>{t('pricing.startFreeTrial')}</span>
                  {plan.highlighted && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
              )}
              {!plan.isEnterprise && (
                <p className="text-center text-xs text-muted-blue mt-3">{t('pricing.freeTrial')}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop: 4-Card Grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5 2xl:gap-8 items-stretch">
        {plans.map((plan) => {
          const price = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

          return (
            <div
              key={plan.key}
              className={`bg-white rounded-2xl p-6 lg:p-8 2xl:p-10 flex flex-col relative transition-all duration-300 ${
                plan.highlighted
                  ? 'shadow-2xl border-2 border-navy md:scale-[1.03] z-10'
                  : 'shadow-md border border-navy/[0.06] hover:shadow-lg hover:scale-[1.01]'
              }`}
            >
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl 2xl:text-2xl font-bold text-navy">
                    {t(`pricing.cards.${plan.key}.name`)}
                  </h3>
                  {plan.highlighted && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-navy text-white whitespace-nowrap">
                      {t('pricing.cards.professional.badge')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-blue font-instrument mt-1">
                  {t(`pricing.cards.${plan.key}.description`)}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                {plan.isEnterprise ? (
                  <div>
                    <span className="text-3xl font-bold text-navy">
                      {t('pricing.custom')}
                    </span>
                    <p className="text-sm text-slate-blue font-instrument mt-1">
                      {t('pricing.cards.enterprise.contactForPricing')}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-4xl 2xl:text-5xl font-bold text-navy">
                        €{price}
                      </span>
                      <span className="text-slate-blue text-sm 2xl:text-base">{t('pricing.perUserPerMonth')}</span>
                    </div>
                    {billingPeriod === 'yearly' && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 border border-green-200 text-green-800">
                          {t('pricing.save20')}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Message cap */}
              {!plan.isEnterprise && (
                <div className="mb-4 px-3 py-2 bg-navy/[0.04] rounded-xl">
                  <p className="text-sm font-medium text-navy">
                    {t('pricing.messagesPerMonth', { count: plan.messagesPerUser })}
                  </p>
                </div>
              )}
              {plan.isEnterprise && (
                <div className="mb-4 px-3 py-2 bg-navy/[0.04] rounded-xl">
                  <p className="text-sm font-medium text-navy">
                    {t('pricing.negotiatedVolume')}
                  </p>
                </div>
              )}

              {/* Features */}
              <div className="space-y-3 mb-6 flex-grow">
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

              {/* Top-up info */}
              {plan.topUp && (
                <div className="mb-6 px-3 py-2.5 bg-glow-blue/10 border border-glow-blue/20 rounded-xl text-center">
                  <p className="text-xs font-semibold text-navy">
                    {t('pricing.topUpLabel')}
                  </p>
                  <p className="text-sm font-medium text-navy mt-0.5">
                    +{plan.topUp.messages} {t('pricing.topUpMessages')} — €{plan.topUp.price}
                  </p>
                </div>
              )}

              {/* CTA */}
              {plan.isEnterprise ? (
                <button
                  onClick={openContactModal}
                  className="w-full font-semibold py-3 px-6 rounded-full border-2 border-navy text-navy hover:bg-navy hover:text-white transition-all duration-300 hover:shadow-lg flex items-center justify-center space-x-2 group"
                >
                  <span>{t('pricing.getCustomQuote')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={() => navigateWithTransition(withUTM('/signup'))}
                  className={`w-full font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:shadow-lg flex items-center justify-center space-x-2 group ${
                    plan.highlighted
                      ? 'bg-navy text-white hover:bg-navy-hover hover:shadow-xl'
                      : 'border-2 border-navy text-navy hover:bg-navy hover:text-white'
                  }`}
                >
                  <span>{t('pricing.startFreeTrial')}</span>
                  {plan.highlighted && (
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  )}
                </button>
              )}
              {!plan.isEnterprise && (
                <p className="text-center text-xs text-muted-blue mt-3">
                  {t('pricing.freeTrial')}
                </p>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
