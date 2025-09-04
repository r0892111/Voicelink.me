import React from 'react';
import { MessageCircle, Zap, Shield, ArrowRight, Star, CheckCircle, Play, Users, Mic } from 'lucide-react';
import { BuyButton } from './BuyButton';

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
          {/* Centered Headline Block */}
          <div className="text-center mb-24 px-6">
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-center" style={{ color: '#1C2C55' }}>
                  <div>Transform speech to</div>
                  <div style={{ color: '#F7E69B' }}>CRM Data</div>
                </h1>
                <div className="text-xl leading-relaxed max-w-3xl mx-auto space-y-2" style={{ color: '#202226' }}>
                  <p>Send voice notes via WhatsApp and watch them automatically sync with your CRM.</p>
                  <p>Turn voice messages into structured data instantly.</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={openModal}
                  className="group text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
                  style={{ backgroundColor: '#1C2C55' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F1A3A'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C2C55'}
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  className="group border-2 font-semibold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2"
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

              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" style={{ color: '#1C2C55' }} />
                  <span>No credit card required</span>
                </div>
                <span>·</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" style={{ color: '#1C2C55' }} />
                  <span>Connect WhatsApp in 2 minutes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width Content Row */}
          <div className="w-full px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-5 gap-12 items-start">
                {/* Phone Mockup (40% - 2 columns) */}
                <div className="lg:col-span-2">
                  <div className="relative max-w-sm mx-auto">
                    {/* Phone Frame */}
                    <div className="relative bg-black rounded-[3rem] p-2 shadow-2xl">
                      <div className="bg-white rounded-[2.5rem] overflow-hidden">
                        {/* WhatsApp Header */}
                        <div className="bg-[#075E54] px-4 py-3 flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs font-semibold text-gray-600">SM</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium text-sm">Sarah Mitchell</div>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 rounded-full bg-green-400"></div>
                              <span className="text-xs text-green-200">online</span>
                            </div>
                          </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="bg-[#ECE5DD] min-h-[500px] p-4 space-y-4">
                          {/* User Voice Message */}
                          <div className="flex justify-end">
                            <div className="bg-[#DCF8C6] rounded-2xl rounded-br-md p-3 max-w-xs shadow-sm">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#25D366' }}>
                                  <Play className="w-3 h-3 text-white ml-0.5" />
                                </div>
                                <div className="flex-1">
                                  <div className="h-8 rounded-lg relative overflow-hidden bg-white/20 backdrop-blur-sm">
                                    <div className="absolute inset-0 flex items-center justify-center px-3">
                                      <div className="flex items-end space-x-0.5 w-full">
                                        {[...Array(35)].map((_, i) => {
                                          const heights = [8, 12, 16, 20, 24, 20, 16, 12, 8, 4, 6, 10, 14, 18, 22, 18, 14, 10, 6, 8, 12, 16, 20, 16, 12, 8, 4, 6, 10, 14, 18, 14, 10, 6, 4];
                                          return (
                                            <div 
                                              key={i} 
                                              className="bg-white rounded-full transition-all duration-75" 
                                              style={{ 
                                                width: '2px', 
                                                height: `${heights[i] || 8}px`,
                                                opacity: i < 25 ? 0.9 : 0.4
                                              }}
                                            ></div>
                                          );
                                        })}
                                      </div>
                                      {/* Progress indicator */}
                                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-16 h-0.5 bg-white/60 rounded-full"></div>
                                    </div>
                                  </div>
                                </div>
                                <span className="text-xs text-gray-600">1:23</span>
                              </div>
                              <div className="flex justify-end items-center space-x-1">
                                <span className="text-xs text-gray-500">2:30 PM</span>
                                <CheckCircle className="w-3 h-3 text-blue-500" />
                              </div>
                            </div>
                          </div>

                          {/* Processing Indicator */}
                          <div className="flex justify-start">
                            <div className="bg-white rounded-2xl rounded-bl-md p-3 max-w-xs shadow-sm border border-gray-100">
                              <div className="flex items-center space-x-2">
                                <Zap className="w-4 h-4 animate-pulse" style={{ color: '#1C2C55' }} />
                                <span className="text-sm font-medium" style={{ color: '#1C2C55' }}>AI Processing Voice Note...</span>
                              </div>
                              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full animate-pulse" style={{ backgroundColor: '#F7E69B', width: '70%' }}></div>
                              </div>
                            </div>
                          </div>

                          {/* VoiceLink Bot Reply */}
                          <div className="flex justify-start">
                            <div className="bg-white rounded-2xl rounded-bl-md p-4 max-w-sm shadow-sm border border-gray-100">
                              <div className="flex items-center space-x-2 mb-3">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1C2C55' }}>
                                  <span className="text-xs text-white">🤖</span>
                                </div>
                                <span className="text-sm font-semibold" style={{ color: '#1C2C55' }}>VoiceLink</span>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="text-sm font-medium" style={{ color: '#1C2C55' }}>Updated CRM with:</div>
                                
                                <div className="bg-red-50 rounded-xl p-3 border-l-4" style={{ borderColor: '#F7E69B' }}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-semibold" style={{ color: '#1C2C55' }}>Follow-up Call</span>
                                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#F7E69B', color: '#1C2C55' }}>High</span>
                                  </div>
                                  <div className="text-xs text-gray-600 mb-1">Sarah Mitchell – TechFlow</div>
                                  <div className="text-xs text-gray-700">Discuss premium package pricing and implementation timeline.</div>
                                  <div className="text-xs text-gray-500 mt-1">Thursday, Jan 16 – 2:00 PM</div>
                                </div>

                                <details className="group">
                                  <summary className="text-xs cursor-pointer" style={{ color: '#1C2C55' }}>View summary ▼</summary>
                                  <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs space-y-1">
                                    <div><strong>Actionables:</strong> Call back Thu 2:00 PM · Send proposal by Fri · Review contract comments</div>
                                    <div><strong>Client info:</strong> Budget increased 40% for digital tools; prefers real-time sync.</div>
                                  </div>
                                </details>
                              </div>
                              
                              <div className="flex justify-end items-center space-x-1 mt-3">
                                <span className="text-xs text-gray-500">2:31 PM</span>
                                <CheckCircle className="w-3 h-3 text-blue-500" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CRM Summary Panel (60% - 3 columns) */}
                <div className="lg:col-span-3">
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Panel Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold" style={{ color: '#1C2C55' }}>CRM Snapshot</h3>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#25D366' }}></div>
                          <span className="text-xs font-medium" style={{ color: '#25D366' }}>Live</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Client Contact Card */}
                      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1C2C55' }}>
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold" style={{ color: '#1C2C55' }}>Sarah Mitchell</h4>
                            <p className="text-sm text-gray-600">Senior Procurement Manager</p>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <MessageCircle className="w-4 h-4" style={{ color: '#25D366' }} />
                              <span className="text-sm font-medium">+32 456 789 123</span>
                              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#25D366', color: 'white' }}>WhatsApp ✓</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">📧</span>
                              <span className="text-sm">sarah.mitchell@techflow.be</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">🏢</span>
                              <span className="text-sm font-medium">TechFlow Solutions</span>
                            </div>
                            <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 inline-block">Enterprise Client</div>
                          </div>
                        </div>
                      </div>

                      {/* Latest Note Card */}
                      <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-100">
                        <div className="flex items-center space-x-2 mb-4">
                          <Mic className="w-5 h-5" style={{ color: '#F7E69B' }} />
                          <h4 className="text-lg font-bold" style={{ color: '#1C2C55' }}>Client Note</h4>
                        </div>
                        <div className="bg-white rounded-xl p-4">
                          <div className="text-sm text-gray-700 space-y-2 mb-3">
                            <div className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: '#1C2C55' }}></div>
                              <span>Confirmed 40% budget expansion for digital tools</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: '#1C2C55' }}></div>
                              <span>Strong interest in premium WhatsApp integration</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: '#1C2C55' }}></div>
                              <span>Requested detailed pricing deck and ROI examples</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: '#1C2C55' }}></div>
                              <span>Prefers Thursday PM calls for follow-ups</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Jan 15, 2025 - 2:30 PM</span>
                            <span className="px-2 py-1 rounded-full" style={{ backgroundColor: '#F7E69B', color: '#1C2C55' }}>Processed</span>
                          </div>
                        </div>
                      </div>

                      {/* Combined Upcoming & Action Items */}
                      <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                        <div className="flex items-center space-x-2 mb-4">
                          <span className="text-lg">📅</span>
                          <h4 className="text-lg font-bold" style={{ color: '#1C2C55' }}>Upcoming & Actions</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-white rounded-xl p-4 border-l-4" style={{ borderColor: '#F7E69B' }}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold" style={{ color: '#1C2C55' }}>Follow-up Call</span>
                              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#F7E69B', color: '#1C2C55' }}>High</span>
                            </div>
                            <div className="text-xs text-gray-600 mb-1">Sarah Mitchell – TechFlow</div>
                            <div className="text-xs text-gray-700">Discuss premium package pricing and implementation timeline.</div>
                            <div className="text-xs text-gray-500 mt-1">Thursday, Jan 16 – 2:00 PM</div>
                          </div>
                          <div className="bg-white rounded-xl p-4 border-l-4 border-orange-400">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold" style={{ color: '#1C2C55' }}>Send Proposal</span>
                              <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">Due Friday</span>
                            </div>
                            <div className="text-xs text-gray-600 mb-1">Include WhatsApp integration demo and ROI calculations</div>
                            <div className="text-xs text-gray-500 mt-1">From WhatsApp note</div>
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

      {/* Features Section */}
      <section id="features" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#1C2C55' }}>
              Powerful Features for Modern Teams
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: '#202226' }}>
              Everything you need to streamline your CRM workflow with AI-powered voice processing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(28, 44, 85, 0.02) 0%, rgba(247, 230, 155, 0.05) 100%)' }}></div>
              <div className="relative">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#1C2C55' }}>
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: '#1C2C55' }}>WhatsApp Voice Notes</h3>
              <p className="leading-relaxed" style={{ color: '#202226' }}>
                Send voice notes directly through WhatsApp. Advanced AI transcription understands context, accents, and industry terminology with 99% accuracy.
              </p>
              </div>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(28, 44, 85, 0.02) 0%, rgba(247, 230, 155, 0.05) 100%)' }}></div>
              <div className="relative">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#1C2C55' }}>
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: '#1C2C55' }}>Instant CRM Sync</h3>
              <p className="leading-relaxed" style={{ color: '#202226' }}>
                Seamlessly integrates with TeamLeader, Pipedrive, and Odoo. Voice data from WhatsApp appears in your CRM within seconds.
              </p>
              </div>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(28, 44, 85, 0.02) 0%, rgba(247, 230, 155, 0.05) 100%)' }}></div>
              <div className="relative">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#1C2C55' }}>
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: '#1C2C55' }}>Enterprise Security</h3>
              <p className="leading-relaxed" style={{ color: '#202226' }}>
                Bank-level encryption and GDPR compliance. Your WhatsApp voice messages are processed securely and never stored.
              </p>
              </div>
            </div>
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