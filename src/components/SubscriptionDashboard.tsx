import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../lib/supabase';
import { useI18n } from '../hooks/useI18n';
import { Users, Zap, Settings, MessageCircle, Check, ExternalLink, Crown, UserPlus, TrendingUp, Shield, Headphones, BarChart3, Loader2, AlertCircle, Mail, Phone } from 'lucide-react';
import { UserInfoCard } from './UserInfoCard';
import { WhatsAppVerification } from './WhatsAppVerification';
import { OdooApiKeyInput } from './OdooApiKeyInput';
import { useNavigate } from 'react-router-dom';

interface TeamMember {
  name: string;
  email: string;
  whatsapp_number: string;
}

export const SubscriptionDashboard: React.FC = () => {
  const { user } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const { t } = useI18n();
  const [whatsappStatus, setWhatsappStatus] = useState<'not_set' | 'pending' | 'active'>('not_set');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { name: '', email: '', whatsapp_number: '' },
    { name: '', email: '', whatsapp_number: '' },
    { name: '', email: '', whatsapp_number: '' },
    { name: '', email: '', whatsapp_number: '' }
  ]);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const navigate = useNavigate();

  // Redirect if no subscription
  useEffect(() => {
    if (!subscriptionLoading && !subscription) {
      navigate('/pricing');
    }
  }, [subscription, subscriptionLoading, navigate]);

  // Don't render if no subscription
  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return null; // Will redirect
  }

  // Redirect non-subscribers
  if (!user || !subscription) {
    if (!subscriptionLoading) {
      navigate('/pricing');
    }
    return null;
  }

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    setTeamMembers(prev => prev.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    ));
    setInviteError(null);
  };

  const validateTeamMembers = () => {
    const filledMembers = teamMembers.filter(member => 
      member.name.trim() || member.email.trim() || member.whatsapp_number.trim()
    );
    
    for (const member of filledMembers) {
      if (!member.name.trim()) {
        throw new Error('Please enter a name for all team members');
      }
      if (!member.email.trim() || !member.email.includes('@')) {
        throw new Error('Please enter valid email addresses for all team members');
      }
      if (!member.whatsapp_number.trim() || !member.whatsapp_number.startsWith('+')) {
        throw new Error('Please enter valid WhatsApp numbers (with country code) for all team members');
      }
    }
    
    return filledMembers;
  };

  const sendInvitations = async () => {
    if (!user) return;
    
    setInviting(true);
    setInviteError(null);
    
    try {
      const validMembers = validateTeamMembers();
      
      if (validMembers.length === 0) {
        throw new Error('Please fill in at least one team member');
      }
      
      // Send invitations via edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-team-members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          crm_provider: user.platform,
          admin_user_id: user.id,
          team_members: validMembers
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send invitations');
      }
      
      setInviteSuccess(true);
      setTeamMembers([
        { name: '', email: '', whatsapp_number: '' },
        { name: '', email: '', whatsapp_number: '' },
        { name: '', email: '', whatsapp_number: '' },
        { name: '', email: '', whatsapp_number: '' }
      ]);
      
      setTimeout(() => setInviteSuccess(false), 5000);
      
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : 'Failed to send invitations');
    } finally {
      setInviting(false);
    }
  };

  const saveAsDraft = () => {
    localStorage.setItem('voicelink_team_draft', JSON.stringify(teamMembers));
    // Show a brief success message
    const originalError = inviteError;
    setInviteError(null);
    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setInviteError(originalError);
    }, 2000);
  };

  // Load draft on component mount
  useEffect(() => {
    const draft = localStorage.getItem('voicelink_team_draft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        setTeamMembers(parsedDraft);
      } catch (error) {
        console.error('Error loading team member draft:', error);
      }
    }
  }, []);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'teamleader':
        return '/Teamleader_Icon.svg';
      case 'pipedrive':
        return '/Pipedrive_id-7ejZnwv_0.svg';
      case 'odoo':
        return '/odoo_logo.svg';
      default:
        return null;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          {/* Premium Hero Section */}
          <section className="text-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="relative inline-block mb-6">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent leading-tight">
                    Welcome, {user?.name || 'Valued Customer'}
                  </h1>
                  <p className="text-2xl text-gray-600 font-medium">
                    Your Premium VoiceLink Experience
                  </p>
                </div>
              </div>
              {/* Subtle background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-purple-50 to-indigo-100 rounded-3xl blur-3xl opacity-30 transform scale-150 -z-10"></div>
            </div>
          </section>

          {/* Status Overview Cards */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              {/* Platform Connection */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                    {getPlatformIcon(user?.platform || '') && (
                      <img 
                        src={getPlatformIcon(user?.platform || '') || ''} 
                        alt={getPlatformName(user?.platform || '')} 
                        className="w-12 h-12" 
                      />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">
                    {getPlatformName(user?.platform || '')}
                  </h3>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-lg font-semibold text-green-600">Connected & Active</span>
                  </div>
                  <p className="text-gray-600">
                    Your CRM integration is running smoothly
                  </p>
                </div>
              </div>

              {/* WhatsApp Status */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">WhatsApp</h3>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className={`w-3 h-3 rounded-full ${
                      whatsappStatus === 'active' ? 'bg-green-500 animate-pulse' : 
                      whatsappStatus === 'pending' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-lg font-semibold ${
                      whatsappStatus === 'active' ? 'text-green-600' : 
                      whatsappStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {whatsappStatus === 'active' ? 'Connected' : 
                       whatsappStatus === 'pending' ? 'Pending' : 'Not Connected'}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    {whatsappStatus === 'active' ? 'Ready to receive voice notes' : 
                     whatsappStatus === 'pending' ? 'Verification in progress' : 'Setup required'}
                  </p>
                </div>
              </div>

              {/* Subscription Status */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <Crown className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">Premium Plan</h3>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-lg font-semibold text-blue-600">Active</span>
                  </div>
                  <p className="text-gray-600">
                    Full access to all features
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* User Profile Card */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <UserInfoCard />
          </section>

          {/* WhatsApp Integration */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <WhatsAppVerification onStatusChange={setWhatsappStatus} />
          </section>

          {/* Team Management Section */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl shadow-2xl p-8 lg:p-12 text-white">
              <div className="relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-20 transform translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-full opacity-20 transform -translate-x-12 translate-y-12"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <UserPlus className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">Expand Your Team</h3>
                      <p className="text-blue-100">Add up to 4 team members to your trial account</p>
                    </div>
                  </div>

                  {inviteSuccess && (
                    <div className="mb-6 p-4 bg-green-500 bg-opacity-20 border border-green-300 rounded-lg flex items-center space-x-2 text-white">
                      <Check className="w-5 h-5" />
                      <span className="text-sm">Invitations sent successfully!</span>
                    </div>
                  )}

                  {inviteError && (
                    <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-300 rounded-lg flex items-center space-x-2 text-white">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm">{inviteError}</span>
                    </div>
                  )}

                  {/* Trial Benefits Banner */}
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 mb-6 border border-white border-opacity-20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Crown className="w-5 h-5 text-yellow-300" />
                      <span className="font-semibold text-white">Trial Benefits</span>
                    </div>
                    <p className="text-blue-100 text-sm">
                      Team members get full access during your trial period at no extra cost. Perfect time to test collaboration features!
                    </p>
                  </div>

                  {/* Current User */}
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 mb-4 border border-white border-opacity-20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{user?.name} (You)</div>
                          <div className="text-blue-200 text-sm">{user?.email}</div>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-green-500 bg-opacity-20 border border-green-400 rounded-full">
                        <span className="text-green-200 text-xs font-medium">Admin</span>
                      </div>
                    </div>
                  </div>

                  {/* Team Member Slots */}
                  <div className="space-y-4 mb-6">
                    {teamMembers.map((member, index) => (
                      <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20 hover:bg-opacity-15 transition-all duration-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">Team Member {index + 1}</div>
                            <div className="text-blue-200 text-sm">Available slot</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-blue-200 text-xs font-medium mb-1">Full Name</label>
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                              placeholder="Enter full name"
                              className="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-blue-200 text-xs font-medium mb-1">
                              <Mail className="w-3 h-3 inline mr-1" />
                              Email Address
                            </label>
                            <input
                              type="email"
                              value={member.email}
                              onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                              placeholder="Enter email address"
                              className="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-blue-200 text-xs font-medium mb-1">
                              <Phone className="w-3 h-3 inline mr-1" />
                              WhatsApp Number
                            </label>
                            <input
                              type="tel"
                              value={member.whatsapp_number}
                              onChange={(e) => updateTeamMember(index, 'whatsapp_number', e.target.value)}
                              placeholder="+32 123 456 789"
                              className="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* What Happens Next */}
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 mb-6 border border-white border-opacity-20">
                    <h4 className="font-semibold text-white mb-2">What happens next?</h4>
                    <ul className="text-blue-100 text-sm space-y-1">
                      <li>• Team members receive email invitations with setup instructions</li>
                      <li>• They'll verify their WhatsApp numbers for voice note access</li>
                      <li>• Full collaboration features activate immediately during trial</li>
                      <li>• Shared workspace and unified CRM updates for the whole team</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={sendInvitations}
                      disabled={inviting}
                      className="flex-1 bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {inviting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Sending Invitations...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5" />
                          <span>Send Invitations</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={saveAsDraft}
                      className="px-6 py-3 border border-white border-opacity-30 text-white font-medium rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <span>Save as Draft</span>
                    </button>
                  </div>

                  {/* Trust Indicators */}
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white border-opacity-20">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-white text-xs font-medium">Free Team Onboarding</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Headphones className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-white text-xs font-medium">Dedicated Support</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <BarChart3 className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-white text-xs font-medium">Team Analytics</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Odoo API Key Input - Only for Odoo users */}
          {user?.platform === 'odoo' && (
            <section className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <OdooApiKeyInput />
            </section>
          )}

          {/* Premium Features Grid */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Your Premium Features
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need for seamless CRM automation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* WhatsApp Integration */}
              <div className="group bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  WhatsApp Voice Notes
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Send voice messages directly to WhatsApp and watch them transform into structured CRM data automatically.
                </p>
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-full">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Unlimited Usage</span>
                </div>
              </div>

              {/* Real-time Sync */}
              <div className="group bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  Real-time CRM Sync
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Instant synchronization with your CRM platform. Updates appear in real-time across all your devices.
                </p>
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full">
                  <Check className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Live Updates</span>
                </div>
              </div>

              {/* AI Processing */}
              <div className="group bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  AI-Powered Processing
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Advanced AI understands context, extracts key information, and structures your data intelligently.
                </p>
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-50 rounded-full">
                  <Check className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Smart Analysis</span>
                </div>
              </div>

              {/* Multi-User Support */}
              <div className="group bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  Team Collaboration
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Add team members, share workspaces, and collaborate seamlessly with unified CRM access.
                </p>
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-50 rounded-full">
                  <Check className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Up to 5 Users</span>
                </div>
              </div>

              {/* Priority Support */}
              <div className="group bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Headphones className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  Priority Support
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Get dedicated support with faster response times and direct access to our technical team.
                </p>
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-50 rounded-full">
                  <Check className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">24/7 Support</span>
                </div>
              </div>

              {/* Advanced Analytics */}
              <div className="group bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  Advanced Analytics
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Detailed insights into your CRM usage, team performance, and automation effectiveness.
                </p>
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-teal-50 rounded-full">
                  <Check className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-medium text-teal-800">Full Reports</span>
                </div>
              </div>
            </div>
          </section>

          {/* Billing Portal Section */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border border-gray-100">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <Settings className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-900">
                  Manage Your Subscription
                </h3>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  Access your billing portal to view invoices, update payment methods, and manage your subscription settings.
                </p>
                
                <a
                  href="https://billing.stripe.com/p/login/cNifZi74c1OQepfcYAdMI00"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1"
                >
                  <Settings className="w-6 h-6" />
                  <span>Access Billing Portal</span>
                  <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 text-sm text-gray-600">
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>View Billing History</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Update Payment Methods</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Download Invoices</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Manage Subscription</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Support Section */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
            <div className="text-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Headphones className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-gray-900">
                Need Help?
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Our premium support team is here to help you get the most out of VoiceLink. Get in touch anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/support"
                  className="group bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center space-x-2"
                >
                  <Headphones className="w-5 h-5" />
                  <span>Contact Support</span>
                </a>
                <a
                  href="mailto:support@voicelink.com"
                  className="group border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Email Us</span>
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};