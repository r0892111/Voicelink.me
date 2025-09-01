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

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasProcessedRef.current) {
      return;
    }

    const handleCallback = async () => {
      try {
        hasProcessedRef.current = true;
        
        if (!platform) {
          setStatus('error');
          setMessage('Invalid authentication platform');
          return;
        }

        // Special handling for Odoo OAuth which uses access_token in URL fragment
        if (platform === 'odoo') {
          const fragment = window.location.hash.substring(1);
          const params = new URLSearchParams(fragment);
          const accessToken = params.get('access_token');
          const state = params.get('state');
          const error = params.get('error');

          if (error) {
            setStatus('error');
            setMessage(`Authentication failed: ${error}`);
            return;
          }

          if (!accessToken || !state) {
            setStatus('error');
            setMessage('Missing authentication parameters');
            return;
          }

          // Verify state parameter
          const storedState = localStorage.getItem('odoo_oauth_state');
          if (state !== storedState) {
            setStatus('error');
            setMessage('Invalid state parameter');
            return;
          }

          // Clean up stored state
          localStorage.removeItem('odoo_oauth_state');

          // Update loading message
          setMessage('Processing Odoo authentication...');

          // Call the Odoo edge function with access token
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/odoo-auth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              access_token: accessToken,
              state,
            })
          });

          if (!response.ok) {
            throw new Error(`Authentication failed: ${response.statusText}`);
          }

          const result = await response.json();
          
          if (result.success) {
            setStatus('success');
            setMessage('Successfully authenticated with Odoo!');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          } else {
            setStatus('error');
            setMessage(result.error || 'Authentication failed');
          }
          return;
        }

        // Standard OAuth flow for other platforms
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

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

        // Update loading message
        setMessage(`Processing ${platform} authentication...`);

        // Call the appropriate edge function
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${platform}-auth`, {
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
        });

        if (!response.ok) {
          throw new Error(`Authentication failed: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.success) {
          // Handle session creation for platforms that return session_url
          if (result.session_url) {
            // For platforms like Pipedrive that use magic link verification
            setMessage('Completing authentication...');
            window.location.href = result.session_url;
            return;
          }
          
          // If the result contains session data, set the session
          if (result.session) {
            const { data, error } = await supabase.auth.setSession({
              access_token: result.session.access_token,
              refresh_token: result.session.refresh_token
            });
            
            if (error) {
              console.error('Session setup error:', error);
              setStatus('error');
              setMessage('Failed to establish session');
              return;
            }
          }
          
          // If the result contains session data, set the session
          if (result.session) {
            const { data, error } = await supabase.auth.setSession({
              access_token: result.session.access_token,
              refresh_token: result.session.refresh_token
            });
            
            if (error) {
              console.error('Session setup error:', error);
              setStatus('error');
              setMessage('Failed to establish session');
              return;
            }
          }
          
          setStatus('success');
          setMessage('Successfully authenticated with Odoo!');
          
          // Redirect to home after a short delay
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(result.error || 'Authentication failed');
        }

      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      }
    };

    handleCallback();
  }, [platform, navigate]);

  // Add supabase import
  const supabase = React.useMemo(() => {
    return createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }, []);
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
        <div className="flex justify-center mb-6">
          {getIcon()}
        </div>
        
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
          <p className="text-sm text-gray-500">
            Redirecting to dashboard...
          </p>
        )}
      </div>
    </div>
  );
};