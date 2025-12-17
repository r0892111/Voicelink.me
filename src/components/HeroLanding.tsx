import React from 'react';
import { ArrowRight } from 'lucide-react';
import { trackCTAClick, trackLandingPageView } from '../utils/analytics';

interface HeroLandingProps {
  openModal: () => void;
}

const WhatsAppPreview: React.FC = () => {
  const waveHeights = [6, 10, 14, 9, 16, 8, 12, 7, 15, 9, 13, 6];

  return (
    <div
      className="
        w-full
        max-w-[360px]
        sm:max-w-[380px]
        rounded-[20px]
        overflow-hidden
        shadow-2xl
        border
      "
      style={{
        backgroundColor: '#0b141a',
        borderColor: 'rgba(0,0,0,0.08)',
      }}
      role="region"
      aria-label="VoiceLink WhatsApp preview"
    >
      {/* Top bar */}
     {/* Top bar */}
<div
  className="flex items-center gap-3 px-3 py-2.5"
  style={{
    backgroundColor: '#202c33',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  }}
>
  {/* Logo with white background only */}
  <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center">
    <img
      src="/Finit Icon Blue.svg"
      alt="VoiceLink"
      className="h-6 w-6 object-contain"
      draggable={false}
    />
  </div>

  <div className="flex-1 min-w-0">
    <div className="text-[13px] font-bold leading-tight" style={{ color: '#e9edef' }}>
      VoiceLink
    </div>
    <div className="text-[11px] truncate" style={{ color: 'rgba(233,237,239,0.7)' }}>
      Online • logs to Teamleader/Pipedrive
    </div>
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
          background:
            'radial-gradient(circle at 20% 10%, rgba(255,255,255,0.06), transparent 45%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.04), transparent 50%), #0b141a',
        }}
      >
        <div
          className="mx-auto mb-2 w-max px-3 py-1 text-[11px] rounded-full border"
          style={{
            color: 'rgba(233,237,239,0.75)',
            background: 'rgba(255,255,255,0.06)',
            borderColor: 'rgba(255,255,255,0.06)',
          }}
        >
          Today
        </div>

        {/* Incoming */}
        <div className="flex justify-start my-2">
          <div
            className="max-w-[88%] rounded-2xl px-3 py-2 text-[12px] leading-snug border"
            style={{
              backgroundColor: '#202c33',
              color: '#e9edef',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            Hey! Send me a voice note or message and I’ll log it in your CRM. ✅
            <div className="mt-1 text-[10px] text-right" style={{ color: 'rgba(233,237,239,0.65)' }}>
              09:12
            </div>
          </div>
        </div>

        {/* Outgoing voice note */}
        <div className="flex justify-end my-2">
          <div
            className="max-w-[88%] rounded-2xl px-3 py-2 text-[12px] leading-snug border"
            style={{
              backgroundColor: '#005c4b',
              color: '#e9edef',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-6 rounded-full flex items-center justify-center"
                aria-hidden="true"
                style={{ background: 'rgba(255,255,255,0.18)' }}
              >
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    borderLeft: '8px solid rgba(255,255,255,0.9)',
                    marginLeft: '2px',
                  }}
                />
              </div>

              <div className="flex items-end gap-1 flex-1" aria-hidden="true">
                {waveHeights.map((h, idx) => (
                  <span
                    key={idx}
                    className="inline-block rounded-sm"
                    style={{
                      width: 3,
                      height: h,
                      background: 'rgba(255,255,255,0.7)',
                      opacity: 0.85,
                    }}
                  />
                ))}
              </div>

              <div className="text-[11px]" style={{ color: 'rgba(233,237,239,0.9)' }}>
                0:14
              </div>
            </div>

            <div className="mt-2 text-[12px]" style={{ color: 'rgba(233,237,239,0.95)' }}>
              “Jan confirmed—he’s in. Quote is €4,850 excl. VAT. Schedule the installation for next Friday. Move the deal to Won and create a task: ‘meet Jan on site’ Tuesday at 8:00. Also attach the photos of the meter cabinet to the deal.”
            </div>

            <div className="mt-1 text-[10px] text-right" style={{ color: 'rgba(233,237,239,0.65)' }}>
              09:13
            </div>
          </div>
        </div>

        {/* Incoming result */}
        <div className="flex justify-start my-2">
          <div
            className="max-w-[88%] rounded-2xl px-3 py-2 text-[12px] leading-snug border"
            style={{
              backgroundColor: '#202c33',
              color: '#e9edef',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            Updates:
            <ul className="mt-2 pl-5 list-disc space-y-1" style={{ color: 'rgba(233,237,239,0.9)' }}>
              <li>✅ Deal moved: Proposal → Won</li>
              <li>✅ Quote logged: €4,850 excl. VAT</li>
              <li>✅ Task created: Tue 08:00 — “On-site check”</li>
              <li>✅ Files added: “meterkast.jpg”, “panel.jpg”</li>
              
            </ul>

            

            <div className="mt-1 text-[10px] text-right" style={{ color: 'rgba(233,237,239,0.65)' }}>
              09:13
            </div>
          </div>
        </div>
      </div>

      {/* Compose bar */}
      <div
        className="flex items-center gap-2 px-3 py-2.5"
        aria-hidden="true"
        style={{
          backgroundColor: '#111b21',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          className="h-9 w-9 rounded-full flex items-center justify-center text-lg"
          style={{ background: 'rgba(255,255,255,0.10)', color: '#e9edef' }}
        >
          +
        </div>

        <div
          className="flex-1 h-9 rounded-full flex items-center px-4 text-[12px]"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(233,237,239,0.7)' }}
        >
          Message
        </div>

        <div
          className="h-9 w-9 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.10)',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -55%)',
              width: 10,
              height: 16,
              borderRadius: 6,
              background: 'rgba(233,237,239,0.85)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '64%',
              transform: 'translateX(-50%)',
              width: 14,
              height: 2,
              borderRadius: 2,
              background: 'rgba(233,237,239,0.85)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const HeroLanding: React.FC<HeroLandingProps> = ({ openModal }) => {
  React.useEffect(() => {
    trackLandingPageView('/landing');
  }, []);

  const handleStartTrial = () => {
    trackCTAClick('start_free_trial', '/landing');
    openModal();
  };

  return (
    <div className="h-screen bg-white relative overflow-hidden">
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

      {/* Background Gradient */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #1C2C55 0%, #FFFFFF 50%, #F7E69B 100%)',
          }}
        ></div>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(45deg, transparent 0%, rgba(247, 230, 155, 0.1) 20%, transparent 40%, rgba(28, 44, 85, 0.05) 60%, transparent 80%, rgba(247, 230, 155, 0.08) 100%)',
          }}
        ></div>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(28, 44, 85, 0.02) 0%, transparent 30%, rgba(247, 230, 155, 0.03) 50%, transparent 70%, rgba(28, 44, 85, 0.02) 100%)',
          }}
        ></div>
      </div>

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

        {/* Centered content: ensure everything fits on mobile (no scroll) */}
        <div className="flex-1 flex items-start justify-center pt-4 sm:pt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start">
              {/* Copy */}
              <div className="space-y-3 sm:space-y-5 animate-fade-in-left">
                <h1
                  className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight animate-scale-in max-w-4xl"
                  style={{
                    color: '#1C2C55',
                    textShadow: '0 4px 8px rgba(28, 44, 85, 0.1)',
                    animationDelay: '0.2s',
                  }}
                >
                  
                 
                  <span className="underline">Talk</span> to your CRM with <span className="underline">VoiceLink</span>.
                </h1>
              </div>

              {/* WhatsApp preview + CTA BELOW it (always visible) */}
              <div
                className="flex flex-col items-center lg:items-end gap-3 animate-fade-in-up"
                style={{ animationDelay: '0.25s' }}
              >
                <WhatsAppPreview />

                <div className="w-full flex flex-col items-center lg:items-end pb-4">
                  <button
                    onClick={handleStartTrial}
                    className="vl-cta-nudge group text-white font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center space-x-2"
                    style={{
                      backgroundColor: '#1C2C55',
                      animation: 'vlCtaNudge 2.2s ease-in-out infinite',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0F1A3A')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1C2C55')}
                  >
                    <span className="text-sm sm:text-base">Start free trial now</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div
                    className="mt-2 text-[11px] sm:text-sm text-center lg:text-right"
                    style={{ color: 'rgba(32, 34, 38, 0.75)' }}
                  >
                    Setup in minutes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
