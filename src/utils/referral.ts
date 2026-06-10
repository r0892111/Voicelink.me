/**
 * Affiliate referral capture (?ref=<code>).
 * Mirrors the UTM handler's consent model: localStorage only with marketing
 * consent, otherwise sessionStorage — which still survives the Teamleader
 * OAuth redirect round-trip, so same-session signups attribute without
 * consent (only the multi-day window is lost).
 *
 * First-touch wins: an unexpired stored code is never overwritten, matching
 * the published program terms ("the first registered partner counts").
 */

const REF_STORAGE_KEY = 'vl_ref';
const REF_PARAM = 'ref';
// Attribution window from the published partner terms.
const REF_TTL_MS = 90 * 24 * 60 * 60 * 1000;
// Must match the affiliates.ref_code CHECK constraint.
const REF_CODE_PATTERN = /^[a-z0-9-]{2,32}$/;

interface StoredRef {
  code: string;
  ts: number;
}

function hasMarketingConsent(): boolean {
  try {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) return false;
    return JSON.parse(consent).marketing === true;
  } catch {
    return false;
  }
}

function readFrom(storage: Storage): StoredRef | null {
  try {
    const raw = storage.getItem(REF_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredRef;
    if (!parsed.code || typeof parsed.ts !== 'number') return null;
    if (Date.now() - parsed.ts > REF_TTL_MS) {
      storage.removeItem(REF_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function readStoredRef(): StoredRef | null {
  return readFrom(localStorage) ?? readFrom(sessionStorage);
}

/** Returns the active referral code, or null if none / expired. */
export function getReferralCode(): string | null {
  return readStoredRef()?.code ?? null;
}

function persistRef(entry: StoredRef): void {
  const json = JSON.stringify(entry);
  if (hasMarketingConsent()) {
    localStorage.setItem(REF_STORAGE_KEY, json);
    sessionStorage.removeItem(REF_STORAGE_KEY);
  } else {
    sessionStorage.setItem(REF_STORAGE_KEY, json);
  }
}

/** Moves a sessionStorage-held code to localStorage once consent is granted. */
function migrateRefToStorage(): void {
  if (!hasMarketingConsent()) return;
  const fromSession = readFrom(sessionStorage);
  if (fromSession && !readFrom(localStorage)) {
    localStorage.setItem(REF_STORAGE_KEY, JSON.stringify(fromSession));
  }
  sessionStorage.removeItem(REF_STORAGE_KEY);
}

/**
 * Initialize referral capture on page load. Call once from main.tsx,
 * alongside initializeUTMTracking().
 */
export function initializeReferralTracking(): void {
  const raw = new URLSearchParams(window.location.search).get(REF_PARAM);
  const code = raw?.trim().toLowerCase() ?? '';

  // First-touch: only store when no unexpired code exists.
  if (REF_CODE_PATTERN.test(code) && !readStoredRef()) {
    persistRef({ code, ts: Date.now() });
  }

  window.addEventListener('storage', (e) => {
    if (e.key === 'cookie-consent') migrateRefToStorage();
  });
  window.addEventListener('consentChanged', () => migrateRefToStorage());
  migrateRefToStorage();
}
