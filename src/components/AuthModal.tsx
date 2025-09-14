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
  // Prevent double calls using ref
  if (processingRef.current || loadingProvider) return;

  try {
    processingRef.current = true;
    setLoadingProvider(provider.name);
    setError(null);

    // Set platform in localStorage immediately
    localStorage.setItem('userPlatform', provider.name);
    localStorage.setItem('auth_provider', provider.name);

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
      // Clear platform if auth failed
      localStorage.removeItem('userPlatform');
      localStorage.removeItem('auth_provider');
    }

  } catch (error) {
    setError(`Error signing in with ${provider.displayName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    localStorage.removeItem('userPlatform');
    localStorage.removeItem('auth_provider');
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
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative transform transition-all duration-300 scale-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/Finit Voicelink Blue.svg" 
              alt="VoiceLink" 
              className="h-8 w-auto"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Start Your Free Trial</h2>
          <p className="text-lg text-gray-600 mb-4">Connect your CRM and begin using VoiceLink instantly</p>
          
          {/* Free Trial Banner */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-green-800 font-semibold text-lg">14-Day Free Trial Starts Now</span>
            </div>
            <p className="text-green-700 text-sm">
              Your free trial begins immediately upon connecting your CRM. No credit card required.
            </p>
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Sign-in Options */}
        <div className="space-y-4 mb-8">
          {authProviders.map((provider) => {
            const isLoading = loadingProvider === provider.name;
            
            // Get the appropriate logo image for each CRM
            const getProviderLogo = (providerName: string) => {
              switch (providerName) {
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
            
            return (
              <button
                key={provider.name}
                onClick={() => handleSignIn(provider)}
                disabled={loadingProvider !== null}
                className={`group w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-800 font-semibold py-5 px-8 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transform relative overflow-hidden`}
              >
                {isLoading ? (
                  <>
                    <div className="flex items-center justify-center w-full">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-600 mr-3" />
                      <span className="text-lg text-gray-600">Connecting to {provider.displayName}...</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                        <img 
                          src={getProviderLogo(provider.name)} 
                          alt={provider.displayName} 
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                      <div className="text-left">
                        <div className="text-lg font-semibold text-gray-900">Connect {provider.displayName}</div>
                        <div className="text-sm text-gray-500">Start your free trial instantly</div>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div className="flex flex-col items-center space-y-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs text-gray-600 font-medium">Secure OAuth</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs text-gray-600 font-medium">No Setup Fees</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs text-gray-600 font-medium">Cancel Anytime</span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500">
            By connecting your CRM, you agree to our{' '}
            <a href="/saas-agreement" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy-policy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};