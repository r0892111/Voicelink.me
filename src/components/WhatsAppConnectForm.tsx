// ── WhatsAppConnectForm ───────────────────────────────────────────────────────
// SRP: pure presentational component for the WhatsApp connection flow.
// DIP: receives all state + callbacks as props — no service or hook imports.

import React from 'react';
import { MessageCircle, Loader2, AlertCircle, Check, X } from 'lucide-react';
import { isValidPhone } from '../hooks/useWhatsAppConnect';
import type { WaStep } from '../hooks/useWhatsAppConnect';

export interface WhatsAppConnectFormProps {
  open: boolean;
  step: WaStep;
  phone: string;
  otp: string;
  busy: boolean;
  error: string | null;
  success: boolean;
  onPhoneChange(v: string): void;
  onOtpChange(v: string): void;
  onSendOtp(): void;
  onVerifyOtp(): void;
  onBackToPhone(): void;
  onResendOtp(): void;
}

export const WhatsAppConnectForm: React.FC<WhatsAppConnectFormProps> = ({
  open, step, phone, otp, busy, error, success,
  onPhoneChange, onOtpChange, onSendOtp, onVerifyOtp, onBackToPhone, onResendOtp,
}) => (
  <div
    className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
    style={{ maxHeight: open ? '400px' : '0px' }}
  >
    <div className="border border-t-0 border-navy/[0.09] rounded-b-2xl bg-white/70 backdrop-blur-sm px-5 py-5">

      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-instrument">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-instrument font-medium">
          <Check className="w-4 h-4" />
          WhatsApp connected successfully! 🎉
        </div>
      )}

      {/* ── Phone number step ── */}
      {!success && step === 'phone' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-navy/70 font-general mb-1.5">
              Your WhatsApp number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSendOtp()}
              placeholder="+32 123 456 789"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-instrument bg-white/80 focus:outline-none focus:ring-2 focus:ring-navy/20 transition-colors ${
                phone && !isValidPhone(phone) ? 'border-red-300' : 'border-navy/[0.12]'
              }`}
            />
            <p className="text-xs text-navy/40 font-instrument mt-1">
              Include your country code — e.g. +32 for Belgium.
            </p>
          </div>
          <button
            onClick={onSendOtp}
            disabled={busy || !phone || !isValidPhone(phone)}
            className="inline-flex items-center gap-2 bg-navy disabled:bg-navy/40 hover:bg-navy-hover text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
            {busy ? 'Sending…' : 'Send Verification Code'}
          </button>
        </div>
      )}

      {/* ── OTP step ── */}
      {!success && step === 'otp' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-navy/[0.04] rounded-xl">
            <MessageCircle className="w-4 h-4 text-navy/50 flex-shrink-0" />
            <p className="text-xs text-navy/60 font-instrument">
              Code sent to <span className="font-semibold text-navy">{phone}</span>. Check your WhatsApp.
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy/70 font-general mb-1.5">
              6-digit verification code
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && onVerifyOtp()}
              placeholder="• • • • • •"
              maxLength={6}
              className="w-full px-4 py-2.5 rounded-xl border border-navy/[0.12] text-center text-xl font-mono tracking-[0.4em] bg-white/80 focus:outline-none focus:ring-2 focus:ring-navy/20 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onBackToPhone}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy/50 hover:text-navy px-4 py-2.5 rounded-full border border-navy/[0.10] hover:border-navy/20 bg-white/60 transition-colors"
            >
              <X className="w-3 h-3" />
              Back
            </button>
            <button
              onClick={onVerifyOtp}
              disabled={busy || otp.length !== 6}
              className="inline-flex items-center gap-2 bg-navy disabled:bg-navy/40 hover:bg-navy-hover text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {busy ? 'Verifying…' : 'Verify'}
            </button>
            <button
              onClick={onResendOtp}
              disabled={busy}
              className="ml-auto text-xs text-navy/45 hover:text-navy/70 font-instrument underline underline-offset-2 disabled:opacity-40 transition-colors"
            >
              Resend code
            </button>
          </div>
        </div>
      )}

    </div>
  </div>
);
