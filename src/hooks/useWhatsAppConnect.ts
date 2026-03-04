// ── useWhatsAppConnect ────────────────────────────────────────────────────────
// SRP: manages all state for the WhatsApp connection flow.
// DIP: depends on IWhatsAppService, not on raw fetch calls.

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { whatsappService } from '../services/whatsappService';
import type { AuthUser } from './useAuth';

export type WhatsAppStatus = 'not_set' | 'pending' | 'active';
export type WaStep = 'phone' | 'otp';

const phoneRegex = /^\+[1-9]\d{1,14}$/;
export const isValidPhone = (v: string) => phoneRegex.test(v.trim());

export interface WhatsAppConnect {
  // DB state
  status: WhatsAppStatus;
  number: string | null;
  // Form state
  open: boolean;
  step: WaStep;
  phone: string;
  otp: string;
  busy: boolean;
  error: string | null;
  success: boolean;
  // Actions
  toggle(): void;
  setPhone(v: string): void;
  setOtp(v: string): void;
  sendOtp(): Promise<void>;
  verifyOtp(): Promise<void>;
  backToPhone(): void;
  resendOtp(): Promise<void>;
  reset(): void;
}

export function useWhatsAppConnect(user: AuthUser | null): WhatsAppConnect {
  const [status, setStatus]   = useState<WhatsAppStatus>('not_set');
  const [number, setNumber]   = useState<string | null>(null);
  const [open, setOpen]       = useState(false);
  const [step, setStep]       = useState<WaStep>('phone');
  const [phone, setPhone]     = useState('');
  const [otp, setOtp]         = useState('');
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch initial WhatsApp status from DB
  useEffect(() => {
    if (!user) return;
    supabase
      .from(`${user.platform}_users`)
      .select('whatsapp_number, whatsapp_status')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setStatus(data.whatsapp_status || 'not_set');
          setNumber(data.whatsapp_number);
        }
      });
  }, [user]);

  const toggle = useCallback(() => {
    setOpen((o) => !o);
    setError(null);
  }, []);

  const sendOtp = useCallback(async () => {
    if (!user || !isValidPhone(phone)) {
      setError('Please enter a valid international phone number (e.g. +32 123 456 789).');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await whatsappService.sendOtp(user.platform, user.id, phone.trim());
      setStep('otp');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send code. Try again.');
    } finally {
      setBusy(false);
    }
  }, [user, phone]);

  const verifyOtp = useCallback(async () => {
    if (!user || otp.length !== 6) {
      setError('Please enter the 6-digit code from WhatsApp.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await whatsappService.verifyOtp(user.platform, user.id, otp.trim());
      // Non-blocking welcome message — failures never surface to user
      whatsappService.sendWelcome(user.platform, user.id, phone.trim()).catch(() => {});
      setSuccess(true);
      setStatus('active');
      setNumber(phone.trim());
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setStep('phone');
        setPhone('');
        setOtp('');
      }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid code. Try again.');
    } finally {
      setBusy(false);
    }
  }, [user, otp, phone]);

  const backToPhone = useCallback(() => {
    setStep('phone');
    setOtp('');
    setError(null);
  }, []);

  const resendOtp = useCallback(async () => {
    setOtp('');
    setError(null);
    await sendOtp();
  }, [sendOtp]);

  const reset = useCallback(() => {
    setOpen(false);
    setStep('phone');
    setPhone('');
    setOtp('');
    setError(null);
    setSuccess(false);
  }, []);

  return {
    status, number,
    open, step, phone, otp, busy, error, success,
    toggle, setPhone, setOtp, sendOtp, verifyOtp, backToPhone, resendOtp, reset,
  };
}
