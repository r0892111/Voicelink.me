import React from 'react';
import { MessageCircle, Zap, CheckCircle, Play, Users, Mic } from 'lucide-react';

export const HeroDemo: React.FC = () => {
  return (
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
                    {/* User Voice Message - Enhanced with wider display and detailed waveform */}
                    <div className="flex justify-end">
                      <div className="bg-[#DCF8C6] rounded-2xl rounded-br-md p-4 max-w-sm shadow-sm">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: '#25D366' }}>
                            <Play className="w-4 h-4 text-white ml-0.5" />
                          </div>
                          <div className="flex-1">
                            {/* WhatsApp-style waveform visualization */}
                            <div className="h-8 rounded-lg relative overflow-hidden bg-[#128C7E]/20">
                              <div className="absolute inset-0 flex items-center justify-center px-4">
                                {/* WhatsApp-style waveform bars */}
                                <div className="flex items-center space-x-1 w-full">
                                  {[...Array(28)].map((_, i) => {
                                    // WhatsApp-style waveform heights (more compact and realistic)
                                    const heights = [
                                      4, 8, 12, 16, 20, 24, 20, 16, 12, 8, 6, 10, 14, 18, 22, 18, 14, 10, 8, 12, 16, 20, 16, 12, 8, 6, 4, 8
                                    ];
                                    const isPlayed = i < 18; // Show progress through waveform
                                    
                                    return (
                                      <div 
                                        key={i} 
                                        className="rounded-full transition-all duration-100" 
                                        style={{ 
                                          width: '2px', 
                                          height: `${heights[i] || 8}px`,
                                          backgroundColor: isPlayed ? '#128C7E' : '#128C7E',
                                          opacity: isPlayed ? 1 : 0.3
                                        }}
                                      ></div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-medium text-gray-700">1:23</div>
                            <div className="text-xs text-gray-500 mt-0.5">Voice</div>
                          </div>
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
  );
};