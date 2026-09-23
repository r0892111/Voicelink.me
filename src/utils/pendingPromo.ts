// Event promo intent ("2 months Professional free") carried from a QR landing
// page to the first dashboard load, where provision-promo-subscription grants
// it on the account's billing row.
//
// Two carriers, because the grant can happen in another browser than the one
// that saw the landing page: an Odoo sign-up that needs e-mail confirmation is
// finished from the confirmation link, often in the phone's mail app.
//  - localStorage `pending_promo` (same browser; also used by WorkSmarter)
//  - user_metadata.promo_months, stamped at sign-up (any browser)
// Both are cleared only once the grant has succeeded, so a failed or early
// attempt (e.g. the Odoo placeholder row not written yet) retries next load.

import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const KEY = 'pending_promo';
const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export function setPendingPromo(months: number, source: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ months, source }));
  } catch { /* storage blocked: the metadata carrier still works */ }
}

/** Months to stamp on user_metadata at sign-up, when a promo is pending. */
export function pendingPromoMonths(): number | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { months } = JSON.parse(raw) as { months?: number };
    return typeof months === 'number' && months > 0 ? months : null;
  } catch {
    return null;
  }
}

/** Grant a pending promo, if any. Never throws — a promo must not block the
 *  dashboard. For an Odoo account the billing row is a placeholder that
 *  odoo-account writes, so it is ensured first. */
export async function consumePendingPromo(session: Session, platform: string | null | undefined): Promise<void> {
  const metaMonths = Number(session.user.user_metadata?.promo_months) || null;
  const months = pendingPromoMonths() ?? metaMonths;
  if (!months) return;

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` };
  try {
    if (platform === 'odoo' || session.user.user_metadata?.provider === 'odoo') {
      await fetch(`${FN_BASE}/odoo-account`, { method: 'POST', headers, body: JSON.stringify({}) });
    }
    const res = await fetch(`${FN_BASE}/provision-promo-subscription`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ months }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.success) return; // keep the intent, retry next load
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    if (metaMonths) await supabase.auth.updateUser({ data: { promo_months: null } });
  } catch {
    /* non-fatal */
  }
}
