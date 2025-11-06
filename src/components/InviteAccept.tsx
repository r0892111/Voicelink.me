import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, UserPlus, Shield } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { authProviders } from '../config/authProviders';

type InviteStatus = 'loading' | 'ready' | 'authenticating' | 'error';

export const InviteAccept: React.FC = () => {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<InviteStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<{
    token: string;
    provider: string;
  } | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const provider = searchParams.get('provider');

    if (!token || !provider) {
      setStatus('error');
      setError('Invalid invitation link. Missing token or provider.');
      return;
    }

    // Validate provider
    const validProvider = authProviders.find(p => p.name === provider);
    if (!validProvider) {
      setStatus('error');
      setError('Invalid CRM provider specified in invitation link.');
      return;
    }

    setInviteData({ token, provider });
    setStatus('ready');
  }, [searchParams]);

  const handleAcceptInvite = async () => {
    if (!inviteData) return;

    setStatus('authenticating');

    try {
      // Store invitation token in localStorage for post-auth processing
      localStorage.setItem('pending_invitation_token', inviteData.token);
      localStorage.setItem('pending_invitation_provider', inviteData.provider);

      // Redirect to CRM authentication
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${inviteData.provider}-login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            redirect_uri: `${window.location.protocol}//${window.location.host}/auth/${inviteData.provider}/callback`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to initiate authentication');
      }

      const result = await response.json();

      if (result.auth_url) {
        // Redirect to CRM OAuth
        window.location.href = result.auth_url;
      } else {
        throw new Error('No authentication URL received');
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to start authentication');
      // Clean up stored data on error
      localStorage.removeItem('pending_invitation_token');
      localStorage.removeItem('pending_invitation_provider');
    }
  };

  const getProviderInfo = () => {
    if (!inviteData) return null;
    return authProviders.find(p => p.name === inviteData.provider);
  };

  const providerInfo = getProviderInfo();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Loading Invitation...
          </h1>
          <p className="text-gray-600">
            Please wait while we validate your invitation.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid Invitation
          </h1>

          <p className="text-gray-600 mb-6">
            {error || 'This invitation link is invalid or has expired.'}
          </p>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (status === 'authenticating') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Redirecting to {providerInfo?.displayName}...
          </h1>
          <p className="text-gray-600">
            You'll be asked to authenticate with your {providerInfo?.displayName} account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <UserPlus className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            You're Invited to VoiceLink!
          </h1>

          <p className="text-gray-600">
            You've been invited to join your team on VoiceLink. Accept this invitation to get started.
          </p>
        </div>

        {/* Provider Info */}
        {providerInfo && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-10 h-10 ${providerInfo.color} rounded-lg flex items-center justify-center`}>
                <providerInfo.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  {providerInfo.displayName} Integration
                </div>
                <div className="text-sm text-gray-600">
                  You'll authenticate with your {providerInfo.displayName} account
                </div>
              </div>
            </div>
          </div>
        )}

        {/* What Happens Next */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>What happens next?</span>
          </h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start space-x-2">
              <span className="font-semibold text-blue-600">1.</span>
              <span>Authenticate with your {providerInfo?.displayName} account</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-semibold text-blue-600">2.</span>
              <span>We'll securely save your account data</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-semibold text-blue-600">3.</span>
              <span>You'll verify your WhatsApp number to complete setup</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-semibold text-blue-600">4.</span>
              <span>Start using VoiceLink with your team!</span>
            </li>
          </ol>
        </div>

        {/* Accept Button */}
        <button
          onClick={handleAcceptInvite}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <CheckCircle className="w-5 h-5" />
          <span>Accept Invitation & Continue</span>
        </button>

        {/* Security Notice */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-800">Secure Authentication</span>
            </div>
            <p className="text-xs text-gray-600">
              Your data is encrypted and secure. We'll only access the information necessary for VoiceLink to function.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
