import { useTranslation } from 'react-i18next';
import { formatCurrency, formatNumber, formatPercentage, formatDate, formatRelativeTime, getTextDirection, isRTLLanguage } from '../utils/i18n';

export const useI18n = () => {
  const { t, i18n } = useTranslation();
  
  const currentLanguage = i18n.language;
  
  // Currency formatting
  const currency = (amount: number, currencyCode: string = 'EUR') => {
    return formatCurrency(amount, currencyCode, currentLanguage);
  };
  
  // Number formatting
  const number = (value: number) => {
    return formatNumber(value, currentLanguage);
  };
  
  // Percentage formatting
  const percentage = (value: number) => {
    return formatPercentage(value, currentLanguage);
  };
  
  // Date formatting
  const date = (date: Date | string, format: string = 'PPP') => {
    return formatDate(date, format, currentLanguage);
  };
  
  // Relative time formatting
  const relativeTime = (date: Date | string, baseDate: Date = new Date()) => {
    return formatRelativeTime(date, baseDate, currentLanguage);
  };
  
  // Language switching
  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = getTextDirection(language);
  };
  
  // RTL detection
  const isRTL = isRTLLanguage(currentLanguage);
  const textDirection = getTextDirection(currentLanguage);
  
  return {
    t,
    currentLanguage,
    changeLanguage,
    currency,
    number,
    percentage,
    date,
    relativeTime,
    isRTL,
    textDirection,
  };
};