/**
 * UTM Parameter Handler
 * Manages UTM parameters from URL, stores them in localStorage, and appends them to links.
 */

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

const UTM_STORAGE_KEY = 'utm';
const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

/**
 * Extracts UTM parameters from current URL
 */
export function extractUTMFromURL(): UTMParams {
  const params = new URLSearchParams(window.location.search);
  const utmParams: UTMParams = {};

  UTM_PARAMS.forEach(param => {
    const value = params.get(param);
    if (value) {
      utmParams[param as keyof UTMParams] = value;
    }
  });

  return utmParams;
}

/**
 * Stores UTM parameters in localStorage
 */
export function persistUTM(params: UTMParams): void {
  if (Object.keys(params).length > 0) {
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params));
  }
}

/**
 * Retrieves stored UTM parameters from localStorage
 */
export function getStoredUTM(): UTMParams {
  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Converts UTM params object to URL query string
 */
export function utmToQueryString(params: UTMParams): string {
  const entries = Object.entries(params).filter(([_, value]) => value);
  if (entries.length === 0) return '';

  const queryParams = new URLSearchParams();
  entries.forEach(([key, value]) => {
    queryParams.append(key, value);
  });

  return queryParams.toString();
}

/**
 * Appends UTM parameters to a URL
 */
export function appendUTMToURL(url: string, params?: UTMParams): string {
  const utmParams = params || getStoredUTM();
  const queryString = utmToQueryString(utmParams);

  if (!queryString) return url;

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${queryString}`;
}

/**
 * Initialize UTM tracking on page load
 * Call this once when the app loads
 */
export function initializeUTMTracking(): void {
  // Extract UTM from current URL
  const utmFromURL = extractUTMFromURL();

  // Persist if any UTM params found
  if (Object.keys(utmFromURL).length > 0) {
    persistUTM(utmFromURL);
  }

  // Setup click handlers for links with data-append-utm attribute
  setupUTMClickHandlers();
}

/**
 * Sets up click handlers for links marked with data-append-utm="true"
 */
function setupUTMClickHandlers(): void {
  // Use event delegation on document
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('[data-append-utm="true"]') as HTMLAnchorElement;

    if (link && link.href) {
      const storedUTM = getStoredUTM();
      if (Object.keys(storedUTM).length > 0) {
        const newURL = appendUTMToURL(link.href, storedUTM);
        link.href = newURL;
      }
    }
  }, true); // Use capture phase to catch before navigation
}

/**
 * React hook for UTM tracking
 * Use this in components that need to access UTM params
 */
export function useUTM() {
  const params = getStoredUTM();

  const appendUTM = (url: string): string => {
    return appendUTMToURL(url, params);
  };

  return {
    params,
    appendUTM,
  };
}

/**
 * Enhanced helper for React Router navigation with UTM parameters
 * Appends stored UTM params to internal paths or absolute URLs
 * Returns a react-router friendly string: pathname + search + hash
 *
 * @param pathOrUrl - Internal path ("/signup") or absolute URL
 * @param params - Optional UTM params to override stored ones
 * @returns Complete path with UTM params for react-router navigate()
 */
export function withUTM(pathOrUrl: string, params?: UTMParams): string {
  const utmParams = params || getStoredUTM();
  const queryString = utmToQueryString(utmParams);

  if (!queryString) return pathOrUrl;

  try {
    const url = new URL(pathOrUrl, window.location.origin);

    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });

    if (pathOrUrl.startsWith('http') || pathOrUrl.startsWith('//')) {
      return url.href;
    }

    return url.pathname + url.search + url.hash;
  } catch {
    const separator = pathOrUrl.includes('?') ? '&' : '?';
    return `${pathOrUrl}${separator}${queryString}`;
  }
}

/**
 * Returns only non-empty UTM parameters as a flat object for GA4 events
 * Suitable for passing to gtag() or dataLayer.push()
 *
 * @returns Object with only populated utm_* fields
 */
export function getUTMForAnalytics(): Record<string, string> {
  const stored = getStoredUTM();
  const result: Record<string, string> = {};

  Object.entries(stored).forEach(([key, value]) => {
    if (value && value.trim()) {
      result[key] = value;
    }
  });

  return result;
}
