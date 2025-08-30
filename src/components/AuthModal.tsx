import React from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { AuthProvider } from '../types/auth';
import { AuthService } from '../services/authService';
import { authProviders } from '../config/authProviders';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [loadingProvider, setLoadingProvider] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const processingRef = React.useRef(false);

  const handleSignIn = async (provider: AuthProvider) => {
    // Prevent double calls using ref to avoid React state timing issues
    if (processingRef.current || loadingProvider) {
      return;
    }

    try {
      processingRef.current = true;
      setLoadingProvider(provider.name);
      setError(null);
      
      let authService: AuthService;
      
      switch (provider.name) {
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
          console.error('Unknown provider:', provider.name);
          return;
      }

      const result = await authService.initiateAuth();
      
      if (!result.success && result.error) {
        setError(`Authentication failed for ${provider.displayName}: ${result.error}`);
      }
      
    } catch (error) {
      setError(`Error signing in with ${provider.displayName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingProvider(null);
      processingRef.current = false;
    }
  };

  // Reset processing state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      processingRef.current = false;
      setLoadingProvider(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Platform</h2>
          <p className="text-gray-600">Sign in with your preferred CRM platform</p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Sign-in Options */}
        <div className="space-y-4">
          {authProviders.map((provider) => {
            const IconComponent = provider.icon;
            const isLoading = loadingProvider === provider.name;
            
            return (
              <button
                key={provider.name}
                onClick={() => handleSignIn(provider)}
                disabled={loadingProvider !== null}
                className={`w-full ${provider.color} ${provider.hoverColor} text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Connecting to {provider.displayName}...</span>
                  </>
                ) : (
                  <>
                    <IconComponent className="w-6 h-6" />
                    <span>Sign in with {provider.displayName}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Secure authentication powered by OAuth 2.0
          </p>
        </div>
      </div>
    </div>
  );
};