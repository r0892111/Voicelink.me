import React, { useCallback, useRef } from 'react';
import {
  Check,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  MessageSquare,
  Users,
  StickyNote,
  CheckSquare,
  Calendar,
  FileText,
  MoreHorizontal,
} from 'lucide-react';
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
    creditsApprox: '20–30',
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

// Format a euro amount with NL-style decimals (€57,60). Used for the yearly
// savings badge so it reads naturally for the Belgian/NL audience.
function formatEuro(amount: number): string {
  return '€' + amount.toFixed(2).replace('.', ',');
}

// Small inline language map for the "/ per user" suffix on the yearly savings
// badge. Kept inline on purpose so we don't touch the shared locale JSON
// (another session may be editing it).
const PER_USER_SUFFIX: Record<string, string> = {
  en: '/user',
  nl: '/gebruiker',
  fr: '/utilisateur',
  de: '/Nutzer',
};

// Title above the +/- user counter. Inline map (don't touch shared locale JSON).
const USERS_LABEL: Record<string, string> = {
  en: 'Users',
  nl: 'Gebruikers',
  fr: 'Utilisateurs',
  de: 'Nutzer',
};

// Icons for the "Use your credits for" list, in the same order as the
// pricing.creditUses i18n array.
const CREDIT_USE_ICONS = [
  MessageSquare, // ± messages per month
  Users,         // Contacts
  StickyNote,    // Notes
  CheckSquare,   // Tasks
  Calendar,      // Appointments
  FileText,      // Quotes & invoices
  MoreHorizontal, // More
];

// Pull the upper bound from a "20–30" / "200–285" style range so the first
// credit-use line can show a concrete estimate per plan.
function approxUpperBound(creditsApprox: string): string {
  const parts = creditsApprox.split(/[–-]/);
  return (parts[parts.length - 1] ?? creditsApprox).trim();
}


export const PricingSection: React.FC<PricingSectionProps> = ({ openContactModal }) => {
  const { t, currentLanguage } = useI18n();
  const { navigateWithTransition } = usePageTransition();
  const [billingPeriod, setBillingPeriod] = React.useState<BillingPeriod>('monthly');
  const [currentCardIdx, setCurrentCardIdx] = React.useState(0);
  const [userCounts, setUserCounts] = React.useState<Record<string, number>>({
    starter: 1,
    professional: 1,
    business: 1,
  });
  const [inputValues, setInputValues] = React.useState<Record<string, string>>({
    starter: '1',
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
    // Show the user counter on every paid plan — Starter, Professional,
    // Business. Free Trial is a one-person account so it stays hidden.
    // Starter has no volume discounts, so the per-user price stays flat; the
    // counter just scales the Stripe quantity (and the team's seat count).
    // Starter is single-seat by design (plan_limits.max_seats = 1) — hide the
    // counter so the Stripe checkout quantity stays 1. Free Trial is also
    // single-seat. Counter only shows on Professional and Business.
    if (plan.isFreeTrial || plan.key === 'starter') return null;
    const count = userCounts[plan.key] ?? 1;
    const displayValue = inputValues[plan.key] ?? String(count);
    return (
      <div className="flex flex-col items-start gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-blue/70 leading-none">
          {USERS_LABEL[currentLanguage] ?? USERS_LABEL.en}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => updateUserCount(plan.key, count - 1)}
            disabled={count <= 1}
            className="w-7 h-7 rounded-full border border-navy/20 bg-white flex items-center justify-center text-navy hover:bg-navy/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
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
            className="w-10 text-center text-sm font-semibold text-navy border border-navy/20 rounded-lg py-0.5 focus:outline-none focus:ring-2 focus:ring-navy/20"
          />
          <button
            onClick={() => updateUserCount(plan.key, count + 1)}
            disabled={count >= 50}
            className="w-7 h-7 rounded-full border border-navy/20 bg-white flex items-center justify-center text-navy hover:bg-navy/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Increase users"
          >
            <Plus size={13} />
          </button>
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
    // Yearly savings per user: the monthly per-user price (before the yearly
    // discount) × 12 × 20%. Shown in the green badge when yearly is selected.
    const monthlyPerUser = getPricePerUser(plan, users, 'monthly');
    const yearlySavingsPerUser = monthlyPerUser * 12 * 0.2;

    const padding = desktop ? 'p-6 lg:p-7 2xl:p-8' : 'p-6';
    const titleSize = desktop ? 'text-3xl 2xl:text-4xl' : 'text-3xl';
    const priceSize = desktop ? 'text-4xl 2xl:text-5xl' : 'text-4xl';

    // "Use your credits for" — shared list of what credits buy. The first line
    // is rebuilt to show this plan's concrete estimated message count.
    const creditUsesRaw = t('pricing.creditUses', { returnObjects: true });
    const creditUses = Array.isArray(creditUsesRaw) ? (creditUsesRaw as string[]) : [];
    const creditUsesTitle = t('pricing.creditUsesTitle');

    // Support / feature ladder for this specific plan. features[0] is a heading
    // ("Everything from X, plus:" / "Included:"), the rest are bullets.
    const planFeaturesRaw = t(`pricing.cards.${plan.key}.features`, { returnObjects: true });
    const planFeatures = Array.isArray(planFeaturesRaw) ? (planFeaturesRaw as string[]) : [];
    // Free Trial has no "Everything from X" ladder — give it the neutral
    // "Included:" heading so its block lines up with the other cards.
    const featuresHeading = plan.isFreeTrial
      ? t('pricing.includedHeading')
      : (planFeatures[0] ?? '');
    const featureBullets = plan.isFreeTrial ? planFeatures : planFeatures.slice(1);

    // Shared section heading style — identical for "Use your credits for:" and
    // "Everything from X, plus:" so they read as one consistent system and
    // align across cards.
    const sectionHeadingClass =
      'text-[13px] font-bold uppercase tracking-wide text-navy mb-2.5';

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
        {/* "Most popular" badge — sits on the top-right card edge, vertically
            centered on the border so its top half rises above the frame and its
            bottom half stays inside. */}
        {plan.highlighted && (
          <span className="absolute top-0 right-6 -translate-y-1/2 inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-navy text-white whitespace-nowrap shadow-md z-10">
            {t('pricing.cards.professional.badge')}
          </span>
        )}

        {/* Header — fixed height so the price row starts at the same Y on every card */}
        <div className="min-h-[40px] mb-2">
          <h3 className={`${titleSize} font-bold text-navy leading-tight`}>
            {t(`pricing.cards.${plan.key}.name`)}
          </h3>
        </div>

        {/* Price — big amount left, small 2-line "user / month" label beside it,
            and (paid multi-seat plans) the +/- user selector right of that.
            At yearly the strikethrough widens the row, so the selector wraps to
            a second line; the min-height grows by billing period so every card's
            CTA drops by the same amount and stays aligned. */}
        <div className="min-h-[56px]">
          {plan.isFreeTrial ? (
            <div className="flex items-end gap-2">
              <span className={`${priceSize} font-bold text-navy leading-none`}>€0</span>
              <span className="text-[13px] leading-tight text-slate-blue font-instrument pb-1">
                {t('pricing.cards.freetrial.billingNote')}
              </span>
            </div>
          ) : (
            <div className="flex items-end flex-wrap gap-x-2 gap-y-2">
              {showStrikethrough && (
                <span className="text-xl font-bold text-navy/30 line-through pb-1">
                  €{formatPrice(plan.baseMonthlyPrice)}
                </span>
              )}
              <span className={`${priceSize} font-bold text-navy leading-none`}>
                €{formatPrice(pricePerUser)}
              </span>
              <span className="text-[13px] leading-tight text-slate-blue font-instrument pb-1">
                {plan.key === 'starter' ? (
                  // Starter is single-seat, so it bills per month, not per user.
                  `/${t('pricing.perUserLine2')}`
                ) : (
                  <>
                    {t('pricing.perUserLine1')}
                    <br />
                    {t('pricing.perUserLine2')}
                  </>
                )}
              </span>
            </div>
          )}
        </div>

        {/* User counter — below the price; reserved height on every card so all
            CTAs stay aligned whether or not the card shows the selector. */}
        <div className="min-h-[48px]">
          {renderUserControl(plan)}
        </div>

        {/* Special offer — reserve height only at yearly (where the badge shows);
            on monthly it collapses so the CTA sits closer to the price. */}
        <div className={billingPeriod === 'yearly' ? 'min-h-[28px] mt-2' : 'mt-1'}>
          {!plan.isFreeTrial && billingPeriod === 'yearly' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 border border-green-200 text-green-700">
              {t('pricing.save20')} - {formatEuro(yearlySavingsPerUser)} {PER_USER_SUFFIX[currentLanguage] ?? PER_USER_SUFFIX.en}
            </span>
          )}
        </div>

        {/* CTA — sits high in the card, same Y across all cards */}
        <button
          onClick={() => handleCtaClick(plan)}
          className={`w-full font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 group mt-2 ${
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

        {/* Divider under the CTA — Monday-style separation */}
        <div className="border-t border-navy/10 my-5" />

        {/* Credits — same vertical height across cards */}
        <div className="min-h-[28px]">
          <p className="text-[15px] font-semibold text-navy">
            {plan.isFreeTrial
              ? t('pricing.oneTimeCredits', { count: plan.credits })
              : t('pricing.creditsPerUserPerMonth', { count: plan.credits })}
          </p>
        </div>

        {/* Use your credits for — dark navy heading + darker icons */}
        {creditUses.length > 0 && (
          <div className="mt-4">
            <p className={sectionHeadingClass}>{creditUsesTitle}</p>
            <ul className="space-y-2">
              {creditUses.map((label, index) => {
                const Icon = CREDIT_USE_ICONS[index] ?? MoreHorizontal;
                // First line is the "± N messages per month" estimate. Bold just
                // the number so it stands out; the rest of the line stays normal.
                let content: React.ReactNode = label;
                if (index === 0) {
                  const num = approxUpperBound(plan.creditsApprox);
                  const [before, after] = label.split('±');
                  // Free trial isn't a monthly subscription, so drop the
                  // "per month" suffix there (kept on paid tiers).
                  const MONTHLY_SUFFIX: Record<string, string> = {
                    nl: 'per maand', en: 'per month', fr: 'par mois', de: 'pro Monat',
                  };
                  const suffix = MONTHLY_SUFFIX[currentLanguage] ?? MONTHLY_SUFFIX.en;
                  const afterText = plan.isFreeTrial
                    ? after.replace(suffix, '').trimEnd()
                    : after;
                  content = (
                    <>
                      {before}± <span className="font-semibold text-navy">{num}</span>
                      {afterText}
                    </>
                  );
                }
                return (
                  <li key={index} className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-navy/70 flex-shrink-0" strokeWidth={2.25} />
                    <span className="text-[15px] text-slate-blue font-instrument">{content}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* "Everything from X, plus:" heading + feature bullets */}
        {(featuresHeading || featureBullets.length > 0) && (
          <div className="mt-5">
            {featuresHeading && <p className={sectionHeadingClass}>{featuresHeading}</p>}
            <div className="space-y-2.5">
              {featureBullets.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    plan.highlighted ? 'bg-navy' : 'bg-navy/10'
                  }`}>
                    <Check className={`w-3 h-3 ${plan.highlighted ? 'text-white' : 'text-navy'}`} />
                  </div>
                  <span className="text-[15px] text-slate-blue font-instrument">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Auto top-up info (Professional & Business) */}
        {plan.hasAutoTopUp && (
          <div className="mt-4 px-3 py-2 bg-glow-blue/10 border border-glow-blue/20 rounded-xl">
            <p className="text-xs font-medium text-navy/80">{t('pricing.autoTopUpInfo')}</p>
          </div>
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
        <h2 className="font-general text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl font-bold text-navy mb-4">
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
        className="md:hidden overflow-x-auto snap-x snap-mandatory flex gap-4 -mx-6 px-5 -my-6 py-6"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {plans.map((plan) => (
          <div key={plan.key} className="snap-center flex-shrink-0 w-[85vw]">
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
