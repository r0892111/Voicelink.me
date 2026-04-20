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

export interface MetaSendResult {
  message_id: string | null;
  message_status: string | null;
  contact_wa_id: string | null;
  contact_input: string | null;
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
    const result = await this.post({
      to: normalisePhone(toPhone),
      type: 'template',
      template: {
        name: this.cfg.welcomeTemplateName,
        language: { code: this.cfg.welcomeTemplateLang },
        components: [],
      },
    });
    // Stash the Meta response so the welcome handler can surface it in the
    // HTTP response body (function-log stream isn't exposed by get_logs).
    this.lastResult = result;
    log.info('sendWelcome completed', {
      to: normalisePhone(toPhone),
      message_id: result.message_id,
      message_status: result.message_status,
      contact_wa_id: result.contact_wa_id,
      contact_input: result.contact_input,
    });
  }

  /** Last-call Meta response (message_id, wa_id). Read by the welcome handler
   *  to surface into the HTTP response for debugging silent-drop scenarios. */
  lastResult: MetaSendResult | null = null;

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

  private async post(payload: Record<string, unknown>): Promise<MetaSendResult> {
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
      const rawText = await res.text().catch(() => '');
      let body: Record<string, unknown> = {};
      try { body = rawText ? JSON.parse(rawText) : {}; } catch { /* non-JSON */ }
      const errorMsg   = (body as { error?: { message?: string } })?.error?.message
                      ?? `Meta API error ${res.status}`;
      const errorCode  = (body as { error?: { code?: number } })?.error?.code;
      const errorType  = (body as { error?: { type?: string } })?.error?.type;
      const errorData  = (body as { error?: { error_data?: unknown } })?.error?.error_data;
      const fbtraceId  = (body as { error?: { fbtrace_id?: string } })?.error?.fbtrace_id;
      log.error('Meta API request failed', {
        status: res.status,
        error: errorMsg,
        error_code: errorCode,
        error_type: errorType,
        error_data: errorData,
        fbtrace_id: fbtraceId,
        raw_body: rawText.slice(0, 2000),
        to: payload.to,
      });
      const err = new Error(errorMsg);
      // Attach the full Meta response for callers that surface debug info.
      Object.assign(err, {
        meta_status: res.status,
        meta_error_code: errorCode,
        meta_error_type: errorType,
        meta_error_data: errorData,
        meta_fbtrace_id: fbtraceId,
        meta_raw_body: rawText.slice(0, 2000),
      });
      throw err;
    }

    // Parse the happy-path response to extract message_id / status so callers
    // can trace the message in Meta Business Manager if delivery silently
    // fails downstream (template dropped, user not opted in, quality gate).
    const rawText = await res.text().catch(() => '');
    let body: Record<string, unknown> = {};
    try { body = rawText ? JSON.parse(rawText) : {}; } catch { /* non-JSON */ }
    const messages = (body as { messages?: Array<Record<string, unknown>> }).messages;
    const contacts = (body as { contacts?: Array<Record<string, unknown>> }).contacts;
    const result: MetaSendResult = {
      message_id:      (messages?.[0]?.id as string) ?? null,
      message_status:  (messages?.[0]?.message_status as string) ?? null,
      contact_wa_id:   (contacts?.[0]?.wa_id as string) ?? null,
      contact_input:   (contacts?.[0]?.input as string) ?? null,
    };
    log.debug('Meta API request succeeded', {
      status: res.status,
      to: payload.to,
      ...result,
    });
    return result;
  }
}
