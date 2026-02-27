// ── WhatsApp repository ──────────────────────────────────────────────────────
// SRP: only knows about DB reads/writes for WhatsApp verification state.
// DIP: depends on IDbClient (a minimal interface), not on the Supabase SDK
//      directly, making it straightforward to swap the data layer.

import type { OtpRecord } from './types.ts';

/** Minimal DB interface — keeps the repository decoupled from Supabase. */
export interface IDbClient {
  // deno-lint-ignore no-explicit-any
  from(table: string): any;
}

export interface IWhatsAppRepository {
  storeOtp(
    userId: string,
    phone: string,
    code: string,
    expiresAt: string,
  ): Promise<void>;

  getOtpRecord(userId: string): Promise<OtpRecord | null>;

  markVerified(userId: string, phone: string): Promise<void>;
}

export class SupabaseWhatsAppRepository implements IWhatsAppRepository {
  constructor(
    private readonly db: IDbClient,
    private readonly table: string,
  ) {}

  async storeOtp(
    userId: string,
    phone: string,
    code: string,
    expiresAt: string,
  ): Promise<void> {
    const { error } = await this.db
      .from(this.table)
      .update({
        whatsapp_otp_code:       code,
        whatsapp_otp_expires_at: expiresAt,
        whatsapp_otp_phone:      phone,
        whatsapp_status:         'pending',
        updated_at:              new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) throw new Error(`storeOtp failed: ${error.message}`);
  }

  async getOtpRecord(userId: string): Promise<OtpRecord | null> {
    const { data, error } = await this.db
      .from(this.table)
      .select('whatsapp_otp_code, whatsapp_otp_expires_at, whatsapp_otp_phone')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new Error(`getOtpRecord failed: ${error.message}`);
    if (!data?.whatsapp_otp_code) return null;

    return {
      code:      data.whatsapp_otp_code,
      expiresAt: data.whatsapp_otp_expires_at,
      phone:     data.whatsapp_otp_phone,
    };
  }

  async markVerified(userId: string, phone: string): Promise<void> {
    const { error } = await this.db
      .from(this.table)
      .update({
        whatsapp_number:         phone,
        whatsapp_status:         'active',
        whatsapp_otp_code:       null,
        whatsapp_otp_expires_at: null,
        whatsapp_otp_phone:      null,
        updated_at:              new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) throw new Error(`markVerified failed: ${error.message}`);
  }
}
