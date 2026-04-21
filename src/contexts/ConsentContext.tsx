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
  /** Persist a partial set of category choices. Essential is always true. */
  saveChoices: (choices: { analytics: boolean; preferences: boolean }) => void;
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

// ─── Google Analytics helpers ────────────────────────────────────────────────
// We load gtag.js lazily — only after the user explicitly grants analytics
// consent. Revoking consent removes the script and clears any `_ga*` cookies
// that were already placed so the browser stops phoning home.

const GA_MEASUREMENT_ID = 'G-V2GHSHWX23';
const GA_SCRIPT_ID = 'voicelink-gtag-script';

function loadGoogleAnalytics(): void {
  if (typeof window === 'undefined') return;
  if (document.getElementById(GA_SCRIPT_ID)) return; // already loaded

  const s = document.createElement('script');
  s.id = GA_SCRIPT_ID;
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(s);

  // window.gtag + dataLayer are pre-created in index.html.
  window.gtag?.('js', new Date());
  window.gtag?.('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
}

function unloadGoogleAnalytics(): void {
  if (typeof window === 'undefined') return;
  document.getElementById(GA_SCRIPT_ID)?.remove();

  // Tell any already-loaded gtag to stop collecting.
  (window as unknown as Record<string, boolean>)[`ga-disable-${GA_MEASUREMENT_ID}`] = true;

  // Best-effort cookie cleanup. GA cookies are first-party on the current
  // host with path=/ and (in production) domain=.voicelink.me.
  const host = window.location.hostname;
  const domains = [host, `.${host.replace(/^www\./, '')}`];
  const names = ['_ga', '_gid', '_gat', `_ga_${GA_MEASUREMENT_ID.replace(/^G-/, '')}`];
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
    }
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

function applyConsent(consent: Record<string, boolean>): void {
  if (consent.analytics) loadGoogleAnalytics();
  else unloadGoogleAnalytics();
}

export const ConsentProvider: React.FC<ConsentProviderProps> = ({ children }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<Record<string, boolean>>({});

  // Listen for custom event to open settings
  useEffect(() => {
    const handleOpenSettings = () => setShowSettings(true);
    window.addEventListener('openCookieSettings', handleOpenSettings);
    return () => window.removeEventListener('openCookieSettings', handleOpenSettings);
  }, []);

  useEffect(() => {
    // Restore consent choice from localStorage on mount, and apply it so GA
    // loads/stays-unloaded before the user interacts again.
    const savedConsent = localStorage.getItem('cookie-consent');
    if (savedConsent) {
      try {
        const parsedConsent = JSON.parse(savedConsent);
        setConsent(parsedConsent);
        setShowBanner(false);
        applyConsent(parsedConsent);
      } catch {
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
      // No prior consent → make sure nothing analytics-related is loaded.
      unloadGoogleAnalytics();
    }
  }, []);

  const saveConsent = (newConsent: Record<string, boolean>) => {
    setConsent(newConsent);
    localStorage.setItem('cookie-consent', JSON.stringify(newConsent));
    setShowBanner(false);
    setShowSettings(false);
    applyConsent(newConsent);
    window.dispatchEvent(new Event('consentChanged'));
  };

  const acceptAll = () => {
    saveConsent({ essential: true, analytics: true, preferences: true });
  };

  const rejectAll = () => {
    saveConsent({ essential: true, analytics: false, preferences: false });
  };

  const saveChoices = (choices: { analytics: boolean; preferences: boolean }) => {
    saveConsent({ essential: true, ...choices });
  };

  const openSettings = () => setShowSettings(true);
  const closeSettings = () => setShowSettings(false);

  const closeBanner = () => {
    // Closing the banner without an explicit choice counts as essential-only
    // (the strictest option). Under GDPR/ePrivacy, "X out" is NOT implied
    // consent for non-essential cookies.
    saveConsent({ essential: true, analytics: false, preferences: false });
  };

  const hasConsent = (category: string): boolean => consent[category] === true;

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
        saveChoices,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
};
