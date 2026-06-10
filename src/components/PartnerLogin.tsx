import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useI18n } from '../hooks/useI18n';

/**
 * Login for affiliate partners. Deliberately separate from the customer auth
 * flow (/signup, useAuth): partners have no CRM connection and no
 * teamleader_users row. Logging in grants nothing by itself — the
 * affiliate-portal edge function only returns data for a matching
 * affiliates row.
 *
 * Two methods: email + password (set from the portal after first login),
 * and a magic link — which is also the first-login bootstrap and the
 * de-facto password recovery, so there is no separate reset flow.
 */
export function PartnerLogin() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<'password' | 'link' | null>(null);
  const [error, setError] = useState<'password' | 'link' | 'notPartner' | null>(null);
  const [linkSent, setLinkSent] = useState(false);

  // Only emails on an active affiliates row may log in. Fails open on
  // transient errors — the portal still 403s non-partners after auth.
  const isPartnerEmail = async (): Promise<boolean> => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/affiliate-portal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ action: 'precheck', email: email.trim() }),
        },
      );
      if (!res.ok) return true;
      const data = await res.json();
      return data.exists !== false;
    } catch {
      return true;
    }
  };

  const signInWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setBusy('password');
    setError(null);
    if (!(await isPartnerEmail())) {
      setError('notPartner');
      setBusy(null);
      return;
    }
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (err) {
      setError('password');
      setBusy(null);
      return;
    }
    navigate('/partner', { replace: true });
  };

  const sendLink = async () => {
    if (!email.trim()) return;
    setBusy('link');
    setError(null);
    if (!(await isPartnerEmail())) {
      setError('notPartner');
      setBusy(null);
      return;
    }
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/partner` },
    });
    setBusy(null);
    if (err) setError('link');
    else setLinkSent(true);
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

        {linkSent ? (
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-sm">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{t('partner.login.sent', { email: email.trim() })}</span>
          </div>
        ) : (
          <>
            <form onSubmit={signInWithPassword}>
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
              <label className="block text-sm font-medium text-navy mb-1.5" htmlFor="partner-password">
                {t('partner.login.password')}
              </label>
              <div className="relative mb-4">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/30" />
                <input
                  id="partner-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-navy/15 focus:border-navy focus:ring-1 focus:ring-navy outline-none text-sm"
                  placeholder="••••••••"
                />
              </div>
              {error === 'password' && (
                <p className="text-red-600 text-sm mb-4">{t('partner.login.invalid')}</p>
              )}
              {error === 'notPartner' && (
                <p className="text-red-600 text-sm mb-4">{t('partner.login.notPartner')}</p>
              )}
              <button
                type="submit"
                disabled={busy !== null}
                className="w-full bg-navy hover:bg-navy-hover disabled:opacity-60 text-white font-semibold py-2.5 rounded-full flex items-center justify-center gap-2 transition-colors"
              >
                <span>{busy === 'password' ? t('partner.login.signingIn') : t('partner.login.signIn')}</span>
                {busy !== 'password' && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-navy/10" />
              <span className="text-navy/40 text-xs uppercase tracking-wider">{t('partner.login.orLink')}</span>
              <div className="flex-1 h-px bg-navy/10" />
            </div>

            {error === 'link' && (
              <p className="text-red-600 text-sm mb-3">{t('partner.login.error')}</p>
            )}
            <button
              type="button"
              onClick={sendLink}
              disabled={busy !== null || !email.trim()}
              className="w-full border border-navy/15 hover:border-navy/30 disabled:opacity-50 text-navy font-semibold py-2.5 rounded-full transition-colors text-sm"
            >
              {busy === 'link' ? t('partner.login.sending') : t('partner.login.sendLinkInstead')}
            </button>
          </>
        )}
      </div>
      <p className="text-navy/40 text-xs mt-6">{t('partner.login.hint')}</p>
    </div>
  );
}
