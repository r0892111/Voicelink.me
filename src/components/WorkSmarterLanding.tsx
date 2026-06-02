import React, { useEffect } from 'react';
import { ArrowRight, CheckCircle, Star } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { NoiseOverlay } from './ui/NoiseOverlay';

const QR_REF = 'wms';
const SESSION_KEY = 'wms_ref';

export const WorkSmarterLanding: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref === QR_REF) {
      sessionStorage.setItem(SESSION_KEY, '1');
    } else if (!sessionStorage.getItem(SESSION_KEY)) {
      navigate('/', { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen bg-porcelain font-instrument relative">
      <NoiseOverlay />

      {/* Header */}
      <div className="flex justify-center pt-10 pb-6 px-6">
        <img src="/Finit Voicelink Blue.svg" alt="VoiceLink" className="h-8 w-auto" />
      </div>

      {/* Event badge */}
      <div className="flex justify-center mb-8 px-6">
        <div className="inline-flex items-center gap-2 bg-navy/[0.06] border border-navy/10 rounded-full px-4 py-2 text-sm font-medium text-navy">
          <Star className="w-3.5 h-3.5 fill-current" />
          WorkSmarter 2026 — Exclusief aanbod
        </div>
      </div>

      {/* Hero */}
      <section className="px-6 pb-16 max-w-2xl mx-auto text-center">
        <h1 className="font-general font-bold text-4xl md:text-5xl leading-tight text-navy mb-6">
          2 maanden Professional gratis
        </h1>
        <p className="text-xl text-slate-blue leading-relaxed mb-10">
          Stuur een spraakbericht op WhatsApp. VoiceLink zet het automatisch om in notities, taken en follow-ups in jouw CRM. Geen tikwerk meer.
        </p>

        <div className="flex flex-col space-y-4 mb-10 text-left max-w-sm mx-auto">
          {[
            '1.000 credits per maand op het Professional plan',
            'Automatische updates in Teamleader',
            'Geen creditcard, geen betaalscherm',
          ].map((bullet, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" />
              <span className="text-navy/80">{bullet}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/onboard/worksmarter')}
          className="group inline-flex items-center gap-2 bg-navy hover:bg-navy-hover text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
        >
          <span>Nu starten</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="mt-5 text-sm text-navy/40">
          Geen kaartgegevens vereist · 2 maanden gratis Professional
        </p>
      </section>

      {/* Trust bar */}
      <section className="border-t border-navy/[0.06] py-10 px-6">
        <div className="max-w-md mx-auto flex justify-center">
          <div className="flex flex-col items-center gap-2 opacity-60">
            <img src="/Teamleader_Icon.svg" alt="Teamleader" className="h-10 w-auto object-contain" />
            <span className="text-xs text-navy/60">Teamleader</span>
          </div>
        </div>
      </section>
    </div>
  );
};
