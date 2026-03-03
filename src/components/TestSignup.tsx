import React from 'react';
import { supabase } from '../lib/supabase';
import { whatsappService } from '../services/whatsappService';
import { MessageCircle, Loader2, Check, AlertCircle, ArrowLeft } from 'lucide-react';

const phoneRegex = /^\+[1-9]\d{6,14}$/;
const normalizePhone = (v: string) => v.trim().replace(/[\s\-().]/g, '');
const isValidPhone   = (v: string) => phoneRegex.test(normalizePhone(v));

type Step = 'phone' | 'otp' | 'success';

export const TestSignup: React.FC = () => {
  const [phone,          setPhone]         = React.useState('');
  const [otp,            setOtp]           = React.useState('');
  const [step,           setStep]          = React.useState<Step>('phone');
  const [busy,           setBusy]          = React.useState(false);
  const [error,          setError]         = React.useState<string | null>(null);
  const [testUserId,     setTestUserId]    = React.useState<string | null>(null);
  const [confirmedPhone, setConfirmedPhone] = React.useState('');

  // ── Phone lookup + OTP send ────────────────────────────────────────────────
  const handleSendOtp = async () => {
    const normalized = normalizePhone(phone);
    if (!isValidPhone(normalized)) {
      setError('Enter a valid number with country code — e.g. +32 456 789 123.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('test_users')
        .select('user_id, whatsapp_status')
        .eq('phone', normalized)
        .maybeSingle();

      if (dbError) throw new Error('Something went wrong. Please try again.');
      if (!data) {
        setError("This number isn't in our system. Reach out if you think that's a mistake.");
        return;
      }

      await whatsappService.sendOtp('test', data.user_id, normalized);
      setTestUserId(data.user_id);
      setConfirmedPhone(normalized);
      setStep('otp');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send code. Try again.');
    } finally {
      setBusy(false);
    }
  };

  // ── OTP verify ────────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (!testUserId || otp.length !== 6) {
      setError('Enter the 6-digit code you received on WhatsApp.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await whatsappService.verifyOtp('test', testUserId, otp.trim());
      whatsappService.sendWelcome('test', testUserId, confirmedPhone).catch(() => {});
      setStep('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid code. Try again.');
    } finally {
      setBusy(false);
    }
  };

  // ── Resend ────────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!testUserId) return;
    setOtp('');
    setError(null);
    setBusy(true);
    try {
      await whatsappService.sendOtp('test', testUserId, confirmedPhone);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to resend. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-porcelain flex items-center justify-center p-6 font-instrument">

      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/Finit Voicelink Blue.svg" alt="VoiceLink" className="h-7 w-auto" />
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-navy/[0.07] overflow-hidden">

          {/* ── Phone step ── */}
          {step === 'phone' && (
            <div className="p-8">
              <h1 className="font-general text-xl font-bold text-navy mb-1.5">
                Connect your WhatsApp
              </h1>
              <p className="text-sm text-slate-blue mb-7">
                Enter the phone number we have on file for you.
              </p>

              {error && (
                <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-navy/60 mb-1.5">
                    WhatsApp number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setError(null); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    placeholder="+32 456 789 123"
                    className="w-full px-4 py-3 rounded-xl border border-navy/[0.12] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy/30 transition-all"
                    autoFocus
                  />
                  <p className="text-xs text-navy/35 mt-1.5">
                    Include your country code — e.g. +32 for Belgium.
                  </p>
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={busy || !phone.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 bg-navy hover:bg-navy-hover disabled:bg-navy/40 text-white text-sm font-semibold py-3 rounded-full transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed"
                >
                  {busy
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Checking…</>
                    : 'Continue'
                  }
                </button>
              </div>
            </div>
          )}

          {/* ── OTP step ── */}
          {step === 'otp' && (
            <div className="p-8">
              <button
                onClick={() => { setStep('phone'); setOtp(''); setError(null); }}
                className="flex items-center gap-1.5 text-xs text-navy/45 hover:text-navy mb-5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>

              <h1 className="font-general text-xl font-bold text-navy mb-1.5">
                Check WhatsApp
              </h1>
              <p className="text-sm text-slate-blue mb-1">
                We sent a 6-digit code to
              </p>
              <p className="text-sm font-semibold text-navy mb-6">{confirmedPhone}</p>

              {error && (
                <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-3">
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(null); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                  placeholder="· · · · · ·"
                  maxLength={6}
                  className="w-full px-4 py-3.5 rounded-xl border border-navy/[0.12] text-center text-2xl font-mono tracking-[0.5em] bg-white focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy/30 transition-all"
                  autoFocus
                />

                <button
                  onClick={handleVerifyOtp}
                  disabled={busy || otp.length !== 6}
                  className="w-full inline-flex items-center justify-center gap-2 bg-navy hover:bg-navy-hover disabled:bg-navy/40 text-white text-sm font-semibold py-3 rounded-full transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed"
                >
                  {busy
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying…</>
                    : <><Check className="w-4 h-4" />Verify</>
                  }
                </button>

                <button
                  onClick={handleResend}
                  disabled={busy}
                  className="w-full text-xs text-navy/40 hover:text-navy/70 transition-colors py-1 text-center disabled:opacity-40"
                >
                  Didn't get a message? Resend code
                </button>
              </div>
            </div>
          )}

          {/* ── Success step ── */}
          {step === 'success' && (
            <div className="p-10 text-center">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <Check className="w-6 h-6 text-emerald-500" strokeWidth={2.5} />
              </div>
              <h1 className="font-general text-xl font-bold text-navy mb-2">You're all set</h1>
              <p className="text-sm text-slate-blue leading-relaxed">
                Your WhatsApp is connected. VoiceLink will now sync your voice messages to your CRM.
              </p>
            </div>
          )}

        </div>

        {/* Footer note */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <MessageCircle className="w-3.5 h-3.5 text-navy/25" />
          <p className="text-xs text-navy/30 text-center">
            Questions?{' '}
            <a
              href="mailto:support@voicelink.me"
              className="hover:text-navy/60 transition-colors underline underline-offset-2"
            >
              support@voicelink.me
            </a>
          </p>
        </div>

      </div>
    </div>
  );
};
