// ── Meta WhatsApp Cloud API provider ────────────────────────────────────────
// SRP: only knows how to talk to the Meta Graph API.
// OCP: adding a new provider (Twilio, Bird…) means adding a new file here,
//      never touching this one.

import type { IWhatsAppProvider } from './interface.ts';

export interface MetaProviderConfig {
  phoneNumberId: string;
  accessToken: string;
  otpTemplateName: string;
  otpTemplateLang: string;
  welcomeTemplateName: string;
  welcomeTemplateLang: string;
}

function normalisePhone(phone: string): string {
  return phone.trim().replace(/\s/g, '').replace(/^\+/, '');
}

export class MetaWhatsAppProvider implements IWhatsAppProvider {
  private readonly apiBase = 'https://graph.facebook.com/v19.0';

  constructor(private readonly cfg: MetaProviderConfig) {}

  async sendOtp(toPhone: string, code: string): Promise<void> {
    await this.post({
      to: normalisePhone(toPhone),
      type: 'template',
      template: {
        name: this.cfg.otpTemplateName,
        language: { code: this.cfg.otpTemplateLang },
        components: [
          { type: 'body', parameters: [{ type: 'text', text: code }] },
        ],
      },
    });
  }

  async sendWelcome(toPhone: string): Promise<void> {
    await this.post({
      to: normalisePhone(toPhone),
      type: 'template',
      template: {
        name: this.cfg.welcomeTemplateName,
        language: { code: this.cfg.welcomeTemplateLang },
        components: [],
      },
    });
  }

  private async post(payload: Record<string, unknown>): Promise<void> {
    const res = await fetch(
      `${this.apiBase}/${this.cfg.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.cfg.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messaging_product: 'whatsapp', ...payload }),
      },
    );

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error?.message ?? `Meta API error ${res.status}`);
    }
  }
}
