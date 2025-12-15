import React from 'react';
import { ArrowRight, CheckCircle, Play } from 'lucide-react';
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
  signupRoute = '/test',
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
        <div className="max-w-5xl mx-auto">
          {/* Hero Content */}
          <div className="text-center space-y-8 animate-fade-in-up">
            {/* Title */}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              style={{ color: '#1C2C55' }}
            >
              {hero.title}
            </h1>

            {/* Subtitle */}
            <p
              className="text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto"
              style={{ color: '#202226' }}
            >
              {hero.subtitle}
            </p>

            {/* Bullets */}
            <div className="flex flex-col items-center space-y-4 pt-6">
              {hero.bullets.map((bullet, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 max-w-2xl w-full text-left animate-fade-in-up"
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#1C2C55' }} />
                  <span className="text-lg text-gray-700">{bullet}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
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
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 pt-6 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" style={{ color: '#1C2C55' }} />
                <span>1-click setup</span>
              </div>
              <span>·</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" style={{ color: '#1C2C55' }} />
                <span>2-minute WhatsApp setup</span>
              </div>
              <span>·</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" style={{ color: '#1C2C55' }} />
                <span>No credit card required</span>
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
