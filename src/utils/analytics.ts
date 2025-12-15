import { getUTMForAnalytics } from './utm';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export interface PageViewParams {
  page_path: string;
  page_location: string;
  page_title?: string;
  [key: string]: any;
}

export interface EventParams {
  event_name: string;
  [key: string]: any;
}

function hasAnalyticsConsent(): boolean {
  try {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      console.log('[Analytics] No consent found, allowing by default');
      return true;
    }
    const parsed = JSON.parse(consent);
    const hasConsent = parsed.analytics === true;
    console.log('[Analytics] Consent check:', hasConsent);
    return hasConsent;
  } catch (error) {
    console.warn('[Analytics] Error checking consent:', error);
    return true;
  }
}

export function trackPageView(customParams?: Partial<PageViewParams>): void {
  if (typeof window === 'undefined') return;

  if (!hasAnalyticsConsent()) {
    console.log('[Analytics] Blocked: No analytics consent');
    return;
  }

  const utmParams = getUTMForAnalytics();

  const params: PageViewParams = {
    page_path: window.location.pathname + window.location.search,
    page_location: window.location.href,
    page_title: document.title,
    ...utmParams,
    ...customParams,
  };

  console.log('[Analytics] Sending page_view:', params);

  if (window.gtag) {
    window.gtag('event', 'page_view', params);
    console.log('[Analytics] Sent via gtag');
  } else if (window.dataLayer) {
    window.dataLayer.push({
      event: 'page_view',
      ...params,
    });
    console.log('[Analytics] Sent via dataLayer');
  } else {
    console.warn('[Analytics] No gtag or dataLayer found');
  }
}

export function trackEvent(eventName: string, eventParams?: Record<string, any>): void {
  if (typeof window === 'undefined') return;

  if (!hasAnalyticsConsent()) {
    console.log('[Analytics] Blocked: No analytics consent for event:', eventName);
    return;
  }

  const utmParams = getUTMForAnalytics();

  const params = {
    ...utmParams,
    ...eventParams,
  };

  console.log(`[Analytics] Sending ${eventName}:`, params);

  if (window.gtag) {
    window.gtag('event', eventName, params);
    console.log('[Analytics] Sent via gtag');
  } else if (window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...params,
    });
    console.log('[Analytics] Sent via dataLayer');
  } else {
    console.warn('[Analytics] No gtag or dataLayer found');
  }
}

export function trackLandingPageView(lpPath: string): void {
  trackEvent('LP_view', {
    lp_path: lpPath,
    page_path: window.location.pathname + window.location.search,
    page_location: window.location.href,
  });
}

export function trackCTAClick(ctaName: string, lpPath?: string): void {
  trackEvent('CTA_click', {
    cta_name: ctaName,
    lp_path: lpPath || window.location.pathname,
    page_location: window.location.href,
  });
}

export function trackSignupStart(): void {
  trackEvent('Signup_start', {
    page_path: window.location.pathname + window.location.search,
    page_location: window.location.href,
  });
}

export function trackTrialStarted(crmType?: string): void {
  trackEvent('Trial_started', {
    crm_type: crmType || 'unknown',
    page_path: window.location.pathname + window.location.search,
    page_location: window.location.href,
  });
}
