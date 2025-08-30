import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { AuthService } from '../services/authService';

export const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const location = useLocation();
  const navigate = useNavigate();
  const { provider } = useParams<{ provider: string }>();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        if (!provider) {
          setStatus('error');
          setMessage('No authentication provider specified');
          return;
        }

        let authService: AuthService;
        let code: string | null = null;
        let state: string | null = null;
        let accessToken: string | null = null;

        // Parse URL parameters based on provider
        if (provider === 'odoo') {
          // Odoo returns access_token in URL fragment
          const fragment = location.hash.substring(1);
          const fragmentParams = new URLSearchParams(fragment);
          accessToken = fragmentParams.get('access_token');
          state = fragmentParams.get('state');
          authService = AuthService.createOdooAuth();
        } else {
          // Other providers use query parameters
          const searchParams = new URLSearchParams(location.search);
          code = searchParams.get('code');
          state = searchParams.get('state');
          
          if (provider === 'teamleader') {
            authService = AuthService.createTeamleaderAuth();
          } else if (provider === 'pipedrive') {
            authService = AuthService.createPipedriveAuth();
          } else {
            setStatus('error');
            setMessage(`Unknown provider: ${provider}`);
            return;
          }
        }

        // Check for error parameter
        const searchParams = new URLSearchParams(location.search);
        const error = searchParams.get('error');
        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          return;
        }

        if (provider === 'odoo') {
          if (!accessToken || !state) {
            setStatus('error');
            setMessage('Missing access token or state parameter from Odoo');
            return;
          }
        } else {
          if (!code || !state) {
            setStatus('error');
            setMessage('Missing authorization code or state parameter');
            return;
          }
        }

        // Handle the callback
        const result = await authService.handleCallback(code || undefined, state || undefined, accessToken || undefined);

        if (result.success) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(result.error || 'Authentication failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage(`Error during authentication: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    handleAuth();
  }, [location, navigate, provider]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-12 h-12 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-600" />;
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
          {status === 'success' && 'Success!'}
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
      </div>
    </div>
  );
};