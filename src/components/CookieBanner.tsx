import React from 'react';
import { useConsent } from '../contexts/ConsentContext';
import { X } from 'lucide-react';
import { CookieSettingsModal } from './CookieSettingsModal';

export const CookieBanner: React.FC = () => {
  const { showBanner, showSettings, acceptAll, rejectAll, openSettings, closeSettings, closeBanner } = useConsent();

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cookies on this website
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              We use cookies to make our site work properly (essential) and – with your consent – for statistics and marketing. You can always change your choices later.
            </p>
            <a 
              href="/cookie-policy" 
              className="text-sm text-blue-600 hover:underline mt-2 inline-block"
            >
              Read our cookie policy
            </a>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
            <button
              onClick={rejectAll}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors font-medium"
            >
              Reject All
            </button>
            <button
              onClick={openSettings}
              className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
            >
              Settings
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              style={{ backgroundColor: '#1C2C55' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F1A3A'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C2C55'}
            >
              Accept All
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={closeBanner}
            className="absolute top-4 right-4 lg:relative lg:top-0 lg:right-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close cookie banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      </div>
      
      <CookieSettingsModal isOpen={showSettings} onClose={closeSettings} />
    </>
  );
};