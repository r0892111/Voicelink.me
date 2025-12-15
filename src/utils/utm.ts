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
