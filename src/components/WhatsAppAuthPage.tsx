import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageCircle, AlertCircle, Shield, Loader2 } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { AuthService } from '../services/authService';
import { authProviders } from '../config/authProviders';

export const WhatsAppAuthPage: React.FC = () => {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState<string | null>(null);
  const [userProvider, setUserProvider] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState(true);

  useEffect(() => {
    // Extract URL parameters
    const userIdParam = searchParams.get('user_id') || searchParams.get('userid');
    const otpCodeParam = searchParams.get('otp_code') || searchParams.get('otpcode');

    // Also check if parameters are in the URL path
    const currentPath = window.location.pathname + window.location.search;
    const pathMatch = currentPath.match(/(?:user_id|userid)=([^&]+)&(?:otp_code|otpcode)=([^&\s]+)/);

    let finalUserId = userIdParam;
    let finalOtpCode = otpCodeParam;

    if (pathMatch) {
      finalUserId = pathMatch[1];
      finalOtpCode = pathMatch[2];
    }

    if (!finalUserId || !finalOtpCode) {
      setError('Invalid verification link. Missing required parameters.');
      return;
    }

    setUserId(finalUserId);
    setOtpCode(finalOtpCode);

    // Store in localStorage so we can retrieve after OAuth callback
    localStorage.setItem('whatsapp_verification_user_id', finalUserId);
    localStorage.setItem('whatsapp_verification_otp_code', finalOtpCode);

    // Fetch the user's CRM provider
    fetchUserProvider(finalUserId);
  }, [searchParams]);

  const fetchUserProvider = async (userId: string) => {
    try {
      setLoadingProvider(true);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-user-provider?user_id=${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      const result = await response.json();

      if (result.success && result.provider) {
        setUserProvider(result.provider);
      } else {
        setError('Could not determine your CRM provider');
      }
    } catch (error) {
      console.error('Error fetching user provider:', error);
      setError('Failed to load authentication options');
    } finally {
      setLoadingProvider(false);
    }
  };

  const handleProviderAuth = async (providerName: string) => {
    if (!userId || !otpCode) {
      setError('Invalid verification link');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Store that we're in WhatsApp verification flow
      localStorage.setItem('whatsapp_verification_flow', 'true');

      // Initiate OAuth flow
      let authService: AuthService;

      switch (providerName) {
        case 'teamleader':
          authService = AuthService.createTeamleaderAuth();
          break;
        case 'pipedrive':
          authService = AuthService.createPipedriveAuth();
          break;
        case 'odoo':
          authService = AuthService.createOdooAuth();
          break;
        default:
          throw new Error('Unknown provider');
      }

      const result = await authService.initiateAuth();

      if (!result.success) {
        throw new Error(result.error || 'Authentication failed');
      }

      // OAuth flow will redirect away, so loading state will persist
    } catch (error) {
      console.error('Auth error:', error);
      setError(error instanceof Error ? error.message : 'Failed to authenticate');
      setLoading(false);
    }
  };

  if (!userId || !otpCode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid Verification Link
          </h1>

          <p className="text-gray-600 mb-6">
            This link appears to be invalid or incomplete. Please check your WhatsApp message for the correct verification link.
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
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            WhatsApp Verification
          </h1>

          <p className="text-gray-600">
            Sign in with your CRM platform to verify your WhatsApp
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-800">Secure Authentication Required</span>
          </div>
          <p className="text-sm text-blue-700">
            To complete WhatsApp verification, please sign in with your CRM account. Your tokens will be securely stored and linked to your WhatsApp verification.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Provider Buttons */}
        <div className="space-y-3">
          {loadingProvider ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading authentication options...</span>
            </div>
          ) : userProvider ? (
            <>
              <p className="text-sm text-gray-700 font-medium mb-3">
                Sign in with your CRM platform:
              </p>
              {authProviders
                .filter(provider => provider.name === userProvider)
                .map((provider) => {
                  const Icon = provider.icon;
                  return (
                    <button
                      key={provider.name}
                      onClick={() => handleProviderAuth(provider.name)}
                      disabled={loading}
                      className={`w-full ${provider.color} ${provider.hoverColor} disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Redirecting...</span>
                        </>
                      ) : (
                        <>
                          <Icon className="w-5 h-5" />
                          <span>Sign in with {provider.displayName}</span>
                        </>
                      )}
                    </button>
                  );
                })}
            </>
          ) : (
            <div className="text-center text-red-600">
              Unable to load authentication options
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 text-center">
              After signing in, you'll be redirected back to complete your WhatsApp verification. Your CRM access tokens will be securely stored in the database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
