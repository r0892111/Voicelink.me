import React, { useState, useEffect } from 'react';
import { useConsent } from '../contexts/ConsentContext';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface ConsentChoices {
  essential: boolean;
  statistics: boolean;
  marketing: boolean;
  social: boolean;
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
    title: 'Essentieel (altijd actief)',
    description: 'Nodig om de site te laten werken (beveiliging, load balancing, cookievoorkeuren).',
    required: true,
    cookies: ['fs_cookie_consent_v1', 'fs_cookie_consent_log_v1', 'PHPSESSID', '__Secure-*']
  },
  {
    key: 'statistics',
    title: 'Statistieken',
    description: 'Helpen ons te begrijpen hoe de site gebruikt wordt (anonieme statistieken).',
    required: false,
    cookies: ['_ga', '_ga_*', '_gid', '_gat', '_gtag_*']
  },
  {
    key: 'marketing',
    title: 'Marketing',
    description: 'Maakt gepersonaliseerde advertenties en metingen mogelijk.',
    required: false,
    cookies: ['_fbp', '_fbc', 'fr', 'ads/ga-audiences', 'IDE', 'test_cookie']
  },
  {
    key: 'social',
    title: 'Sociaal',
    description: 'Voor het laden van externe media en deelknoppen.',
    required: false,
    cookies: ['VISITOR_INFO1_LIVE', 'YSC', 'CONSENT', 'SOCS']
  }
];

interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CookieSettingsModal: React.FC<CookieSettingsModalProps> = ({ isOpen, onClose }) => {
  const { acceptAll, rejectAll } = useConsent();
  const [localChoices, setLocalChoices] = useState<ConsentChoices>({
    essential: true,
    statistics: false,
    marketing: false,
    social: false,
  });
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});

  const handleToggle = (category: keyof ConsentChoices, value: boolean) => {
    setLocalChoices(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSave = () => {
    // Save the specific choices
    const consentData = {
      essential: true, // Always true
      analytics: localChoices.statistics,
      marketing: localChoices.marketing,
      preferences: localChoices.social,
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    onClose();
  };

  const handleAcceptAll = () => {
    acceptAll();
    onClose();
  };

  const handleRejectAll = () => {
    rejectAll();
    onClose();
  };

  const toggleCategoryExpansion = (categoryKey: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Cookie-instellingen</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              Maak je keuze per categorie. Je kan dit later altijd aanpassen via 'Cookie-instellingen' onderaan de pagina.
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
                          Altijd actief
                        </div>
                      ) : (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localChoices[category.key]}
                            onChange={(e) => handleToggle(category.key, e.target.checked)}
                            className="sr-only peer"
                            aria-label={`${category.title} toestaan`}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Cookie details accordion */}
                  <button
                    onClick={() => toggleCategoryExpansion(category.key)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    aria-expanded={expandedCategories[category.key]}
                  >
                    <span>Bekijk cookies</span>
                    {expandedCategories[category.key] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {expandedCategories[category.key] && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Cookies in deze categorie:</h5>
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
                Cookieverklaring
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors font-medium"
              >
                Alles weigeren
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                Opslaan
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                style={{ backgroundColor: '#1C2C55' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F1A3A'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C2C55'}
              >
                Alles accepteren
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};