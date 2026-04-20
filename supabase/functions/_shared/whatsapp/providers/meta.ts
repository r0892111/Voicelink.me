// ── Meta WhatsApp Cloud API provider ────────────────────────────────────────
// SRP: only knows how to talk to the Meta Graph API.
// OCP: adding a new provider (Twilio, Bird…) means adding a new file here,
//      never touching this one.

import type { IWhatsAppProvider } from './interface.ts';
import { createLogger, toErrorDetail } from '../../logger.ts';

const log = createLogger('whatsapp-meta');

export interface MetaProviderConfig {
  phoneNumberId: string;
  accessToken: string;
  otpTemplateName: string;
  otpTemplateLang: string;
  welcomeTemplateName: string;
  welcomeTemplateLang: string;
  teamInviteTemplateName: string;
  teamInviteTemplateLang: string;
}

function normalisePhone(phone: string): string {
  return phone.trim().replace(/\s/g, '').replace(/^\+/, '');
}

export class MetaWhatsAppProvider implements IWhatsAppProvider {
  private readonly apiBase = 'https://graph.facebook.com/v19.0';

  constructor(private readonly cfg: MetaProviderConfig) {}

  async sendOtp(toPhone: string, code: string): Promise<void> {
    log.info('sendOtp', { to: normalisePhone(toPhone), template: this.cfg.otpTemplateName });
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
    log.info('sendOtp completed', { to: normalisePhone(toPhone) });
  }

  async sendWelcome(toPhone: string): Promise<void> {
    log.info('sendWelcome', { to: normalisePhone(toPhone), template: this.cfg.welcomeTemplateName });
    await this.post({
      to: normalisePhone(toPhone),
      type: 'template',
      template: {
        name: this.cfg.welcomeTemplateName,
        language: { code: this.cfg.welcomeTemplateLang },
        components: [],
      },
    });
    log.info('sendWelcome completed', { to: normalisePhone(toPhone) });
  }

  async sendTeamInvite(toPhone: string, adminName: string, inviteUrl: string): Promise<void> {
    log.info('sendTeamInvite', { to: normalisePhone(toPhone), template: this.cfg.teamInviteTemplateName, admin_name: adminName });
    await this.post({
      to: normalisePhone(toPhone),
      type: 'template',
      template: {
        name: this.cfg.teamInviteTemplateName,
        language: { code: this.cfg.teamInviteTemplateLang },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: adminName },
              { type: 'text', text: inviteUrl },
            ],
          },
        ],
      },
    });
    log.info('sendTeamInvite completed', { to: normalisePhone(toPhone) });
  }

  private async post(payload: Record<string, unknown>): Promise<void> {
    const url = `${this.apiBase}/${this.cfg.phoneNumberId}/messages`;
    log.debug('Meta API POST', { url, to: payload.to });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.cfg.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messaging_product: 'whatsapp', ...payload }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const errorMsg = body?.error?.message ?? `Meta API error ${res.status}`;
      log.error('Meta API request failed', {
        status: res.status,
        error: errorMsg,
        to: payload.to,
      });
      throw new Error(errorMsg);
    }

    log.debug('Meta API request succeeded', { status: res.status, to: payload.to });
  }
}
