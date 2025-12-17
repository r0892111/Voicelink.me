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

  const ProofCard = () => (
    <div className="relative w-full max-w-[420px] mx-auto lg:mx-0">
      {/* Badge overlay */}
      <div className="absolute -top-3 left-4 z-20">
        <div
          className="px-3 py-1 rounded-full text-xs font-semibold shadow-sm border"
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderColor: 'rgba(28, 44, 85, 0.12)',
            color: '#1C2C55',
            backdropFilter: 'blur(6px)',
          }}
        >
          WhatsApp → CRM (auto)
        </div>
      </div>

      {/* Proof crop card (no phone frame) */}
      <div
        className="relative rounded-3xl overflow-hidden border shadow-xl"
        style={{
          backgroundColor: 'rgba(255,255,255,0.92)',
          borderColor: 'rgba(28, 44, 85, 0.10)',
          boxShadow:
            '0 18px 40px -18px rgba(0,0,0,0.18), 0 10px 24px -14px rgba(0,0,0,0.14)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* WhatsApp header (minimal) */}
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{
            backgroundColor: '#075E54',
          }}
        >
          <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center p-1">
            <img
              src="/Finit Icon Blue.svg"
              alt={t('phoneMockup.voiceLink')}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1">
            <div className="text-white font-semibold text-sm leading-tight">
              {t('phoneMockup.voiceLink')}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-xs text-green-100">{t('phoneMockup.online')}</span>
            </div>
          </div>
          <img src="/whatsapp.svg" alt="WhatsApp" className="w-5 h-5 opacity-95" />
        </div>

        {/* Chat area (tight, focused on the proof) */}
        <div
          className="p-4 space-y-3"
          style={{
            backgroundColor: '#ECE5DD',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4d4d8' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          {/* User voice note bubble */}
          <div className="flex justify-end">
            <div className="bg-[#DCF8C6] rounded-2xl rounded-br-md px-3 py-2 max-w-[92%] shadow-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <Play className="w-4 h-4 text-white ml-0.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-[3px]">
                    {[...Array(14)].map((_, i) => {
                      const heights = [3, 5, 7, 10, 12, 14, 12, 9, 7, 5, 4, 3, 4, 5];
                      const isPlayed = i < 9;
                      return (
                        <div
                          key={i}
                          className="rounded-full"
                          style={{
                            width: '2px',
                            height: `${heights[i]}px`,
                            backgroundColor: isPlayed ? '#128C7E' : '#B3B3B3',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="text-xs font-semibold text-gray-600">1:23</div>
              </div>
              <div className="flex justify-end items-center gap-1 mt-1">
                <span className="text-[11px] text-gray-500">2:30 PM</span>
                <CheckCircle className="w-3 h-3 text-[#53BDEB]" />
              </div>
            </div>
          </div>

          {/* Processing indicator */}
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md px-3 py-2 max-w-[92%] shadow-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 animate-pulse" style={{ color: '#1C2C55' }} />
                <span className="text-sm font-semibold" style={{ color: '#1C2C55' }}>
                  {t('phoneMockup.aiProcessing')}
                </span>
              </div>
              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full animate-pulse"
                  style={{ backgroundColor: '#F7E69B', width: '70%' }}
                />
              </div>
            </div>
          </div>

          {/* VoiceLink reply bubble (the proof) */}
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md px-3 py-3 max-w-[92%] shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center p-1">
                  <img
                    src="/Finit Icon Blue.svg"
                    alt={t('phoneMockup.voiceLink')}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-sm font-bold" style={{ color: '#1C2C55' }}>
                  {t('phoneMockup.voiceLink')}
                </span>
              </div>

              <div className="text-sm text-gray-800 leading-snug">
                <div className="font-extrabold" style={{ color: '#1C2C55' }}>
                  {t('phoneMockup.updatedCrm')}
                </div>

                {/* Keep this tight: 1–2 bullets only */}
                <div className="mt-2 space-y-1 text-[13px]">
                  <div>
                    📞 <strong>{t('phoneMockup.followUpCall')}</strong>
                  </div>
                  <div className="ml-5 text-gray-700">• Thursday at 2:00 PM</div>

                  <div className="pt-1">
                    📝 <strong>{t('phoneMockup.keyNotes')}</strong>
                  </div>
                  <div className="ml-5 text-gray-700">• {t('phoneMockup.strongInterest')}</div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-1 mt-2">
                <span className="text-[11px] text-gray-500">2:31 PM</span>
                <CheckCircle className="w-3 h-3 text-[#53BDEB]" />
              </div>
            </div>
          </div>

          {/* Minimal input bar (just a hint, not a whole UI) */}
          <div className="pt-1">
            <div className="bg-white rounded-full px-3 py-2 flex items-center gap-2 shadow-sm">
              <span className="text-gray-400 text-sm">😊</span>
              <div className="flex-1 text-sm text-gray-500">{t('phoneMockup.typeMessage')}</div>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#25D366' }}
              >
                <Mic className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
          {/* Layout: copy left, proof card right on desktop; on mobile proof card under CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Left: headline + copy + CTA */}
            <div className="space-y-7 animate-fade-in-left">
              <h1
                className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight animate-scale-in"
                style={{
                  color: '#1C2C55',
                  textShadow: '0 4px 8px rgba(28, 44, 85, 0.10)',
                  animationDelay: '0.2s',
                }}
              >
                Talk to your CRM
              </h1>

              <p
                className="text-lg sm:text-xl lg:text-2xl leading-relaxed animate-fade-in-up max-w-2xl"
                style={{
                  color: '#202226',
                  animationDelay: '0.3s',
                }}
              >
                Transform WhatsApp voice notes into structured CRM data instantly.
                <br className="hidden sm:block" />
                No typing, no forms, just talk.
              </p>

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

                {/* Micro trust line (cheap lift) */}
                <div className="mt-3 text-sm" style={{ color: 'rgba(32, 34, 38, 0.75)' }}>
                  No credit card • Setup in minutes
                </div>
              </div>

              {/* On mobile, show proof card directly under CTA (above-the-fold-ish) */}
              <div className="lg:hidden pt-2">
                <ProofCard />
              </div>
            </div>

            {/* Right: proof card on desktop */}
            <div className="hidden lg:flex justify-end animate-fade-in-right" style={{ animationDelay: '0.3s' }}>
              <ProofCard />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};