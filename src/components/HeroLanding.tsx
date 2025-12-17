import React from 'react';
import { ArrowRight, MessageCircle, Database } from 'lucide-react';
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

  const TwoCardFlow = () => {
    return (
      <div className="mt-6">
        {/* Instant understanding line */}
        <div className="text-sm sm:text-base font-semibold mb-4" style={{ color: '#1C2C55' }}>
          Talk in WhatsApp → Your CRM updates itself
        </div>

        <div className="flex flex-col sm:flex-row sm:items-stretch gap-3 sm:gap-4">
          {/* Card 1: WhatsApp */}
          <div
            className="w-full sm:flex-1 rounded-2xl border px-4 py-4 bg-white/80"
            style={{
              borderColor: 'rgba(28, 44, 85, 0.12)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: 'rgba(37, 211, 102, 0.14)',
                  color: '#128C7E',
                }}
              >
                <MessageCircle className="w-5 h-5" />
              </div>

              <div className="leading-tight">
                <div className="text-sm font-extrabold" style={{ color: '#1C2C55' }}>
                  WhatsApp
                </div>
                <div className="text-sm text-gray-700">Send a voice note</div>
              </div>
            </div>

            {/* Minimal “input” snippet */}
            <div className="mt-3 rounded-xl border bg-white px-3 py-3" style={{ borderColor: 'rgba(28,44,85,0.08)' }}>
              <div className="text-xs font-semibold text-gray-700">🎤 Voice note</div>
              <div className="mt-1 text-sm text-gray-800 leading-snug">
                “Client X — follow-up Friday 9:00. Update the quote.”
              </div>
            </div>
          </div>

          {/* Connector */}
          <div className="flex sm:flex-col items-center justify-center gap-2 sm:gap-2 px-1">
            {/* Arrow */}
            <div className="flex items-center justify-center">
              <ArrowRight className="w-5 h-5" style={{ color: 'rgba(28, 44, 85, 0.35)' }} />
            </div>

            {/* “Invisible layer” badge */}
            <div
              className="px-3 py-1 rounded-full text-xs font-semibold border bg-white/80"
              style={{
                borderColor: 'rgba(28, 44, 85, 0.12)',
                color: '#1C2C55',
                backdropFilter: 'blur(6px)',
              }}
              title="VoiceLink runs inside WhatsApp"
            >
              Powered by VoiceLink AI
            </div>
          </div>

          {/* Card 2: CRM */}
          <div
            className="w-full sm:flex-1 rounded-2xl border px-4 py-4 bg-white/80"
            style={{
              borderColor: 'rgba(28, 44, 85, 0.12)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: 'rgba(28, 44, 85, 0.08)',
                  color: '#1C2C55',
                }}
              >
                <Database className="w-5 h-5" />
              </div>

              <div className="leading-tight">
                <div className="text-sm font-extrabold" style={{ color: '#1C2C55' }}>
                  Your CRM
                </div>
                <div className="text-sm text-gray-700">Updated automatically</div>
              </div>
            </div>

            {/* Minimal “output” snippet */}
            <div className="mt-3 rounded-xl border bg-white px-3 py-3" style={{ borderColor: 'rgba(28,44,85,0.08)' }}>
              <div className="text-xs font-semibold text-gray-700">✅ Logged to the right deal</div>
              <div className="mt-1 text-sm text-gray-800 leading-snug">
                Follow-up scheduled + key notes saved.
              </div>
              <div className="mt-2 text-xs text-gray-600">📅 Next action: Friday 9:00</div>
            </div>
          </div>
        </div>

        {/* Supporting line (reinforces “invisible”) */}
        <div className="mt-3 text-sm" style={{ color: 'rgba(32, 34, 38, 0.75)' }}>
          No app switching • No typing • Works with your existing workflow
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
              Send a WhatsApp voice note. Your CRM gets the update automatically — structured and ready for follow-up.
            </p>

            {/* Two-card flow (WhatsApp -> CRM, VoiceLink as invisible layer) */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
              <TwoCardFlow />
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