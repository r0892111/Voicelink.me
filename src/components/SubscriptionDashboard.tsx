import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Crown, Users, Zap, Settings, CheckCircle, MessageCircle, Headphones, Calendar, Mail, CreditCard, ExternalLink, Check } from 'lucide-react';
import { WhatsAppVerification } from './WhatsAppVerification';
import { OdooApiKeyInput } from './OdooApiKeyInput';
import { supabase } from '../lib/supabase';
  id?: string;
import { useI18n } from '../hooks/useI18n';

export const SubscriptionDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [whatsappStatus, setWhatsappStatus] = React.useState<'not_set' | 'pending' | 'active'>('not_set');
  const [loadingWhatsApp, setLoadingWhatsApp] = React.useState(true);
  const [addedTeamMembers, setAddedTeamMembers] = useState<TeamMember[]>([]);
  const [currentMember, setCurrentMember] = useState<TeamMember>({ name: '', email: '', whatsapp_number: '' });
  const fetchWhatsAppStatus = React.useCallback(async (force = false) => {
    if (!user || isFetchingRef.current) return;

    // Throttle requests - only fetch if 2+ seconds have passed or forced
    const now = Date.now();
    if (!force && now - lastFetchTimeRef.current < 2000) {
      return;
    }

    isFetchingRef.current = true;
    setLoadingWhatsApp(true);
    lastFetchTimeRef.current = now;
    
    try {
      const platform = user.platform;
      const tableName = `${platform}_users`;
      
      const { data, error } = await supabase
        .from(tableName)
        .select('whatsapp_status')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) {
        console.error('Error fetching WhatsApp status:', error);
        setWhatsappStatus('not_set');
        return;
      }

      const newStatus = data?.whatsapp_status || 'not_set';
      
      // Only update state if status actually changed
      if (newStatus !== lastStatusRef.current) {
        setWhatsappStatus(newStatus);
        lastStatusRef.current = newStatus;
      }
    } catch (error) {
      console.error('Error fetching WhatsApp status:', error);
      setWhatsappStatus('not_set');
    } finally {
      setLoadingWhatsApp(false);
      isFetchingRef.current = false;
    }
  }, [user]);

  // Initial fetch only - no polling
  React.useEffect(() => {
    if (!user) return;
    fetchWhatsAppStatus(true);
    
    // Cleanup on unmount
    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
    };
  }, [user?.id]); // Removed fetchWhatsAppStatus from dependencies


  // Manual refresh function
  const refreshWhatsAppStatus = React.useCallback(() => {
    if (!user || isFetchingRef.current) return;

    // Throttle requests - only fetch if 2+ seconds have passed
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 2000) {
      return;
    }

    isFetchingRef.current = true;
    setLoadingWhatsApp(true);
    lastFetchTimeRef.current = now;
    
    const fetchData = async () => {
      try {
        const platform = user.platform;
        const tableName = `${platform}_users`;
        
        const { data, error } = await supabase
          .from(tableName)
          .select('whatsapp_status')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .maybeSingle();

        if (error) {
          console.error('Error fetching WhatsApp status:', error);
          setWhatsappStatus('not_set');
          return;
        }

        const newStatus = data?.whatsapp_status || 'not_set';
        
        // Only update state if status actually changed
        if (newStatus !== lastStatusRef.current) {
          setWhatsappStatus(newStatus);
          lastStatusRef.current = newStatus;
        }
      } catch (error) {
        console.error('Error fetching WhatsApp status:', error);
        setWhatsappStatus('not_set');
      } finally {
        setLoadingWhatsApp(false);
        isFetchingRef.current = false;
      }
    };

    fetchData();
  }, [user]);

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
                    {t('dashboard.welcome', { name: user?.name|| t('dashboard.welcomeDefault') })}
                  </h1>
                  <p className="text-xl" style={{ color: '#6B7280' }}>
                    {t('dashboard.subscriptionActive')}
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
                      <span className="text-sm font-medium text-green-600">{t('dashboard.platformConnection.connectedActive')}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {t('dashboard.platformConnection.integrationReady')}
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
                      <h3 className="text-xl font-bold" style={{ color: '#1C2C55' }}>{t('dashboard.accountProfile.title')}</h3>
                      <p className="text-sm text-gray-600">{t('dashboard.accountProfile.subtitle')}</p>
                    </div>
                  </div>

                  {user?.user_info && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{t('dashboard.accountProfile.personalInfo')}</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">{t('dashboard.accountProfile.fullName')}</span>
                            <span className="text-sm font-medium text-gray-900">
                              {user.user_info.first_name} {user.user_info.last_name}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">{t('dashboard.accountProfile.email')}</span>
                            <span className="text-sm font-medium text-gray-900">{user.email}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">{t('dashboard.accountProfile.language')}</span>
                            <span className="text-sm font-medium text-gray-900">
                              {typeof user.user_info.language === 'string' 
                                ? user.user_info.language 
                                : user.user_info.language?.language_code 
                                  ? `${user.user_info.language.language_code}-${user.user_info.language.country_code}`
                                  : 'N/A'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">{t('dashboard.accountProfile.timeZone')}</span>
                            <span className="text-sm font-medium text-gray-900">{user.user_info.time_zone}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">{t('dashboard.accountProfile.whatsappStatus')}</span>
                            <span className={`text-sm font-medium inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              whatsappStatus === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : whatsappStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {whatsappStatus === 'active' && '✅ '}
                              {whatsappStatus === 'pending' && '⏳ '}
                              {whatsappStatus === 'not_set' && '❌ '}
                              {whatsappStatus === 'active' ? t('dashboard.whatsappStatus.connected') : 
                               whatsappStatus === 'pending' ? t('dashboard.whatsappStatus.pending') : t('dashboard.whatsappStatus.notConnected')}
                            </span>
                          </div>
                          {user.user_info.telephones && user.user_info.telephones.length > 0 && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-600">{t('dashboard.accountProfile.phone')}</span>
                              <span className="text-sm font-medium text-gray-900">
                                +{user.user_info.telephones[0].number}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Account Information */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{t('dashboard.accountProfile.accountDetails')}</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">{t('dashboard.accountProfile.accountId')}</span>
                            <span className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                              {user.user_info.account?.id}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">{t('dashboard.accountProfile.emailStatus')}</span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {user.user_info.email_verification_status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Conditional Content Based on WhatsApp Status */}
          {!loadingWhatsApp && (
            <>
              {whatsappStatus === 'active' ? (
                /* Ready to Use Section */
                <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'rgba(37, 211, 102, 0.1)' }}>
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      </div>
                      <h2 className="text-3xl font-bold mb-4" style={{ color: '#1C2C55' }}>
                        {t('dashboard.allSet.title')}
                      </h2>
                      <p className="text-xl mb-6" style={{ color: '#6B7280' }}>
                        {t('dashboard.allSet.subtitle')}
                      </p>
                      
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-6 mb-6">
                        <div className="flex items-center justify-center space-x-3 mb-3">
                          <MessageCircle className="w-6 h-6 text-green-600" />
                          <h3 className="text-lg font-semibold" style={{ color: '#1C2C55' }}>
                            {t('dashboard.allSet.startSending')}
                          </h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {t('dashboard.allSet.description')}
                        </p>
                                                      {/* WhatsApp Management - Always visible when active */}
        <div className="mt-8">
          <WhatsAppVerification onStatusChange={(status) => {
            setWhatsappStatus(status);
            // Refresh status after change
            setTimeout(() => refreshWhatsAppStatus(), 1000);
          }} />
        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>{t('dashboard.allSet.whatsappConnected')}</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>{t('dashboard.allSet.crmIntegrationActive')}</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>{t('dashboard.allSet.aiProcessingReady')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              ) : (
                /* Getting Started Guide */
                <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold mb-4" style={{ color: '#1C2C55' }}>
                        {t('dashboard.gettingStarted.title')}
                      </h2>
                      <p className="text-xl" style={{ color: '#6B7280' }}>
                        {t('dashboard.gettingStarted.subtitle')}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                      {/* Step 1 */}
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)' }}>
                          <span className="text-2xl font-bold" style={{ color: '#1C2C55' }}>1</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-3" style={{ color: '#1C2C55' }}>
                          {t('dashboard.gettingStarted.step1.title')}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {t('dashboard.gettingStarted.step1.description')}
                        </p>
                      </div>

                      {/* Step 2 */}
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)' }}>
                          <span className="text-2xl font-bold" style={{ color: '#1C2C55' }}>2</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-3" style={{ color: '#1C2C55' }}>
                          {t('dashboard.gettingStarted.step2.title')}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {t('dashboard.gettingStarted.step2.description')}
                        </p>
                      </div>

                      {/* Step 3 */}
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)' }}>
                          <span className="text-2xl font-bold" style={{ color: '#1C2C55' }}>3</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-3" style={{ color: '#1C2C55' }}>
                          {t('dashboard.gettingStarted.step3.title')}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {t('dashboard.gettingStarted.step3.description')}
                        </p>
                      </div>
                    </div>

                    {/* WhatsApp Integration Embedded */}
                    <div className="border-t border-gray-200 pt-8">
                      <WhatsAppVerification onStatusChange={(status) => {
                        setWhatsappStatus(status);
                        // Refresh status after change
                        setTimeout(() => refreshWhatsAppStatus(), 1000);
                      }} />
                    </div>
                  </div>
                </section>
              )}
            </>
          )}

          {/* User Guide Section - Only show when WhatsApp is active */}
          {!loadingWhatsApp && whatsappStatus === 'active' && (
            <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)' }}>
                    <MessageCircle className="w-8 h-8" style={{ color: '#1C2C55' }} />
                  </div>
                  <h2 className="text-3xl font-bold mb-4" style={{ color: '#1C2C55' }}>
                    Daily Usage Guide
                  </h2>
                  <p className="text-xl" style={{ color: '#6B7280' }}>
                    VoiceLink works best when you speak your updates in a structured and clear manner
                  </p>
                </div>

                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Contact Recording */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center space-x-2" style={{ color: '#1C2C55' }}>
                      <Users className="w-6 h-6" />
                      <span>1. Recording Contacts</span>
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2" style={{ color: '#1C2C55' }}>Start with:</h4>
                        <div className="bg-white rounded-lg p-4 border-l-4" style={{ borderColor: '#1C2C55' }}>
                          <p className="font-medium">"Just called/spoke with [NAME]"</p>
                          <p className="font-medium">or "[NAME] just visited"</p>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2" style={{ color: '#1C2C55' }}>Names:</h4>
                          <p className="text-sm text-gray-700">Speak slowly and spell difficult names letter by letter</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2" style={{ color: '#1C2C55' }}>Phone/Email:</h4>
                          <p className="text-sm text-gray-700">Optional, but always spell when in doubt</p>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                          <strong>New vs. Existing Contacts:</strong> VoiceLink automatically searches for existing records and creates new contacts when needed.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Conversation Information */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center space-x-2" style={{ color: '#1C2C55' }}>
                      <MessageCircle className="w-6 h-6" />
                      <span>2. Conversation Information</span>
                    </h3>
                    
                    <div className="space-y-4">
                      <p className="text-gray-700">Share important information as if you're telling a colleague.</p>
                      
                      <div className="bg-white rounded-lg p-4 border-l-4" style={{ borderColor: '#25D366' }}>
                        <p className="font-medium text-gray-800">Example:</p>
                        <p className="italic text-gray-700 mt-2">
                          "He's interested in product X, wants a demo next week, and asked me to send the price list."
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          <strong>Tip:</strong> The more details you provide, the better VoiceLink can fill your CRM. 
                          The system automatically creates tags and reports as annotations.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Calendar & Task Management */}
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center space-x-2" style={{ color: '#1C2C55' }}>
                      <Calendar className="w-6 h-6" />
                      <span>3. Calendar & Task Management</span>
                    </h3>
                    
                    <p className="text-gray-700 mb-4">VoiceLink can automatically create or update appointments and tasks.</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2" style={{ color: '#1C2C55' }}>📞 Callbacks:</h4>
                          <div className="bg-white rounded-lg p-3 text-sm">
                            <p>"I need to call him back Monday at 3 PM"</p>
                            <p>"I should call him tomorrow morning"</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2" style={{ color: '#1C2C55' }}>📅 Appointments:</h4>
                          <div className="bg-white rounded-lg p-3 text-sm">
                            <p>"He's coming next Tuesday at 2 PM"</p>
                            <p>"Meeting in Tremelo on May 29th at 1 PM"</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2" style={{ color: '#1C2C55' }}>✅ Tasks:</h4>
                          <div className="bg-white rounded-lg p-3 text-sm">
                            <p>"Send catalog tomorrow"</p>
                            <p>"Prepare quote for Friday 2 PM"</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2" style={{ color: '#1C2C55' }}>🔄 Updates:</h4>
                          <div className="bg-white rounded-lg p-3 text-sm">
                            <p>"Meeting with Marianna moved to Tuesday 12 PM"</p>
                            <p>"Jeff didn't answer, try again tomorrow"</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Best Practices */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center space-x-2" style={{ color: '#1C2C55' }}>
                      <CheckCircle className="w-6 h-6" />
                      <span>4. Best Practices for Optimal Use</span>
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1C2C55' }}>
                            <span className="text-white text-sm">🗣️</span>
                          </div>
                          <div>
                            <h4 className="font-semibold" style={{ color: '#1C2C55' }}>Speak Clearly</h4>
                            <p className="text-sm text-gray-700">Speak clearly and slowly in standard English</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1C2C55' }}>
                            <span className="text-white text-sm">📱</span>
                          </div>
                          <div>
                            <h4 className="font-semibold" style={{ color: '#1C2C55' }}>Spelling Mode</h4>
                            <p className="text-sm text-gray-700">Spell letters for names, emails, and phone numbers when in doubt</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1C2C55' }}>
                            <span className="text-white text-sm">⏰</span>
                          </div>
                          <div>
                            <h4 className="font-semibold" style={{ color: '#1C2C55' }}>Auto-Scheduling</h4>
                            <p className="text-sm text-gray-700">No time mentioned? VoiceLink finds a suitable time automatically</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1C2C55' }}>
                            <span className="text-white text-sm">🎯</span>
                          </div>
                          <div>
                            <h4 className="font-semibold" style={{ color: '#1C2C55' }}>Keep It Focused</h4>
                            <p className="text-sm text-gray-700">One update per message is most reliable</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800">
                        <strong>Important:</strong> You can only update one contact per message. 
                        Want to update multiple people in your CRM? Record them with separate voice notes on WhatsApp.
                      </p>
                    </div>
                  </div>

                  {/* Troubleshooting */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center space-x-2" style={{ color: '#1C2C55' }}>
                      <Settings className="w-6 h-6" />
                      <span>5. Troubleshooting</span>
                    </h3>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold mb-2" style={{ color: '#1C2C55' }}>No Connection?</h4>
                        <p className="text-sm text-gray-700">Check internet connection and API settings</p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold mb-2" style={{ color: '#1C2C55' }}>Wrong Input?</h4>
                        <p className="text-sm text-gray-700">Send corrections via new voice message</p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold mb-2" style={{ color: '#1C2C55' }}>Transcription Errors?</h4>
                        <p className="text-sm text-gray-700">Speak clearly without background noise</p>
                      </div>
                    </div>
                  </div>

                  {/* Support */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 text-center">
                    <h3 className="text-xl font-bold mb-4" style={{ color: '#1C2C55' }}>
                      Need Help?
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <a
                        href="mailto:contact@finitsolutions.be"
                        className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg hover:shadow-md transition-shadow"
                      >
                        <Mail className="w-4 h-4" style={{ color: '#1C2C55' }} />
                        <span className="text-sm font-medium" style={{ color: '#1C2C55' }}>contact@finitsolutions.be</span>
                      </a>
                      
                      <a
                        href="/support"
                        className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg hover:shadow-md transition-shadow"
                      >
                        <Headphones className="w-4 h-4" style={{ color: '#1C2C55' }} />
                        <span className="text-sm font-medium" style={{ color: '#1C2C55' }}>Support Center</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Multi-User CTA Section */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Add Team Members</h2>
                  <p className="text-sm text-gray-600">Invite up to 4 additional users to your trial account</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-blue-800">Trial Account Benefits</span>
                </div>
                <p className="text-sm text-blue-700">
                  Add up to 4 team members to your trial account at no extra cost. They'll get full access to VoiceLink features during your trial period.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Team Member Slots (4 available)</h3>
                
                {/* Current User */}
                <div className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{user?.name || 'You'}</div>
                    <div className="text-sm text-gray-600">{user?.email} (Account Owner)</div>
                  </div>
                  <div className="text-sm font-medium text-green-700">Active</div>
                </div>

                {/* 4 Open Slots */}
                {[1, 2, 3, 4].map((slot) => (
                  <div key={slot} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor={`name-${slot}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Team Member Name
                          </label>
                          <input
                            type="text"
                            id={`name-${slot}`}
                            placeholder="Enter full name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor={`phone-${slot}`} className="block text-sm font-medium text-gray-700 mb-1">
                            WhatsApp Phone Number
                          </label>
                          <input
                            type="tel"
                            id={`phone-${slot}`}
                            placeholder="+32 123 456 789"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor={`email-${slot}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id={`email-${slot}`}
                          placeholder="team.member@company.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">Slot {slot}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Team members will receive an invitation email with setup instructions</li>
                  <li>• They'll need to verify their WhatsApp number to start using VoiceLink</li>
                  <li>• All team members get full access during your 14-day trial</li>
                  <li>• After trial, you can upgrade to a team plan with volume discounts</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Send Invitations</span>
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg transition-colors">
                  Save as Draft
                </button>
              </div>
            </div>
          </section>

          {/* Odoo API Key Input - Only for Odoo users */}
          {user?.platform === 'odoo' && (
            <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <OdooApiKeyInput />
            </section>
          )}

          <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#1C2C55' }}>
                {t('dashboard.customerPortal.title')}
              </h2>
              <p className="text-xl" style={{ color: '#6B7280' }}>
                {t('dashboard.customerPortal.subtitle')}
              </p>
            </div>

            <div className="max-w-2xl mx-auto mb-16">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)' }}>
                    <CreditCard className="w-8 h-8" style={{ color: '#1C2C55' }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#1C2C55' }}>
                    {t('dashboard.customerPortal.portalTitle')}
                  </h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    {t('dashboard.customerPortal.portalDescription')}
                  </p>
                  
                  <a
                    href="https://billing.stripe.com/p/login/cNifZi74c1OQepfcYAdMI00"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center space-x-3 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1"
                    style={{ backgroundColor: '#1C2C55' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F1A3A'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C2C55'}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>{t('dashboard.customerPortal.accessPortal')}</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  
                  <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="w-4 h-4" style={{ color: '#1C2C55' }} />
                      <span>{t('dashboard.customerPortal.viewBillingHistory')}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="w-4 h-4" style={{ color: '#1C2C55' }} />
                      <span>{t('dashboard.customerPortal.updatePaymentMethods')}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="w-4 h-4" style={{ color: '#1C2C55' }} />
                      <span>{t('dashboard.customerPortal.downloadInvoices')}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="w-4 h-4" style={{ color: '#1C2C55' }} />
                      <span>{t('dashboard.customerPortal.manageSubscription')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Premium Features Grid */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#1C2C55' }}>
                {t('dashboard.premiumFeatures.title')}
              </h2>
              <p className="text-xl" style={{ color: '#6B7280' }}>
                {t('dashboard.premiumFeatures.subtitle')}
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* WhatsApp Integration */}
              <div className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)' }}>
                  <MessageCircle className="w-8 h-8" style={{ color: '#1C2C55' }} />
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: '#1C2C55' }}>
                  {t('dashboard.premiumFeatures.whatsappVoiceNotes.title')}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {t('dashboard.premiumFeatures.whatsappVoiceNotes.description')}
                </p>
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(247, 230, 155, 0.2)' }}>
                  <CheckCircle className="w-4 h-4" style={{ color: '#1C2C55' }} />
                  <span className="text-sm font-medium" style={{ color: '#1C2C55' }}>{t('dashboard.premiumFeatures.whatsappVoiceNotes.unlimitedUsage')}</span>
                </div>
              </div>

              {/* Real-time Sync */}
              <div className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)' }}>
                  <Zap className="w-8 h-8" style={{ color: '#1C2C55' }} />
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: '#1C2C55' }}>
                  {t('dashboard.premiumFeatures.realtimeSync.title')}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {t('dashboard.premiumFeatures.realtimeSync.description')}
                </p>
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(247, 230, 155, 0.2)' }}>
                  <CheckCircle className="w-4 h-4" style={{ color: '#1C2C55' }} />
                  <span className="text-sm font-medium" style={{ color: '#1C2C55' }}>{t('dashboard.premiumFeatures.realtimeSync.liveUpdates')}</span>
                </div>
              </div>

              {/* Priority Support */}
              <div className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)' }}>
                  <Headphones className="w-8 h-8" style={{ color: '#1C2C55' }} />
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: '#1C2C55' }}>
                  {t('dashboard.premiumFeatures.prioritySupport.title')}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {t('dashboard.premiumFeatures.prioritySupport.description')}
                </p>
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(247, 230, 155, 0.2)' }}>
                  <CheckCircle className="w-4 h-4" style={{ color: '#1C2C55' }} />
                  <span className="text-sm font-medium" style={{ color: '#1C2C55' }}>{t('dashboard.premiumFeatures.prioritySupport.support24x7')}</span>
                </div>
              </div>
              </div>
            </div>
          </section>

          {/* Support Section */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <div className="text-center bg-gradient-to-r from-gray-50 to-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#1C2C55' }}>
                {t('dashboard.support.title')}
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                {t('dashboard.support.description')}
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
                  <span>{t('dashboard.support.contactSupport')}</span>
                </a>
              </div>
            </div>
          </section>
        </div>
        

      </div>
    </div>
  );
};