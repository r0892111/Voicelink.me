/**
 * Platform-owner check for owner-only UI (affiliate overview).
 * Cosmetic gate only — the affiliate-overview edge function enforces the
 * real allowlist via PLATFORM_ADMIN_USER_IDS. Deliberately NOT the
 * teamleader_users.is_admin flag: every workspace admin has that.
 */
export function isPlatformOwner(email: string | null | undefined): boolean {
  if (!email) return false;
  return (import.meta.env.VITE_PLATFORM_ADMIN_EMAILS ?? '')
    .split(',')
    .map((s: string) => s.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}
