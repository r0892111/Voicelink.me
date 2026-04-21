// ── Test-signup flow marker ──────────────────────────────────────────────────
// The test-user signup path sets a flag in localStorage so the OAuth callback
// can pass `is_test_user: true` to the teamleader-auth edge function. The flag
// used to be plain `'true'` — which persisted indefinitely and silently
// hijacked future *real* signups if the same browser had ever touched the
// test-dashboard.
//
// This module TTL-stamps the flag so a stale marker older than TEST_FLOW_TTL_MS
// (10 minutes) is ignored. Anything that isn't valid JSON with a fresh ts is
// treated as "no test intent".

const KEY_FLOW = 'is_test_user_flow';
const KEY_PHONE = 'test_user_phone';
const KEY_PHONE_DISPLAY = 'test_user_phone_display';
const TEST_FLOW_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface FlowRecord {
  v: true;
  ts: number;
}

/** Mark the current session as a test-user signup. Called from /test-dashboard
 *  right before the OAuth redirect, so the flag is always ~seconds old when
 *  the callback reads it. */
export function markTestFlow(phone?: string | null): void {
  const record: FlowRecord = { v: true, ts: Date.now() };
  localStorage.setItem(KEY_FLOW, JSON.stringify(record));
  if (phone) {
    localStorage.setItem(KEY_PHONE, phone);
  }
}

/** Read the flag and return true only if set AND fresh. Legacy plain-text
 *  `'true'` values are ignored — they were almost certainly placed days ago
 *  and would now misidentify a real signup as a test user. */
export function consumeTestFlow(): { isTest: boolean; phone: string | null } {
  const raw = localStorage.getItem(KEY_FLOW);
  if (!raw) return { isTest: false, phone: null };

  try {
    const parsed = JSON.parse(raw) as Partial<FlowRecord>;
    const fresh =
      parsed?.v === true &&
      typeof parsed.ts === 'number' &&
      Date.now() - parsed.ts < TEST_FLOW_TTL_MS;
    if (!fresh) return { isTest: false, phone: null };
    return { isTest: true, phone: localStorage.getItem(KEY_PHONE) };
  } catch {
    // legacy or malformed — treat as no intent
    return { isTest: false, phone: null };
  }
}

/** Clear every test-flow key. Call this after the OAuth callback has
 *  consumed the intent, and on /signup mount to wipe any stale state. */
export function clearTestFlow(): void {
  localStorage.removeItem(KEY_FLOW);
  localStorage.removeItem(KEY_PHONE);
  localStorage.removeItem(KEY_PHONE_DISPLAY);
}
