// ── Domain types ────────────────────────────────────────────────────────────

export type CrmProvider = 'teamleader' | 'pipedrive' | 'odoo' | 'catermonkey_mcp' | 'test';

export interface OtpRecord {
  code: string;
  expiresAt: string;
  phone: string;
}

export interface OtpValidationResult {
  valid: boolean;
  error?: string;
}
