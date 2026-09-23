import React, { useEffect } from 'react';
import { ArrowRight, CheckCircle, Star } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { NoiseOverlay } from './ui/NoiseOverlay';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useI18n } from '../hooks/useI18n';
import { setPendingPromo } from '../utils/pendingPromo';
import { withUTM } from '../utils/utm';

// Odoo Experience 2026 QR page — the Odoo twin of WorkSmarterLanding. Only
// reachable with the booth QR (?ref=oxp) or a session that already saw it.
// The CTA stamps a 2-month promo intent and opens the Odoo account screen on
// /signup; the dashboard grants it (utils/pendingPromo.ts) once the account's
// billing row exists.
const QR_REF = 'oxp';
const SESSION_KEY = 'oxp_ref';
const PROMO_MONTHS = 2;

export const OdooExperienceLanding: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useI18n();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref === QR_REF) {
      sessionStorage.setItem(SESSION_KEY, '1');
    } else if (!sessionStorage.getItem(SESSION_KEY)) {
      navigate('/', { replace: true });
    }
  }, []);

  const start = () => {
    setPendingPromo(PROMO_MONTHS, 'odoo-experience');
    navigate(withUTM('/signup?provider=odoo'));
  };

  const bullets = [t('odooExperience.bullets.credits'), t('odooExperience.bullets.odoo'), t('odooExperience.bullets.noCard')];

  return (
    <div className="min-h-screen bg-porcelain font-instrument relative">
      <NoiseOverlay />

      <div className="flex items-center justify-center pt-10 pb-6 px-6 relative">
        <img src="/Finit Voicelink Blue.svg" alt="VoiceLink" className="h-8 w-auto" />
        <div className="absolute right-6 top-9">
          <LanguageSwitcher />
        </div>
      </div>

      <div className="flex justify-center mb-8 px-6">
        <div className="inline-flex items-center gap-2 bg-navy/[0.06] border border-navy/10 rounded-full px-4 py-2 text-sm font-medium text-navy">
          <Star className="w-3.5 h-3.5 fill-current" />
          {t('odooExperience.badge')}
        </div>
      </div>

      <section className="px-6 pb-16 max-w-2xl mx-auto text-center">
        <h1 className="font-general font-bold text-4xl md:text-5xl leading-tight text-navy mb-6">
          {t('odooExperience.title')}
        </h1>
        <p className="text-xl text-slate-blue leading-relaxed mb-10">{t('odooExperience.subtitle')}</p>

        <div className="flex flex-col space-y-4 mb-10 text-left max-w-sm mx-auto">
          {bullets.map((bullet, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" />
              <span className="text-navy/80">{bullet}</span>
            </div>
          ))}
        </div>

        <button
          onClick={start}
          className="group inline-flex items-center gap-2 bg-navy hover:bg-navy-hover text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
        >
          <span>{t('odooExperience.cta')}</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="mt-5 text-sm text-navy/40">{t('odooExperience.footnote')}</p>
      </section>

      <section className="border-t border-navy/[0.06] py-10 px-6">
        <div className="max-w-md mx-auto flex justify-center">
          <div className="flex flex-col items-center gap-2 opacity-60">
            <img src="/odoo_logo.svg" alt="Odoo" className="h-10 w-auto object-contain" />
          </div>
        </div>
      </section>
    </div>
  );
};
