// ── Account linking by email — the verified-email rule ──────────────────────
// Industry rule (OIDC `email_verified`, Supabase/Auth0/Firebase linking
// docs): an identity provider's email may be used to attach a login to an
// EXISTING account only if that email is verified on BOTH sides. Otherwise
// linking is a takeover primitive: whoever can assert a victim's address on
// an unverified provider captures the victim's next login here.
//
// This portal's auth edge functions do their own find-or-create on
// public.users.email (they don't use Supabase's built-in identity linking),
// so the check lives here and every merge site calls it.
//
// Primary control for unverified providers is stronger than this guard:
// they never put the asserted email on auth.users at all (see
// catermonkey-mcp-auth — placeholder account email). This guard is defense
// in depth for the day a provider stores a real-but-unverified address.

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

/** Providers whose asserted email is NOT verified by the provider. A login
 *  from a verified provider must never be merged INTO an account created by
 *  one of these, and vice versa. */
export const UNVERIFIED_EMAIL_PROVIDERS: ReadonlySet<string> = new Set(['catermonkey_mcp']);

export interface LinkDecision {
  safe: boolean;
  reason?: 'target_provider_unverified' | 'target_email_unverified' | 'target_lookup_failed';
}

/** May a login with a VERIFIED email be attached to the existing auth user
 *  `targetUserId`? Fails closed: any lookup problem is "not safe". */
export async function canLinkByEmail(supabase: SupabaseClient, targetUserId: string): Promise<LinkDecision> {
  const { data, error } = await supabase.auth.admin.getUserById(targetUserId);
  if (error || !data?.user) return { safe: false, reason: 'target_lookup_failed' };
  const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
  const provider = typeof meta.provider === 'string' ? meta.provider : '';
  if (UNVERIFIED_EMAIL_PROVIDERS.has(provider)) return { safe: false, reason: 'target_provider_unverified' };
  if (meta.email_verified === false) return { safe: false, reason: 'target_email_unverified' };
  // Placeholder addresses are ours (teamleader_<id>@placeholder.local,
  // catermonkey-mcp-<id>@placeholder.local): nobody can log in with one at a
  // real provider, so a match on one can only be the same account.
  return { safe: true };
}
