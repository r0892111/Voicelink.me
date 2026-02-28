// ── Provider factory ─────────────────────────────────────────────────────────
// OCP: to add a new provider, register it here and create its class file.
//      Existing code (handlers, repository) never changes.
// DIP: callers depend on IWhatsAppProvider, never on a concrete class.

import type { IWhatsAppProvider } from './interface.ts';
import { MetaWhatsAppProvider } from './meta.ts';
import { TwilioWhatsAppProvider } from './twilio.ts';

export function createWhatsAppProvider(): IWhatsAppProvider {
  const providerName = Deno.env.get('WHATSAPP_PROVIDER') ?? 'meta';

  switch (providerName) {
    case 'meta':
      return createMetaProvider();

    case 'twilio':
      return createTwilioProvider();

    default:
      throw new Error(
        `Unknown WHATSAPP_PROVIDER "${providerName}". Supported: meta, twilio`,
      );
  }
}

function createMetaProvider(): MetaWhatsAppProvider {
  const phoneNumberId = Deno.env.get('META_WHATSAPP_PHONE_NUMBER_ID');
  const accessToken   = Deno.env.get('META_WHATSAPP_ACCESS_TOKEN');

  if (!phoneNumberId || !accessToken) {
    throw new Error(
      'Missing required secrets: META_WHATSAPP_PHONE_NUMBER_ID, META_WHATSAPP_ACCESS_TOKEN',
    );
  }

  return new MetaWhatsAppProvider({
    phoneNumberId,
    accessToken,
    otpTemplateName:     Deno.env.get('META_WHATSAPP_OTP_TEMPLATE_NAME')     ?? 'voicelink_otp',
    otpTemplateLang:     Deno.env.get('META_WHATSAPP_OTP_TEMPLATE_LANG')     ?? 'en_US',
    welcomeTemplateName: Deno.env.get('META_WHATSAPP_WELCOME_TEMPLATE_NAME') ?? 'voicelink_welcome',
    welcomeTemplateLang: Deno.env.get('META_WHATSAPP_WELCOME_TEMPLATE_LANG') ?? 'en_US',
  });
}

function createTwilioProvider(): TwilioWhatsAppProvider {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken  = Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromNumber = Deno.env.get('TWILIO_WHATSAPP_FROM');

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error(
      'Missing required secrets: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM',
    );
  }

  return new TwilioWhatsAppProvider({
    accountSid,
    authToken,
    fromNumber,
    otpTemplateSid:     Deno.env.get('TWILIO_WHATSAPP_OTP_TEMPLATE_SID'),
    welcomeTemplateSid: Deno.env.get('TWILIO_WHATSAPP_WELCOME_TEMPLATE_SID'),
    otpFallbackBody:     'Your VoiceLink verification code is: {code}. Valid for 10 minutes.',
    welcomeFallbackBody: 'Welcome to VoiceLink! Your WhatsApp is now connected.',
  });
}
