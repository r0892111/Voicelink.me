import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackLandingPageView } from '../utils/analytics';
import { initializeUTMTracking } from '../utils/utm';

export const AnalyticsListener: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    initializeUTMTracking();
  }, []);

  useEffect(() => {
    trackPageView({
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    });

    if (location.pathname.startsWith('/lp/')) {
      trackLandingPageView(location.pathname);
    }
  }, [location]);

  return null;
};
