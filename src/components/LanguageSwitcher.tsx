import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
];

export const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, changeLanguage, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  // Close on any click outside the menu, or on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const handlePointer = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label={t('common.changeLanguage')}
      >
        <Globe className="w-4 h-4 text-navy/60" />
        <span className="text-sm font-medium text-navy/80">
          {currentLang.code.toUpperCase()}
        </span>
        <ChevronDown className={`w-4 h-4 text-navy/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
          /* Dropdown */
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-navy/[0.08] py-2 z-20">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-4 py-2 hover:bg-navy/[0.04] transition-colors flex items-center gap-3 ${
                  currentLanguage === language.code ? 'text-navy' : 'text-navy/70'
                }`}
              >
                <span className="text-xs font-semibold text-navy/40 w-6 flex-shrink-0">{language.code.toUpperCase()}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{language.nativeName}</div>
                  <div className="text-xs text-navy/50">{language.name}</div>
                </div>
                {currentLanguage === language.code && (
                  <div className="w-2 h-2 rounded-full bg-navy flex-shrink-0"></div>
                )}
              </button>
            ))}
          </div>
      )}
    </div>
  );
};