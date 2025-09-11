import React, { createContext, useContext, useState, useEffect } from 'react';

interface ConsentContextType {
  showBanner: boolean;
  showSettings: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  closeBanner: () => void;
  hasConsent: (category: string) => boolean;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export const useConsent = () => {
  const context = useContext(ConsentContext);
  if (context === undefined) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return context;
};

interface ConsentProviderProps {
  children: React.ReactNode;
}

export const ConsentProvider: React.FC<ConsentProviderProps> = ({ children }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Check if user has already made a consent choice
    const savedConsent = localStorage.getItem('cookie-consent');
    if (savedConsent) {
      setConsent(JSON.parse(savedConsent));
      setShowBanner(false);
    } else {
      // Show banner after a short delay to avoid flash
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const saveConsent = (newConsent: Record<string, boolean>) => {
    setConsent(newConsent);
    localStorage.setItem('cookie-consent', JSON.stringify(newConsent));
    setShowBanner(false);
  };

  const acceptAll = () => {
    const allConsent = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    saveConsent(allConsent);
  };

  const rejectAll = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    saveConsent(essentialOnly);
  };

  const openSettings = () => {
    setShowSettings(true);
    setShowBanner(false);
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  const closeBanner = () => {
    setShowBanner(false);
  };

  const hasConsent = (category: string): boolean => {
    return consent[category] === true;
  };

  return (
    <ConsentContext.Provider
      value={{
        showBanner,
        showSettings,
        acceptAll,
        rejectAll,
        openSettings,
        closeSettings,
        closeBanner,
        hasConsent,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
};