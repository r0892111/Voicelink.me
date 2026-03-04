import React, { useState, useEffect } from 'react';
import { useConsent } from '../contexts/ConsentContext';
import { X } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const { showBanner, acceptAll, rejectAll, openSettings, closeBanner } = useConsent();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (showBanner) {
      const timer = setTimeout(() => { setIsVisible(true); }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [showBanner]);

  const handleAcceptAll = () => {
    setIsAnimating(true);
    setTimeout(() => { acceptAll(); }, 300);
  };

  const handleRejectAll = () => {
    setIsAnimating(true);
    setTimeout(() => { rejectAll(); }, 300);
  };

  const handleCloseBanner = () => {
    setIsAnimating(true);
    setTimeout(() => { closeBanner(); }, 300);
  };

  if (!showBanner) return null;

  return (
    <div
      data-cookie-banner
      className={`fixed bottom-0 left-0 right-0 z-[9999] transition-all duration-300 ease-in-out ${
        isVisible && !isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="bg-white border-t border-navy/[0.08] shadow-[0_-8px_40px_rgba(26,45,99,0.10)]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="font-general font-semibold text-navy text-[15px] mb-0.5">
                We use cookies
              </p>
              <p className="font-instrument text-sm text-slate-blue leading-relaxed">
                We use cookies to improve your experience.{' '}
                <a
                  href="/cookie-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy underline underline-offset-2 hover:opacity-70 transition-opacity"
                >
                  Learn more
                </a>
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleRejectAll}
                className="text-sm font-medium font-instrument text-navy/50 hover:text-navy px-4 py-2 rounded-full hover:bg-navy/5 transition-all duration-200"
                aria-label="Reject all non-essential cookies"
              >
                Reject
              </button>
              <button
                onClick={openSettings}
                className="text-sm font-medium font-instrument border border-navy/20 text-navy px-4 py-2 rounded-full hover:bg-navy/5 transition-all duration-200"
                aria-label="Open cookie settings"
              >
                Settings
              </button>
              <button
                onClick={handleAcceptAll}
                className="text-sm font-semibold font-instrument bg-navy text-white px-5 py-2 rounded-full hover:bg-navy-hover transition-all duration-200 hover:shadow-md"
                aria-label="Accept all cookies"
              >
                Accept all
              </button>
              <button
                onClick={handleCloseBanner}
                className="p-1.5 text-navy/30 hover:text-navy/60 hover:bg-navy/5 rounded-full transition-all duration-200 ml-1"
                aria-label="Close cookie banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
