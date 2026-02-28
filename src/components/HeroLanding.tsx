import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { trackCTAClick, trackLandingPageView } from '../utils/analytics';
import { withUTM } from '../utils/utm';
import { usePageTransition } from '../hooks/usePageTransition';

const WhatsAppPreview: React.FC = () => {
  const waveHeights = [6, 10, 14, 9, 16, 8, 12, 7, 15, 9, 13, 6];

  return (
    <div
      className="w-full max-w-[360px] sm:max-w-[380px] rounded-[20px] overflow-hidden shadow-2xl border"
      style={{
        backgroundColor: '#0b141a',
        borderColor: 'rgba(0,0,0,0.08)',
      }}
      role="region"
      aria-label="VoiceLink WhatsApp preview"
    >
      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-3 py-2.5"
        style={{
          backgroundColor: '#202c33',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center">
          <img src="/Finit Icon Blue.svg" alt="VoiceLink" className="h-6 w-6 object-contain" draggable={false} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold leading-tight" style={{ color: '#e9edef' }}>VoiceLink</div>
          <div className="text-[11px] truncate" style={{ color: 'rgba(233,237,239,0.7)' }}>Online • logs to Teamleader/Pipedrive</div>
        </div>
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'rgba(233,237,239,0.5)' }} />
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'rgba(233,237,239,0.5)' }} />
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'rgba(233,237,239,0.5)' }} />
        </div>
      </div>

      {/* Body */}
      <div
        className="px-3 py-2.5"
        style={{
          background: 'radial-gradient(circle at 20% 10%, rgba(255,255,255,0.06), transparent 45%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.04), transparent 50%), #0b141a',
        }}
      >
        <div
          className="mx-auto mb-2 w-max px-3 py-1 text-[11px] rounded-full border"
          style={{ color: 'rgba(233,237,239,0.75)', background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          Today
        </div>

        <div className="flex justify-start my-2">
          <div
            className="max-w-[88%] rounded-2xl px-3 py-2 text-[12px] leading-snug border"
            style={{ backgroundColor: '#202c33', color: '#e9edef', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            Hey! Send me a voice note or message and I'll log it in your CRM. ✅
            <div className="mt-1 text-[10px] text-right" style={{ color: 'rgba(233,237,239,0.65)' }}>09:12</div>
          </div>
        </div>

        <div className="flex justify-end my-2">
          <div
            className="max-w-[88%] rounded-2xl px-3 py-2 text-[12px] leading-snug border"
            style={{ backgroundColor: '#005c4b', color: '#e9edef', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full flex items-center justify-center" aria-hidden="true" style={{ background: 'rgba(255,255,255,0.18)' }}>
                <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '8px solid rgba(255,255,255,0.9)', marginLeft: '2px' }} />
              </div>
              <div className="flex items-end gap-1 flex-1" aria-hidden="true">
                {waveHeights.map((h, idx) => (
                  <span key={idx} className="inline-block rounded-sm" style={{ width: 3, height: h, background: 'rgba(255,255,255,0.7)', opacity: 0.85 }} />
                ))}
              </div>
              <div className="text-[11px]" style={{ color: 'rgba(233,237,239,0.9)' }}>0:18</div>
            </div>
            <div className="mt-2 text-[12px]" style={{ color: 'rgba(233,237,239,0.95)' }}>
              "Jan confirmed—he's in. Quote is €4,850 excl. VAT. Schedule the installation for next Friday. Move the deal
              to Won and create a task: 'meet Jan on site' Tuesday at 8:00. Also attach the photos of the meter cabinet
              to the deal."
            </div>
            <div className="mt-1 text-[10px] text-right" style={{ color: 'rgba(233,237,239,0.65)' }}>09:13</div>
          </div>
        </div>

        <div className="flex justify-start my-2">
          <div
            className="max-w-[88%] rounded-2xl px-3 py-2 text-[12px] leading-snug border"
            style={{ backgroundColor: '#202c33', color: '#e9edef', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            Updates:
            <ul className="mt-2 pl-5 list-disc space-y-1" style={{ color: 'rgba(233,237,239,0.9)' }}>
              <li>✅ Deal moved: Proposal → Won</li>
              <li>✅ Quote logged: €4,850 excl. VAT</li>
              <li>✅ Task: Tue 08:00 — "On-site check"</li>
              <li>✅ Files: "meterkast.jpg", "panel.jpg"</li>
            </ul>
            <div className="mt-1 text-[10px] text-right" style={{ color: 'rgba(233,237,239,0.65)' }}>09:13</div>
          </div>
        </div>
      </div>

      {/* Compose bar */}
      <div
        className="flex items-center gap-2 px-3 py-2.5"
        aria-hidden="true"
        style={{ backgroundColor: '#111b21', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="h-9 w-9 rounded-full flex items-center justify-center text-lg" style={{ background: 'rgba(255,255,255,0.10)', color: '#e9edef' }}>+</div>
        <div className="flex-1 h-9 rounded-full flex items-center px-4 text-[12px]" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(233,237,239,0.7)' }}>Message</div>
        <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.10)' }}>
          <div className="relative w-[16px] h-[18px]">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[10px] h-[12px] rounded-full" style={{ background: 'rgba(233,237,239,0.9)' }} />
            <div className="absolute left-1/2 -translate-x-1/2 top-[6px] w-[16px] h-[10px] rounded-b-full" style={{ border: '2px solid rgba(233,237,239,0.9)', borderTop: '0' }} />
            <div className="absolute left-1/2 -translate-x-1/2 top-[11px] w-[2px] h-[4px] rounded" style={{ background: 'rgba(233,237,239,0.9)' }} />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[14px] h-[2px] rounded" style={{ background: 'rgba(233,237,239,0.9)' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const HeroLanding: React.FC = () => {
  const navigate = useNavigate();
  const { navigateWithTransition } = usePageTransition();

  React.useEffect(() => {
    trackLandingPageView('/landing');
  }, []);

  const handleStartTrial = () => {
    trackCTAClick('start_free_trial', '/landing');
    navigateWithTransition(withUTM('/test'));
  };

  return (
    <div className="h-screen bg-porcelain relative overflow-hidden font-instrument">
      {/* CTA attention animation */}
      <style>{`
        @keyframes vlCtaNudge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .vl-cta-nudge { animation: none !important; }
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative h-full z-10 flex flex-col">
        {/* Logo pinned at top */}
        <div className="flex-shrink-0 pt-6 sm:pt-10 pb-1 flex justify-center z-20">
          <img
            src="/Finit Voicelink Blue.svg"
            alt="Finit VoiceLink"
            className="w-[160px] sm:w-[220px] lg:w-[300px] h-auto object-contain"
          />
        </div>

        <div className="flex-1 flex items-start justify-end pt-4 sm:pt-10">
          <div className="w-full px-4 sm:px-6 lg:px-10 2xl:px-16">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 2xl:gap-20 items-center lg:items-start lg:justify-end">
              <div className="space-y-3 sm:space-y-5 animate-fade-in-left flex flex-col items-center lg:items-start text-center lg:text-left flex-1 min-w-0">
                <h1
                  className="font-general font-bold text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl leading-tight animate-scale-in text-navy whitespace-nowrap"
                  style={{ animationDelay: '0.2s' }}
                >
                  <span className="underline">Talk</span> to your CRM with{' '}
                  <span className="underline">VoiceLink</span>.
                </h1>

                <button
                  onClick={handleStartTrial}
                  className="vl-cta-nudge group text-white font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-full bg-navy hover:bg-navy-hover transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center space-x-2"
                  style={{ animation: 'vlCtaNudge 2.2s ease-in-out infinite' }}
                >
                  <span className="text-sm sm:text-base">Start free trial now</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="text-[11px] sm:text-sm text-center lg:text-left text-muted-blue">
                  Setup your VoiceLink WhatsApp in 3 minutes
                </div>
              </div>

              <div className="flex-shrink-0 flex flex-col items-center lg:items-end gap-3 animate-fade-in-up lg:mr-[5vw] 2xl:mr-[8vw]" style={{ animationDelay: '0.25s' }}>
                <WhatsAppPreview />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
