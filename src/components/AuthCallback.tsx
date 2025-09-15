import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { StripeService } from '../services/stripeService';
import { useI18n } from '../hooks/useI18n';

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
        setMessage('Invalid authentication platform');
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
        setMessage(`Authentication failed: ${error}`);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setMessage('Missing authentication parameters');
        return;
      }

      // Verify stored state (if applicable)
      const storedState = platform === 'odoo'
        ? localStorage.getItem('odoo_oauth_state')
        : localStorage.getItem(`${platform}_oauth_state`);

      if (storedState && state !== storedState) {
        setStatus('error');
        setMessage('Invalid state parameter');
        return;
      }

      // Clean up stored state
      if (platform === 'odoo') localStorage.removeItem('odoo_oauth_state');
      else localStorage.removeItem(`${platform}_oauth_state`);

      setMessage(`Processing ${platform} authentication...`);
      setMessage(t('auth.callback.processingAuth', { platform }));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${platform}-auth`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            code,
            state,
            redirect_uri: `${window.location.protocol}//${window.location.host}/auth/${platform}/callback`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        setStatus('error');
        setMessage(result.error || 'Authentication failed');
        return;
      }

      // ✅ Store platform in localStorage immediately
      localStorage.setItem('userPlatform', platform);
      localStorage.setItem('auth_provider', platform);

      // Handle session if returned
      if (result.session) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });

        if (sessionError) {
          console.error('Session setup error:', sessionError);
          setStatus('error');
          setMessage('Failed to establish session');
          return;
        }
      }

      // Handle platforms with session_url (magic links, Pipedrive, etc.)
      if (result.session_url) {
        setMessage('Completing authentication...');
        window.location.href = result.session_url;
        return;
      }

      setStatus('success');
      setMessage(t('auth.callback.successfullyAuthenticated', { platform }));

      // Check subscription status and redirect accordingly
      setTimeout(() => {
        checkSubscriptionAndRedirect();
      }, 2000);

    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
      setMessage(err instanceof Error ? err.message : t('errors.unexpectedError'));
    }
  };

  const checkSubscriptionAndRedirect = async () => {
    try {
      const hasActiveSubscription = await checkSubscriptionStatus();
      
      if (hasActiveSubscription) {
        // User has active subscription, go to dashboard
        navigate('/dashboard');
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
      navigate('/dashboard');
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
            onClick={() => navigate('/')}
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
