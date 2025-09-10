import React from 'react';
import { MessageCircle, Zap, Shield, ArrowRight, Star, CheckCircle, Play, Users, Mic, Settings } from 'lucide-react';
import { HeroDemo } from './HeroDemo';

// Pricing Calculator Component
const PricingCalculator: React.FC = () => {
  const [userCount, setUserCount] = React.useState(1);
  const [customInput, setCustomInput] = React.useState('');
  const [isCustom, setIsCustom] = React.useState(false);
  
  const basePrice = 29.99;
  const totalPrice = userCount * basePrice;
  
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
        <p className="text-sm mb-6" style={{ color: '#202226' }}>
          €{basePrice}/user/month • {userCount} user{userCount > 1 ? 's' : ''}
        </p>
        
        <button
          className="w-full text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
          style={{ backgroundColor: '#1C2C55' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F1A3A'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C2C55'}
        >
          <span>Start Free Trial</span>
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <p className="text-xs text-gray-500 mt-3">
          14-day free trial • No credit card required
        </p>
      </div>
    </div>
  );
};

interface HomepageProps {
  openModal: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({ openModal }) => {
  return (
    <div className="min-h-screen bg-white relative">
      {/* Continuous Background Gradient */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1C2C55 0%, #FFFFFF 50%, #F7E69B 100%)' }}></div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(45deg, transparent 0%, rgba(247, 230, 155, 0.1) 20%, transparent 40%, rgba(28, 44, 85, 0.05) 60%, transparent 80%, rgba(247, 230, 155, 0.08) 100%)' }}></div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(28, 44, 85, 0.02) 0%, transparent 30%, rgba(247, 230, 155, 0.03) 50%, transparent 70%, rgba(28, 44, 85, 0.02) 100%)' }}></div>
      </div>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden z-10 pt-48">
        <div className="w-full">


          <HeroDemo />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 tracking-tight" style={{ color: '#1C2C55' }}>
              CRM Integrations
            </h2>
            <p className="text-xl max-w-2xl mx-auto font-light" style={{ color: '#6B7280' }}>
              Connect instantly. Sync automatically.
            </p>
          </div>

          {/* CRM Logos */}
          <div className="flex justify-center items-center space-x-24 mb-20">
            <div className="group cursor-pointer">
              <div className="w-32 h-32 flex items-center justify-center bg-white rounded-3xl shadow-sm border border-gray-100 group-hover:shadow-lg transition-all duration-300 p-6 mb-4">
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
            
            <div className="group cursor-pointer">
              <div className="w-32 h-32 flex items-center justify-center bg-white rounded-3xl shadow-sm border border-gray-100 group-hover:shadow-lg transition-all duration-300 p-6 mb-4">
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
            
            <div className="group cursor-pointer">
              <div className="w-32 h-32 flex items-center justify-center bg-white rounded-3xl shadow-sm border border-gray-100 group-hover:shadow-lg transition-all duration-300 p-6 mb-4">
                <img 
                  src="/odoo_logo.svg" 
                  alt="Odoo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-gray-900">Odoo</div>
              </div>
            </div>
          </div>

          {/* Simple feature list */}
          <div className="text-center mb-16">
            <div className="flex justify-center space-x-12 mb-10">
              <div className="group flex flex-col items-center space-y-3 p-4 rounded-2xl transition-all duration-300 hover:bg-gray-50">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="text-base font-medium text-gray-700 group-hover:text-gray-900 transition-colors">One-click setup</div>
              </div>
              
              <div className="group flex flex-col items-center space-y-3 p-4 rounded-2xl transition-all duration-300 hover:bg-gray-50">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="text-base font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Real-time sync</div>
              </div>
              
              <div className="group flex flex-col items-center space-y-3 p-4 rounded-2xl transition-all duration-300 hover:bg-gray-50">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="text-base font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Secure OAuth</div>
              </div>
            </div>
          </div>

          {/* More integrations coming */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-3 px-8 py-4 bg-gray-50 rounded-full border border-gray-200 mb-8">
              <div className="flex space-x-1.5">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
              </div>
              <span className="text-base font-medium text-gray-600">HubSpot, Salesforce, Zoho & more</span>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-gray-600 mb-6">
                Don't see your CRM? We build custom integrations for any platform with an API.
              </p>
              <button className="inline-flex items-center space-x-2 px-8 py-4 bg-white border border-gray-300 rounded-full hover:border-gray-400 transition-colors">
                <span className="text-base font-medium text-gray-700">Request Custom Integration</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Solutions Section */}
      <section id="custom-solutions" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header Section */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-full mb-6" style={{ backgroundColor: 'rgba(247, 230, 155, 0.2)', border: '1px solid rgba(28, 44, 85, 0.1)' }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#1C2C55' }}></div>
              <span className="text-sm font-medium" style={{ color: '#1C2C55' }}>Custom Voice Solutions</span>
            </div>
            <h2 className="text-5xl font-bold mb-6 leading-tight" style={{ color: '#1C2C55' }}>
              Built for Your
              <span className="block relative">
                <span className="relative z-10">Unique Business</span>
              </span>
            </h2>
            <p className="text-xl leading-relaxed max-w-4xl mx-auto" style={{ color: '#202226' }}>
              VoiceLink isn't just a CRM tool. We create custom voice-powered solutions tailored to your industry, 
              workflow, and specific business requirements. If it has an API, we can connect to it.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Left Side - Animated Use Cases */}
            <div className="space-y-8">
              <div className="group">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)' }}>
                      <Settings className="w-8 h-8" style={{ color: '#1C2C55' }} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2" style={{ color: '#1C2C55' }}>Field Technicians</h3>
                      <p className="text-gray-600">On-the-road reporting made simple</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Technicians speak their service reports while driving between jobs. Voice notes automatically 
                    generate structured reports with job details, parts used, time spent, and next steps - 
                    all formatted exactly how your system needs it.
                  </p>
                  <div className="flex items-center space-x-2 text-sm font-medium" style={{ color: '#1C2C55' }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F7E69B' }}></div>
                    <span>Custom report formats • Real-time sync • Mobile-first</span>
                  </div>
                </div>
              </div>

              <div className="group">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)' }}>
                      <Users className="w-8 h-8" style={{ color: '#1C2C55' }} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2" style={{ color: '#1C2C55' }}>Healthcare Teams</h3>
                      <p className="text-gray-600">Patient care documentation</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Healthcare professionals record patient interactions, treatment notes, and care plans via voice. 
                    Our AI structures the information according to medical standards and integrates with EMR systems, 
                    ensuring compliance and accuracy.
                  </p>
                  <div className="flex items-center space-x-2 text-sm font-medium" style={{ color: '#1C2C55' }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F7E69B' }}></div>
                    <span>HIPAA compliant • Medical terminology • EMR integration</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Technology Showcase */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-2xl border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-100 to-orange-100 rounded-full blur-2xl opacity-40"></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#1C2C55' }}>
                      <Zap className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: '#1C2C55' }}>Any System, Any API</h3>
                    <p className="text-gray-600">We connect to whatever you use</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)' }}>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#1C2C55' }}></div>
                        </div>
                        <span className="font-medium text-gray-800">ERP Systems</span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)' }}>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#1C2C55' }}></div>
                        </div>
                        <span className="font-medium text-gray-800">Project Management</span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)' }}>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#1C2C55' }}></div>
                        </div>
                        <span className="font-medium text-gray-800">Inventory Systems</span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)' }}>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#1C2C55' }}></div>
                        </div>
                        <span className="font-medium text-gray-800">Custom Databases</span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    </div>

                    <div className="text-center mt-6 p-4 rounded-xl" style={{ backgroundColor: 'rgba(247, 230, 155, 0.1)' }}>
                      <p className="text-sm font-medium" style={{ color: '#1C2C55' }}>
                        + Any system with REST API, GraphQL, or webhooks
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA Section */}
          <div className="text-center bg-gradient-to-r from-gray-50 to-white rounded-3xl p-12 shadow-lg border border-gray-100 relative overflow-hidden">
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#1C2C55' }}>
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl" style={{ color: '#202226' }}>
              Per user pricing. Start free, upgrade when you're ready. No hidden fees.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative hover:shadow-2xl transition-all duration-300">
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
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#1C2C55' }}>
              How WhatsApp Voice Notes Work
            </h2>
            <p className="text-xl" style={{ color: '#202226' }}>
              Three simple steps to transform WhatsApp voice notes into CRM data
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group relative">
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(28, 44, 85, 0.02) 0%, rgba(247, 230, 155, 0.03) 100%)' }}></div>
              <div className="relative p-6">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#25D366' }}>
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#F7E69B', color: '#1C2C55' }}>
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#1C2C55' }}>Send WhatsApp Voice Note</h3>
              <p className="leading-relaxed" style={{ color: '#202226' }}>
                Record and send a voice note through WhatsApp with your meeting notes, client feedback, or any CRM data.
              </p>
              </div>
            </div>

            <div className="text-center group relative">
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(28, 44, 85, 0.02) 0%, rgba(247, 230, 155, 0.03) 100%)' }}></div>
              <div className="relative p-6">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#1C2C55' }}>
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#F7E69B', color: '#1C2C55' }}>
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#1C2C55' }}>AI Processing</h3>
              <p className="leading-relaxed" style={{ color: '#202226' }}>
                Our advanced AI transcribes and structures your voice data, extracting key information automatically.
              </p>
              </div>
            </div>

            <div className="text-center group relative">
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(28, 44, 85, 0.02) 0%, rgba(247, 230, 155, 0.03) 100%)' }}></div>
              <div className="relative p-6">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#1C2C55' }}>
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#F7E69B', color: '#1C2C55' }}>
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#1C2C55' }}>CRM Integration</h3>
              <p className="leading-relaxed" style={{ color: '#202226' }}>
                Data automatically syncs to your CRM with proper formatting, tags, and contact associations.
              </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 relative z-10" style={{ background: 'linear-gradient(135deg, #1C2C55 0%, #F7E69B 100%)' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto opacity-90">
            Join hundreds of teams already using WhatsApp voice notes to streamline their CRM processes. 
            Connect your WhatsApp and start your free trial today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

          <div className="mt-8 flex items-center justify-center space-x-8 text-white opacity-90">
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
      <footer className="text-white py-12 relative z-10" style={{ backgroundColor: '#202226' }}>
        <div className="max-w-7xl mx-auto px-6">
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