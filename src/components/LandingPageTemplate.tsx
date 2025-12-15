import React from 'react';
import { ArrowRight, CheckCircle, Play, Mic, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUTM } from '../utils/utm';

interface LandingPageProps {
  hero: {
    title: string;
    subtitle: string;
    bullets: string[];
  };
  signupRoute?: string;
  demoURL?: string;
}

export const LandingPageTemplate: React.FC<LandingPageProps> = ({
  hero,
  signupRoute = '/signup',
  demoURL = 'https://youtu.be/wVaR0NwPNHc',
}) => {
  const navigate = useNavigate();
  const { appendUTM } = useUTM();

  const handleGetStarted = () => {
    const url = appendUTM(signupRoute);
    navigate(url);
  };

  const handleWatchDemo = () => {
    const url = appendUTM(demoURL);
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[2fr_1fr] gap-8 items-center">
            {/* Hero Text - Left Side */}
            <div className="space-y-8 animate-fade-in-left">
              {/* Title */}
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                style={{ color: '#1C2C55' }}
              >
                {hero.title}
              </h1>

              {/* Subtitle */}
              <p
                className="text-xl md:text-2xl leading-relaxed"
                style={{ color: '#202226' }}
              >
                {hero.subtitle}
              </p>

              {/* Bullets */}
              <div className="flex flex-col space-y-4">
                {hero.bullets.map((bullet, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 animate-fade-in-up"
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                  >
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#1C2C55' }} />
                    <span className="text-lg text-gray-700">{bullet}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <button
                  onClick={handleGetStarted}
                  data-append-utm="true"
                  className="group text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center space-x-2"
                  style={{ backgroundColor: '#1C2C55' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F1A3A'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C2C55'}
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={handleWatchDemo}
                  data-append-utm="true"
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

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" style={{ color: '#1C2C55' }} />
                  <span>1-click setup</span>
                </div>
                <span className="hidden sm:inline">·</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" style={{ color: '#1C2C55' }} />
                  <span>2-minute WhatsApp setup</span>
                </div>
                <span className="hidden sm:inline">·</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" style={{ color: '#1C2C55' }} />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>

            {/* Phone Mockup - Right Side */}
            <div className="flex justify-center lg:justify-end animate-fade-in-right" style={{ animationDelay: '0.5s' }}>
              <div className="relative max-w-xs mx-auto">
                {/* Background Effect Elements */}
                <div className="absolute inset-0 transform translate-x-8 translate-y-8 bg-gradient-to-br from-gray-300 to-gray-500 rounded-[2.5rem] blur-2xl opacity-40 scale-110"></div>

                {/* Phone Frame */}
                <div className="relative bg-black rounded-[2.5rem] p-1.5 shadow-2xl z-10" style={{
                  aspectRatio: '9/19.5',
                  boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.5), 0 25px 50px -15px rgba(0, 0, 0, 0.4)'
                }}>
                  {/* iPhone Dynamic Island */}
                  <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10"></div>

                  <div className="bg-white rounded-[2.25rem] overflow-hidden h-full">
                    {/* WhatsApp Header */}
                    <div className="bg-[#075E54] px-4 py-4 pt-8 flex items-center space-x-3 animate-fade-in-up" style={{ animationDelay: '1.0s' }}>
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center p-2">
                        <img
                          src="/Finit Icon Blue.svg"
                          alt="VoiceLink"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">VoiceLink</div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                          <span className="text-xs text-green-200">online</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <img
                          src="/whatsapp.svg"
                          alt="WhatsApp"
                          className="w-6 h-6"
                        />
                        <div className="text-white text-lg font-bold">⋮</div>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="bg-[#ECE5DD] flex-1 flex flex-col" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4d4d8' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                      height: '600px'
                    }}>
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* User Voice Message */}
                        <div className="flex justify-end animate-fade-in-right" style={{ animationDelay: '1.5s' }}>
                          <div className="bg-[#DCF8C6] rounded-2xl rounded-br-md p-3 max-w-[280px] shadow-sm">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#25D366' }}>
                                <Play className="w-3 h-3 text-white ml-0.5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-1 px-2 py-1">
                                  {[...Array(25)].map((_, i) => {
                                    const heights = [2, 4, 6, 8, 10, 12, 14, 16, 14, 12, 10, 8, 6, 10, 14, 18, 16, 12, 8, 6, 4, 2, 4, 6, 8];
                                    const isPlayed = i < 15;

                                    return (
                                      <div
                                        key={i}
                                        className="rounded-full"
                                        style={{
                                          width: '2px',
                                          height: `${heights[i]}px`,
                                          backgroundColor: isPlayed ? '#128C7E' : '#B3B3B3'
                                        }}
                                      ></div>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="text-xs font-medium text-gray-600 ml-1">1:23</div>
                            </div>
                            <div className="flex justify-end items-center space-x-1">
                              <span className="text-xs text-gray-500">2:30 PM</span>
                              <CheckCircle className="w-3 h-3 text-[#53BDEB]" />
                            </div>
                          </div>
                        </div>

                        {/* Processing Indicator */}
                        <div className="flex justify-start animate-fade-in-left" style={{ animationDelay: '1.8s' }}>
                          <div className="bg-white rounded-2xl rounded-bl-md p-3 max-w-[250px] shadow-sm">
                            <div className="flex items-center space-x-2">
                              <Zap className="w-4 h-4 animate-pulse" style={{ color: '#1C2C55' }} />
                              <span className="text-sm font-medium" style={{ color: '#1C2C55' }}>AI processing...</span>
                            </div>
                            <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full animate-pulse" style={{ backgroundColor: '#F7E69B', width: '70%' }}></div>
                            </div>
                          </div>
                        </div>

                        {/* VoiceLink Bot Reply */}
                        <div className="flex justify-start animate-fade-in-left" style={{ animationDelay: '2.1s' }}>
                          <div className="bg-white rounded-2xl rounded-bl-md p-4 max-w-[280px] shadow-sm">
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center p-1">
                                <img
                                  src="/Finit Icon Blue.svg"
                                  alt="VoiceLink"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <span className="text-sm font-semibold" style={{ color: '#1C2C55' }}>VoiceLink</span>
                            </div>

                            <div className="text-sm text-gray-800 leading-relaxed">
                              <div className="font-medium mb-2" style={{ color: '#1C2C55' }}>✅ Updated in your CRM</div>

                              <div className="space-y-1.5 text-sm">
                                <div>📞 <strong>Follow-up call</strong> - Sarah Mitchell (TechFlow)</div>
                                <div className="ml-4 text-gray-700">• Discuss premium package</div>
                                <div className="ml-4 text-gray-700">• Thursday, Jan 16 at 2:00 PM</div>
                              </div>
                            </div>

                            <div className="flex justify-end items-center space-x-1 mt-3">
                              <span className="text-xs text-gray-500">2:31 PM</span>
                              <CheckCircle className="w-3 h-3 text-[#53BDEB]" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* WhatsApp Input Area */}
                      <div className="flex-shrink-0 p-4 pt-2">
                        <div className="bg-white rounded-full px-4 py-2 flex items-center space-x-3 shadow-sm">
                          <div className="text-gray-400">😊</div>
                          <div className="flex-1 text-sm text-gray-500">Type a message</div>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#25D366' }}>
                            <Mic className="w-4 h-4 text-white" />
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

      {/* Proof Section - Integrations */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#1C2C55' }}>
              Works with your CRM
            </h2>
            <p className="text-lg text-gray-600">
              Seamlessly integrate with leading CRM platforms
            </p>
          </div>

          {/* Platform Logos */}
          <div className="flex flex-wrap items-center justify-center gap-12">
            <div className="group transition-all duration-300 hover:scale-110">
              <div className="w-32 h-32 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 group-hover:shadow-lg transition-all duration-300 p-4">
                <img
                  src="/Teamleader_Icon.svg"
                  alt="Teamleader"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center mt-3">
                <div className="text-lg font-medium text-gray-900">Teamleader</div>
              </div>
            </div>

            <div className="group transition-all duration-300 hover:scale-110">
              <div className="w-32 h-32 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 group-hover:shadow-lg transition-all duration-300 p-4">
                <img
                  src="/Pipedrive_id-7ejZnwv_0.svg"
                  alt="Pipedrive"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center mt-3">
                <div className="text-lg font-medium text-gray-900">Pipedrive</div>
              </div>
            </div>

            <div className="group transition-all duration-300 hover:scale-110">
              <div className="w-32 h-32 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 group-hover:shadow-lg transition-all duration-300 p-4">
                <img
                  src="/odoo_logo.svg"
                  alt="Odoo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center mt-3">
                <div className="text-lg font-medium text-gray-900">Odoo</div>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="flex justify-center space-x-8 mt-16">
            <div className="flex flex-col items-center space-y-2 p-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-base font-medium text-gray-700">1-click setup</div>
            </div>

            <div className="flex flex-col items-center space-y-2 p-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-base font-medium text-gray-700">Real-time sync</div>
            </div>

            <div className="flex flex-col items-center space-y-2 p-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-base font-medium text-gray-700">Secure OAuth</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#1C2C55' }}>
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join teams already using VoiceLink to stay on top of their CRM
          </p>
          <button
            onClick={handleGetStarted}
            data-append-utm="true"
            className="group text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] inline-flex items-center space-x-2"
            style={{ backgroundColor: '#1C2C55' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F1A3A'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C2C55'}
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
};
