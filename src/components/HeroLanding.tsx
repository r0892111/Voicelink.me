import React from 'react';
import { ArrowRight, MessageCircle, Sparkles, Database } from 'lucide-react';
import { trackCTAClick, trackLandingPageView } from '../utils/analytics';

interface HeroLandingProps {
  openModal: () => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({ openModal }) => {
  // Track landing page view on mount
  React.useEffect(() => {
    trackLandingPageView('/landing');
  }, []);

  const handleStartTrial = () => {
    trackCTAClick('start_free_trial', '/landing');
    openModal();
  };

  const ProcessStrip = () => {
    const steps = [
      {
        title: 'WhatsApp',
        desc: 'Send a voice note',
        icon: <MessageCircle className="w-5 h-5" />,
        iconBg: 'rgba(37, 211, 102, 0.14)',
        iconColor: '#128C7E',
      },
      {
  title: 'VoiceLink AI',
  desc: 'Extracts the details',
  icon: (
    <img
      src="/Finit Voicelink Blue.svg"
      alt="VoiceLink AI"
      className="w-30 h-5"
    />
  ),
  iconBg: 'rgba(255, 255, 255, 0.35)',
  iconColor: '#1C2C55',
},
      {
        title: 'CRM',
        desc: 'Updates automatically',
        icon: <Database className="w-5 h-5" />,
        iconBg: 'rgba(28, 44, 85, 0.08)',
        iconColor: '#1C2C55',
      },
    ];

    return (
      <div className="mt-6">
        {/* “Equation” line (instant understanding) */}
        <div className="text-sm sm:text-base font-semibold mb-4" style={{ color: '#1C2C55' }}>
          WhatsApp voice → AI → CRM update
        </div>

        {/* Steps */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {steps.map((s, i) => (
            <React.Fragment key={s.title}>
              <div
                className="flex items-center gap-3 rounded-2xl border px-4 py-3 bg-white/80"
                style={{
                  borderColor: 'rgba(28, 44, 85, 0.12)',
                  backdropFilter: 'blur(6px)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: s.iconBg,
                    color: s.iconColor,
                  }}
                >
                  {s.icon}
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-extrabold" style={{ color: '#1C2C55' }}>
                    {s.title}
                  </div>
                  <div className="text-sm text-gray-700">{s.desc}</div>
                </div>
              </div>

              {/* Arrow between steps */}
              {i < steps.length - 1 && (
                <div className="flex justify-center sm:justify-start">
                  <ArrowRight
                    className="w-4 h-4"
                    style={{ color: 'rgba(28, 44, 85, 0.35)' }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Background Gradient */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #1C2C55 0%, #FFFFFF 50%, #F7E69B 100%)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(45deg, transparent 0%, rgba(247, 230, 155, 0.10) 20%, transparent 40%, rgba(28, 44, 85, 0.05) 60%, transparent 80%, rgba(247, 230, 155, 0.08) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(28, 44, 85, 0.02) 0%, transparent 30%, rgba(247, 230, 155, 0.03) 50%, transparent 70%, rgba(28, 44, 85, 0.02) 100%)',
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center z-10 pt-16">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="space-y-8 animate-fade-in-left max-w-3xl">
            {/* H1 Title */}
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight animate-scale-in"
              style={{
                color: '#1C2C55',
                textShadow: '0 4px 8px rgba(28, 44, 85, 0.1)',
                animationDelay: '0.2s',
              }}
            >
              Just.. Talk to your CRM
            </h1>

            {/* Subtext */}
            <p
              className="text-lg sm:text-xl lg:text-2xl leading-relaxed animate-fade-in-up"
              style={{
                color: '#202226',
                animationDelay: '0.3s',
              }}
            >
              Talk about any company update. VoiceLink turns it into structured CRM data automatically
            </p>

            {/* 3-step process strip (instant understanding) */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
              <ProcessStrip />
            </div>

            {/* CTAs */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <button
                onClick={handleStartTrial}
                className="group text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center space-x-2"
                style={{ backgroundColor: '#1C2C55' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0F1A3A')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1C2C55')}
              >
                <span>Start free trial now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-3 text-sm" style={{ color: 'rgba(32, 34, 38, 0.75)' }}>
                No credit card • Setup in minutes
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};