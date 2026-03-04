// ── WhatsApp service ──────────────────────────────────────────────────────────
// SRP: only knows how to call the WhatsApp edge functions over HTTP.
// DIP: components and hooks depend on this interface, never on raw fetch calls.

export interface IWhatsAppService {
  sendOtp(platform: string, userId: string, phone: string): Promise<{ expiresAt: string }>;
  verifyOtp(platform: string, userId: string, code: string): Promise<void>;
  sendWelcome(platform: string, userId: string, phone: string): Promise<void>;
}

class WhatsAppService implements IWhatsAppService {
  private readonly base: string;
  private readonly anonKey: string;

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    this.base    = supabaseUrl;
    this.anonKey = supabaseAnonKey;
  }

  async sendOtp(platform: string, userId: string, phone: string): Promise<{ expiresAt: string }> {
    const data = await this.call('whatsapp-otp', {
      action:       'send',
      crm_provider: platform,
      crm_user_id:  userId,
      phone_number: phone,
    });
    if (!data.success) throw new Error(data.error ?? 'Failed to send code.');
    return { expiresAt: data.expires_at as string };
  }

  async verifyOtp(platform: string, userId: string, code: string): Promise<void> {
    const data = await this.call('whatsapp-otp', {
      action:       'verify',
      crm_provider: platform,
      crm_user_id:  userId,
      otp_code:     code,
    });
    if (!data.success) throw new Error(data.error ?? 'Failed to verify code.');
  }

  async sendWelcome(platform: string, userId: string, phone: string): Promise<void> {
    // Best-effort — swallow errors so the signup flow is never blocked.
    try {
      await this.call('whatsapp-welcome', {
        crm_provider: platform,
        crm_user_id:  userId,
        phone_number: phone,
      });
    } catch {
      // intentionally silent
    }
  }

  private async call(fn: string, body: Record<string, string>): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.base}/functions/v1/${fn}`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.anonKey}`,
      },
      body: JSON.stringify(body),
    });
    return res.json();
  }
}

// Singleton — imported by hooks, never instantiated by components directly.
export const whatsappService: IWhatsAppService = new WhatsAppService(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
