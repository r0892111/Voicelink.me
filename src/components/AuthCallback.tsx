import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { StripeService } from '../services/stripeService';
import { useI18n } from '../hooks/useI18n';
import { withUTM } from '../utils/utm';
import { trackTrialStarted } from '../utils/analytics';

type CallbackStatus = 'loading' | 'success' | 'error';

export const AuthCallback: React.FC = () => {
  const { t } = useI18n();
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [message, setMessage] = useState(t('auth.callback.processingAuth', { platform: '' }));
  const { platform } = useParams<{ platform: string }>();
  const navigate = useNavigate();
  const hasProcessedRef = React.useRef(false);

  // Check if user has active subscription
  const checkSubscriptionStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      // Get provider from localStorage or URL params
      const provider = localStorage.getItem('auth_provider') || localStorage.getItem('userPlatform');
      const urlParams = new URLSearchParams(window.location.search);
      const urlProvider = urlParams.get('provider');
      const finalProvider = urlProvider || provider;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-subscription?provider=${finalProvider || 'unknown'}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      // Handle case where user has no Stripe customer ID yet
      if (!result.success && result.error && result.error.includes('empty string')) {
        console.log('User has not set up Stripe customer yet');
        return false;
      }

      return result.success && (result.subscription?.subscription_status === 'active' || result.subscription?.subscription_status === 'trialing');
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  };

  useEffect(() => {
    if (hasProcessedRef.current) return;
    handleCallback();
  }, [platform, navigate]);

  const handleCallback = async () => {
    try {
      hasProcessedRef.current = true;

      if (!platform) {
        setStatus('error');
        setMessage(t('auth.invalidAuthenticationPlatform'));
        return;
      }

      let code: string | null = null;
      let state: string | null = null;
      let error: string | null = null;

      // Odoo sends access_token in the hash fragment
      if (platform === 'odoo') {
        const fragment = window.location.hash.substring(1);
        const params = new URLSearchParams(fragment);
        code = params.get('access_token');
        state = params.get('state');
        error = params.get('error');
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        code = urlParams.get('code');
        state = urlParams.get('state');
        error = urlParams.get('error');
      }

      if (error) {
        setStatus('error');
        setMessage(`${t('auth.authenticationFailed')}: ${error}`);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setMessage(t('auth.missingAuthenticationParameters'));
        return;
      }

      // Verify stored state (if applicable)
      const storedState = platform === 'odoo'
        ? localStorage.getItem('odoo_oauth_state')
        : localStorage.getItem(`${platform}_oauth_state`);

      if (storedState && state !== storedState) {
        setStatus('error');
        setMessage(t('auth.invalidStateParameter'));
        return;
      }

      // Clean up stored state
      if (platform === 'odoo') localStorage.removeItem('odoo_oauth_state');
      else localStorage.removeItem(`${platform}_oauth_state`);

      setMessage(`Processing ${platform} authentication...`);
      setMessage(t('auth.callback.processingAuth', { platform }));

      // Build request body - include custom OAuth URL for Odoo if configured
      // Support custom redirect URI for Teamleader via environment variable
      let redirectUri = `${window.location.protocol}//${window.location.host}/auth/${platform}/callback`;
      if (platform === 'teamleader' && import.meta.env.VITE_TEAMLEADER_REDIRECT_URI) {
        redirectUri = import.meta.env.VITE_TEAMLEADER_REDIRECT_URI;
      }
      
      const requestBody: Record<string, string> = {
        code,
        state,
        redirect_uri: redirectUri,
      };

      // For custom Odoo implementations, pass the OAuth URL to the backend
      if (platform === 'odoo' && import.meta.env.VITE_ODOO_AUTH_URL) {
        requestBody.odoo_oauth_url = import.meta.env.VITE_ODOO_AUTH_URL;
      }

      // Check if we're in WhatsApp verification flow and use external auth for Pipedrive
      const isWhatsAppFlow = localStorage.getItem('whatsapp_verification_flow') === 'true';
      const authFunctionName = (platform === 'pipedrive' && isWhatsAppFlow) 
        ? 'pipedrive-external-auth' 
        : `${platform}-auth`;

      console.log('Auth callback:', { platform, isWhatsAppFlow, authFunctionName });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${authFunctionName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `Authentication failed: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
        }
        console.error('Auth function error:', { status: response.status, statusText: response.statusText, authFunctionName });
        throw new Error(errorMessage);
      }

      const result = await response.json();

      console.log('Auth function result:', { 
        success: result.success, 
        hasSession: !!result.session, 
        hasSessionUrl: !!result.session_url,
        platform 
      });

      if (!result.success) {
        setStatus('error');
        setMessage(result.error || t('auth.authenticationFailed'));
        return;
      }

      // ✅ Store platform in localStorage immediately
      localStorage.setItem('userPlatform', platform);
      localStorage.setItem('auth_provider', platform);

      // Handle session if returned
      if (result.session) {
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });

        if (sessionError) {
          console.error('Session setup error:', sessionError);
          setStatus('error');
          setMessage(t('auth.failedToEstablishSession'));
          return;
        }

        // Verify session was set
        if (!sessionData.session) {
          console.error('Session was not established after setSession');
          setStatus('error');
          setMessage(t('auth.failedToEstablishSession'));
          return;
        }

        console.log('Session established successfully:', { userId: sessionData.session.user.id });
      }

      // Handle platforms with session_url (magic links, Pipedrive, etc.)
      if (result.session_url) {
        setMessage(t('auth.completingAuthentication'));
        
        // Fix redirect_to parameter in session_url to use current origin instead of localhost
        let fixedSessionUrl = result.session_url;
        try {
          const url = new URL(result.session_url);
          const redirectTo = url.searchParams.get('redirect_to');
          if (redirectTo) {
            // Replace any localhost URL with current origin (voicelink.me in production)
            const currentOrigin = window.location.origin; // Will be https://voicelink.me in production
            let fixedRedirectTo = redirectTo;
            
            // Replace localhost with current origin
            if (redirectTo.includes('localhost')) {
              fixedRedirectTo = redirectTo.replace(/https?:\/\/localhost(:\d+)?/, currentOrigin);
            }
            
            // Ensure we're using the correct protocol (https in production)
            if (currentOrigin.includes('voicelink.me') && fixedRedirectTo.startsWith('http://')) {
              fixedRedirectTo = fixedRedirectTo.replace('http://', 'https://');
            }
            
            url.searchParams.set('redirect_to', fixedRedirectTo);
            fixedSessionUrl = url.toString();
            console.log('Fixed session_url redirect_to:', { original: redirectTo, fixed: fixedRedirectTo, currentOrigin });
          }
        } catch (e) {
          console.warn('Could not parse session_url:', e);
        }
        
        // For external auth, we might need to wait a bit for session to be established
        // Check if we have a session before redirecting
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && !result.session) {
          console.warn('No session available before redirecting to session_url');
          // Still redirect as the session_url might establish the session
        }
        
        // Store a flag to check subscription after magic link redirect completes
        sessionStorage.setItem('pending_subscription_check', 'true');
        sessionStorage.setItem('auth_platform', platform);
        
        window.location.href = fixedSessionUrl;
        return;
      }

      // If no session and no session_url, verify we have a session
      if (!result.session && !result.session_url) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.error('No session established and no session_url provided');
          setStatus('error');
          setMessage('Authentication completed but no session was established. Please try again.');
          return;
        }
        console.log('Session verified after auth:', { userId: session.user.id });
      }

      setStatus('success');
      setMessage(t('auth.callback.successfullyAuthenticated', { platform }));

      // Check subscription status and redirect accordingly
      setTimeout(() => {
        checkSubscriptionAndRedirect();
      }, 2000);

    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : t('errors.unexpectedError'));
    }
  };

  const checkSubscriptionAndRedirect = async () => {
    try {
      // First, verify we have an active session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting session:', sessionError);
        setStatus('error');
        setMessage('Failed to verify authentication session. Please try again.');
        return;
      }

      if (!session?.user) {
        console.error('No active session found after authentication');
        setStatus('error');
        setMessage('Authentication completed but no session is active. Please try signing in again.');
        return;
      }

      console.log('Session verified in redirect check:', { userId: session.user.id, email: session.user.email });

      // Check if we're in WhatsApp verification flow
      const isWhatsAppFlow = localStorage.getItem('whatsapp_verification_flow') === 'true';
      const whatsappUserId = localStorage.getItem('whatsapp_verification_user_id');
      const whatsappOtpCode = localStorage.getItem('whatsapp_verification_otp_code');

      if (isWhatsAppFlow && whatsappUserId && whatsappOtpCode) {
        // Clear the flow flag
        localStorage.removeItem('whatsapp_verification_flow');

        setMessage(t('auth.redirectingToWhatsAppVerification'));

        // Redirect to WhatsApp verification with auth_user_id
        navigate(withUTM(`/verify-whatsapp?user_id=${whatsappUserId}&otp_code=${whatsappOtpCode}&auth_user_id=${session.user.id}`));
        return;
      }

      const hasActiveSubscription = await checkSubscriptionStatus();

      if (hasActiveSubscription) {
        // User has active subscription, check if trial event already tracked
        const provider = localStorage.getItem('auth_provider') || localStorage.getItem('userPlatform');

        // Get table name based on provider
        const tableName = provider === 'teamleader' ? 'teamleader_users'
                       : provider === 'pipedrive' ? 'pipedrive_users'
                       : provider === 'odoo' ? 'odoo_users'
                       : null;

        if (tableName) {
          // Check if trial_started_tracked is false
          const { data: userData, error: userError } = await supabase
            .from(tableName)
            .select('trial_started_tracked')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (!userError && userData && !userData.trial_started_tracked) {
            // Fire the event only once
            trackTrialStarted(provider || undefined);

            // Update the flag in database
            await supabase
              .from(tableName)
              .update({ trial_started_tracked: true })
              .eq('user_id', session.user.id);

            console.log('[Analytics] Trial_started tracked for first time');
          } else {
            console.log('[Analytics] Trial_started already tracked, skipping');
          }
        }

        navigate(withUTM('/dashboard'));
      } else {
        // User doesn't have subscription, redirect to Stripe checkout
        setMessage(t('auth.callback.redirectingToCheckout'));

        // Use the starter tier price ID for single user
        await StripeService.createCheckoutSession({
          priceId: 'price_1S5o6zLPohnizGblsQq7OYCT',
          quantity: 1,
          successUrl: `${window.location.origin}/dashboard`,
          cancelUrl: `${window.location.origin}/dashboard`,
        });
      }
    } catch (error) {
      console.error('Error during subscription check/redirect:', error);
      // Fallback to dashboard if there's an error
      navigate(withUTM('/dashboard'));
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-12 h-12 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-600" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">{getIcon()}</div>

        <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {status === 'loading' && t('auth.callback.authenticating')}
          {status === 'success' && t('auth.callback.authenticationSuccessful')}
          {status === 'error' && t('auth.callback.authenticationFailed')}
        </h1>

        <p className="text-gray-600 mb-6">{message}</p>

        {status === 'error' && (
          <button
            onClick={() => navigate(withUTM('/'))}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {t('auth.callback.returnToHome')}
          </button>
        )}

        {status === 'success' && (
          <p className="text-sm text-gray-500">{t('auth.callback.redirectingToCheckout')}</p>
        )}
      </div>
    </div>
  );
};
