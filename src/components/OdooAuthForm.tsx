import React, { useState } from 'react';
import { Settings, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { AuthService } from '../services/authService';

interface OdooAuthFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const OdooAuthForm: React.FC<OdooAuthFormProps> = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [odooUrl, setOdooUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !apiKey || !odooUrl) {
      setError('Please fill in all fields');
      return;
    }

    // Basic URL validation
    try {
      new URL(odooUrl);
    } catch {
      setError('Please enter a valid Odoo URL (e.g., https://yourcompany.odoo.com)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const authService = AuthService.createOdooAuth();
      const result = await authService.authenticateWithApiKey(email, apiKey, odooUrl);
      
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
        <p className="text-gray-600 text-sm">Enter your Odoo credentials to connect</p>
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
          <label htmlFor="odoo-url" className="block text-sm font-medium text-gray-700 mb-2">
            Odoo URL
          </label>
          <input
            id="odoo-url"
            type="url"
            value={odooUrl}
            onChange={(e) => setOdooUrl(e.target.value)}
            placeholder="https://yourcompany.odoo.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="odoo-email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            id="odoo-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@company.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="odoo-api-key" className="block text-sm font-medium text-gray-700 mb-2">
            API Key
          </label>
          <input
            id="odoo-api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Your Odoo API key"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            You can find your API key in Odoo under Settings → Users & Companies → Users
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
            disabled={loading || !email || !apiKey || !odooUrl}
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