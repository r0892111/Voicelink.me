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

if (storedLanguage && supportedLanguages.includes(storedLanguage)) {
  // Use stored language if it's valid
  initialLanguage = storedLanguage;
} else if (storedLanguage && !supportedLanguages.includes(storedLanguage)) {
  // Clear invalid stored language
  localStorage.removeItem('i18nextLng');
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
        const supportedLanguages = ['en', 'nl', 'fr', 'de'];
        return supportedLanguages.includes(lng) ? lng : 'en';
      },
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // Namespace configuration
    defaultNS: 'translation',
    ns: ['translation'],
  });

export default i18n;