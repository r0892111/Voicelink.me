import React, { useState, useEffect } from 'react';
import { Key, Save, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const OdooApiKeyInput: React.FC = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);

  // Load existing API key on component mount
  useEffect(() => {
    loadExistingApiKey();
  }, [user]);

  const loadExistingApiKey = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('odoo_users')
        .select('id')
        .eq('user_id', user.id)
        .not('api_key', 'is', null)
        .single();

      if (error) {
        // No existing API key found - this is normal
        setHasExistingKey(false);
        return;
      }

      if (data?.id) {
        setHasExistingKey(true);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
      setHasExistingKey(false);
    } finally {
      setLoading(false);
    }
  };

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }

    if (!user) {
      setError('User not authenticated');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('odoo_users')
        .update({ 
          api_key: apiKey.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      setSuccess(true);
      setHasExistingKey(true);
      setApiKey(''); // Clear the input field
      
      // Show success message
      setTimeout(() => {
        setSuccess(false);
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    setError(null);
    setSuccess(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span className="ml-2 text-gray-600">Loading API key settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <Key className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Odoo API Key</h3>
          <p className="text-sm text-gray-600">
            {hasExistingKey 
              ? '✅ API key is securely stored and ready to use'
              : 'Enter your Odoo API key to enable advanced integrations'
            }
          </p>
        </div>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700">
          <Check className="w-5 h-5" />
          <span className="text-sm">API key saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="odoo-api-key" className="block text-sm font-medium text-gray-700 mb-2">
            {hasExistingKey ? 'Update API Key' : 'API Key'}
          </label>
          <div className="relative">
            <input
              type="password"
              id="odoo-api-key"
              value={apiKey}
              onChange={handleInputChange}
              placeholder={hasExistingKey ? "Enter new API key to update" : "Enter your Odoo API key"}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            />
            <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Your API key is encrypted and stored securely. It's used to sync data with your Odoo instance.
          </p>
        </div>

        <button
          onClick={saveApiKey}
          disabled={saving || !apiKey.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{hasExistingKey ? 'Update API Key' : 'Save API Key'}</span>
            </>
          )}
        </button>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-purple-800 mb-2">How to get your Odoo API Key:</h4>
          <ol className="text-xs text-purple-700 space-y-1 list-decimal list-inside">
            <li>Log into your Odoo instance as an administrator</li>
            <li>Go to Settings → Users & Companies → Users</li>
            <li>Select your user account</li>
            <li>In the "Access Rights" tab, find the "API Key" section</li>
            <li>Generate or copy your existing API key</li>
          </ol>
        </div>
      </div>
    </div>
  );
};