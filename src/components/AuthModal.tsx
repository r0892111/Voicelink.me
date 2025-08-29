import React from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { AuthProvider } from '../types/auth';
import { AuthService } from '../services/authService';
import { authProviders } from '../config/authProviders';
import { OdooAuthForm } from './OdooAuthForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [loadingProvider, setLoadingProvider] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showOdooForm, setShowOdooForm] = React.useState(false);

  const handleSignIn = async (provider: AuthProvider) => {
    // Handle Odoo differently - show form instead of OAuth
    if (provider.name === 'odoo') {
      setShowOdooForm(true);
      return;
    }

    try {
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
        default:
          console.error('Unknown provider:', provider.name);
          return;
      }

      const result = await authService.initiateAuth();
      
      if (!result.success && result.error) {
        setError(`Authentication failed for ${provider.displayName}: ${result.error}`);
        setLoadingProvider(null);
      }
      
    } catch (error) {
      setError(`Error signing in with ${provider.displayName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoadingProvider(null);
    }
  };

  const handleOdooSuccess = () => {
    setShowOdooForm(false);
    onClose();
  };

  const handleOdooCancel = () => {
    setShowOdooForm(false);
  };

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
        {!showOdooForm && (
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
        )}

        {/* Content */}
        {showOdooForm ? (
          <OdooAuthForm onSuccess={handleOdooSuccess} onCancel={handleOdooCancel} />
        ) : (
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
        )}

        {/* Footer */}
        {!showOdooForm && (
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Secure authentication powered by OAuth 2.0
            </p>
          </div>
        )}
      </div>
    </div>
  );
};