import React, { useState, useEffect } from 'react';
import { useConsent } from '../contexts/ConsentContext';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

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
    title: 'Essential',
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

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  'aria-label'?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange, 'aria-label': ariaLabel }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 focus-visible:ring-offset-2 ${
      checked ? 'bg-navy' : 'bg-navy/15'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

export const CookieSettingsModal: React.FC = () => {
  const { showSettings, closeSettings, acceptAll, rejectAll, hasConsent } = useConsent();
  const [localChoices, setLocalChoices] = useState<ConsentChoices>({
    essential: true,
    analytics: hasConsent('analytics'),
    marketing: hasConsent('marketing'),
    preferences: hasConsent('preferences'),
  });
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});

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
    setLocalChoices(prev => ({ ...prev, [category]: value }));
  };

  const handleSave = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      essential: true,
      analytics: localChoices.analytics,
      marketing: localChoices.marketing,
      preferences: localChoices.preferences,
    }));
    closeSettings();
    window.location.reload();
  };

  const toggleCategoryExpansion = (categoryKey: string) => {
    setExpandedCategories(prev => ({ ...prev, [categoryKey]: !prev[categoryKey] }));
  };

  if (!showSettings) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-navy/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-navy/[0.06] max-w-lg w-full max-h-[88vh] overflow-y-auto">
        <div className="p-7">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-general text-xl font-bold text-navy">Cookie Settings</h2>
            <button
              onClick={closeSettings}
              className="p-2 text-navy/30 hover:text-navy/60 hover:bg-navy/5 rounded-full transition-all duration-200"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="font-instrument text-sm text-slate-blue leading-relaxed mb-6">
            Make your choice per category. You can always change this later via 'Cookie Settings' at the bottom of the page.
          </p>

          {/* Categories */}
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.key} className="border border-navy/[0.08] rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-general font-semibold text-navy text-sm">
                        {category.title}
                      </h4>
                      {category.required && (
                        <span className="text-[11px] font-medium font-instrument text-navy/40 bg-navy/[0.06] px-2 py-0.5 rounded-full">
                          Always on
                        </span>
                      )}
                    </div>
                    <p className="font-instrument text-sm text-slate-blue leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 mt-0.5">
                    {category.required ? (
                      <div className="h-6 w-11 rounded-full bg-navy/15 flex items-center justify-end pr-1">
                        <span className="inline-block h-4 w-4 rounded-full bg-navy/30" />
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
                  className="mt-3 flex items-center gap-1.5 text-xs font-medium font-instrument text-navy/50 hover:text-navy transition-colors"
                  aria-expanded={expandedCategories[category.key]}
                >
                  <span>View cookies</span>
                  {expandedCategories[category.key]
                    ? <ChevronUp className="h-3.5 w-3.5" />
                    : <ChevronDown className="h-3.5 w-3.5" />
                  }
                </button>

                {expandedCategories[category.key] && (
                  <div className="mt-2 p-3 bg-navy/[0.03] rounded-lg border border-navy/[0.06]">
                    <ul className="space-y-1">
                      {category.cookies.map((cookie, index) => (
                        <li key={index} className="text-xs font-mono text-navy/50">
                          {cookie}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Cookie Policy link */}
          <div className="mt-5 pt-5 border-t border-navy/[0.08]">
            <a
              href="/cookie-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-instrument text-sm text-navy/50 hover:text-navy underline underline-offset-2 transition-colors"
            >
              Cookie Policy
            </a>
          </div>

          {/* Action buttons */}
          <div className="mt-5 pt-5 border-t border-navy/[0.08] flex flex-col sm:flex-row gap-3">
            <button
              onClick={rejectAll}
              className="flex-1 px-5 py-2.5 font-instrument font-medium text-sm text-navy/60 hover:text-navy border border-navy/20 rounded-full hover:bg-navy/5 transition-all duration-200"
            >
              Reject all
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-5 py-2.5 font-instrument font-medium text-sm text-navy border border-navy/30 rounded-full hover:bg-navy/5 transition-all duration-200"
            >
              Save settings
            </button>
            <button
              onClick={acceptAll}
              className="flex-1 px-5 py-2.5 font-instrument font-semibold text-sm bg-navy text-white rounded-full hover:bg-navy-hover transition-all duration-200 hover:shadow-md"
            >
              Accept all
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
