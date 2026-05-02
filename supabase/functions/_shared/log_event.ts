// ── log_event ─────────────────────────────────────────────────────────────────
// Edge-function helper that mirrors VLAgent's monitor.log_event into the
// central /monitor/events table at logs.finitplatform.be. Hits VLAgent's
// POST /admin/event endpoint with X-VLAgent-Secret. Never throws — logging
// is best-effort; a 500 here must not break the webhook handler that called
// us.
//
// Set in Supabase Edge Functions secrets:
//   VLAGENT_URL    (e.g. https://vlagent-dev.finit.example  or per-env)
//   VLAGENT_SECRET (matches the same env var on VLAgent)

export type Severity = 'info' | 'warn' | 'error';

export interface LogEventInput {
  source:     string;            // 'edge:stripe-webhook' | 'edge:trigger-entity-sync' | etc.
  event_type: string;            // 'subscription.created' | 'webhook.signature_failed' | etc.
  payload?:   Record<string, unknown>;
  user_id?:   string | null;
  severity?:  Severity;
}

const VLAGENT_URL    = Deno.env.get('VLAGENT_URL') ?? '';
const VLAGENT_SECRET = Deno.env.get('VLAGENT_SECRET') ?? '';

export async function logEvent(input: LogEventInput): Promise<void> {
  if (!VLAGENT_URL || !VLAGENT_SECRET) {
    // Env not configured — silently skip. Don't bring the function down
    // because someone forgot to set a secret.
    return;
  }
  try {
    await fetch(`${VLAGENT_URL.replace(/\/$/, '')}/admin/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VLAgent-Secret': VLAGENT_SECRET,
      },
      body: JSON.stringify({
        source:     input.source,
        event_type: input.event_type,
        user_id:    input.user_id ?? null,
        severity:   input.severity ?? 'info',
        payload:    input.payload ?? {},
      }),
      signal: AbortSignal.timeout(5000),  // never block the caller for >5s
    });
  } catch (_err) {
    // Best-effort. Swallow.
  }
}
