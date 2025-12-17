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
      className="w-full max-w-[420px] rounded-[22px] overflow-hidden shadow-2xl border"
      style={{
        backgroundColor: '#0b141a',
        borderColor: 'rgba(0,0,0,0.08)',
      }}
      role="region"
      aria-label="VoiceLink WhatsApp preview"
    >
      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{
          backgroundColor: '#202c33',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          className="h-10 w-10 rounded-full"
          aria-hidden="true"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))',
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold leading-tight" style={{ color: '#e9edef' }}>
            VoiceLink
          </div>
          <div
            className="text-[12px] truncate"
            style={{ color: 'rgba(233,237,239,0.7)' }}
          >
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
        className="px-3 py-3"
        style={{
          background:
            'radial-gradient(circle at 20% 10%, rgba(255,255,255,0.06), transparent 45%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.04), transparent 50%), #0b141a',
        }}
      >
        <div
          className="mx-auto mb-3 w-max px-3 py-1.5 text-[12px] rounded-full border"
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
            className="max-w-[86%] rounded-2xl px-3 py-2 text-[13px] leading-snug border"
            style={{
              backgroundColor: '#202c33',
              color: '#e9edef',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            Hey! Send me a voice note or message and I’ll log it in your CRM. ✅
            <div className="mt-1.5 text-[11px] text-right" style={{ color: 'rgba(233,237,239,0.65)' }}>
              09:12
            </div>
          </div>
        </div>

        {/* Outgoing voice note */}
        <div className="flex justify-end my-2">
          <div
            className="max-w-[86%] rounded-2xl px-3 py-2 text-[13px] leading-snug border"
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

              <div className="text-[12px]" style={{ color: 'rgba(233,237,239,0.9)' }}>
                0:14
              </div>
            </div>

            <div className="mt-2 text-[13px]" style={{ color: 'rgba(233,237,239,0.95)' }}>
              “Called Jan — confirm delivery Friday, update deal, create follow-up next Tuesday.”
            </div>

            <div className="mt-1.5 text-[11px] text-right" style={{ color: 'rgba(233,237,239,0.65)' }}>
              09:13
            </div>
          </div>
        </div>

        {/* Incoming result */}
        <div className="flex justify-start my-2">
          <div
            className="max-w-[86%] rounded-2xl px-3 py-2 text-[13px] leading-snug border"
            style={{
              backgroundColor: '#202c33',
              color: '#e9edef',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            Got it. I created:
            <ul className="mt-2 pl-5 list-disc space-y-1" style={{ color: 'rgba(233,237,239,0.9)' }}>
              <li>✅ CRM note on “Jan / Deal #1842”</li>
              <li>✅ Follow-up task: Tue 09:00</li>
              <li>✅ Next step: confirm delivery Friday</li>
            </ul>

            <div
              className="mt-3 inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-semibold"
              style={{ background: 'rgba(255,255,255,0.10)', color: '#e9edef' }}
            >
              Open in CRM →
            </div>

            <div className="mt-1.5 text-[11px] text-right" style={{ color: 'rgba(233,237,239,0.65)' }}>
              09:13
            </div>
          </div>
        </div>
      </div>

      {/* Compose bar */}
      <div
        className="flex items-center gap-2 px-3 py-3"
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
          className="flex-1 h-9 rounded-full flex items-center px-4 text-[13px]"
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
          {/* simple mic */}
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
  // Track landing page view on mount
  React.useEffect(() => {
    trackLandingPageView('/landing');
  }, []);

  const handleStartTrial = () => {
    trackCTAClick('start_free_trial', '/landing');
    openModal();
  };

  return (
    <div className="h-screen bg-white relative overflow-hidden">
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
        <div className="flex-shrink-0 pt-10 pb-2 flex justify-center z-20">
          <img
            src="/Finit Voicelink Blue.svg"
            alt="Finit VoiceLink"
            className="w-[180px] sm:w-[240px] lg:w-[320px] h-auto object-contain"
          />
        </div>

        {/* Centered content */}
        <div className="flex-1 flex items-start justify-center pt-12 sm:pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
              {/* Left: copy + CTA */}
              <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in-left">
                {/* Headline */}
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight animate-scale-in max-w-4xl"
                  style={{
                    color: '#1C2C55',
                    textShadow: '0 4px 8px rgba(28, 44, 85, 0.1)',
                    animationDelay: '0.2s',
                  }}
                >
                  <span className="underline">Nobody</span> likes administration.
                  <br />
                  <br />
                  Talk to your CRM with VoiceLink.
                </h1>

                {/* CTA */}
                <div className="animate-fade-in-up pb-10 lg:pb-24" style={{ animationDelay: '0.35s' }}>
                  <button
                    onClick={handleStartTrial}
                    className="group text-white font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center space-x-2"
                    style={{ backgroundColor: '#1C2C55' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0F1A3A')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1C2C55')}
                  >
                    <span className="text-sm sm:text-base">Start free trial now</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div
                    className="mt-2 sm:mt-3 text-xs sm:text-sm"
                    style={{ color: 'rgba(32, 34, 38, 0.75)' }}
                  >
                    No credit card • Setup in minutes
                  </div>
                </div>
              </div>

              {/* Right: WhatsApp preview */}
              <div className="flex lg:justify-end justify-center animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                <WhatsAppPreview />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
