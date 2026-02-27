import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface PageTransitionContextType {
  isTransitioning: boolean;
  navigateWithTransition: (to: string, delay?: number) => void;
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  isTransitioning: false,
  navigateWithTransition: () => {},
});

export const PageTransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  const navigateWithTransition = useCallback((to: string, delay = 450) => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate(to);
      // Let the new page render, then fade out the overlay
      setTimeout(() => setIsTransitioning(false), 80);
    }, delay);
  }, [navigate]);

  return (
    <PageTransitionContext.Provider value={{ isTransitioning, navigateWithTransition }}>
      {children}
      {/* Loader overlay */}
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none"
        style={{
          opacity: isTransitioning ? 1 : 0,
          transition: 'opacity 0.2s cubic-bezier(0.4,0,0.2,1)',
          pointerEvents: isTransitioning ? 'auto' : 'none',
        }}
      >
        <div className="absolute inset-0 bg-[#FDFBF7]" />
        <div className="dot-loader relative z-10" />
      </div>
    </PageTransitionContext.Provider>
  );
};

export const usePageTransition = () => useContext(PageTransitionContext);
