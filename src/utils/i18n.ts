import { format, formatDistance, formatRelative } from 'date-fns';
import { enUS, nl, fr, de } from 'date-fns/locale';

// Locale mapping for date-fns
const localeMap = {
  en: enUS,
  nl: nl,
  fr: fr,
  de: de,
};

// Get date-fns locale from i18n language
export const getDateFnsLocale = (language: string) => {
  return localeMap[language as keyof typeof localeMap] || enUS;
};

// Format date with locale
export const formatDate = (date: Date | string, formatStr: string, language: string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: getDateFnsLocale(language) });
};

// Format relative time with locale
export const formatRelativeTime = (date: Date | string, baseDate: Date, language: string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatRelative(dateObj, baseDate, { locale: getDateFnsLocale(language) });
};

// Format distance with locale
export const formatTimeDistance = (date: Date | string, baseDate: Date, language: string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistance(dateObj, baseDate, { locale: getDateFnsLocale(language) });
};

// Number formatting utilities
export const formatCurrency = (amount: number, currency: string = 'EUR', language: string = 'en') => {
  return new Intl.NumberFormat(language, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatNumber = (number: number, language: string = 'en') => {
  return new Intl.NumberFormat(language).format(number);
};

export const formatPercentage = (number: number, language: string = 'en') => {
  return new Intl.NumberFormat(language, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number / 100);
};

// RTL language detection
export const isRTLLanguage = (language: string): boolean => {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'ku', 'dv'];
  return rtlLanguages.includes(language);
};

// Get text direction for CSS
export const getTextDirection = (language: string): 'ltr' | 'rtl' => {
  return isRTLLanguage(language) ? 'rtl' : 'ltr';
};

// Pluralization helper
export const getPlural = (count: number, singular: string, plural?: string): string => {
  if (count === 1) return singular;
  return plural || `${singular}s`;
};