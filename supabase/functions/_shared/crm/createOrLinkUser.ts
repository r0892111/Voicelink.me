// ── Shared CRM-OAuth helpers ────────────────────────────────────────────────
// The find-or-create auth-user dance, oauth_tokens write, and magic-link session
// are identical across teamleader-auth / pipedrive-auth / hubspot-auth. Extracted
// here so the per-platform auth functions only carry their provider-specific
// token-exchange + profile-fetch + mapping-table upsert.

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { RequestLogger } from '../logger.ts';

export type CrmProvider = 'teamleader' | 'pipedrive' | 'hubspot';

export interface CrmIdentity {
  provider: CrmProvider;
  /** mapping table, e.g. 'pipedrive_users' */
  mappingTable: string;
  /** unique id column on the mapping table, e.g. 'pipedrive_id' */
  idColumn: string;
  /** the CRM's user id value (stringified) */
  crmUserId: string;
  email: string;
  name: string;
}

export interface CrmTokens {
  accessToken: string;
  refreshToken?: string | null;
  /** ISO timestamp, or null if unknown */
  expiresAt?: string | null;
}

/** Compute an ISO expiry from a token `expires_in` (seconds). */
export function expiresAtFrom(expiresIn: number | undefined | null): string | null {
  return expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;
}

/**
 * Resolve (or create) the Supabase auth user for a CRM identity.
 * 1. existing mapping row (CRM id already linked) → reuse, refresh metadata
 * 2. users table by email (signed up via another provider)
 * 3. create a new auth user (with already-registered fallback)
 * Returns the auth user id. Throws on unrecoverable creation failure.
 */
export async function findOrCreateUser(
  supabase: SupabaseClient,
  identity: CrmIdentity,
  r: RequestLogger,
): Promise<string> {
  const { provider, mappingTable, idColumn, crmUserId, email, name } = identity;

  const { data: mappingRow } = await supabase
    .from(mappingTable)
    .select('user_id')
    .eq(idColumn, crmUserId)
    .maybeSingle();

  if (mappingRow?.user_id) {
    r.info('existing user via mapping table', { user_id: mappingRow.user_id, provider });
    await supabase.auth.admin.updateUserById(mappingRow.user_id, {
      user_metadata: { name, provider },
    });
    return mappingRow.user_id as string;
  }

  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (userRow?.id) {
    r.info('existing user via email', { user_id: userRow.id, provider });
    return userRow.id as string;
  }

  r.info('creating new Supabase user', { email, provider });
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { name, provider },
  });

  if (createError || !newUser?.user) {
    const alreadyRegistered = /already|registered|duplicate/i.test(createError?.message ?? '');
    if (alreadyRegistered) {
      r.info('user already registered, looking up by email', { error: createError?.message });
      const { data: listData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const existing = listData?.users?.find(
        (u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase(),
      );
      if (existing) {
        await supabase.from('users').upsert({ id: existing.id, email, name }, { onConflict: 'id' });
        return existing.id;
      }
    }
    throw new Error(createError?.message || 'Failed to create user');
  }

  const userId = newUser.user.id;
  await supabase.from('users').upsert({ id: userId, email, name }, { onConflict: 'id' });
  r.info('new user created', { user_id: userId, provider });
  return userId;
}

/** Upsert the generic oauth_tokens row for this user+provider. Non-fatal on failure. */
export async function saveOAuthTokens(
  supabase: SupabaseClient,
  userId: string,
  provider: CrmProvider,
  tokens: CrmTokens,
  r: RequestLogger,
): Promise<void> {
  const { error } = await supabase.from('oauth_tokens').upsert(
    {
      user_id: userId,
      provider,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken ?? null,
      expires_at: tokens.expiresAt ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,provider' },
  );
  if (error) {
    r.warn('oauth_tokens upsert failed (non-fatal)', { error: error.message, provider });
  } else {
    r.info('OAuth tokens saved', { provider });
  }
}

/**
 * Generate a magic-link action URL for a passwordless session, landing the user
 * on /dashboard at the caller's origin (falls back to SITE_URL). Throws on failure.
 */
export async function generateSessionLink(
  supabase: SupabaseClient,
  email: string,
  redirectUri: string,
  r: RequestLogger,
): Promise<string> {
  let postAuthRedirect: string;
  try {
    postAuthRedirect = `${new URL(redirectUri).origin}/dashboard`;
  } catch {
    postAuthRedirect = `${(Deno.env.get('SITE_URL') ?? 'https://voicelink.me').replace(/\/$/, '')}/dashboard`;
  }
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: postAuthRedirect },
  });
  if (error || !data?.properties?.action_link) {
    throw new Error(error?.message || 'Failed to create session');
  }
  r.info('magic link generated', { redirect_to: postAuthRedirect });
  return data.properties.action_link as string;
}
