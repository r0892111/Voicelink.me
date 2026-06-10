// ── gdprService ──────────────────────────────────────────────────────────────
// Self-service right-to-erasure (GDPR Art. 17). Calls the gdpr-erasure edge
// function with the user's own session JWT; the function cascades through
// VLAgent (CRM tokens, entity memory, message history, logs) and finally
// deletes the auth account. Irreversible — the UI gates on a typed DELETE.

import { supabase } from '../lib/supabase';

export interface ErasureResult {
  erased: Record<string, unknown> | null;
  account_deleted: boolean;
}

export async function requestErasure(): Promise<ErasureResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Not authenticated.');

  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gdpr-erasure`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ confirm: 'DELETE' }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error ?? `Erasure failed (${res.status})`);
  }
  return body as ErasureResult;
}
