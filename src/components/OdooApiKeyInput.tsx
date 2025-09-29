import React, { useState, useEffect } from 'react';
import { Key, Save, Check, AlertCircle, Loader2, Database } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { supabase } from '../lib/supabase';

export const OdooApiKeyInput: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [apiKey, setApiKey] = useState('');
  const [databaseName, setDatabaseName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [hasExistingDatabase, setHasExistingDatabase] = useState(false);

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
        .select('id, odoo_database')
        .eq('user_id', user.id)
        .not('api_key', 'is', null)
        .single();

      if (error) {
        // No existing API key found - this is normal
        setHasExistingKey(false);
        setHasExistingDatabase(false);
        return;
      }

      if (data?.id) {
        setHasExistingKey(true);
        setHasExistingDatabase(!!data.odoo_database);
        if (data.odoo_database) {
          setDatabaseName(data.odoo_database);
        }
      }
    } catch (error) {
      console.error('Error loading API key:', error);
      setHasExistingKey(false);
      setHasExistingDatabase(false);
    } finally {
      setLoading(false);
    }
  };

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      setError(t('validation.enterValidApiKey'));
      return;
    }

    if (!databaseName.trim()) {
      setError(t('validation.enterOdooDatabaseName'));
      return;
    }
    if (!user) {
      setError(t('validation.userNotAuthenticated'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('odoo_users')
        .upsert({ 
          user_id: user.id,
          access_token: apiKey.trim(),
          odoo_database: databaseName.trim(),
          updated_at: new Date().toISOString(),
          is_admin: true
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        throw new Error(error.message);
      }

      setSuccess(true);
      setHasExistingKey(true);
      setHasExistingDatabase(true);
      setApiKey(''); // Clear the input field
      
      // Show success message
      setTimeout(() => {
        setSuccess(false);
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : t('validation.failedToSaveApiKey'));
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    setError(null);
    setSuccess(false);
  };

  const handleDatabaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatabaseName(e.target.value);
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
            {hasExistingKey && hasExistingDatabase
              ? '✅ API key and database are configured and ready to use'
              : 'Enter your Odoo API key and database name to enable advanced integrations'
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
          <label htmlFor="odoo-database" className="block text-sm font-medium text-gray-700 mb-2">
            Database Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="odoo-database"
              value={databaseName}
              onChange={handleDatabaseChange}
              placeholder={hasExistingDatabase ? t('common.updateDatabaseName') : t('common.enterOdooDatabaseName')}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            />
            <Database className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            The name of your Odoo database (e.g., "mycompany" from mycompany.odoo.com)
          </p>
        </div>

        <div>
          <label htmlFor="odoo-api-key" className="block text-sm font-medium text-gray-700 mb-2">
            API Key
          </label>
          <div className="relative">
            <input
              type="password"
              id="odoo-api-key"
              value={apiKey}
              onChange={handleInputChange}
              placeholder={hasExistingKey ? t('common.enterNewApiKey') : t('common.enterOdooApiKey')}
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
          disabled={saving || !apiKey.trim() || !databaseName.trim()}
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
              <span>{hasExistingKey ? 'Update Configuration' : 'Save Configuration'}</span>
            </>
          )}
        </button>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-purple-800 mb-2">How to get your Odoo API Key:</h4>
          <ol className="text-xs text-purple-700 space-y-1 list-decimal list-inside">
            <li>{t('common.selectUserAccount')}</li>
            <li>{t('common.accessRightsTab')}</li>
            <li>{t('common.generateOrCopyApiKey')}</li>
            <li>{t('common.databaseNameLocation')}</li>
          </ol>
        </div>
      </div>
    </div>
  );
};