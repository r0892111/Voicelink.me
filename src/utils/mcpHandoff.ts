// ── MCP signup handoff ───────────────────────────────────────────────────────
// VoiceLink's backend finishes an MCP OAuth login (Catermonkey today) and
// sends the browser to /auth/<platform>_mcp/callback?handoff=<token>. The
// token is a single-use, 5-minute bearer for account creation, so it must
// leave the URL BEFORE anything can observe it: AnalyticsListener sends
// window.location.href as page_location on mount, and consented gtag would
// ship it to Google. main.tsx calls stashHandoffFromUrl() synchronously
// before createRoot; AuthCallback takes it back with takeStashedHandoff().
//
// Lives in utils (not main.tsx) so AuthCallback never imports the app
// entrypoint — that would be a circular import that only works by accident.

export const MCP_HANDOFF_STORAGE_KEY = 'mcp_signup_handoff';

// Same contract as AuthCallback's `platform.endsWith('_mcp')`.
const MCP_CALLBACK_PATH = /^\/auth\/[a-z0-9_-]+_mcp\/callback\/?$/;

/** If the current URL is an MCP callback carrying ?handoff=, move the token
 *  into sessionStorage and rewrite the URL without it. When storage is
 *  blocked the URL is left intact so takeStashedHandoff()'s URL fallback
 *  still works. Safe to call on any page. */
export function stashHandoffFromUrl(): void {
  if (typeof window === 'undefined' || !MCP_CALLBACK_PATH.test(window.location.pathname)) return;
  const q = new URLSearchParams(window.location.search);
  const handoff = q.get('handoff');
  if (!handoff) return;

  let stored = false;
  try {
    sessionStorage.setItem(MCP_HANDOFF_STORAGE_KEY, handoff);
    stored = sessionStorage.getItem(MCP_HANDOFF_STORAGE_KEY) === handoff;
  } catch {
    stored = false;
  }
  if (!stored) return;

  q.delete('handoff');
  const rest = q.toString();
  window.history.replaceState(null, '', window.location.pathname + (rest ? `?${rest}` : '') + window.location.hash);
}

/** The stashed token (removed from storage on read), or the URL param when
 *  storage was blocked, or null. */
export function takeStashedHandoff(): string | null {
  let handoff: string | null = null;
  try {
    handoff = sessionStorage.getItem(MCP_HANDOFF_STORAGE_KEY);
    sessionStorage.removeItem(MCP_HANDOFF_STORAGE_KEY);
  } catch {
    handoff = null;
  }
  if (!handoff && typeof window !== 'undefined') {
    handoff = new URLSearchParams(window.location.search).get('handoff');
  }
  return handoff || null;
}
