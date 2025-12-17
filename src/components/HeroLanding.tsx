import React from 'react';
import { ArrowRight, Play, CheckCircle, Zap, Mic } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-white relative">
      {/* Background Gradient */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1C2C55 0%, #FFFFFF 50%, #F7E69B 100%)' }}></div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(45deg, transparent 0%, rgba(247, 230, 155, 0.1) 20%, transparent 40%, rgba(28, 44, 85, 0.05) 60%, transparent 80%, rgba(247, 230, 155, 0.08) 100%)' }}></div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(28, 44, 85, 0.02) 0%, transparent 30%, rgba(247, 230, 155, 0.03) 50%, transparent 70%, rgba(28, 44, 85, 0.02) 100%)' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center z-10 pt-16">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="space-y-8 animate-fade-in-left">

            {/* H1 Title with Phone Mockup */}
            <div className="flex items-center gap-8">
              {/* H1 Title */}
              <h1
                className="text-6xl lg:text-7xl font-black leading-tight animate-scale-in"
                style={{
                  color: '#1C2C55',
                  textShadow: '0 4px 8px rgba(28, 44, 85, 0.1)',
                  animationDelay: '0.2s'
                }}
              >
                Talk to your CRM
              </h1>

              {/* Phone Mockup */}
              <div className="flex-shrink-0 animate-fade-in-right" style={{ animationDelay: '0.3s' }}>
              <div className="relative max-w-[140px] mx-auto">
                {/* Background Effect Elements */}
                <div className="absolute inset-0 transform translate-x-3 translate-y-3 bg-gradient-to-br from-gray-300 to-gray-500 rounded-[1rem] blur-xl opacity-40 scale-110"></div>
                <div className="absolute inset-0 transform translate-x-2 translate-y-2 bg-gradient-to-br from-gray-400 to-gray-600 rounded-[1rem] blur-lg opacity-35 scale-107"></div>
                <div className="absolute inset-0 transform translate-x-1.5 translate-y-1.5 bg-gradient-to-br from-gray-500 to-gray-700 rounded-[1rem] blur-md opacity-30 scale-105"></div>

                {/* Phone Frame */}
                <div className="relative bg-black rounded-[1rem] p-0.5 shadow-xl z-10" style={{
                  aspectRatio: '9/19.5',
                  boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 12px 25px -7px rgba(0, 0, 0, 0.4), 0 7px 15px -5px rgba(0, 0, 0, 0.3)'
                }}>
                  {/* iPhone Dynamic Island */}
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-10 h-2.5 bg-black rounded-full z-10"></div>

                  <div className="bg-white rounded-[0.9rem] overflow-hidden h-full">
                    {/* WhatsApp Header */}
                    <div className="bg-[#075E54] px-1.5 py-1.5 pt-3 flex items-center space-x-1">
                      <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center p-0.5">
                        <img
                          src="/Finit Icon Blue.svg"
                          alt={t('phoneMockup.voiceLink')}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium text-[6px]">{t('phoneMockup.voiceLink')}</div>
                        <div className="flex items-center space-x-0.5">
                          <div className="w-0.5 h-0.5 rounded-full bg-green-400"></div>
                          <span className="text-[5px] text-green-200">{t('phoneMockup.online')}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <img
                          src="/whatsapp.svg"
                          alt="WhatsApp"
                          className="w-2.5 h-2.5"
                        />
                        <div className="text-white text-xs font-bold">⋮</div>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="bg-[#ECE5DD] flex-1 flex flex-col" style={{
                      backgroundImage: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4d4d8' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"),
                      height: '250px'
                    }}>
                      {/* Messages Container */}
                      <div className="flex-1 p-1.5 space-y-1.5">
                        {/* User Voice Message */}
                        <div className="flex justify-end">
                          <div className="bg-[#DCF8C6] rounded-lg rounded-br-sm p-1 max-w-[85%] shadow-sm">
                            <div className="flex items-center space-x-1 mb-0.5">
                              <div className="w-3 h-3 rounded-full flex items-center justify-center" style={{ backgroundColor: '#25D366' }}>
                                <Play className="w-1.5 h-1.5 text-white ml-0.5" />
                              </div>
                              <div className="flex-1">
                                {/* Waveform */}
                                <div className="flex items-center space-x-0.5 px-0.5 py-0.5">
                                  {[...Array(10)].map((_, i) => {
                                    const heights = [1, 2, 3, 4, 5, 6, 5, 3, 2, 1];
                                    const isPlayed = i < 6;

                                    return (
                                      <div
                                        key={i}
                                        className="rounded-full"
                                        style={{
                                          width: '0.75px',
                                          height: ${heights[i]}px,
                                          backgroundColor: isPlayed ? '#128C7E' : '#B3B3B3'
                                        }}
                                      ></div>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="text-[5px] font-medium text-gray-600">1:23</div>
                            </div>
                            <div className="flex justify-end items-center space-x-0.5">
                              <span className="text-[5px] text-gray-500">2:30 PM</span>
                              <CheckCircle className="w-1 h-1 text-[#53BDEB]" />
                            </div>
                          </div>
                        </div>

                        {/* Processing Indicator */}
                        <div className="flex justify-start">
                          <div className="bg-white rounded-lg rounded-bl-sm p-1 max-w-[85%] shadow-sm">
                            <div className="flex items-center space-x-1">
                              <Zap className="w-1.5 h-1.5 animate-pulse" style={{ color: '#1C2C55' }} />
                              <span className="text-[5px] font-medium" style={{ color: '#1C2C55' }}>{t('phoneMockup.aiProcessing')}</span>
                            </div>
                            <div className="mt-0.5 h-0.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full animate-pulse" style={{ backgroundColor: '#F7E69B', width: '70%' }}></div>
                            </div>
                          </div>
                        </div>

                        {/* VoiceLink Bot Reply */}
                        <div className="flex justify-start">
                          <div className="bg-white rounded-lg rounded-bl-sm p-1 max-w-[85%] shadow-sm">
                            <div className="flex items-center space-x-0.5 mb-0.5">
                              <div className="w-2 h-2 rounded-full bg-gray-300 flex items-center justify-center p-0.5">
                                <img
                                  src="/Finit Icon Blue.svg"
                                  alt={t('phoneMockup.voiceLink')}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <span className="text-[5px] font-semibold" style={{ color: '#1C2C55' }}>{t('phoneMockup.voiceLink')}</span>
                            </div>

                            <div className="text-[5px] text-gray-800 leading-tight">
                              <div className="font-medium mb-0.5" style={{ color: '#1C2C55' }}>{t('phoneMockup.updatedCrm')}</div>

                              <div className="space-y-0.5 text-[4px]">
                                <div>📞 <strong>{t('phoneMockup.followUpCall')}</strong></div>
                                <div className="ml-1.5 text-gray-700">• {t('phoneMockup.discussPremium')}</div>
                                <div className="ml-1.5 text-gray-700">• Thursday at 2:00 PM</div>

                                <div className="pt-0.5">📝 <strong>{t('phoneMockup.keyNotes')}</strong></div>
                                <div className="ml-1.5 text-gray-700">• {t('phoneMockup.budgetIncreased')}</div>
                                <div className="ml-1.5 text-gray-700">• {t('phoneMockup.strongInterest')}</div>
                              </div>
                            </div>

                            <div className="flex justify-end items-center space-x-0.5 mt-0.5">
                              <span className="text-[5px] text-gray-500">2:31 PM</span>
                              <CheckCircle className="w-1 h-1 text-[#53BDEB]" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* WhatsApp Input Area */}
                      <div className="flex-shrink-0 p-1.5 pt-1">
                        <div className="bg-white rounded-full px-1.5 py-1 flex items-center space-x-1 shadow-sm">
                          <div className="text-gray-400 text-[6px]">😊</div>
                          <div className="flex-1 text-[5px] text-gray-500">{t('phoneMockup.typeMessage')}</div>
                          <div className="w-3 h-3 rounded-full flex items-center justify-center" style={{ backgroundColor: '#25D366' }}>
                            <Mic className="w-1.5 h-1.5 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Subtext */}
            <p
              className="text-xl lg:text-2xl leading-relaxed animate-fade-in-up max-w-3xl"
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
              className="animate-fade-in-up"
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
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};