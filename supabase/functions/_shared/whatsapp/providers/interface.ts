// ── Provider contracts (ISP: two focused interfaces, not one fat one) ────────
// Handlers only depend on the interface they actually use — never on a concrete
// class — satisfying the Dependency Inversion Principle.

/** Sends a time-limited OTP code to a WhatsApp number. */
export interface IWhatsAppOtpSender {
  sendOtp(toPhone: string, code: string): Promise<void>;
}

/** Sends a one-time welcome message to a newly verified WhatsApp number. */
export interface IWhatsAppWelcomeSender {
  sendWelcome(toPhone: string): Promise<void>;
}

/** Combined provider for implementations that support both operations. */
export type IWhatsAppProvider = IWhatsAppOtpSender & IWhatsAppWelcomeSender;
