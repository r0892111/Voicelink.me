import React, { useState, useEffect } from 'react';
import { useConsent } from '../contexts/ConsentContext';
import { X, Cookie } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const { showBanner, acceptAll, rejectAll, openSettings, closeBanner } = useConsent();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (showBanner) {
      // Small delay to ensure smooth animation
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [showBanner]);

  const handleAcceptAll = () => {
    setIsAnimating(true);
    setTimeout(() => {
      acceptAll();
    }, 300);
  };

  const handleRejectAll = () => {
    setIsAnimating(true);
    setTimeout(() => {
      rejectAll();
    }, 300);
  };

  const handleOpenSettings = () => {
    openSettings();
  };

  const handleCloseBanner = () => {
    setIsAnimating(true);
    setTimeout(() => {
      closeBanner();
    }, 300);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div 
      data-cookie-banner
      className={`fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-gray-200 shadow-2xl transform transition-all duration-300 ease-in-out mobile-cookie-banner ${
        isVisible && !isAnimating 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-full opacity-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
          {/* Content */}
          <div className="flex-1 flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Cookie className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                We use cookies to enhance your experience
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-2 sm:mb-3">
                We use essential cookies to make our site work properly and – with your consent – 
                analytics and marketing cookies to improve your experience. You can always change 
                your preferences later.
              </p>
              <a 
                href="/cookie-policy" 
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more about our cookie policy →
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-shrink-0">
            <button
              onClick={handleRejectAll}
              className="mobile-btn-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 bg-white transition-all duration-200 font-medium hover:shadow-sm"
              aria-label="Reject all non-essential cookies"
            >
              Reject All
            </button>
            <button
              onClick={handleOpenSettings}
              className="mobile-btn-sm border border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 bg-white transition-all duration-200 font-medium hover:shadow-sm"
              aria-label="Open cookie settings"
            >
              Settings
            </button>
            <button
              onClick={handleAcceptAll}
              className="mobile-btn-sm text-white transition-all duration-200 font-medium hover:shadow-lg hover:scale-[1.02]"
              style={{ backgroundColor: '#1C2C55' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F1A3A'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C2C55'}
              aria-label="Accept all cookies"
            >
              Accept All
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={handleCloseBanner}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 lg:relative lg:top-0 lg:right-0 p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 mobile-touch-target"
            aria-label="Close cookie banner"
          >
            <X className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};