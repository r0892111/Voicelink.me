import React, { useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';

interface RTLProviderProps {
  children: React.ReactNode;
}

export const RTLProvider: React.FC<RTLProviderProps> = ({ children }) => {
  const { isRTL, textDirection, currentLanguage } = useI18n();
  
  useEffect(() => {
    // Set document direction and language
    document.documentElement.dir = textDirection;
    document.documentElement.lang = currentLanguage;
    
    // Add RTL class to body for additional styling if needed
    if (isRTL) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
    
    return () => {
      document.body.classList.remove('rtl');
    };
  }, [isRTL, textDirection, currentLanguage]);
  
  return (
    <div dir={textDirection} className={isRTL ? 'rtl' : 'ltr'}>
      {children}
    </div>
  );
};