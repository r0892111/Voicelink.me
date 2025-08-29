import React, { useState } from 'react';
import { Settings, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { AuthService } from '../services/authService';

interface OdooAuthFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const OdooAuthForm: React.FC<OdooAuthFormProps> = ({ onSuccess, onCancel }) => {
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessToken) {
      setError('Please enter your Odoo access token');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const authService = AuthService.createOdooAuth();
      const result = await authService.authenticateWithApiKey(accessToken);
      
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect to Odoo</h3>
        <p className="text-gray-600 text-sm">Enter your Odoo access token to connect</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="odoo-access-token" className="block text-sm font-medium text-gray-700 mb-2">
            Access Token
          </label>
          <input
            id="odoo-access-token"
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="Your Odoo access token"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            You can get your access token from Odoo's OAuth 2.0 authentication flow
          </p>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <button
            type="submit"
            disabled={loading || !accessToken}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <span>Connect to Odoo</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};