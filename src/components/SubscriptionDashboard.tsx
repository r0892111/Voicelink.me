import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Crown, Users, Zap, Settings, CheckCircle, MessageCircle, BarChart3, Headphones, ArrowRight } from 'lucide-react';
import { UserInfoCard } from './UserInfoCard';
import { WhatsAppVerification } from './WhatsAppVerification';
import { OdooApiKeyInput } from './OdooApiKeyInput';

export const SubscriptionDashboard: React.FC = () => {
  const { user } = useAuth();

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'teamleader':
        return <Users className="w-6 h-6 text-emerald-600" />;
      case 'pipedrive':
        return <Zap className="w-6 h-6 text-orange-500" />;
      case 'odoo':
        return <Settings className="w-6 h-6 text-purple-600" />;
      default:
        return <Users className="w-6 h-6 text-gray-600" />;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'teamleader':
        return 'TeamLeader';
      case 'pipedrive':
        return 'Pipedrive';
      case 'odoo':
        return 'Odoo';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Continuous Background Gradient - Same as Homepage */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1C2C55 0%, #FFFFFF 50%, #F7E69B 100%)' }}></div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(45deg, transparent 0%, rgba(247, 230, 155, 0.1) 20%, transparent 40%, rgba(28, 44, 85, 0.05) 60%, transparent 80%, rgba(247, 230, 155, 0.08) 100%)' }}></div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(28, 44, 85, 0.02) 0%, transparent 30%, rgba(247, 230, 155, 0.03) 50%, transparent 70%, rgba(28, 44, 85, 0.02) 100%)' }}></div>
      </div>

      <div className="relative z-10 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 space-y-12 pt-8">
          {/* Premium Hero Section */}
          <section className="text-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="relative inline-block mb-6">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(247, 230, 155, 0.2)' }}>
                  <Crown className="w-8 h-8" style={{ color: '#1C2C55' }} />
                </div>
                <div className="text-left">
                  <h1 className="text-4xl lg:text-5xl font-bold leading-tight" style={{ color: '#1C2C55' }}>
                    Welcome back, {user?.user_info?.first_name || 'Premium User'}!
                  </h1>
                  <p className="text-xl" style={{ color: '#6B7280' }}>
                    Your VoiceLink subscription is active
                  </p>
                </div>
              </div>
              {/* Subtle background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-purple-50 to-indigo-100 rounded-2xl blur-xl opacity-20 transform scale-110 -z-10"></div>
            </div>
          </section>

          {/* Platform Connection Status */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Platform Connection Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 h-full">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-white shadow-sm border border-gray-100">
                      {user?.platform === 'teamleader' && (
                        <img src="/Teamleader_Icon.svg" alt="TeamLeader" className="w-12 h-12" />
                      )}
                      {user?.platform === 'pipedrive' && (
                        <img src="/Pipedrive_id-7ejZnwv_0.svg" alt="Pipedrive" className="w-12 h-12" />
                      )}
                      {user?.platform === 'odoo' && (
                        <img src="/odoo_logo.svg" alt="Odoo" className="w-12 h-12" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: '#1C2C55' }}>
                      {getPlatformName(user?.platform || '')}
                    </h3>
                    <div className="flex items-center justify-center space-x-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-sm font-medium text-green-600">Connected & Active</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Integration is live and ready for voice notes
                    </p>
                  </div>
                </div>
              </div>

              {/* User Profile Card */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 h-full">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)' }}>
                      <Users className="w-6 h-6" style={{ color: '#1C2C55' }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: '#1C2C55' }}>Account Profile</h3>
                      <p className="text-sm text-gray-600">Your CRM account information</p>
                    </div>
                  </div>

                  {user?.user_info && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Personal Information</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Full Name</span>
                            <span className="text-sm font-medium text-gray-900">
                              {user.user_info.first_name} {user.user_info.last_name}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Email</span>
                            <span className="text-sm font-medium text-gray-900">{user.email}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Language</span>
                            <span className="text-sm font-medium text-gray-900">{user.user_info.language}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Time Zone</span>
                            <span className="text-sm font-medium text-gray-900">{user.user_info.time_zone}</span>
                          </div>
                          {user.user_info.telephones && user.user_info.telephones.length > 0 && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-600">Phone</span>
                              <span className="text-sm font-medium text-gray-900">
                                +{user.user_info.telephones[0].number}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Account Information */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Account Details</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Account ID</span>
                            <span className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                              {user.user_info.account?.id}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Account Type</span>
                            <span className="text-sm font-medium text-gray-900 capitalize">
                              {user.user_info.account?.type}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Email Status</span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {user.user_info.email_verification_status}
                            </span>
                          </div>
                          {user.user_info.preferences && (
                            <>
                              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Invoiceable</span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  user.user_info.preferences.invoiceable 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {user.user_info.preferences.invoiceable ? 'Yes' : 'No'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-600">Whitelabeling</span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  user.user_info.preferences.whitelabeling 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {user.user_info.preferences.whitelabeling ? 'Enabled' : 'Disabled'}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* WhatsApp Integration */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <WhatsAppVerification />
          </section>

          {/* Odoo API Key Input - Only for Odoo users */}
          {user?.platform === 'odoo' && (
            <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <OdooApiKeyInput />
            </section>
          )}

          {/* Premium Features Grid */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#1C2C55' }}>
                Your Premium Features
              </h2>
              <p className="text-xl" style={{ color: '#6B7280' }}>
                Everything you need to transform voice into structured CRM data
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* WhatsApp Integration */}
              <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-500 hover:-translate-y-2">
                <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#1C2C55' }}>
                  WhatsApp Voice Notes
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Send unlimited voice messages directly to your CRM via WhatsApp
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">Unlimited Usage</span>
                </div>
              </div>

              {/* Real-time Sync */}
              <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-500 hover:-translate-y-2">
                <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#1C2C55' }}>
                  Real-time Sync
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Instant synchronization with your CRM platform
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium">Live Updates</span>
                </div>
              </div>

              {/* Priority Support */}
              <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-500 hover:-translate-y-2">
                <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                  <Headphones className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#1C2C55' }}>
                  Priority Support
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  24/7 dedicated assistance from our expert team
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-amber-600 font-medium">24/7 Support</span>
                </div>
              </div>
            </div>
          </section>

          {/* Getting Started Guide */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4" style={{ color: '#1C2C55' }}>
                  Ready to Get Started?
                </h2>
                <p className="text-xl" style={{ color: '#6B7280' }}>
                  Follow these simple steps to start using VoiceLink
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)' }}>
                    <span className="text-2xl font-bold" style={{ color: '#1C2C55' }}>1</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#1C2C55' }}>
                    Verify WhatsApp
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Connect your WhatsApp number to receive voice note confirmations
                  </p>
                </div>

                {/* Step 2 */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)' }}>
                    <span className="text-2xl font-bold" style={{ color: '#1C2C55' }}>2</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#1C2C55' }}>
                    Send Voice Note
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Record your thoughts naturally through WhatsApp voice messages
                  </p>
                </div>

                {/* Step 3 */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)' }}>
                    <span className="text-2xl font-bold" style={{ color: '#1C2C55' }}>3</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: '#1C2C55' }}>
                    Watch Magic Happen
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    AI processes your voice and syncs structured data to your CRM
                  </p>
                </div>
              </div>

              <div className="text-center mt-8">
                <button
                  className="group text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 flex items-center justify-center space-x-2 mx-auto"
                  style={{ backgroundColor: '#1C2C55' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F1A3A'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C2C55'}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Start Sending Voice Notes</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </section>

          {/* Support Section */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <div className="text-center bg-gradient-to-r from-gray-50 to-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#1C2C55' }}>
                Need Help Getting Started?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Our support team is here to help you make the most of VoiceLink. 
                Get personalized assistance with setup and optimization.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/support"
                  className="group border-2 font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center space-x-2"
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
                  <Headphones className="w-5 h-5" />
                  <span>Contact Support</span>
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};