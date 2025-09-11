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
  const [showBanner, setShowBanner] = useState(true); // Start with true
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<Record<string, boolean>>({});

  // Listen for custom event to open settings
  useEffect(() => {
    const handleOpenSettings = () => {
      setShowSettings(true);
    };

    window.addEventListener('openCookieSettings', handleOpenSettings);
    return () => window.removeEventListener('openCookieSettings', handleOpenSettings);
  }, []);

  useEffect(() => {
    // Check if user has already made a consent choice
    const savedConsent = localStorage.getItem('cookie-consent');
    
    if (savedConsent) {
      try {
        const parsedConsent = JSON.parse(savedConsent);
        setConsent(parsedConsent);
        setShowBanner(false); // Hide banner if consent exists
      } catch (error) {
        console.error('Error parsing consent:', error);
        setShowBanner(true); // Show banner on error
      }
    } else {
      setShowBanner(true); // Show banner if no consent found
    }
  }, []);

  const saveConsent = (newConsent: Record<string, boolean>) => {
    setConsent(newConsent);
    localStorage.setItem('cookie-consent', JSON.stringify(newConsent));
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    const allConsent = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    saveConsent(allConsent);
    setShowBanner(false);
  };

  const rejectAll = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    saveConsent(essentialOnly);
    setShowBanner(false);
  };

  const openSettings = () => {
    setShowSettings(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  const closeBanner = () => {
    setShowBanner(false);
    // Also save essential-only consent when closing
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    localStorage.setItem('cookie-consent', JSON.stringify(essentialOnly));
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