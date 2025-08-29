import React from 'react';
import { X } from 'lucide-react';
import { AuthProvider } from '../types/auth';
import { AuthService } from '../services/authService';
import { authProviders } from '../config/authProviders';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const handleSignIn = async (provider: AuthProvider) => {
    try {
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
        console.error(`Authentication failed for ${provider.displayName}:`, result.error);
        // You could show a toast notification here
      }
      
    } catch (error) {
      console.error(`Error signing in with ${provider.displayName}:`, error);
    }
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
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Platform</h2>
          <p className="text-gray-600">Sign in with your preferred CRM platform</p>
        </div>

        {/* Sign-in Options */}
        <div className="space-y-4">
          {authProviders.map((provider) => {
            const IconComponent = provider.icon;
            return (
              <button
                key={provider.name}
                onClick={() => handleSignIn(provider)}
                className={`w-full ${provider.color} ${provider.hoverColor} text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center justify-center space-x-3`}
              >
                <IconComponent className="w-6 h-6" />
                <span>Sign in with {provider.displayName}</span>
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