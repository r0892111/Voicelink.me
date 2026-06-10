import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useI18n } from '../hooks/useI18n';

/**
 * Magic-link login for affiliate partners. Deliberately separate from the
 * customer auth flow (/signup, useAuth): partners have no CRM connection and
 * no teamleader_users row. Completing a login grants nothing by itself — the
 * affiliate-portal edge function only returns data for emails matching an
 * affiliates row.
 */
export function PartnerLogin() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState('sending');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/partner` },
    });
    setState(error ? 'error' : 'sent');
  };

  return (
    <div className="min-h-screen bg-porcelain flex flex-col items-center justify-center px-6">
      <img
        src="/Finit Voicelink Blue.svg"
        alt="VoiceLink"
        className="h-9 w-auto mb-10 cursor-pointer"
        onClick={() => navigate('/')}
      />
      <div className="w-full max-w-md bg-white rounded-2xl border border-navy/[0.07] shadow-sm p-8">
        <h1 className="font-general font-bold text-navy text-2xl tracking-tight mb-2">
          {t('partner.login.title')}
        </h1>
        <p className="text-navy/60 text-sm mb-6">{t('partner.login.subtitle')}</p>

        {state === 'sent' ? (
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-sm">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{t('partner.login.sent', { email: email.trim() })}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-navy mb-1.5" htmlFor="partner-email">
              {t('partner.login.email')}
            </label>
            <div className="relative mb-4">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/30" />
              <input
                id="partner-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-navy/15 focus:border-navy focus:ring-1 focus:ring-navy outline-none text-sm"
                placeholder="partner@company.com"
              />
            </div>
            {state === 'error' && (
              <p className="text-red-600 text-sm mb-4">{t('partner.login.error')}</p>
            )}
            <button
              type="submit"
              disabled={state === 'sending'}
              className="w-full bg-navy hover:bg-navy-hover disabled:opacity-60 text-white font-semibold py-2.5 rounded-full flex items-center justify-center gap-2 transition-colors"
            >
              <span>{state === 'sending' ? t('partner.login.sending') : t('partner.login.send')}</span>
              {state !== 'sending' && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}
      </div>
      <p className="text-navy/40 text-xs mt-6">{t('partner.login.hint')}</p>
    </div>
  );
}
