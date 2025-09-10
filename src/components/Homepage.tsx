import React from 'react';
import { MessageCircle, Zap, Shield, ArrowRight, Star, CheckCircle, Play, Users, Mic, Settings } from 'lucide-react';
import { HeroDemo } from './HeroDemo';
import { PricingSection } from './PricingSection';

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
  const originalPrice = userCount * 29.90;
  const savings = originalPrice - totalPrice;
  
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
            placeholder="Enter number of users"
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
        <div className="mb-6">
          <p className="text-sm" style={{ color: '#202226' }}>
            €{tierInfo.pricePerUser.toFixed(2)}/user/month • {userCount} user{userCount > 1 ? 's' : ''}
          </p>
          {tierInfo.discount > 0 && (
            <div className="mt-2">
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: '#F7E69B', color: '#1C2C55' }}>
                {tierInfo.tier} Plan • {tierInfo.discount}% discount
              </span>
              <p className="text-xs text-green-600 mt-1">

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
          <HeroDemo />
        </div>
      </section>

      {/* Features Section */}
      <section 
        id="features" 
        data-animate-section
        className={`py-16 relative z-10 transition-all duration-1000 ${
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
              CRM Integrations
            </h2>
            <p className="text-xl max-w-2xl mx-auto font-light" style={{ color: '#6B7280' }}>
              Connect instantly. Sync automatically.
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
                  alt="TeamLeader" 
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
                  alt="Pipedrive" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-gray-900">Pipedrive</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection openModal={openModal} />
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
                      CRM Integration
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Structured data syncs automatically to your CRM system
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
        className={`py-20 relative z-10 transition-all duration-1000 ${
          visibleSections.has('pricing') 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center mb-16 transition-all duration-1000 delay-200 ${
            visibleSections.has('pricing') 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#1C2C55' }}>
            Volume Pricing That Scales With You
            </h2>
            <p className="text-xl" style={{ color: '#202226' }}>
              Per user pricing. Start free, upgrade when you're ready. No hidden fees.
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className={`grid lg:grid-cols-[1fr_1fr] gap-8 items-start transition-all duration-1000 delay-300 ${
              visibleSections.has('pricing') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}>
              {/* Left side - VoiceLink Pro Card */}
              <div className={`bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative hover:shadow-2xl transition-all duration-1000 delay-500 ${
                visibleSections.has('pricing') 
                  ? 'opacity-100 -translate-x-0' 
                  : 'opacity-0 -translate-x-8'
              }`}>
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #1C2C55 0%, #F7E69B 100%)' }}></div>
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(247, 230, 155, 0.02) 0%, rgba(28, 44, 85, 0.01) 100%)' }}></div>
                
                <div className="p-8 relative">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Left side - Product info */}
                    <div className="text-center md:text-left">
                    {/* VoiceLink logo in pricing card - blue version on white background */}
                    <img 
                      src="/Finit Voicelink Blue.svg" 
                      alt="VoiceLink Pro" 
                      className="h-12 w-auto mx-auto md:mx-0 mb-4"
                    />
                    <h3 className="text-2xl font-bold mb-2" style={{ color: '#1C2C55' }}>VoiceLink Pro</h3>
                    <p className="mb-6" style={{ color: '#202226' }}>Perfect for growing teams</p>
                    
                    <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#1C2C55' }} />
                      <span style={{ color: '#202226' }}>Unlimited WhatsApp voice notes</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#1C2C55' }} />
                      <span style={{ color: '#202226' }}>Real-time CRM sync</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#1C2C55' }} />
                      <span style={{ color: '#202226' }}>Native WhatsApp integration</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#1C2C55' }} />
                      <span style={{ color: '#202226' }}>Multi-language support</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#1C2C55' }} />
                      <span style={{ color: '#202226' }}>Priority support</span>
                    </div>
                    </div>
                  </div>

                  {/* Right side - Pricing and purchase */}
                  <div className="text-center">
                    <PricingCalculator />
                  </div>
                </div>
                </div>
              </div>

              {/* Right side - Volume Discount Tiers Table */}
              <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-1000 delay-700 ${
                visibleSections.has('pricing') 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 translate-x-8'
              }`}>
                <div className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2" style={{ color: '#1C2C55' }}>Volume Discount Tiers</h3>
                    <p className="text-gray-600">Automatic discounts applied based on team size</p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200" style={{ backgroundColor: '#F8FAFC' }}>
                          <th className="text-left py-4 px-6 font-semibold" style={{ color: '#1C2C55' }}>Plan</th>
                          <th className="text-left py-4 px-6 font-semibold" style={{ color: '#1C2C55' }}>Team Size</th>
                          <th className="text-left py-4 px-6 font-semibold" style={{ color: '#1C2C55' }}>Price per User</th>
                          <th className="text-left py-4 px-6 font-semibold" style={{ color: '#1C2C55' }}>Discount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-4 px-6 font-medium" style={{ color: '#1C2C55' }}>Starter</td>
                          <td className="py-4 px-6 text-gray-600">1–4 users</td>
                          <td className="py-4 px-6 font-semibold">€29.90</td>
                          <td className="py-4 px-6 text-gray-500">—</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-4 px-6 font-medium" style={{ color: '#1C2C55' }}>Team</td>
                          <td className="py-4 px-6 text-gray-600">5–9 users</td>
                          <td className="py-4 px-6 font-semibold">€27.00</td>
                          <td className="py-4 px-6">
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              10% off
                            </span>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-4 px-6 font-medium" style={{ color: '#1C2C55' }}>Business</td>
                          <td className="py-4 px-6 text-gray-600">10–24 users</td>
                          <td className="py-4 px-6 font-semibold">€24.00</td>
                          <td className="py-4 px-6">
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              20% off
                            </span>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-4 px-6 font-medium" style={{ color: '#1C2C55' }}>Growth</td>
                          <td className="py-4 px-6 text-gray-600">25–49 users</td>
                          <td className="py-4 px-6 font-semibold">€21.00</td>
                          <td className="py-4 px-6">
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              30% off
                            </span>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-4 px-6 font-medium" style={{ color: '#1C2C55' }}>Scale</td>
                          <td className="py-4 px-6 text-gray-600">50–99 users</td>
                          <td className="py-4 px-6 font-semibold">€18.00</td>
                          <td className="py-4 px-6">
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              40% off
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-4 px-6 font-medium" style={{ color: '#1C2C55' }}>Enterprise</td>
                          <td className="py-4 px-6 text-gray-600">100+ users</td>
                          <td className="py-4 px-6 font-semibold">€15.00</td>
                          <td className="py-4 px-6">
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                              50%+ off
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="text-center mt-6">
                    <p className="text-sm text-gray-500">
                      All plans include unlimited WhatsApp voice notes, real-time CRM sync, and priority support
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Solutions Section */}
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
              Want a custom VoiceLink solution?
            </h2>
            <p className="text-xl leading-relaxed max-w-3xl mx-auto" style={{ color: '#6B7280' }}>
              We build tailored voice solutions for any CRM or business system. 
              If it has an API, we can connect to it.
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
               <h3 className="text-xl font-semibold mb-2" style={{ color: '#1C2C55' }}>Two examples:</h3>
               <p className="text-gray-600">VoiceLink adapts to any industry or workflow that needs voice-to-data conversion.</p>
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
                    <h3 className="text-2xl font-semibold mb-3" style={{ color: '#1C2C55' }}>Field Technicians</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Technicians speak service reports while driving between jobs. Voice notes automatically 
                      generate structured reports with job details, parts used, and time spent.
                    </p>
                    <div className="text-sm text-gray-500">
                      Custom report formats • Real-time sync • Mobile-first
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
                    <h3 className="text-2xl font-semibold mb-3" style={{ color: '#1C2C55' }}>Property Management</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Property managers record maintenance requests, tenant interactions, and inspection notes via voice. 
                      AI automatically creates work orders, updates tenant records, and schedules follow-ups.
                    </p>
                    <div className="text-sm text-gray-500">
                      Work order creation • Tenant communication • Maintenance scheduling
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
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#1C2C55' }}>Connect Any CRM</h3>
                  <p className="text-sm text-gray-600">We integrate with any system that has an API</p>
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
                    + Any system with REST API, GraphQL, or webhooks
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
                Ready to Build Your Custom Solution?
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Tell us about your workflow, and we'll show you how voice technology can transform your business operations. 
                Every solution is tailored to your exact needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  className="group text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
                  style={{ backgroundColor: '#1C2C55' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F1A3A'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C2C55'}
                >
                  <span>Schedule Custom Demo</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
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
                  <span>Discuss Your Needs</span>
                </button>
              </div>
              
              <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" style={{ color: '#1C2C55' }} />
                  <span>Free consultation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" style={{ color: '#1C2C55' }} />
                  <span>Custom proof of concept</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" style={{ color: '#1C2C55' }} />
                  <span>Tailored implementation</span>
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
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto opacity-90">
            The more users you add, the more you save. Start free, scale affordably.
            Connect your WhatsApp and start your free trial today.
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
                alt="" 
                className="w-5 h-5 mr-1"
              />
              <span>Start Free Trial</span>
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
            >
              <Play className="w-5 h-5" />
              <span>Watch Demo</span>
            </button>
          </div>

          <div className={`mt-8 flex items-center justify-center space-x-8 text-white opacity-90 transition-all duration-1000 delay-500 ${
            visibleSections.has('final-cta') 
              ? 'opacity-90 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">14-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">No setup fees</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        id="footer"
        data-animate-section
        className={`text-white py-12 relative z-10 transition-all duration-1000 ${
          visibleSections.has('footer') 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
        style={{ backgroundColor: '#202226' }}
      >
        <div className={`max-w-7xl mx-auto px-6 transition-all duration-1000 delay-200 ${
          visibleSections.has('footer') 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              {/* White logo on dark background */}
              <img 
                src="/Finit Voicelink White.svg" 
                alt="VoiceLink" 
                className="h-8 w-auto"
              />
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-white opacity-70">
              <span>© 2025 Finit Solutions</span>
              <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/saas-agreement" className="hover:text-white transition-colors">SaaS Agreement</a>
              <a href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</a>
              <a href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</a>
              <a href="/support" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};