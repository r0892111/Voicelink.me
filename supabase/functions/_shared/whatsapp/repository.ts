// ── WhatsApp repository ──────────────────────────────────────────────────────
// SRP: only knows about DB reads/writes for WhatsApp verification state.
// DIP: depends on IDbClient (a minimal interface), not on the Supabase SDK
//      directly, making it straightforward to swap the data layer.

import type { OtpRecord } from './types.ts';
import { createLogger } from '../logger.ts';

const log = createLogger('whatsapp-repository');

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
    log.info('storeOtp', { table: this.table, user_id: userId, phone });

    const { data, error } = await this.db
      .from(this.table)
      .update({
        whatsapp_otp_code:       code,
        whatsapp_otp_expires_at: expiresAt,
        whatsapp_otp_phone:      phone,
        whatsapp_status:         'pending',
        updated_at:              new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select('user_id');

    if (error) {
      log.error('storeOtp failed', { table: this.table, user_id: userId, error: error.message });
      throw new Error(`storeOtp failed: ${error.message}`);
    }
    if (!data || data.length === 0) {
      log.error('storeOtp: no user row found', { table: this.table, user_id: userId });
      throw new Error('No user row found — make sure the account exists in the database before connecting WhatsApp.');
    }
    log.info('storeOtp successful', { table: this.table, user_id: userId });
  }

  async getOtpRecord(userId: string): Promise<OtpRecord | null> {
    log.info('getOtpRecord', { table: this.table, user_id: userId });

    const { data, error } = await this.db
      .from(this.table)
      .select('whatsapp_otp_code, whatsapp_otp_expires_at, whatsapp_otp_phone')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      log.error('getOtpRecord failed', { table: this.table, user_id: userId, error: error.message });
      throw new Error(`getOtpRecord failed: ${error.message}`);
    }
    if (!data?.whatsapp_otp_code) {
      log.info('getOtpRecord: no pending OTP found', { table: this.table, user_id: userId });
      return null;
    }

    log.info('getOtpRecord: OTP record found', { table: this.table, user_id: userId, phone: data.whatsapp_otp_phone });
    return {
      code:      data.whatsapp_otp_code,
      expiresAt: data.whatsapp_otp_expires_at,
      phone:     data.whatsapp_otp_phone,
    };
  }

  async markVerified(userId: string, phone: string): Promise<void> {
    log.info('markVerified', { table: this.table, user_id: userId, phone });

    const { data, error } = await this.db
      .from(this.table)
      .update({
        whatsapp_number:         phone,
        whatsapp_status:         'active',
        whatsapp_otp_code:       null,
        whatsapp_otp_expires_at: null,
        whatsapp_otp_phone:      null,
        updated_at:              new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select('user_id');

    if (error) {
      log.error('markVerified failed', { table: this.table, user_id: userId, error: error.message });
      throw new Error(`markVerified failed: ${error.message}`);
    }
    if (!data || data.length === 0) {
      log.error('markVerified: no user row found', { table: this.table, user_id: userId });
      throw new Error('No user row found — cannot mark WhatsApp as verified.');
    }
    log.info('markVerified successful', { table: this.table, user_id: userId });
  }
}
