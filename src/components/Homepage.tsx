import React from 'react';
import { Zap, MessageCircle, Play, ArrowRight, CheckCircle, Settings } from 'lucide-react';
import { HeroDemo } from './HeroDemo';
import { PricingSection } from './PricingSection';
import { useConsent } from '../contexts/ConsentContext';
import { useI18n } from '../hooks/useI18n';

interface HomepageProps {
  openModal: () => void;
  openContactModal: () => void;
}

// Custom hook for scroll-triggered animations
const useScrollAnimation = () => {
  const [visibleSections, setVisibleSections] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
      }
    );

    // Observe all sections
    const sections = document.querySelectorAll('[data-animate-section]');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return visibleSections;
};

// Pricing Calculator Component
const PricingCalculator: React.FC = () => {
  const [userCount, setUserCount] = React.useState(1);
  const [customInput, setCustomInput] = React.useState('');
  const [isCustom, setIsCustom] = React.useState(false);
  const { t } = useI18n();
  
  // Tier-based pricing logic
  const getTierInfo = (users: number) => {
    if (users >= 1 && users <= 4) return { tier: 'Starter', pricePerUser: 29.90, discount: 0 };
    if (users >= 5 && users <= 9) return { tier: 'Team', pricePerUser: 27.00, discount: 10 };
    if (users >= 10 && users <= 24) return { tier: 'Business', pricePerUser: 24.00, discount: 20 };
    if (users >= 25 && users <= 49) return { tier: 'Growth', pricePerUser: 21.00, discount: 30 };
    if (users >= 50 && users <= 99) return { tier: 'Scale', pricePerUser: 18.00, discount: 40 };
    return { tier: 'Enterprise', pricePerUser: 15.00, discount: 50 }; // 100+ users
  };
  
  const tierInfo = getTierInfo(userCount);
  const totalPrice = userCount * tierInfo.pricePerUser;
  
  const predefinedOptions = [1, 2, 3, 5, 10, 20, 50, 100];
  
  const handleUserCountChange = (value: string) => {
    if (value === 'custom') {
      setIsCustom(true);
      setCustomInput('');
    } else {
      setIsCustom(false);
      setUserCount(parseInt(value));
    }
  };
  
  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomInput(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setUserCount(numValue);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3" style={{ color: '#1C2C55' }}>
          Number of Users
        </label>
        <select
          value={isCustom ? 'custom' : userCount.toString()}
          onChange={(e) => handleUserCountChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-medium"
          style={{ color: '#1C2C55' }}
        >
          {predefinedOptions.map(option => (
            <option key={option} value={option.toString()}>
              {option} user{option > 1 ? 's' : ''}
            </option>
          ))}
          <option value="custom">Custom amount</option>
        </select>
        
        {isCustom && (
          <input
            type="number"
            min="1"
            value={customInput}
            onChange={handleCustomInputChange}
            placeholder={t('common.enterNumberOfUsers')}
            className="w-full mt-3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-medium"
            style={{ color: '#1C2C55' }}
          />
        )}
      </div>
      
      <div className="text-center">
        <div className="flex items-baseline justify-center space-x-1 mb-2">
          <span className="text-4xl font-bold" style={{ color: '#1C2C55' }}>
            €{totalPrice.toFixed(2)}
          </span>
          <span className="text-lg" style={{ color: '#202226' }}>/month</span>
        </div>
      </div>
    </div>
  );
};

export const Homepage: React.FC<HomepageProps> = ({ openModal, openContactModal }) => {
  const visibleSections = useScrollAnimation();
  const [selectedUsers, setSelectedUsers] = React.useState(1);
  const { openSettings } = useConsent();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-white relative">
      {/* Continuous Background Gradient */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1C2C55 0%, #FFFFFF 50%, #F7E69B 100%)' }}></div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(45deg, transparent 0%, rgba(247, 230, 155, 0.1) 20%, transparent 40%, rgba(28, 44, 85, 0.05) 60%, transparent 80%, rgba(247, 230, 155, 0.08) 100%)' }}></div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(28, 44, 85, 0.02) 0%, transparent 30%, rgba(247, 230, 155, 0.03) 50%, transparent 70%, rgba(28, 44, 85, 0.02) 100%)' }}></div>
      </div>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden z-10 pt-48 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="w-full">
          <HeroDemo openModal={openModal} />
        </div>
      </section>

      {/* Features Section */}
      <section 
        id="features" 
        data-animate-section
        className={`py-16 relative z-10 transition-all duration-1000 scroll-mt-24 ${
          visibleSections.has('features') 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center mb-12 transition-all duration-1000 delay-200 ${
            visibleSections.has('features') 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-5xl font-bold mb-6 tracking-tight" style={{ color: '#1C2C55' }}>
              {t('features.title')}
            </h2>
            <p className="text-xl max-w-2xl mx-auto font-light" style={{ color: '#6B7280' }}>
              {t('features.subtitle')}
            </p>
          </div>

          {/* CRM Logos */}
          <div className="flex justify-center items-center space-x-16 mb-12">
            <div className={`group cursor-pointer transition-all duration-800 delay-500 ${
              visibleSections.has('features') 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-95'
            }`}>
              <div className="w-24 h-24 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 group-hover:shadow-lg transition-all duration-300 p-4 mb-3">
                <img 
                  src="/Teamleader_Icon.svg" 
                  alt={t('platforms.teamleader')} 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-gray-900">TeamLeader</div>
              </div>
            </div>
            
            <div className={`group cursor-pointer transition-all duration-800 delay-700 ${
              visibleSections.has('features') 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-95'
            }`}>
              <div className="w-24 h-24 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 group-hover:shadow-lg transition-all duration-300 p-4 mb-3">
                <img 
                  src="/Pipedrive_id-7ejZnwv_0.svg" 
                  alt={t('platforms.pipedrive')} 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-gray-900">Pipedrive</div>
              </div>
            </div>
            
            <div className={`group cursor-pointer transition-all duration-800 delay-[900ms] ${
              visibleSections.has('features') 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-95'
            }`}>
              <div className="w-24 h-24 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 group-hover:shadow-lg transition-all duration-300 p-4 mb-3">
                <img 
                  src="/odoo_logo.svg" 
                  alt={t('platforms.odoo')} 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-gray-900">Odoo</div>
              </div>
            </div>
          </div>

          {/* Feature list */}
          <div className="text-center mb-12">
            <div className="flex justify-center space-x-8 mb-8">
              <div className={`group flex flex-col items-center space-y-2 p-3 rounded-xl transition-all duration-800 delay-[1100ms] hover:bg-gray-50 ${
                visibleSections.has('features') 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4'
              }`}>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="text-base font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{t('features.oneClickSetup')}</div>
              </div>
              
              <div className={`group flex flex-col items-center space-y-2 p-3 rounded-xl transition-all duration-800 delay-[1300ms] hover:bg-gray-50 ${
                visibleSections.has('features') 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4'
              }`}>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="text-base font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{t('features.realtimeSync')}</div>
              </div>
              
              <div className={`group flex flex-col items-center space-y-2 p-3 rounded-xl transition-all duration-800 delay-[1500ms] hover:bg-gray-50 ${
                visibleSections.has('features') 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4'
              }`}>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="text-base font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{t('features.secureOauth')}</div>
              </div>
            </div>
          </div>

          {/* More integrations coming */}
          <div className={`text-center transition-all duration-800 delay-[1700ms] ${
            visibleSections.has('features') 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-gray-600 mb-4">
                {t('features.moreIntegrations')}
              </p>
              <p className="text-base text-gray-500 mb-6 font-bold">
                {t('features.dontSeeYourCrm')}
              </p>
              <button 
                onClick={openContactModal}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-white border border-gray-300 rounded-full hover:border-gray-400 transition-colors group"
              >
                <span className="text-base font-medium text-gray-700">{t('features.contactForCustom')}</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              <a
                href="https://www.youtube.com/watch?v=wVaR0NwPNHc"
                target="_blank"
                rel="noopener noreferrer"
              >
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section 
        id="how-it-works"
        data-animate-section
        className={`py-32 relative z-10 transition-all duration-1000 scroll-mt-24 ${
          visibleSections.has('how-it-works') 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center mb-24 transition-all duration-1000 delay-200 ${
            visibleSections.has('how-it-works') 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-5xl font-bold mb-6 leading-tight tracking-tight" style={{ color: '#1C2C55' }}>
              {t('howItWorks.title')}
            </h2>
            <p className="text-2xl font-light max-w-3xl mx-auto leading-relaxed" style={{ color: '#6B7280' }}>
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Professional Process Flow */}
            <div className={`relative transition-all duration-1000 delay-300 ${
              visibleSections.has('how-it-works') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}>
              {/* Connection Line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-200 to-transparent transform -translate-y-1/2 hidden lg:block"></div>
              
              <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
                {/* Step 1 - Voice Input */}
                <div className={`group relative transition-all duration-1000 delay-500 ${
                  visibleSections.has('how-it-works') 
                    ? 'opacity-100 -translate-x-0' 
                    : 'opacity-0 -translate-x-8'
                }`}>
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-500 hover:-translate-y-2">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)' }}>
                        <svg className="w-7 h-7" style={{ color: '#1C2C55' }} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                        </svg>
                      </div>
                      <div className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)', color: '#1C2C55' }}>
                        Step 1
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3" style={{ color: '#1C2C55' }}>
                      {t('howItWorks.step1.title')}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {t('howItWorks.step1.description')}
                    </p>
                  </div>
                  
                  {/* Animated Arrow */}
                  <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Step 2 - AI Processing */}
                <div className={`group relative transition-all duration-1000 delay-700 ${
                  visibleSections.has('how-it-works') 
                    ? 'opacity-100 scale-100' 
                    : 'opacity-0 scale-95'
                }`}>
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-500 hover:-translate-y-2">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)' }}>
                        <svg className="w-7 h-7" style={{ color: '#1C2C55' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                          <circle cx="12" cy="9" r="2" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)', color: '#1C2C55' }}>
                        Step 2
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3" style={{ color: '#1C2C55' }}>
                      {t('howItWorks.step2.title')}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {t('howItWorks.step2.description')}
                    </p>
                  </div>
                  
                  {/* Animated Arrow */}
                  <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Step 3 - CRM Integration */}
                <div className={`group relative transition-all duration-1000 delay-[900ms] ${
                  visibleSections.has('how-it-works') 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 translate-x-8'
                }`}>
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-500 hover:-translate-y-2">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)' }}>
                        <svg className="w-7 h-7" style={{ color: '#1C2C55' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 12c0 2.21 3.582 4 8 4s8-1.79 8-4"/>
                        </svg>
                      </div>
                      <div className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)', color: '#1C2C55' }}>
                        Step 3
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3" style={{ color: '#1C2C55' }}>
                      {t('howItWorks.step3.title')}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {t('howItWorks.step3.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section 
        id="pricing" 
        data-animate-section
        className={`py-20 relative z-10 transition-all duration-1000 scroll-mt-24 ${
          visibleSections.has('pricing') 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
      >
        <PricingSection 
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
          openModal={openModal}
          openContactModal={openContactModal}
        />
      </section>
      
      <section 
        id="custom-solutions" 
        data-animate-section
        className={`py-20 relative z-10 transition-all duration-1000 ${
          visibleSections.has('custom-solutions') 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Header Section */}
          <div className={`text-center mb-20 transition-all duration-1000 delay-200 ${
            visibleSections.has('custom-solutions') 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-5xl font-bold mb-6 leading-tight tracking-tight" style={{ color: '#1C2C55' }}>
              {t('customSolutions.title')}
            </h2>
            <p className="text-xl leading-relaxed max-w-3xl mx-auto" style={{ color: '#6B7280' }}>
              {t('customSolutions.subtitle')}
            </p>
          </div>

          {/* Main Content Grid */}
          <div className={`grid lg:grid-cols-[2fr_1fr] gap-16 items-start mb-20 transition-all duration-1000 delay-300 ${
            visibleSections.has('custom-solutions') 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}>
            {/* Left Side - Animated Use Cases */}
            <div className="space-y-8">
             <div className={`text-center lg:text-left mb-8 transition-all duration-1000 delay-500 ${
               visibleSections.has('custom-solutions') 
                 ? 'opacity-100 -translate-x-0' 
                 : 'opacity-0 -translate-x-8'
             }`}>
               <h3 className="text-xl font-semibold mb-2" style={{ color: '#1C2C55' }}>{t('customSolutions.twoExamples')}</h3>
               <p className="text-gray-600">{t('customSolutions.adaptsToAnyIndustry')}</p>
             </div>
             
              <div className={`bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-1000 delay-600 ${
                visibleSections.has('custom-solutions') 
                  ? 'opacity-100 -translate-x-0' 
                  : 'opacity-0 -translate-x-8'
              }`}>
                <div className="flex items-start space-x-6 mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.08)' }}>
                      <Settings className="w-8 h-8" style={{ color: '#1C2C55' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-3" style={{ color: '#1C2C55' }}>{t('customSolutions.fieldTechnicians.title')}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {t('customSolutions.fieldTechnicians.description')}
                    </p>
                    <div className="text-sm text-gray-500">
                      {t('customSolutions.fieldTechnicians.features')}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-1000 delay-800 ${
                visibleSections.has('custom-solutions') 
                  ? 'opacity-100 -translate-x-0' 
                  : 'opacity-0 -translate-x-8'
              }`}>
                <div className="flex items-start space-x-6 mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.08)' }}>
                      <Settings className="w-8 h-8" style={{ color: '#1C2C55' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-3" style={{ color: '#1C2C55' }}>{t('customSolutions.propertyManagement.title')}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {t('customSolutions.propertyManagement.description')}
                    </p>
                    <div className="text-sm text-gray-500">
                      {t('customSolutions.propertyManagement.features')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Technology Showcase */}
            <div className={`sticky top-8 transition-all duration-1000 delay-700 ${
              visibleSections.has('custom-solutions') 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 translate-x-8'
            }`}>
              <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-1000 delay-[900ms] ${
                visibleSections.has('custom-solutions') 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-95'
              }`}>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.08)' }}>
                    <Zap className="w-6 h-6" style={{ color: '#1C2C55' }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#1C2C55' }}>{t('customSolutions.connectAnyCrm')}</h3>
                  <p className="text-sm text-gray-600">{t('customSolutions.integrateWithAnySystem')}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-800">HubSpot</span>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-800">Salesforce</span>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-800">ERP Systems</span>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-800">Project Management</span>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-800">Custom Databases</span>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                </div>

                <div className="text-center mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(247, 230, 155, 0.1)' }}>
                  <p className="text-xs font-medium" style={{ color: '#1C2C55' }}>
                    {t('customSolutions.apiSupport')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA Section */}
          <div className={`text-center bg-gradient-to-r from-gray-50 to-white rounded-3xl p-12 shadow-lg border border-gray-100 relative overflow-hidden transition-all duration-1000 delay-[1000ms] ${
            visibleSections.has('custom-solutions') 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-20"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4" style={{ color: '#1C2C55' }}>
                {t('customSolutions.readyToBuild')}
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                {t('customSolutions.customSolutionDescription')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.open('https://calendly.com/alex-finitsolutions/30min', '_blank')}
                  className="group text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
                  style={{ backgroundColor: '#1C2C55' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F1A3A'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C2C55'}
                >
                  <span>{t('customSolutions.scheduleCustomDemo')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={openContactModal}
                  className="group border-2 font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center space-x-2"
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
                  <MessageCircle className="w-5 h-5" />
                  <span>{t('customSolutions.discussYourNeeds')}</span>
                </button>
              </div>
              
              <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" style={{ color: '#1C2C55' }} />
                  <span>{t('customSolutions.freeConsultation')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" style={{ color: '#1C2C55' }} />
                  <span>{t('customSolutions.customProofOfConcept')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" style={{ color: '#1C2C55' }} />
                  <span>{t('customSolutions.tailoredImplementation')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section 
        id="final-cta"
        data-animate-section
        className={`py-20 relative z-10 transition-all duration-1000 ${
          visibleSections.has('final-cta') 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
        style={{ background: 'linear-gradient(135deg, #1C2C55 0%, #F7E69B 100%)' }}
      >
        <div className={`max-w-4xl mx-auto px-6 text-center transition-all duration-1000 delay-200 ${
          visibleSections.has('final-cta') 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            {t('finalCta.title')}
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto opacity-90">
            {t('finalCta.subtitle')}
          </p>
          
          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-300 ${
            visibleSections.has('final-cta') 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}>
            <button
              onClick={openModal}
              className="group bg-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
              style={{ color: '#1C2C55' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F7E69B'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              {/* Small logo icon in CTA button */}
              <img 
                src="/Finit Voicelink Blue.svg" 
                alt={t('common.voiceLink')} 
                className="w-5 h-5 mr-1"
              />
              <span>{t('finalCta.startFreeTrial')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              className="group border-2 border-white text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.color = '#1C2C55';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onClick={() => window.open('https://youtu.be/wVaR0NwPNHc', '_blank')}
            >
              <Play className="w-5 h-5" />
              <span>{t('finalCta.watchDemo')}</span>
            </button>
          </div>

          <div className={`mt-8 flex items-center justify-center space-x-8 text-white opacity-90 transition-all duration-1000 delay-500 ${
            visibleSections.has('final-cta') 
              ? 'opacity-90 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">{t('finalCta.freeTrialFeatures.freeTrialDays')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">{t('finalCta.freeTrialFeatures.noSetupFees')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">{t('finalCta.freeTrialFeatures.cancelAnytime')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        id="footer"
        data-animate-section
        className="text-white py-12 relative z-10"
        style={{ backgroundColor: '#202226' }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              {/* White logo on dark background */}
              <img 
                src="/Finit Voicelink White.svg" 
                alt={t('common.voiceLink')} 
                className="h-8 w-auto"
              />
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-white opacity-70">
              <span>{t('footer.copyright')}</span>
              <a href="/privacy-policy" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
              <a href="/saas-agreement" className="hover:text-white transition-colors">{t('footer.saasAgreement')}</a>
              <a href="/disclaimer" className="hover:text-white transition-colors">{t('footer.disclaimer')}</a>
              <a href="/cookie-policy" className="hover:text-white transition-colors">{t('footer.cookiePolicy')}</a>
              <button 
                onClick={() => {
                  console.log('Cookie Settings button clicked'); // Debug log
                  openSettings();
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                {t('footer.cookieSettings')}
              </button>
              <a href="/support" className="hover:text-white transition-colors">{t('footer.support')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
