import React, { useState, useEffect } from 'react';
import { Globe, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { supabase } from '../lib/supabase';

interface LanguageOption {
  code: string;
  label: string;
  flag: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' }
];

export const LanguagePreference: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useI18n();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      loadLanguagePreference();
    }
  }, [user]);

  const getTableName = (platform: string): string => {
    switch (platform) {
      case 'teamleader':
        return 'teamleader_users';
      case 'pipedrive':
        return 'pipedrive_users';
      case 'odoo':
        return 'odoo_users';
      default:
        return 'odoo_users';
    }
  };

  const loadLanguagePreference = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const tableName = getTableName(user.platform);
      const { data, error } = await supabase
        .from(tableName)
        .select('language_preference')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data?.language_preference) {
        setSelectedLanguage(data.language_preference);
        i18n.changeLanguage(data.language_preference);
      } else {
        setSelectedLanguage(i18n.language);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
      setSelectedLanguage(i18n.language);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (languageCode: string) => {
    if (!user) return;

    setSaving(true);
    setSuccess(false);

    try {
      const tableName = getTableName(user.platform);
      const { error } = await supabase
        .from(tableName)
        .update({
          language_preference: languageCode,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setSelectedLanguage(languageCode);
      i18n.changeLanguage(languageCode);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving language preference:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Globe className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('languagePreference.title') || 'Voice Note Language'}
          </h3>
          <p className="text-sm text-gray-600">
            {t('languagePreference.description') || 'Choose the language you will speak in your WhatsApp voice notes'}
          </p>
        </div>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700">
          <Check className="w-5 h-5" />
          <span className="text-sm">
            {t('languagePreference.saved') || 'Language preference saved successfully!'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LANGUAGE_OPTIONS.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            disabled={saving}
            className={`relative flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
              selectedLanguage === language.code
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 bg-white'
            } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="text-2xl">{language.flag}</span>
            <span className={`font-medium ${
              selectedLanguage === language.code ? 'text-blue-900' : 'text-gray-700'
            }`}>
              {language.label}
            </span>
            {selectedLanguage === language.code && (
              <div className="absolute top-2 right-2">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>{t('languagePreference.note') || 'Note:'}:</strong>{' '}
          {t('languagePreference.noteText') || 'This setting affects how VoiceLink processes your voice notes. Speak in the language you select for best results.'}
        </p>
      </div>
    </div>
  );
};
