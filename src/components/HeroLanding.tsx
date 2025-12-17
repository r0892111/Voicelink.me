import React from 'react';
import { ArrowRight } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-white relative">
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
      <section className="relative min-h-screen flex items-center z-10 pt-16">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="space-y-8 animate-fade-in-left">
            {/* Logo */}
            <div className="flex justify-end pt-3 sm:pt-6">
              <img
                src="/Finit Voicelink Blue.svg"
                alt="Finit VoiceLink"
                className="w-[160px] sm:w-[220px] h-auto object-contain"
              />
            </div>

            {/* Headline */}
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight animate-scale-in max-w-4xl"
              style={{
                color: '#1C2C55',
                textShadow: '0 4px 8px rgba(28, 44, 85, 0.1)',
                animationDelay: '0.2s',
              }}
            >
              Nobody likes administration.
              <br />
              Talk to your CRM with VoiceLink.
            </h1>

            {/* CTA */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
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