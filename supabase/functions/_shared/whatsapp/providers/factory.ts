// ── Provider factory ─────────────────────────────────────────────────────────
// OCP: to add a new provider, register it here and create its class file.
//      Existing code (handlers, repository) never changes.
// DIP: callers depend on IWhatsAppProvider, never on a concrete class.

import type { IWhatsAppProvider } from './interface.ts';
import { MetaWhatsAppProvider } from './meta.ts';
import { TwilioWhatsAppProvider } from './twilio.ts';
import { createLogger } from '../../logger.ts';

const log = createLogger('whatsapp-factory');

export function createWhatsAppProvider(): IWhatsAppProvider {
  const providerName = Deno.env.get('WHATSAPP_PROVIDER') ?? 'meta';
  log.info('creating WhatsApp provider', { provider: providerName });

  switch (providerName) {
    case 'meta':
      return createMetaProvider();

    case 'twilio':
      return createTwilioProvider();

    default:
      log.error('unknown provider', { provider: providerName });
      throw new Error(
        `Unknown WHATSAPP_PROVIDER "${providerName}". Supported: meta, twilio`,
      );
  }
}

function createMetaProvider(): MetaWhatsAppProvider {
  const phoneNumberId = Deno.env.get('META_WHATSAPP_PHONE_NUMBER_ID');
  const accessToken   = Deno.env.get('META_WHATSAPP_ACCESS_TOKEN');

  if (!phoneNumberId || !accessToken) {
    log.error('missing Meta WhatsApp secrets', {
      has_phone_number_id: !!phoneNumberId,
      has_access_token: !!accessToken,
    });
    throw new Error(
      'Missing required secrets: META_WHATSAPP_PHONE_NUMBER_ID, META_WHATSAPP_ACCESS_TOKEN',
    );
  }

  log.info('Meta WhatsApp provider created', { phone_number_id: phoneNumberId });
  return new MetaWhatsAppProvider({
    phoneNumberId,
    accessToken,
    otpTemplateName:        Deno.env.get('META_WHATSAPP_OTP_TEMPLATE_NAME')         ?? 'voicelink_otp',
    otpTemplateLang:        Deno.env.get('META_WHATSAPP_OTP_TEMPLATE_LANG')         ?? 'en_US',
    welcomeTemplateName:    Deno.env.get('META_WHATSAPP_WELCOME_TEMPLATE_NAME')     ?? 'voicelink_welcome',
    welcomeTemplateLang:    Deno.env.get('META_WHATSAPP_WELCOME_TEMPLATE_LANG')     ?? 'en_US',
    teamInviteTemplateName: Deno.env.get('META_WHATSAPP_TEAM_INVITE_TEMPLATE_NAME') ?? 'voicelink_team_invite',
    teamInviteTemplateLang: Deno.env.get('META_WHATSAPP_TEAM_INVITE_TEMPLATE_LANG') ?? 'en_US',
  });
}

function createTwilioProvider(): TwilioWhatsAppProvider {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken  = Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromNumber = Deno.env.get('TWILIO_WHATSAPP_FROM');

  if (!accountSid || !authToken || !fromNumber) {
    log.error('missing Twilio secrets', {
      has_account_sid: !!accountSid,
      has_auth_token: !!authToken,
      has_from_number: !!fromNumber,
    });
    throw new Error(
      'Missing required secrets: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM',
    );
  }

  log.info('Twilio WhatsApp provider created');
  return new TwilioWhatsAppProvider({
    accountSid,
    authToken,
    fromNumber,
    otpTemplateSid:        Deno.env.get('TWILIO_WHATSAPP_OTP_TEMPLATE_SID'),
    // Welcome v2 templates (approved 2026-06): defaults are the live Content
    // SIDs; the env vars allow repointing without a redeploy. The legacy
    // single-SID secret below only applies if a language's SID is unset.
    welcomeTemplateSids: {
      nl: Deno.env.get('TWILIO_WHATSAPP_WELCOME_TEMPLATE_SID_NL') ?? 'HXc301334c031e1da6404ef6e1bba5e26a',
      en: Deno.env.get('TWILIO_WHATSAPP_WELCOME_TEMPLATE_SID_EN') ?? 'HXfb039d77af2f1fac4bb351172759f8ae',
      fr: Deno.env.get('TWILIO_WHATSAPP_WELCOME_TEMPLATE_SID_FR') ?? 'HXb06256e81a31e89aa74f3ed1916f47aa',
      de: Deno.env.get('TWILIO_WHATSAPP_WELCOME_TEMPLATE_SID_DE') ?? 'HXaf864af11346cb5eeb82d336436ceab0',
    },
    welcomeTemplateSid:    Deno.env.get('TWILIO_WHATSAPP_WELCOME_TEMPLATE_SID'),
    teamInviteTemplateSid: Deno.env.get('TWILIO_WHATSAPP_TEAM_INVITE_TEMPLATE_SID'),
    otpFallbackBody:        'Your VoiceLink verification code is: {code}. Valid for 10 minutes.',
    welcomeFallbackBody:    'Welcome to VoiceLink! Your WhatsApp is now connected.',
    teamInviteFallbackBody: 'Hi! {admin_name} has invited you to join their VoiceLink team. Accept your invite here: {invite_url}',
  });
}
