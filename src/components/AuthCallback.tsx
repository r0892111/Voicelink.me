import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

type CallbackStatus = 'loading' | 'success' | 'error';

export const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const { platform } = useParams<{ platform: string }>();
  const navigate = useNavigate();
  const hasProcessedRef = React.useRef(false);

  const supabase = React.useMemo(() => {
    return createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }, []);

  useEffect(() => {
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;
    handleCallback();
  }, [platform, navigate]);

  const handleCallback = async () => {
    try {
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

      // Verify stored state (for Odoo especially)
      const storedState = localStorage.getItem(`${platform}_oauth_state`);
      if (storedState && state !== storedState) {
        setStatus('error');
        setMessage('Invalid state parameter');
        return;
      }
      localStorage.removeItem(`${platform}_oauth_state`);
      
      // Ensure platform is set in localStorage before API call
      localStorage.setItem('userPlatform', platform);
      localStorage.setItem('auth_provider', platform);

      setMessage(`Processing ${platform} authentication...`);


      

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
            redirect_uri: `${window.location.protocol}//${window.location.host}/auth/${platform}/callback`
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        if (result.session_url) {
          setMessage('Completing authentication...');
          window.location.href = result.session_url;
          return;
        }

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

        setStatus('success');
        setMessage(`Successfully authenticated with ${platform}!`);
        setTimeout(() => navigate('/'), 2000);
      } else {
        setStatus('error');
        setMessage(result.error || 'Authentication failed');
      }
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
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
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">{getIcon()}</div>

        <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {status === 'loading' && 'Authenticating...'}
          {status === 'success' && 'Authentication Successful!'}
          {status === 'error' && 'Authentication Failed'}
        </h1>

        <p className="text-gray-600 mb-6">{message}</p>

        {status === 'error' && (
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Return to Home
          </button>
        )}

        {status === 'success' && (
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        )}
      </div>
    </div>
  );
};
