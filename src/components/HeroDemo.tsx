import React from 'react';
import { MessageCircle, Zap, CheckCircle, Play, Users, Mic } from 'lucide-react';

export const HeroDemo: React.FC = () => {
  return (
    <div className="w-full px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Phone Mockup (40% - 2 columns) */}
          <div className="lg:col-span-2">
            <div className="relative max-w-xs mx-auto">
              {/* Phone Frame */}
              <div className="relative bg-black rounded-[2.5rem] p-1 shadow-2xl" style={{ aspectRatio: '9/19.5' }}>
                {/* iPhone 16 Dynamic Island */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-10"></div>
                
                <div className="bg-white rounded-[2.25rem] overflow-hidden h-full">
                  {/* WhatsApp Header */}
                  <div className="bg-[#075E54] px-4 py-4 pt-8 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-600">SM</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">Sarah Mitchell</div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span className="text-xs text-green-200">online</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-6 h-6 text-white">📞</div>
                      <div className="w-6 h-6 text-white">📹</div>
                      <div className="w-6 h-6 text-white">⋮</div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="bg-[#ECE5DD] flex-1 flex flex-col" style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4d4d8' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    height: '600px'
                  }}>
                    {/* Scrollable Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {/* User Voice Message - Enhanced with wider display and detailed waveform */}
                    <div className="flex justify-end">
                      <div className="bg-[#DCF8C6] rounded-2xl rounded-br-md p-3 max-w-[280px] shadow-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#25D366' }}>
                            <Play className="w-3 h-3 text-white ml-0.5" />
                          </div>
                          <div className="flex-1">
                            {/* Authentic WhatsApp waveform */}
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
                          <div className="text-xs font-medium text-gray-600 ml-1">
                            1:23
                          </div>
                        </div>
                        <div className="flex justify-end items-center space-x-1">
                          <span className="text-xs text-gray-500">2:30 PM</span>
                          <div className="flex space-x-0.5">
                            <CheckCircle className="w-3 h-3 text-[#53BDEB]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Processing Indicator */}
                    <div className="flex justify-start">
                      <div className="bg-white rounded-2xl rounded-bl-md p-3 max-w-[250px] shadow-sm">
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 animate-pulse" style={{ color: '#1C2C55' }} />
                          <span className="text-sm font-medium" style={{ color: '#1C2C55' }}>AI Processing Voice Note...</span>
                        </div>
                        <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full animate-pulse" style={{ backgroundColor: '#F7E69B', width: '70%' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* VoiceLink Bot Reply */}
                    <div className="flex justify-start">
                      <div className="bg-white rounded-2xl rounded-bl-md p-4 max-w-[280px] shadow-sm">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1C2C55' }}>
                            <span className="text-xs text-white">🤖</span>
                          </div>
                          <span className="text-sm font-semibold" style={{ color: '#1C2C55' }}>VoiceLink</span>
                        </div>
                        
                        <div className="text-sm text-gray-800 leading-relaxed">
                          <div className="font-medium mb-2" style={{ color: '#1C2C55' }}>✅ Updated CRM with:</div>
                          
                          <div className="space-y-1.5 text-sm">
                            <div>📞 <strong>Follow-up Call</strong> - Sarah Mitchell (TechFlow)</div>
                            <div className="ml-4 text-gray-700">• Discuss premium package pricing and implementation timeline</div>
                            <div className="ml-4 text-gray-700">• Thursday, Jan 16 at 2:00 PM</div>
                            <div className="ml-4 text-xs px-2 py-1 rounded-full inline-block mt-1" style={{ backgroundColor: '#FFE4B5', color: '#D2691E' }}>🔥 High Priority</div>
                            
                            <div className="pt-1">📝 <strong>Key Notes:</strong></div>
                            <div className="ml-4 text-gray-700">• Budget increased 40% for digital tools</div>
                            <div className="ml-4 text-gray-700">• Strong interest in WhatsApp integration</div>
                            <div className="ml-4 text-gray-700">• Prefers Thursday PM calls</div>
                            
                            <div className="pt-1">📋 <strong>Action Items:</strong></div>
                            <div className="ml-4 text-gray-700">• Send proposal by Friday</div>
                            <div className="ml-4 text-gray-700">• Include ROI calculations</div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end items-center space-x-1 mt-3">
                          <span className="text-xs text-gray-500">2:31 PM</span>
                          <div className="flex space-x-0.5">
                            <CheckCircle className="w-3 h-3 text-[#53BDEB]" />
                          </div>
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
  );
};