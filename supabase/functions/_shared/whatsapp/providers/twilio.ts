// ── Twilio WhatsApp provider ──────────────────────────────────────────────────

import type { IWhatsAppProvider } from './interface.ts';

export interface TwilioProviderConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  /** Twilio Content Template SID (HX...) for the OTP message. When set,
   *  the code is passed as ContentVariables {"1": code}.
   *  Falls back to a plain Body if not set. */
  otpTemplateSid?: string;
  /** Twilio Content Template SID for the welcome message. Optional. */
  welcomeTemplateSid?: string;
  /** Plain-text fallback used when no otpTemplateSid is configured. */
  otpFallbackBody: string;
  /** Plain-text fallback used when no welcomeTemplateSid is configured. */
  welcomeFallbackBody: string;
}

function normalisePhone(phone: string): string {
  const clean = phone.trim().replace(/\s/g, '');
  return clean.startsWith('+') ? clean : `+${clean}`;
}

export class TwilioWhatsAppProvider implements IWhatsAppProvider {
  constructor(private readonly cfg: TwilioProviderConfig) {}

  async sendOtp(toPhone: string, code: string): Promise<void> {
    const params = this.baseParams(normalisePhone(toPhone));

    if (this.cfg.otpTemplateSid) {
      params.set('ContentSid', this.cfg.otpTemplateSid);
      params.set('ContentVariables', JSON.stringify({ '1': code }));
    } else {
      params.set('Body', this.cfg.otpFallbackBody.replace('{code}', code));
    }

    await this.post(params);
  }

  async sendWelcome(toPhone: string): Promise<void> {
    const params = this.baseParams(normalisePhone(toPhone));

    if (this.cfg.welcomeTemplateSid) {
      params.set('ContentSid', this.cfg.welcomeTemplateSid);
      params.set('ContentVariables', JSON.stringify({}));
    } else {
      params.set('Body', this.cfg.welcomeFallbackBody);
    }

    await this.post(params);
  }

  private baseParams(to: string): URLSearchParams {
    return new URLSearchParams({
      From: `whatsapp:${this.cfg.fromNumber}`,
      To:   `whatsapp:${to}`,
    });
  }

  private async post(params: URLSearchParams): Promise<void> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.cfg.accountSid}/Messages.json`;
    const credentials = btoa(`${this.cfg.accountSid}:${this.cfg.authToken}`);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization:  `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.message ?? `Twilio API error ${res.status}`);
    }
  }
}
