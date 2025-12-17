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
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
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
                Nobody likes administration.
                <br />
                Talk to your CRM with VoiceLink.
              </h1>

              {/* CTA */}
              <div className="animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
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

                <div className="mt-2 sm:mt-3 text-xs sm:text-sm" style={{ color: 'rgba(32, 34, 38, 0.75)' }}>
                  No credit card • Setup in minutes
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};