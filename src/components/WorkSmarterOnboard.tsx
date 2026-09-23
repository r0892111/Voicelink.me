import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { startTeamleaderCheckout } from '../utils/startCheckout';
import { setPendingPromo } from '../utils/pendingPromo';
import { withUTM } from '../utils/utm';
import { NoiseOverlay } from './ui/NoiseOverlay';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useI18n } from '../hooks/useI18n';

const QR_REF = 'wms';
const SESSION_KEY = 'wms_ref';

// WorkSmarter promo onboarding — connect-only. The /lp/worksmarter landing is
// the entry; its CTA drops the visitor straight here on the "Koppel je CRM"
// screen. Connecting Teamleader stamps a pendingCheckout intent for a real
// Stripe Professional subscription with a 60-day trial and NO card up front
// (collectPaymentMethod: false → checkout uses payment_method_collection
// 'if_required'). AuthCallback runs the checkout after OAuth → dashboard.
// The same printed QR is reused at Odoo Experience (2026-09-24): "Odoo
// koppelen" stamps a 2-month promo intent and opens the Odoo account screen;
// the dashboard grants it (utils/pendingPromo.ts) — Odoo has no OAuth to hang
// a Stripe trial on here.
export const WorkSmarterOnboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [starting, setStarting] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (searchParams.get('ref') === QR_REF) {
      sessionStorage.setItem(SESSION_KEY, '1');
    } else if (!sessionStorage.getItem(SESSION_KEY)) {
      navigate('/', { replace: true });
    }
  }, []);

  const handleConnect = async () => {
    if (starting) return;
    setStarting(true);
    // WSM offer: 60-day Professional trial, no card up front
    // (collectPaymentMethod: false → checkout uses payment_method_collection
    // 'if_required'). On success initiateAuth redirects the page away.
    const result = await startTeamleaderCheckout({
      tierKey: 'professional',
      interval: 'monthly',
      quantity: 1,
      trialDays: 60,
      collectPaymentMethod: false,
    });
    if (!result.success) setStarting(false);
  };

  const handleOdoo = () => {
    setPendingPromo(2, 'worksmarter-qr');
    navigate(withUTM('/signup?provider=odoo'));
  };

  return (
    <div className="min-h-screen bg-porcelain font-instrument relative flex flex-col">
      <NoiseOverlay />

      <div className="flex justify-center pt-10 pb-6 px-6 relative">
        <img src="/Finit Voicelink Blue.svg" alt="VoiceLink" className="h-8 w-auto" />
        <div className="absolute right-6 top-9">
          <LanguageSwitcher />
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-6 pb-16">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-8">
          <div className="text-center mb-7">
            <h1 className="font-general font-bold text-2xl text-navy mb-2">
              {t('worksmarterQr.onboard.title')}
            </h1>
            <p className="text-sm text-navy/60 leading-relaxed">
              {t('worksmarterQr.onboard.subtitle')}
            </p>
          </div>

          <ul className="mb-7 space-y-2.5">
            {[
              t('worksmarterQr.onboard.bullets.free'),
              t('worksmarterQr.onboard.bullets.noCard'),
              t('worksmarterQr.onboard.bullets.after'),
            ].map((line) => (
              <li key={line} className="flex items-center gap-2.5 text-sm text-navy/70">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" strokeWidth={2.5} />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleConnect}
            disabled={starting}
            className="flex items-center gap-3 w-full border border-navy/[0.12] bg-white hover:bg-navy/[0.03] disabled:opacity-60 rounded-xl px-5 py-4 transition-colors"
          >
            {starting ? (
              <Loader2 className="w-5 h-5 animate-spin text-navy mx-auto" />
            ) : (
              <>
                <img src="/Teamleader_Icon.svg" alt="Teamleader" className="h-7 w-7 object-contain" />
                <span className="font-medium text-navy">{t('worksmarterQr.onboard.connectTeamleader')}</span>
                <ArrowRight className="w-4 h-4 text-navy/40 ml-auto" />
              </>
            )}
          </button>

          <button
            onClick={handleOdoo}
            disabled={starting}
            className="mt-3 flex items-center gap-3 w-full border border-navy/[0.12] bg-white hover:bg-navy/[0.03] disabled:opacity-60 rounded-xl px-5 py-4 transition-colors"
          >
            <img src="/odoo_logo.svg" alt="Odoo" className="h-7 w-7 object-contain" />
            <span className="font-medium text-navy">{t('worksmarterQr.onboard.connectOdoo')}</span>
            <ArrowRight className="w-4 h-4 text-navy/40 ml-auto" />
          </button>

          <p className="mt-5 text-xs text-navy/40 text-center">
            {t('worksmarterQr.onboard.note')}
          </p>
        </div>
      </div>
    </div>
  );
};
