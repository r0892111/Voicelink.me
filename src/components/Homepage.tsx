import React from 'react';
import { MessageCircle, Zap, Shield, ArrowRight, Star, CheckCircle, Play, Users, Mic } from 'lucide-react';
import { BuyButton } from './BuyButton';
import { HeroDemo } from './HeroDemo';

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
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#1C2C55' }}>
              One-Click CRM Integrations
            </h2>
            <p className="text-xl max-w-3xl mx-auto mb-8" style={{ color: '#202226' }}>
              Connect your favorite CRM platform instantly. Currently integrated with leading platforms, with more coming soon.
            </p>
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium" style={{ color: '#1C2C55' }}>More integrations coming soon</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Single Consolidated CRM Integration Card */}
            <div className="md:col-span-3">
              <div className="text-center">
                  {/* CRM Logos Row */}
                  <div className="flex justify-center items-center space-x-16 mb-12">
                    <div className="group/logo hover:scale-110 transition-transform duration-300">
                      <div className="w-24 h-24 flex items-center justify-center bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4">
                        <img 
                          src="/Teamleader_Icon.svg" 
                          alt="TeamLeader" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-sm font-bold mt-4 text-emerald-600">TeamLeader</div>
                    </div>
                    
                    <div className="w-12 h-1 bg-gradient-to-r from-emerald-400 to-orange-400 rounded-full"></div>
                    
                    <div className="group/logo hover:scale-110 transition-transform duration-300">
                      <div className="w-24 h-24 flex items-center justify-center bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4">
                        <img 
                          src="/Pipedrive_id-7ejZnwv_0.svg" 
                          alt="Pipedrive" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-sm font-bold mt-4 text-orange-500">Pipedrive</div>
                    </div>
                    
                    <div className="w-12 h-1 bg-gradient-to-r from-orange-400 to-purple-400 rounded-full"></div>
                    
                    <div className="group/logo hover:scale-110 transition-transform duration-300">
                      <div className="w-24 h-24 flex items-center justify-center bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4">
                        <img 
                          src="/odoo_logo.svg" 
                          alt="Odoo" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-sm font-bold mt-4 text-purple-600">Odoo</div>
                    </div>
                  </div>

                  <h3 className="text-3xl font-bold mb-6" style={{ color: '#1C2C55' }}>
                    Currently Integrated CRM Platforms
                  </h3>
                  
                  <p className="text-xl leading-relaxed mb-8 max-w-4xl mx-auto" style={{ color: '#202226' }}>
                    Connect instantly with any of our supported CRM platforms. Whether you use TeamLeader for project management, 
                    Pipedrive for sales, or Odoo for comprehensive business management - your voice notes sync automatically 
                    with contacts, deals, and activities.
                  </p>

                  <div className="flex flex-wrap justify-center gap-6 mb-8">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">One-click authentication</span>
                    </div>
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-full">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Real-time sync</span>
                    </div>
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-50 rounded-full">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">Secure OAuth 2.0</span>
                    </div>
                  </div>

                  <div className="inline-flex items-center space-x-2 px-8 py-4 rounded-full text-lg font-semibold" style={{ backgroundColor: '#F7E69B' }}>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#1C2C55' }}></div>
                    <span className="text-sm font-medium" style={{ color: '#1C2C55' }}>Ready to connect in under 2 minutes</span>
                  </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-lg font-medium text-gray-600">HubSpot, Salesforce, Zoho & more coming soon</span>
            </div>
            <p className="mt-4 text-sm text-gray-500 max-w-2xl mx-auto">
              We're constantly adding new CRM integrations. Request your platform and we'll prioritize it for the next release.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section id="testimonials" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#1C2C55' }}>
              Trusted by Growing Teams
            </h2>
            <p className="text-xl" style={{ color: '#202226' }}>
              See how VoiceLink transforms productivity for sales and support teams
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 relative border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden" style={{ borderColor: '#F7E69B' }}>
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(247, 230, 155, 0.03) 0%, rgba(28, 44, 85, 0.02) 100%)' }}></div>
              <div className="relative">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="mb-6 leading-relaxed" style={{ color: '#202226' }}>
                "VoiceLink has revolutionized how we capture client conversations. I just send a WhatsApp voice note after meetings and the data appears in our CRM automatically."
              </blockquote>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: '#1C2C55' }}>
                  SJ
                </div>
                <div>
                  <div className="font-semibold" style={{ color: '#1C2C55' }}>Sarah Johnson</div>
                  <div className="text-sm" style={{ color: '#202226' }}>Sales Director, TechCorp</div>
                </div>
              </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 relative border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden" style={{ borderColor: '#F7E69B' }}>
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(247, 230, 155, 0.03) 0%, rgba(28, 44, 85, 0.02) 100%)' }}></div>
              <div className="relative">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="mb-6 leading-relaxed" style={{ color: '#202226' }}>
                "The WhatsApp voice notes are brilliant. I can update our CRM while driving between client meetings just by talking to WhatsApp. It's a game-changer for field sales."
              </blockquote>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: '#1C2C55' }}>
                  MR
                </div>
                <div>
                  <div className="font-semibold" style={{ color: '#1C2C55' }}>Michael Rodriguez</div>
                  <div className="text-sm" style={{ color: '#202226' }}>Account Manager, GrowthCo</div>
                </div>
              </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 relative border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden" style={{ borderColor: '#F7E69B' }}>
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(247, 230, 155, 0.03) 0%, rgba(28, 44, 85, 0.02) 100%)' }}></div>
              <div className="relative">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="mb-6 leading-relaxed" style={{ color: '#202226' }}>
                "Setup took literally 2 minutes. I just connected my WhatsApp and now voice notes automatically become CRM entries. The AI accuracy is incredible."
              </blockquote>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: '#1C2C55' }}>
                  EK
                </div>
                <div>
                  <div className="font-semibold" style={{ color: '#1C2C55' }}>Emma Kim</div>
                  <div className="text-sm" style={{ color: '#202226' }}>Customer Success, StartupXYZ</div>
                </div>
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
              Start free, upgrade when you're ready. No hidden fees.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #1C2C55 0%, #F7E69B 100%)' }}></div>
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(247, 230, 155, 0.02) 0%, rgba(28, 44, 85, 0.01) 100%)' }}></div>
              
              <div className="p-8 relative">
                <div className="text-center mb-8">
                  {/* VoiceLink logo in pricing card - blue version on white background */}
                  <img 
                    src="/Finit Voicelink Blue.svg" 
                    alt="VoiceLink Pro" 
                    className="h-12 w-auto mx-auto mb-4"
                  />
                  <h3 className="text-2xl font-bold mb-2" style={{ color: '#1C2C55' }}>VoiceLink Pro</h3>
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-bold" style={{ color: '#1C2C55' }}>€29</span>
                    <span className="text-lg" style={{ color: '#202226' }}>.99/month</span>
                  </div>
                  <p className="mt-2" style={{ color: '#202226' }}>Perfect for growing teams</p>
                </div>

                <div className="space-y-4 mb-8">
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

                <BuyButton
                  priceId="price_1S2ZQPLPohnizGblvhj9qbK3"
                  productName="VoiceLink Pro"
                  price="€29.99"
                  description="Advanced voice-to-CRM features"
                  className="w-full"
                />
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
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};