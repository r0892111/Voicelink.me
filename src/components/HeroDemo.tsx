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
                <div style={{ color: '#F7E69B' }}>CRM Data</div>
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
          <div className="flex justify-center lg:justify-end lg:pl-24">
            <div className="relative w-full max-w-md mx-auto">
              <iframe 
                style={{ border: '1px solid rgba(0, 0, 0, 0.1)' }}
                width="100%"
                height="600"
                src="https://embed.figma.com/design/Vl0NhJaWZOeCpb7TEM5N4Q/iPhone-16-and-16-Plus-Mockups--Community-?node-id=3-1023&embed-host=share"
                allowFullScreen
                className="rounded-lg shadow-2xl"
              />
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