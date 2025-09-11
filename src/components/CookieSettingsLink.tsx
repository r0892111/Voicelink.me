import React from 'react';
import { useConsent } from '../contexts/ConsentContext';

export const CookieSettingsLink: React.FC = () => {
  const { openSettings } = useConsent();

  return (
    <button
      onClick={openSettings}
      className="text-xs text-gray-500 hover:text-blue-600 transition-colors underline"
      aria-label="Cookie-instellingen openen"
    >
      Cookie-instellingen
    </button>
  );
};