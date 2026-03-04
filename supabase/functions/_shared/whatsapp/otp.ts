// ── OTP pure functions (no side effects, fully testable) ────────────────────
// SRP: this module only knows about OTP generation and validation logic.

import type { OtpRecord, OtpValidationResult } from './types.ts';

/** Generate a cryptographically random 6-digit OTP. */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Return an ISO expiry timestamp `ttlMinutes` from now. */
export function buildExpiresAt(ttlMinutes = 10): string {
  return new Date(Date.now() + ttlMinutes * 60_000).toISOString();
}

/** Validate a user-supplied code against a stored OTP record. */
export function validateOtp(
  record: OtpRecord,
  provided: string,
): OtpValidationResult {
  if (record.code !== provided.trim()) {
    return { valid: false, error: 'Incorrect code. Please try again.' };
  }
  if (new Date(record.expiresAt) < new Date()) {
    return { valid: false, error: 'Code has expired. Please request a new one.' };
  }
  return { valid: true };
}
