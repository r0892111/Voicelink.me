import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translation files
import enTranslations from './locales/en.json';
import nlTranslations from './locales/nl.json';
import frTranslations from './locales/fr.json';
import deTranslations from './locales/de.json';

const resources = {
  en: {
    translation: enTranslations
  },
  nl: {
    translation: nlTranslations
  },
  fr: {
    translation: frTranslations
  },
  de: {
    translation: deTranslations
  }
};

// Clear invalid language from localStorage and determine initial language
const supportedLanguages = ['en', 'nl', 'fr', 'de'];
const storedLanguage = localStorage.getItem('i18nextLng');
let initialLanguage = 'en'; // Default to English

console.log('i18n init - storedLanguage:', storedLanguage);
console.log('i18n init - supportedLanguages:', supportedLanguages);

if (storedLanguage && supportedLanguages.includes(storedLanguage)) {
  // Use stored language if it's valid
  initialLanguage = storedLanguage;
  console.log('i18n init - using stored language:', initialLanguage);
} else if (storedLanguage && !supportedLanguages.includes(storedLanguage)) {
  // Clear invalid stored language
  console.log('i18n init - clearing invalid stored language:', storedLanguage);
  localStorage.removeItem('i18nextLng');
} else {
  console.log('i18n init - no stored language, using default:', initialLanguage);
}

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage, // Use determined initial language
    fallbackLng: 'en',
    supportedLngs: ['en', 'nl', 'fr', 'de'], // Only allow supported languages
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      checkWhitelist: true,
      // Force English if no language is detected or if detected language is not supported
      convertDetectedLanguage: (lng: string) => {
        console.log('convertDetectedLanguage - detected language:', lng);
        const supportedLanguages = ['en', 'nl', 'fr', 'de'];
        
        // Handle specific language mappings
        if (lng.startsWith('nl') || lng === 'nl-NL' || lng === 'nl-BE') {
          console.log('convertDetectedLanguage - mapping to Dutch (nl)');
          return 'nl';
        }
        if (lng.startsWith('de') || lng === 'de-DE' || lng === 'de-AT' || lng === 'de-CH') {
          console.log('convertDetectedLanguage - mapping to German (de)');
          return 'de';
        }
        if (lng.startsWith('fr') || lng === 'fr-FR' || lng === 'fr-CA' || lng === 'fr-BE') {
          console.log('convertDetectedLanguage - mapping to French (fr)');
          return 'fr';
        }
        if (lng.startsWith('en') || lng === 'en-US' || lng === 'en-GB' || lng === 'en-CA') {
          console.log('convertDetectedLanguage - mapping to English (en)');
          return 'en';
        }
        
        const result = supportedLanguages.includes(lng) ? lng : 'en';
        console.log('convertDetectedLanguage - final result:', result);
        return result;
      },
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // Namespace configuration
    defaultNS: 'translation',
    ns: ['translation'],
  });

// Add language change event listener for debugging
i18n.on('languageChanged', (lng) => {
  console.log('i18n - language changed to:', lng);
  console.log('i18n - localStorage i18nextLng:', localStorage.getItem('i18nextLng'));
});

export default i18n;