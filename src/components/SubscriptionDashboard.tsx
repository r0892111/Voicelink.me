import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Crown, Users, Settings, CheckCircle, MessageCircle, Headphones, Calendar, Mail, CreditCard, ExternalLink, UserPlus, Phone, Loader2, X, AlertCircle } from 'lucide-react';
import { WhatsAppVerification } from './WhatsAppVerification';
import { OdooApiKeyInput } from './OdooApiKeyInput';
import { CompanyUserDropdown } from './CompanyUserDropdown';
import { supabase } from '../lib/supabase';

interface TeamMember {
  id?: string;
  name: string;
  email: string;
  whatsapp_number: string;
  whatsapp_status?: 'not_set' | 'pending' | 'active';
  invitation_status?: 'pending' | 'accepted' | 'declined';
}

interface CompanyUser {
  id: number | string;
  name: string;
  email: string;
  function?: string;
  phone?: string;
  // Additional platform-specific fields
  [key: string]: any;
}

// Platform-specific user interfaces can be added here if needed
// interface OdooUser extends CompanyUser { id: number; login: string; }
// interface PipedriveUser extends CompanyUser { id: number; active_flag?: boolean; }
// interface TeamLeaderUser extends CompanyUser { id: string; first_name?: string; last_name?: string; }

import { useI18n } from '../hooks/useI18n';
import { useSubscription } from '../hooks/useSubscription';

export const SubscriptionDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { teamSizeLimit, loading: subscriptionLoading } = useSubscription();
  const manageSubscriptionRef = React.useRef<HTMLElement>(null);
  const [whatsappStatus, setWhatsappStatus] = React.useState<'not_set' | 'pending' | 'active'>('not_set');
  const [loadingWhatsApp, setLoadingWhatsApp] = React.useState(true);
  const [addedTeamMembers, setAddedTeamMembers] = useState<TeamMember[]>([]);
  const [currentMember, setCurrentMember] = useState<TeamMember>({ name: '', email: '', whatsapp_number: '' });
  const [inviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState('');
  
  // Company users state (works for all platforms)
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [loadingCompanyUsers, setLoadingCompanyUsers] = useState(false);
  const [selectedCompanyUser, setSelectedCompanyUser] = useState<CompanyUser | null>(null);
  const [isFetchingRef] = React.useState({ current: false });
  const [lastFetchTimeRef] = React.useState({ current: 0 });
  const [lastStatusRef] = React.useState({ current: 'not_set' });
  const [statusCheckIntervalRef] = React.useState({ current: null });

  const remainingSlots = teamSizeLimit - addedTeamMembers.length - 1;
  const canAddMore = remainingSlots > 0;

  const scrollToManageSubscription = () => {
    if (manageSubscriptionRef.current) {
      manageSubscriptionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Debug: Monitor team members state changes
  React.useEffect(() => {
    console.log('Team members updated:', addedTeamMembers);
    console.log('Team size:', addedTeamMembers.length + 1);
  }, [addedTeamMembers]);

  // Fetch existing team members from database
  const fetchTeamMembers = React.useCallback(async () => {
    if (!user) return;
    
    try {
      const platform = user.platform;
      const tableName = `${platform}_users`;
      
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session found for fetching team members');
        return;
      }

      // Fetch team members invited by this admin user
      const { data: teamMembers, error } = await supabase
        .from(tableName)
        .select('id, user_info, whatsapp_number, whatsapp_status, invitation_status, created_at')
        .eq('admin_user_id', user.id)
        .eq('is_admin', false)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching team members:', error);
        return;
      }

      // Transform database data to TeamMember format
      const transformedMembers: TeamMember[] = teamMembers.map(member => ({
        id: member.id.toString(),
        name: member.user_info?.name || member.user_info?.first_name + ' ' + member.user_info?.last_name || 'Unknown',
        email: member.user_info?.email || '',
        whatsapp_number: member.whatsapp_number || '',
        whatsapp_status: member.whatsapp_status || 'not_set',
        invitation_status: member.invitation_status || 'pending'
      }));

      console.log('Fetched team members from database:', transformedMembers);
      setAddedTeamMembers(transformedMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  }, [user]);

  // Fetch team members when component mounts or user changes
  React.useEffect(() => {
    if (user) {
      fetchTeamMembers();
    }
  }, [user, fetchTeamMembers]);

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
        return t('platforms.teamleader');
      case 'pipedrive':
        return t('platforms.pipedrive');
      case 'odoo':
        return t('platforms.odoo');
      default:
        return t('platforms.unknown');
    }
  };

  const updateCurrentMember = (field: keyof TeamMember, value: string) => {
    setCurrentMember(prev => ({ ...prev, [field]: value }));
  };

  const isCurrentMemberValid = () => {
    // Basic validation: name and email are required
    const hasNameAndEmail = currentMember.name.trim() && currentMember.email.trim();
    
    // For company user selection, WhatsApp number is optional if user is selected
    if (selectedCompanyUser) {
      return hasNameAndEmail;
    }
    
    // For manual entry, all fields including WhatsApp are required
    return hasNameAndEmail && currentMember.whatsapp_number.trim();
  };

  const addNewUser = async () => {
    if (!isCurrentMemberValid() || !canAddMore || !user) return;
    
    // Additional validation: Check if we're at the team size limit
    if (addedTeamMembers.length + 1 >= teamSizeLimit) {
      setInviteError(`You have reached your team size limit of ${teamSizeLimit} users. Please upgrade your subscription to add more team members.`);
      setTimeout(() => setInviteError(''), 5000);
      return;
    }
    
    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      // Send invitation via edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-team-members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          crm_provider: user.platform,
          team_member: {
            ...currentMember,
            whatsapp_number: currentMember.whatsapp_number || null
          },
          admin_user_id: user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send invitation');
      }

      const result = await response.json();
      console.log('Team member invitation result:', result);
      
      // Generate a unique ID for the team member
      const teamMemberId = result.crmUser?.id || result.authUser?.user?.id || `temp_${Date.now()}`;
      
      // Add the new team member to the local state
      setAddedTeamMembers(prev => [...prev, {
        id: teamMemberId,
        name: currentMember.name,
        email: currentMember.email,
        whatsapp_number: currentMember.whatsapp_number
      }]);
      
      console.log('Added team member to state:', {
        id: teamMemberId,
        name: currentMember.name,
        email: currentMember.email,
        whatsapp_number: currentMember.whatsapp_number
      });
      
      // Show success message
      setInviteSuccess(true);
      setTimeout(() => setInviteSuccess(false), 3000);
      
      // Refresh team members from database
      await fetchTeamMembers();
      
      // Clear the form and selected user
      setCurrentMember({ name: '', email: '', whatsapp_number: '' });
      setSelectedCompanyUser(null);
    } catch (error) {
      console.error('Error adding team member:', error);
      setInviteError(error instanceof Error ? error.message : 'Failed to add team member');
      setTimeout(() => setInviteError(''), 5000);
    }
  };

  const removeMember = async (id: string) => {
    if (!user) return;
    
    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session found for removing team member');
        return;
      }

      // Call the remove-team-member Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/remove-team-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          team_member_id: id,
          crm_provider: user.platform,
          admin_user_id: user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove team member');
      }

      const result = await response.json();
      console.log('Team member removal result:', result);

      // Remove from local state
      setAddedTeamMembers(prev => prev.filter(member => member.id !== id));
      
      // Show confirmation
      setInviteSuccess(true);
      setTimeout(() => setInviteSuccess(false), 2000);
      
      console.log('Team member and auth user removed successfully');
    } catch (error) {
      console.error('Error removing team member:', error);
      setInviteError(error instanceof Error ? error.message : 'Failed to remove team member');
      setTimeout(() => setInviteError(''), 5000);
    }
  };


  // Generic company users API functions
  const fetchCompanyUsers = async () => {
    if (!user || !['odoo', 'pipedrive', 'teamleader'].includes(user.platform)) return;
    
    setLoadingCompanyUsers(true);
    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      // Determine the correct endpoint based on platform
      const endpoint = getCompanyUsersEndpoint(user.platform);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          crm_provider: user.platform,
          user_id: user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch company users');
      }

      const result = await response.json();
      setCompanyUsers(result.users || []);
    } catch (error) {
      console.error(`Error fetching ${user.platform} company users:`, error);
      setInviteError(error instanceof Error ? error.message : 'Failed to fetch company users');
      setTimeout(() => setInviteError(''), 5000);
    } finally {
      setLoadingCompanyUsers(false);
    }
  };

  // Helper function to get the correct endpoint for each platform
  const getCompanyUsersEndpoint = (platform: string): string => {
    switch (platform) {
      case 'odoo':
        return 'get-odoo-company-users';
      case 'pipedrive':
        return 'get-pipedrive-company-users';
      case 'teamleader':
        return 'get-teamleader-company-users';
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  };

  const handleCompanyUserSelect = (companyUser: CompanyUser) => {
    setSelectedCompanyUser(companyUser);
    setCurrentMember({
      name: companyUser.name,
      email: companyUser.email,
      whatsapp_number: companyUser.phone || ''
    });
  };

  const handleAutofillPhone = (phone: string) => {
    setCurrentMember(prev => ({
      ...prev,
      whatsapp_number: phone
    }));
  };

  // Fetch company users when component loads for supported platforms
  React.useEffect(() => {
    if (user?.platform && ['odoo', 'pipedrive', 'teamleader'].includes(user.platform) && whatsappStatus === 'active') {
      fetchCompanyUsers();
    }
  }, [user?.platform, whatsappStatus]);

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
                        <img src="/Teamleader_Icon.svg" alt={t('platforms.teamleader')} className="w-12 h-12" />
                      )}
                      {user?.platform === 'pipedrive' && (
                        <img src="/Pipedrive_id-7ejZnwv_0.svg" alt={t('platforms.pipedrive')} className="w-12 h-12" />
                      )}
                      {user?.platform === 'odoo' && (
                        <img src="/odoo_logo.svg" alt={t('platforms.odoo')} className="w-12 h-12" />
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
                    <div className="grid md:grid-cols-1 gap-6">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{t('dashboard.accountProfile.personalInfo')}</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">{t('dashboard.accountProfile.fullName')}</span>
                            <span className="text-sm font-medium text-gray-900">
                              {user.name}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">{t('dashboard.accountProfile.email')}</span>
                            <span className="text-sm font-medium text-gray-900">{user.email}</span>
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

          {/* Odoo API Key Input - Only for Odoo users */}
          {user?.platform === 'odoo' && (
            <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <OdooApiKeyInput />
            </section>
          )}

          {/* Team Management Section - Only show when WhatsApp is active */}
          {!loadingWhatsApp && whatsappStatus === 'active' && (
            <section className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 44, 85, 0.1)' }}>
                      <Users className="w-6 h-6" style={{ color: '#1C2C55' }} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold" style={{ color: '#1C2C55' }}>{t('teamManagement.title')}</h3>
                      <p className="text-gray-600">{t('teamManagement.subtitle')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Team Size</div>
                    {subscriptionLoading ? (
                      <div className="text-2xl font-bold text-gray-400 animate-pulse">
                        Loading...
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold" style={{ color: '#1C2C55' }}>
                          {addedTeamMembers.length + 1}/{teamSizeLimit}
                        </div>
                        <div className="text-xs text-gray-500">
                          {remainingSlots} slots remaining
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Account Owner */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-4" style={{ color: '#1C2C55' }}>{t('teamManagement.accountOwner')}</h4>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1C2C55' }}>
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{user?.name}</div>
                          <div className="text-sm text-gray-600">{user?.email}</div>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {t('teamManagement.admin')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                {addedTeamMembers.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold mb-4" style={{ color: '#1C2C55' }}>{t('teamManagement.teamMembers')}</h4>
                    <div className="space-y-3">
                      {addedTeamMembers.map((member) => (
                        <div key={member.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <Users className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{member.name}</div>
                                <div className="text-sm text-gray-600">{member.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className={`px-3 py-1 text-xs font-medium rounded-full ${
                                member.whatsapp_status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : member.whatsapp_status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {member.whatsapp_status === 'active' 
                                  ? t('teamManagement.verified')
                                  : member.whatsapp_status === 'pending'
                                  ? t('teamManagement.pending')
                                  : t('teamManagement.notVerified')
                                }
                              </div>
                              <button
                                onClick={() => removeMember(member.id!)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200 hover:scale-110"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Team Member Form */}
                {canAddMore ? (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold" style={{ color: '#1C2C55' }}>{t('teamManagement.addNewMember')}</h4>
                    
                    {inviteSuccess && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span>{t('common.teamMemberInvitedSuccessfully')}</span>
                      </div>
                    )}

                    {inviteError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        <span>{inviteError}</span>
                      </div>
                    )}

                    {/* Company User Selection Dropdown - Works for all platforms */}
                    {user?.platform && ['odoo', 'pipedrive', 'teamleader'].includes(user.platform) ? (
                      <div className="space-y-4">
                        <CompanyUserDropdown
                          users={companyUsers}
                          loading={loadingCompanyUsers}
                          selectedUser={selectedCompanyUser}
                          onUserSelect={handleCompanyUserSelect}
                          onAutofillPhone={handleAutofillPhone}
                          platform={user.platform}
                          excludedEmails={addedTeamMembers.map(member => member.email.toLowerCase())}
                        />

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Phone className="w-4 h-4 inline mr-1" />
                            {t('teamManagement.whatsappNumber')}
                          </label>
                          <input
                            type="tel"
                            value={currentMember.whatsapp_number}
                            onChange={(e) => updateCurrentMember('whatsapp_number', e.target.value)}
                            placeholder={t('teamManagement.whatsappNumberPlaceholder')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    ) : (
                      /* Regular input fields for non-Odoo users */
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('teamManagement.fullName')}
                          </label>
                          <input
                            type="text"
                            value={currentMember.name}
                            onChange={(e) => updateCurrentMember('name', e.target.value)}
                            placeholder={t('teamManagement.fullNamePlaceholder')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Mail className="w-4 h-4 inline mr-1" />
                            {t('teamManagement.emailAddress')}
                          </label>
                          <input
                            type="email"
                            value={currentMember.email}
                            onChange={(e) => updateCurrentMember('email', e.target.value)}
                            placeholder={t('teamManagement.emailPlaceholder')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Phone className="w-4 h-4 inline mr-1" />
                            {t('teamManagement.whatsappNumber')}
                          </label>
                          <input
                            type="tel"
                            value={currentMember.whatsapp_number}
                            onChange={(e) => updateCurrentMember('whatsapp_number', e.target.value)}
                            placeholder={t('teamManagement.whatsappNumberPlaceholder')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-4">
                      <button
                        onClick={addNewUser}
                        disabled={!isCurrentMemberValid() || inviting || subscriptionLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center space-x-2"
                      >
                        {inviting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>{t('teamManagement.sendingInvitation')}</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-5 h-5" />
                            <span>{t('teamManagement.saveAndInvite')}</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          setCurrentMember({ name: '', email: '', whatsapp_number: '' });
                          setSelectedCompanyUser(null);
                        }}
                        disabled={inviting}
                        className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
                      >
                        {user?.platform === 'odoo' ? t('teamManagement.clearSelection') : t('teamManagement.addNewUser')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-gray-50 rounded-xl">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{t('teamManagement.teamLimitReached')}</h4>
                    <p className="text-gray-600 mb-4">
                      {t('teamManagement.teamLimitMessage', { total: teamSizeLimit })}
                    </p>
                    <button 
                      onClick={scrollToManageSubscription}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                    >
                      {t('teamManagement.upgradeSubscription')}
                    </button>
                  </div>
                )}
              </div>
            </section>
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
                    {t('userGuide.title')}
                  </h2>
                  <p className="text-xl" style={{ color: '#6B7280' }}>
                    {t('userGuide.subtitle')}
                  </p>
                </div>

                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Contact Recording */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center space-x-2" style={{ color: '#1C2C55' }}>
                      <Users className="w-6 h-6" />
                      <span>{t('userGuide.recordingContacts.title')}</span>
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2" style={{ color: '#1C2C55' }}>{t('userGuide.recordingContacts.startWith')}</h4>
                        <div className="bg-white rounded-lg p-4 border-l-4" style={{ borderColor: '#1C2C55' }}>
                          <p className="font-medium">{t('userGuide.recordingContacts.example1')}</p>
                          <p className="font-medium">{t('userGuide.recordingContacts.example2')}</p>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2" style={{ color: '#1C2C55' }}>{t('userGuide.recordingContacts.names')}</h4>
                          <p className="text-sm text-gray-700">{t('userGuide.recordingContacts.namesTip')}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2" style={{ color: '#1C2C55' }}>{t('userGuide.recordingContacts.phoneEmail')}</h4>
                          <p className="text-sm text-gray-700">{t('userGuide.recordingContacts.phoneEmailTip')}</p>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                          <strong>{t('userGuide.recordingContacts.newVsExisting')}:</strong> {t('userGuide.recordingContacts.newVsExistingTip')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Conversation Information */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center space-x-2" style={{ color: '#1C2C55' }}>
                      <MessageCircle className="w-6 h-6" />
                      <span>{t('userGuide.conversationInfo.title')}</span>
                    </h3>
                    
                    <div className="space-y-4">
                      <p className="text-gray-700">{t('userGuide.conversationInfo.description')}</p>
                      
                      <div className="bg-white rounded-lg p-4 border-l-4" style={{ borderColor: '#25D366' }}>
                        <p className="font-medium text-gray-800">{t('userGuide.conversationInfo.example')}</p>
                        <p className="italic text-gray-700 mt-2">
                          {t('userGuide.conversationInfo.exampleText')}
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          <strong>{t('userGuide.conversationInfo.tip')}</strong> {t('userGuide.conversationInfo.tipText')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Calendar & Task Management */}
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center space-x-2" style={{ color: '#1C2C55' }}>
                      <Calendar className="w-6 h-6" />
                      <span>{t('userGuide.calendarTasks.title')}</span>
                    </h3>
                    
                    <p className="text-gray-700 mb-4">{t('userGuide.calendarTasks.description')}</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2" style={{ color: '#1C2C55' }}>{t('userGuide.calendarTasks.callbacks')}</h4>
                          <div className="bg-white rounded-lg p-3 text-sm">
                            <p>{t('userGuide.calendarTasks.callback1')}</p>
                            <p>{t('userGuide.calendarTasks.callback2')}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2" style={{ color: '#1C2C55' }}>{t('userGuide.calendarTasks.appointments')}</h4>
                          <div className="bg-white rounded-lg p-3 text-sm">
                            <p>{t('userGuide.calendarTasks.appointment1')}</p>
                            <p>{t('userGuide.calendarTasks.appointment2')}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2" style={{ color: '#1C2C55' }}>{t('userGuide.calendarTasks.tasks')}</h4>
                          <div className="bg-white rounded-lg p-3 text-sm">
                            <p>{t('userGuide.calendarTasks.task1')}</p>
                            <p>{t('userGuide.calendarTasks.task2')}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2" style={{ color: '#1C2C55' }}>{t('userGuide.calendarTasks.updates')}</h4>
                          <div className="bg-white rounded-lg p-3 text-sm">
                            <p>{t('userGuide.calendarTasks.update1')}</p>
                            <p>{t('userGuide.calendarTasks.update2')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Best Practices */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center space-x-2" style={{ color: '#1C2C55' }}>
                      <CheckCircle className="w-6 h-6" />
                      <span>{t('userGuide.bestPractices.title')}</span>
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1C2C55' }}>
                            <span className="text-white text-sm">🗣️</span>
                          </div>
                          <div>
                            <h4 className="font-semibold" style={{ color: '#1C2C55' }}>{t('userGuide.bestPractices.speakClearly.title')}</h4>
                            <p className="text-sm text-gray-700">{t('userGuide.bestPractices.speakClearly.description')}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1C2C55' }}>
                            <span className="text-white text-sm">📱</span>
                          </div>
                          <div>
                            <h4 className="font-semibold" style={{ color: '#1C2C55' }}>{t('userGuide.bestPractices.spellingMode.title')}</h4>
                            <p className="text-sm text-gray-700">{t('userGuide.bestPractices.spellingMode.description')}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1C2C55' }}>
                            <span className="text-white text-sm">⏰</span>
                          </div>
                          <div>
                            <h4 className="font-semibold" style={{ color: '#1C2C55' }}>{t('userGuide.bestPractices.autoScheduling.title')}</h4>
                            <p className="text-sm text-gray-700">{t('userGuide.bestPractices.autoScheduling.description')}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1C2C55' }}>
                            <span className="text-white text-sm">🎯</span>
                          </div>
                          <div>
                            <h4 className="font-semibold" style={{ color: '#1C2C55' }}>{t('userGuide.bestPractices.keepFocused.title')}</h4>
                            <p className="text-sm text-gray-700">{t('userGuide.bestPractices.keepFocused.description')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800">
                        <strong>{t('userGuide.bestPractices.important')}</strong> {t('userGuide.bestPractices.importantText')}
                      </p>
                    </div>
                  </div>

                  {/* Troubleshooting */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center space-x-2" style={{ color: '#1C2C55' }}>
                      <Settings className="w-6 h-6" />
                      <span>{t('userGuide.troubleshooting.title')}</span>
                    </h3>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold mb-2" style={{ color: '#1C2C55' }}>{t('userGuide.troubleshooting.noConnection.title')}</h4>
                        <p className="text-sm text-gray-700">{t('userGuide.troubleshooting.noConnection.description')}</p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold mb-2" style={{ color: '#1C2C55' }}>{t('userGuide.troubleshooting.wrongInput.title')}</h4>
                        <p className="text-sm text-gray-700">{t('userGuide.troubleshooting.wrongInput.description')}</p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold mb-2" style={{ color: '#1C2C55' }}>{t('userGuide.troubleshooting.transcriptionErrors.title')}</h4>
                        <p className="text-sm text-gray-700">{t('userGuide.troubleshooting.transcriptionErrors.description')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Support */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 text-center">
                    <h3 className="text-xl font-bold mb-4" style={{ color: '#1C2C55' }}>
                      {t('userGuide.needHelp')}
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

          {/* Customer Portal Section - Manage Subscription */}
          <section ref={manageSubscriptionRef} className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
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
                    className="group inline-flex items-center space-x-3 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
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
        </div>
      </div>
    </div>
  );
};