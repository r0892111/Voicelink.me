// ── Twilio WhatsApp provider ──────────────────────────────────────────────────

import type { IWhatsAppProvider } from './interface.ts';
import { createLogger } from '../../logger.ts';

const log = createLogger('whatsapp-twilio');

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
  /** Twilio Content Template SID for team invite message. Optional. */
  teamInviteTemplateSid?: string;
  /** Plain-text fallback used when no otpTemplateSid is configured. */
  otpFallbackBody: string;
  /** Plain-text fallback used when no welcomeTemplateSid is configured. */
  welcomeFallbackBody: string;
  /** Plain-text fallback used when no teamInviteTemplateSid is configured. */
  teamInviteFallbackBody: string;
}

export interface TwilioSendResult {
  sid: string | null;
  status: string | null;
  error_code: string | number | null;
  error_message: string | null;
  to: string | null;
  from: string | null;
  used_template_sid: string | null;
  used_body: string | null;
}

function normalisePhone(phone: string): string {
  const clean = phone.trim().replace(/\s/g, '');
  return clean.startsWith('+') ? clean : `+${clean}`;
}

export class TwilioWhatsAppProvider implements IWhatsAppProvider {
  constructor(private readonly cfg: TwilioProviderConfig) {}

  /** Last-call Twilio response. Read by welcome / invite handlers to surface
   *  message SID + status into their HTTP response for debugging silent drops. */
  lastResult: TwilioSendResult | null = null;

  async sendOtp(toPhone: string, code: string): Promise<void> {
    log.info('sendOtp', { to: normalisePhone(toPhone), has_template: !!this.cfg.otpTemplateSid });
    const params = this.baseParams(normalisePhone(toPhone));

    let usedTemplate: string | null = null;
    let usedBody: string | null = null;
    if (this.cfg.otpTemplateSid) {
      params.set('ContentSid', this.cfg.otpTemplateSid);
      params.set('ContentVariables', JSON.stringify({ '1': code }));
      usedTemplate = this.cfg.otpTemplateSid;
    } else {
      const body = this.cfg.otpFallbackBody.replace('{code}', code);
      params.set('Body', body);
      usedBody = body;
    }

    this.lastResult = await this.post(params, usedTemplate, usedBody);
    log.info('sendOtp completed', {
      to: normalisePhone(toPhone),
      sid: this.lastResult.sid,
      status: this.lastResult.status,
    });
  }

  async sendWelcome(toPhone: string): Promise<void> {
    log.info('sendWelcome', { to: normalisePhone(toPhone), has_template: !!this.cfg.welcomeTemplateSid });
    const params = this.baseParams(normalisePhone(toPhone));

    let usedTemplate: string | null = null;
    let usedBody: string | null = null;
    if (this.cfg.welcomeTemplateSid) {
      params.set('ContentSid', this.cfg.welcomeTemplateSid);
      params.set('ContentVariables', JSON.stringify({}));
      usedTemplate = this.cfg.welcomeTemplateSid;
    } else {
      params.set('Body', this.cfg.welcomeFallbackBody);
      usedBody = this.cfg.welcomeFallbackBody;
    }

    this.lastResult = await this.post(params, usedTemplate, usedBody);
    log.info('sendWelcome completed', {
      to: normalisePhone(toPhone),
      sid: this.lastResult.sid,
      status: this.lastResult.status,
      error_code: this.lastResult.error_code,
      error_message: this.lastResult.error_message,
    });
  }

  async sendTeamInvite(toPhone: string, adminName: string, inviteUrl: string): Promise<void> {
    log.info('sendTeamInvite', { to: normalisePhone(toPhone), admin_name: adminName, has_template: !!this.cfg.teamInviteTemplateSid });
    const params = this.baseParams(normalisePhone(toPhone));

    if (this.cfg.teamInviteTemplateSid) {
      params.set('ContentSid', this.cfg.teamInviteTemplateSid);
      params.set('ContentVariables', JSON.stringify({ '1': adminName, '2': inviteUrl }));
    } else {
      params.set('Body', this.cfg.teamInviteFallbackBody
        .replace('{admin_name}', adminName)
        .replace('{invite_url}', inviteUrl));
    }

    await this.post(params);
    log.info('sendTeamInvite completed', { to: normalisePhone(toPhone) });
  }

  private baseParams(to: string): URLSearchParams {
    return new URLSearchParams({
      From: `whatsapp:${this.cfg.fromNumber}`,
      To:   `whatsapp:${to}`,
    });
  }

  private async post(
    params: URLSearchParams,
    usedTemplate: string | null,
    usedBody: string | null,
  ): Promise<TwilioSendResult> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.cfg.accountSid}/Messages.json`;
    const credentials = btoa(`${this.cfg.accountSid}:${this.cfg.authToken}`);

    log.debug('Twilio API POST', { to: params.get('To') });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization:  `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const rawText = await res.text().catch(() => '');
    let json: Record<string, unknown> = {};
    try { json = rawText ? JSON.parse(rawText) : {}; } catch { /* non-JSON */ }

    if (!res.ok) {
      const errorMsg = (json as { message?: string }).message ?? `Twilio API error ${res.status}`;
      const errorCode = (json as { code?: string | number }).code ?? null;
      log.error('Twilio API request failed', {
        status: res.status,
        error: errorMsg,
        error_code: errorCode,
        raw_body: rawText.slice(0, 2000),
        to: params.get('To'),
      });
      const err = new Error(errorMsg);
      Object.assign(err, {
        twilio_status: res.status,
        twilio_error_code: errorCode,
        twilio_raw_body: rawText.slice(0, 2000),
      });
      throw err;
    }

    const result: TwilioSendResult = {
      sid:           (json as { sid?: string }).sid ?? null,
      status:        (json as { status?: string }).status ?? null,
      error_code:    (json as { error_code?: string | number }).error_code ?? null,
      error_message: (json as { error_message?: string }).error_message ?? null,
      to:            (json as { to?: string }).to ?? null,
      from:          (json as { from?: string }).from ?? null,
      used_template_sid: usedTemplate,
      used_body:     usedBody,
    };
    log.debug('Twilio API request succeeded', {
      status: res.status,
      sid: result.sid,
      msg_status: result.status,
      error_code: result.error_code,
      to: result.to,
    });
    return result;
  }
}
