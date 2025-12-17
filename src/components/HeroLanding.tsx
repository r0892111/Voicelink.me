import React from 'react';
import { Play, ArrowRight } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { trackCTAClick, trackLandingPageView } from '../utils/analytics';

interface HeroLandingProps {
  openModal: () => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({ openModal }) => {
  const { t } = useI18n();

  // Track landing page view on mount
  React.useEffect(() => {
    trackLandingPageView('/landing');
  }, []);

  const handleStartTrial = () => {
    trackCTAClick('start_free_trial', '/landing');
    openModal();
  };

  const handleWatchDemo = () => {
    trackCTAClick('watch_demo', '/landing');
    window.open('https://youtu.be/wVaR0NwPNHc', '_blank');
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Background Gradient */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1C2C55 0%, #FFFFFF 50%, #F7E69B 100%)' }}></div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(45deg, transparent 0%, rgba(247, 230, 155, 0.1) 20%, transparent 40%, rgba(28, 44, 85, 0.05) 60%, transparent 80%, rgba(247, 230, 155, 0.08) 100%)' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center z-10 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left Side - Hero Copy */}
            <div className="space-y-8 animate-fade-in-left">
              {/* Kicker */}
              <div className="inline-block animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <span
                  className="text-lg font-medium tracking-wide"
                  style={{ color: '#202226' }}
                >
                  Just…
                </span>
              </div>

              {/* H1 Title */}
              <h1
                className="text-5xl lg:text-6xl font-bold leading-tight animate-fade-in-up"
                style={{
                  color: '#1C2C55',
                  animationDelay: '0.2s'
                }}
              >
                Talk to your CRM
              </h1>

              {/* Subtext */}
              <p
                className="text-xl leading-relaxed animate-fade-in-up"
                style={{
                  color: '#202226',
                  animationDelay: '0.3s'
                }}
              >
                Transform WhatsApp voice notes into structured CRM data instantly.
                No typing, no forms, just talk.
              </p>

              {/* CTAs */}
              <div
                className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
                style={{ animationDelay: '0.4s' }}
              >
                {/* Primary CTA - Start Free Trial */}
                <button
                  onClick={handleStartTrial}
                  className="group text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center space-x-2"
                  style={{ backgroundColor: '#1C2C55' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F1A3A'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C2C55'}
                >
                  <span>Start free trial now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Secondary CTA - Watch Demo */}
                <button
                  onClick={handleWatchDemo}
                  className="group border-2 font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center space-x-2"
                  style={{ borderColor: '#1C2C55', color: '#1C2C55' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F7E69B';
                    e.currentTarget.style.borderColor = '#1C2C55';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#1C2C55';
                  }}
                >
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              </div>
            </div>

            {/* Right Side - Phone Mockup */}
            <div
              className="flex justify-center lg:justify-end animate-fade-in-right"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="relative max-w-sm w-full">
                {/* Layered Shadow Effect */}
                <div className="absolute inset-0 transform translate-x-8 translate-y-8 bg-gradient-to-br from-gray-300 to-gray-500 rounded-[3rem] blur-3xl opacity-30"></div>
                <div className="absolute inset-0 transform translate-x-6 translate-y-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-[3rem] blur-2xl opacity-25"></div>
                <div className="absolute inset-0 transform translate-x-4 translate-y-4 bg-gradient-to-br from-gray-500 to-gray-700 rounded-[3rem] blur-xl opacity-20"></div>

                {/* Phone Mockup Container */}
                <div
                  className="relative rounded-[3rem] overflow-hidden shadow-2xl bg-white"
                  style={{
                    aspectRatio: '9/19.5',
                    maxHeight: '600px'
                  }}
                >
                  {/* Phone Frame */}
                  <div className="absolute inset-0 border-[12px] border-gray-900 rounded-[3rem] pointer-events-none z-20"></div>

                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-8 bg-gray-900 rounded-b-3xl z-30"></div>

                  {/* Screen Content - Placeholder for phone mockup image */}
                  <div className="relative w-full h-full bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-8">
                    {/* You can replace this div with an actual image:
                        <img
                          src="/phone-mockup.png"
                          alt="Phone mockup showing WhatsApp voice note interface"
                          className="w-full h-full object-cover"
                        />
                    */}

                    {/* Placeholder content showing WhatsApp interface concept */}
                    <div className="space-y-4 w-full">
                      {/* WhatsApp-style message bubbles */}
                      <div className="flex justify-end">
                        <div
                          className="max-w-[75%] rounded-2xl rounded-tr-sm p-4 shadow-sm"
                          style={{ backgroundColor: '#DCF8C6' }}
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#1C2C55' }}></div>
                            <div className="flex-1 h-6 rounded-full bg-gray-200"></div>
                            <div className="w-4 h-4 text-gray-400">▶️</div>
                          </div>
                        </div>
                      </div>

                      {/* Response bubble */}
                      <div className="flex justify-start">
                        <div className="max-w-[75%] bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm">
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                            <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/5"></div>
                          </div>
                        </div>
                      </div>
                    </div>
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
