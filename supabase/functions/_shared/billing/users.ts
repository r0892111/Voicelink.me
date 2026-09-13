// ── Billing row lookup across platform users tables ─────────────────────────
// Every self-serve platform keeps its Stripe linkage (stripe_customer_id,
// is_admin / admin_user_id for team billing, promo_end_date) on its own
// `${platform}_users` row. Until 2026-09-10 every billing function hardcoded
// `teamleader_users`; this helper is the one place that knows which tables
// carry billing columns, so a new platform is one line here.
//
// Lookup order matters: teamleader_users first (status quo for every
// existing customer, and the only table with team/test-user columns), then
// catermonkey_mcp_users. pipedrive_users / odoo_users have no billing
// columns and are deliberately absent — querying them would 400.

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const BILLING_TABLES = ['teamleader_users', 'catermonkey_mcp_users'] as const;
export type BillingTable = (typeof BILLING_TABLES)[number];

export interface BillingRow {
  user_id?: string | null;
  stripe_customer_id?: string | null;
  is_admin?: boolean | null;
  admin_user_id?: string | null;
  promo_end_date?: string | null;
  /** teamleader_users only */
  is_test_user?: boolean | null;
  /** teamleader_users only */
  teamleader_id?: string | null;
  /** catermonkey_mcp_users only */
  vendor_subject?: string | null;
}

export interface BillingLookup {
  table: BillingTable;
  provider: 'teamleader' | 'catermonkey_mcp';
  /** The id VLAgent uses as tenant_id in usage_events / analytics for this row. */
  tenant_id: string | null;
  row: BillingRow;
}

// Per-table select: the shared billing columns plus what each table has.
const SELECT: Record<BillingTable, string> = {
  teamleader_users: 'user_id, stripe_customer_id, is_admin, admin_user_id, promo_end_date, is_test_user, teamleader_id',
  catermonkey_mcp_users: 'user_id, stripe_customer_id, is_admin, admin_user_id, promo_end_date, vendor_subject',
};

function toLookup(table: BillingTable, row: BillingRow): BillingLookup {
  return table === 'teamleader_users'
    ? { table, provider: 'teamleader', tenant_id: row.teamleader_id ?? null, row }
    : { table, provider: 'catermonkey_mcp', tenant_id: row.vendor_subject ?? null, row };
}

export type OnLookupError = (table: BillingTable, message: string) => void;

/** One row from ONE known table (e.g. an admin's row, which lives in the same
 *  table as the member's). Null when absent. A query error is reported via
 *  `onError` (when given) and also yields null — callers that must tell an
 *  outage from "no row" pass a handler and decide there. */
export async function getBillingRowInTable(
  supabase: SupabaseClient,
  table: BillingTable,
  userId: string,
  onError?: OnLookupError,
): Promise<BillingRow | null> {
  const { data, error } = await supabase
    .from(table)
    .select(SELECT[table])
    .eq('user_id', userId)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) {
    onError?.(table, error.message);
    return null;
  }
  return data ? (data as unknown as BillingRow) : null;
}

/** The billing row for a portal user, wherever it lives. Null when the user
 *  has no row in any billing-capable table. */
export async function findBillingRow(
  supabase: SupabaseClient,
  userId: string,
  onError?: OnLookupError,
): Promise<BillingLookup | null> {
  for (const table of BILLING_TABLES) {
    const row = await getBillingRowInTable(supabase, table, userId, onError);
    if (row) return toLookup(table, row);
  }
  return null;
}

/** Patch the user's billing row (wherever it lives). Returns the table that
 *  was updated, or null when the user has no billing row / the update failed. */
export async function updateBillingRow(
  supabase: SupabaseClient,
  userId: string,
  patch: Record<string, unknown>,
): Promise<{ table: BillingTable } | { table: null; error: string }> {
  let lookupError: string | null = null;
  const found = await findBillingRow(supabase, userId, (table, message) => {
    lookupError = `${table}: ${message}`;
  });
  if (!found) return { table: null, error: lookupError ?? 'no billing row for user' };
  const { error } = await supabase.from(found.table).update(patch).eq('user_id', userId);
  if (error) return { table: null, error: error.message };
  return { table: found.table };
}
