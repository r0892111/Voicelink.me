import React from 'react';
import { MessageCircle, Zap, CheckCircle, Play, Users, Mic, ArrowRight, Phone } from 'lucide-react';

export const HeroDemo: React.FC = () => {
  return (
    <div className="w-full">
      {/* Hero Content - Text Left, Phone Right */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Text - Left Side */}
          <div className="space-y-8 lg:pl-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight" style={{ color: '#1C2C55' }}>
                <div>Transform speech to</div>
                <div style={{ color: '#1C2C55' }}>CRM Data</div>
              </h1>
              <div className="text-xl leading-relaxed space-y-2" style={{ color: '#202226' }}>
                <p>Send voice notes via WhatsApp and watch them automatically sync with your CRM.</p>
                <p>Turn voice messages into structured data instantly.</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
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

            <div className="flex items-center space-x-6 text-sm text-gray-500">
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

          {/* Phone Mockup - Right Side */}
          <div className="flex justify-center lg:justify-end lg:pl-24" style={{ perspective: '1000px' }}>
            <div className="relative max-w-xs mx-auto transform-gpu transition-all duration-700 hover:scale-110" 
                 style={{ 
                   transform: 'rotateX(3deg) rotateY(-2deg) translateZ(10px)',
                   transformStyle: 'preserve-3d',
                   backfaceVisibility: 'hidden',
                   WebkitBackfaceVisibility: 'hidden',
                   willChange: 'transform'
                 }}>
              {/* Phone Frame */}
              <div className="relative bg-black rounded-[2.5rem] p-1 transition-all duration-700 hover:shadow-4xl" 
                   style={{ 
                     aspectRatio: '9/19.5',
                     boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.4), 0 30px 60px -30px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                     filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.15))',
                     WebkitFontSmoothing: 'antialiased',
                     MozOsxFontSmoothing: 'grayscale',
                     textRendering: 'optimizeLegibility',
                     WebkitTransform: 'translateZ(0)',
                     transform: 'translateZ(0)'
                   }}>
                {/* iPhone 16 Dynamic Island */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-10"
                     style={{ 
                       transform: 'translateX(-50%)',
                       backfaceVisibility: 'hidden',
                       WebkitTransform: 'translateX(-50%) translateZ(0)'
                     }}></div>
                
                <div className="bg-white rounded-[2.25rem] overflow-hidden h-full relative"
                     style={{ 
                       transform: 'translateZ(0)',
                       backfaceVisibility: 'hidden',
                       WebkitFontSmoothing: 'antialiased',
                       MozOsxFontSmoothing: 'grayscale',
                       WebkitTransform: 'translateZ(0)',
                       imageRendering: 'crisp-edges'
                     }}>
                  {/* WhatsApp Header */}
                  <div className="bg-[#075E54] px-4 py-4 pt-8 flex items-center space-x-3">
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
                        src="/whatsapp-white-icon.webp" 
                        alt="WhatsApp" 
                        className="w-6 h-6 text-white"
                      />
                      <div className="text-white text-lg font-bold">⋮</div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="bg-[#ECE5DD] flex-1 flex flex-col" style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4d4d8' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    height: '600px'
                  }}>
                    {/* Scrollable Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 relative" style={{ 
                      scrollbarWidth: 'thin', 
                      scrollbarColor: '#CBD5E0 transparent'
                    }}>
                      {/* Scroll indicator at top */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-300 rounded-full opacity-50 z-10"></div>
                      
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
                          <div className="font-medium mb-2" style={{ color: '#1C2C55' }}>✅ Updated CRM with:</div>
                          
                          <div className="space-y-1.5 text-sm">
                            <div>📞 <strong>Follow-up Call</strong> - Sarah Mitchell (TechFlow)</div>
                            <div className="ml-4 text-gray-700">• Discuss premium package pricing and implementation timeline</div>
                            <div className="ml-4 text-gray-700">• Thursday, Jan 16 at 2:00 PM</div>
                            
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
        </div>
      </div>

      {/* Partial CRM Preview - Centered Below */}
      <div className="w-full px-6">
        {/* Floating CRM Cards Layout */}
        <div className="relative w-full h-[750px] py-8 max-w-7xl mx-auto">
            
            {/* Contact Card - Top Left */}
            <div 
              className="absolute bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 transform hover:scale-105 transition-all duration-500 hover:shadow-3xl"
              style={{ 
                top: '2%', 
                left: '8%', 
                width: '320px',
                transform: 'rotate(-2deg)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1C2C55' }}>
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-lg font-bold" style={{ color: '#1C2C55' }}>Sarah Mitchell</h4>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#25D366' }}></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-sm" style={{ color: '#202226' }}>Senior Procurement Manager</div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" style={{ color: '#25D366' }} />
                  <span className="text-sm font-medium">+32 456 789 123</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center">
                    <span className="text-xs">@</span>
                  </div>
                  <span className="text-sm">sarah.mitchell@techflow.be</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center">
                    <span className="text-xs font-bold">B</span>
                  </div>
                  <span className="text-sm font-medium">TechFlow Solutions</span>
                </div>
                <div className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 inline-block">Enterprise Client</div>
              </div>
            </div>

            {/* Voice Note Analysis Card - Top Right */}
            <div 
              className="absolute bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 transform hover:scale-105 transition-all duration-500 hover:shadow-3xl"
              style={{ 
                top: '1%', 
                right: '8%', 
                width: '350px',
                transform: 'rotate(1.5deg)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F7E69B' }}>
                  <Mic className="w-5 h-5" style={{ color: '#1C2C55' }} />
                </div>
                <h4 className="text-lg font-bold" style={{ color: '#1C2C55' }}>Client Summary</h4>
                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#F7E69B', color: '#1C2C55' }}>AI Processed</span>
              </div>
              <div className="space-y-3 text-sm" style={{ color: '#202226' }}>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: '#1C2C55' }}></div>
                  <div>
                    <div className="font-medium">Budget allocation increased by 40%</div>
                    <div className="text-xs text-gray-600 mt-1">Digital transformation budget expanded from €75k to €105k for Q1-Q2</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: '#1C2C55' }}></div>
                  <div>
                    <div className="font-medium">Strong interest in WhatsApp integration</div>
                    <div className="text-xs text-gray-600 mt-1">Specifically mentioned need for seamless communication tools and mobile-first solutions</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: '#1C2C55' }}></div>
                  <div>
                    <div className="font-medium">Prefers Thursday PM calls</div>
                    <div className="text-xs text-gray-600 mt-1">Best availability between 2:00-4:00 PM on Thursdays due to team meeting schedule</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: '#1C2C55' }}></div>
                  <div>
                    <div className="font-medium">Decision timeline accelerated</div>
                    <div className="text-xs text-gray-600 mt-1">Wants to finalize vendor selection by end of January due to Q1 implementation goals</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: '#1C2C55' }}></div>
                  <div>
                    <div className="font-medium">Technical requirements clarified</div>
                    <div className="text-xs text-gray-600 mt-1">Needs API integration with existing ERP system and multi-language support</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                Jan 15, 2025 - 2:30 PM
              </div>
            </div>

            {/* Calendar Widget - Center Left */}
            <div 
              className="absolute bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 transform hover:scale-105 transition-all duration-500 hover:shadow-3xl"
              style={{ 
                top: '30%', 
                left: '15%', 
                width: '280px',
                transform: 'rotate(-1deg)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1C2C55' }}>
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-lg font-bold" style={{ color: '#1C2C55' }}>Action Items</h4>
              </div>
              
              {/* Actionables from Voice Notes */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-500 mb-3">Generated from voice notes:</div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg" style={{ backgroundColor: '#F7E69B' }}>
                  <div className="w-2 h-2 rounded-full mt-1.5 animate-pulse" style={{ backgroundColor: '#1C2C55' }}></div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold mb-1" style={{ color: '#1C2C55' }}>Call Sarah Mitchell</div>
                    <div className="text-xs text-gray-700 mb-1">Discuss premium package pricing</div>
                    <div className="text-xs text-gray-600">📅 Thu, Jan 16 • 2:00 PM</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: '#1C2C55' }}></div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold mb-1" style={{ color: '#1C2C55' }}>Send Proposal</div>
                    <div className="text-xs text-gray-700 mb-1">Include ROI calculations & case studies</div>
                    <div className="text-xs text-gray-600">📅 Fri, Jan 17 • 5:00 PM</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: '#1C2C55' }}></div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold mb-1" style={{ color: '#1C2C55' }}>Research Integration</div>
                    <div className="text-xs text-gray-700 mb-1">WhatsApp API requirements for TechFlow</div>
                    <div className="text-xs text-gray-600">📅 Mon, Jan 20 • 10:00 AM</div>
                  </div>
                </div>
                
              </div>
            </div>

            {/* Task List Card - Center Right */}

            {/* Notification Feed - Bottom Left */}

            {/* Analytics Card - Bottom Right */}
            <div 
              className="absolute bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 transform hover:scale-105 transition-all duration-500 hover:shadow-3xl"
              style={{ 
                top: '33%', 
                right: '15%', 
                width: '280px',
                transform: 'rotate(-1.2deg)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1C2C55' }}>
                  <span className="text-white text-sm font-bold">📅</span>
                </div>
                <h4 className="text-lg font-bold" style={{ color: '#1C2C55' }}>January 2025</h4>
              </div>
              
              {/* Calendar Grid */}
              <div className="mb-3">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-xs font-medium text-gray-500 py-1">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {/* Calendar days */}
                  {[...Array(35)].map((_, i) => {
                    const dayNumber = i - 2; // Start from Monday
                    const isCurrentMonth = dayNumber > 0 && dayNumber <= 31;
                    const isToday = dayNumber === 15;
                    const hasEvent = [16, 17, 20].includes(dayNumber);
                    
                    return (
                      <div 
                        key={i} 
                        className={`
                          text-center text-xs py-1 rounded relative
                          ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                          ${isToday ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
                          ${hasEvent ? 'font-medium' : ''}
                        `}
                      >
                        {isCurrentMonth ? dayNumber : ''}
                        {hasEvent && (
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: '#F7E69B' }}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Auto-inserted Events */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-500 mb-2">Auto-inserted from voice notes:</div>
                <div className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: '#F7E69B' }}>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#1C2C55' }}></div>
                    <div>
                      <div className="text-xs font-semibold" style={{ color: '#1C2C55' }}>Follow-up Call</div>
                      <div className="text-xs text-gray-600">Sarah Mitchell</div>
                    </div>
                  </div>
                  <div className="text-xs font-medium" style={{ color: '#1C2C55' }}>Jan 16 • 2:00 PM</div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#1C2C55' }}></div>
                    <div>
                      <div className="text-xs font-semibold" style={{ color: '#1C2C55' }}>Proposal Deadline</div>
                      <div className="text-xs text-gray-600">TechFlow Enterprise</div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-gray-600">Jan 17 • 5:00 PM</div>
                </div>
              </div>
            </div>

            {/* Pipeline Card - Center */}
            <div 
              className="absolute bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 transform hover:scale-105 transition-all duration-500 hover:shadow-3xl"
              style={{ 
                top: '25%', 
                left: '50%', 
                width: '360px',
                transform: 'translateX(-50%) rotate(0.5deg)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1C2C55' }}>
                  <span className="text-white text-sm font-bold">P</span>
                </div>
                <h4 className="text-lg font-bold" style={{ color: '#1C2C55' }}>Sales Pipeline</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F7E69B' }}>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: '#1C2C55' }}>TechFlow Deal</div>
                    <div className="text-xs" style={{ color: '#202226' }}>€45,000 • Contract Negotiation</div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#1C2C55', color: 'white' }}>Priority</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="text-sm font-semibold" style={{ color: '#1C2C55' }}>StartupXYZ</div>
                    <div className="text-xs text-gray-600">€12,000 • Proposal Review</div>
                  </div>
                  <div className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Active</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-semibold" style={{ color: '#1C2C55' }}>GrowthCorp</div>
                    <div className="text-xs text-gray-600">€28,000 • Discovery Phase</div>
                  </div>
                  <div className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">Prospect</div>
                </div>
              </div>
            </div>

            {/* Quick Stats Card - Top Center */}
            <div 
              className="absolute bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 transform hover:scale-105 transition-all duration-500 hover:shadow-3xl"
              style={{ 
                top: '5%', 
                left: '50%', 
                width: '200px',
                transform: 'translateX(-50%) rotate(-0.5deg)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-2">Today's Activity</div>
                <div className="text-2xl font-bold mb-1" style={{ color: '#1C2C55' }}>12</div>
                <div className="text-xs" style={{ color: '#202226' }}>Voice recordings processed</div>
                <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ backgroundColor: '#F7E69B', width: '75%' }}></div>
                </div>
              </div>
            </div>

            {/* Floating Background Elements */}
            <div className="absolute bottom-8 left-1/3 w-20 h-20 rounded-full opacity-5" style={{ backgroundColor: '#F7E69B' }}></div>
            <div className="absolute top-1/2 left-1/2 w-12 h-12 rounded-full opacity-5" style={{ backgroundColor: '#25D366' }}></div>
        </div>
      </div>
    </div>
  );
};