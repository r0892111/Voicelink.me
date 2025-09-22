import React, { useState, useEffect } from 'react';
import { useConsent } from '../contexts/ConsentContext';
import { ChevronDown, ChevronUp, X, Cookie } from 'lucide-react';

interface ConsentChoices {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

interface CategoryInfo {
  key: keyof ConsentChoices;
  title: string;
  description: string;
  required: boolean;
  cookies: string[];
}

const categories: CategoryInfo[] = [
  {
    key: 'essential',
    title: 'Essential (always active)',
    description: 'Necessary for the site to function (security, load balancing, cookie preferences).',
    required: true,
    cookies: ['cookie-consent', 'session-id', '__Secure-*', 'PHPSESSID']
  },
  {
    key: 'analytics',
    title: 'Analytics',
    description: 'Help us understand how the site is used (anonymous statistics).',
    required: false,
    cookies: ['_ga', '_ga_*', '_gid', '_gat', '_gtag_*']
  },
  {
    key: 'marketing',
    title: 'Marketing',
    description: 'Enables personalized advertisements and measurements.',
    required: false,
    cookies: ['_fbp', '_fbc', 'fr', 'ads/ga-audiences', 'IDE', 'test_cookie']
  },
  {
    key: 'preferences',
    title: 'Preferences',
    description: 'For loading external media and sharing buttons.',
    required: false,
    cookies: ['VISITOR_INFO1_LIVE', 'YSC', 'CONSENT', 'SOCS']
  }
];

// Custom Switch Component
interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  'aria-label'?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange, 'aria-label': ariaLabel }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onCheckedChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${checked ? 'bg-blue-600' : 'bg-gray-200'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
};

export const CookieSettingsModal: React.FC = () => {
  const { showSettings, closeSettings, acceptAll, rejectAll, hasConsent } = useConsent();
  const [localChoices, setLocalChoices] = useState<ConsentChoices>({
    essential: true,
    analytics: hasConsent('analytics'),
    marketing: hasConsent('marketing'),
    preferences: hasConsent('preferences'),
  });
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (showSettings) {
      setLocalChoices({
        essential: true,
        analytics: hasConsent('analytics'),
        marketing: hasConsent('marketing'),
        preferences: hasConsent('preferences'),
      });
    }
  }, [showSettings, hasConsent]);

  const handleToggle = (category: keyof ConsentChoices, value: boolean) => {
    setLocalChoices(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSave = () => {
    const newConsent = {
      essential: true,
      analytics: localChoices.analytics,
      marketing: localChoices.marketing,
      preferences: localChoices.preferences,
    };
    localStorage.setItem('cookie-consent', JSON.stringify(newConsent));
    closeSettings();
    // Reload page to apply new settings
    window.location.reload();
  };

  const handleAcceptAll = () => {
    acceptAll();
  };

  const handleRejectAll = () => {
    rejectAll();
  };

  const toggleCategoryExpansion = (categoryKey: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  if (!showSettings) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Cookie className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Cookie Settings</h2>
            </div>
            <button
              onClick={closeSettings}
              className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110"
              aria-label="Close settings"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              Make your choice per category. You can always change this later via 'Cookie Settings' at the bottom of the page.
            </p>

            {/* Categories */}
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {category.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {category.description}
                      </p>
                    </div>
                    <div className="ml-4">
                      {category.required ? (
                        <div className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          Always active
                        </div>
                      ) : (
                        <Switch
                          checked={localChoices[category.key]}
                          onCheckedChange={(checked) => handleToggle(category.key, checked)}
                          aria-label={`Allow ${category.title}`}
                        />
                      )}
                    </div>
                  </div>

                  {/* Cookie details accordion */}
                  <button
                    onClick={() => toggleCategoryExpansion(category.key)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    aria-expanded={expandedCategories[category.key]}
                  >
                    <span>View cookies</span>
                    {expandedCategories[category.key] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {expandedCategories[category.key] && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Cookies in this category:</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {category.cookies.map((cookie, index) => (
                          <li key={index} className="font-mono">
                            {cookie}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Cookie Policy Link */}
            <div className="pt-4 border-t border-gray-200">
              <a 
                href="/cookie-policy" 
                className="text-sm text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Cookie Policy
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleRejectAll}
                className="px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-lg transition-all duration-200 font-medium hover:shadow-sm"
              >
                Reject All
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 rounded-lg transition-all duration-200 font-medium hover:shadow-sm"
              >
                Save Settings
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-6 py-3 text-white rounded-lg transition-all duration-200 font-medium hover:shadow-lg hover:scale-[1.02]"
                style={{ backgroundColor: '#1C2C55' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F1A3A'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C2C55'}
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};