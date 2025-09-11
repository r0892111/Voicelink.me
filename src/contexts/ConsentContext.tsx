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
  const [hasCheckedConsent, setHasCheckedConsent] = useState(false);

  // Debug logging
  console.log('ConsentProvider rendered, showBanner:', showBanner);

  useEffect(() => {
    console.log('ConsentProvider useEffect running');
    // Check if user has already made a consent choice
    const savedConsent = localStorage.getItem('cookie-consent');
    console.log('Saved consent from localStorage:', savedConsent);
    if (savedConsent) {
      console.log('Found existing consent, hiding banner');
      setConsent(JSON.parse(savedConsent));
      setShowBanner(false);
    } else {
      // Show banner if no consent found
      console.log('No existing consent found, showing banner');
      setShowBanner(true);
    }
    setHasCheckedConsent(true);
  }, []);

  const saveConsent = (newConsent: Record<string, boolean>) => {
    console.log('saveConsent called with:', newConsent);
    setConsent(newConsent);
    localStorage.setItem('cookie-consent', JSON.stringify(newConsent));
    console.log('Setting showBanner to false');
    setShowBanner(false);
    setShowSettings(false);
    console.log('Banner should now be hidden, showBanner:', false);
  };

  const acceptAll = () => {
    console.log('acceptAll called');
    const allConsent = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    console.log('Saving consent:', allConsent);
    saveConsent(allConsent);
  };

  const rejectAll = () => {
    console.log('rejectAll called');
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    console.log('Saving essential only consent:', essentialOnly);
    saveConsent(essentialOnly);
  };

  const openSettings = () => {
    console.log('openSettings called');
    setShowSettings(true);
  };

  const closeSettings = () => {
    console.log('closeSettings called');
    setShowSettings(false);
  };

  const closeBanner = () => {
    console.log('closeBanner called');
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