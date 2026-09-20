// ── ResetPassword ─────────────────────────────────────────────────────────────
// Lands the "Forgot password?" e-mail (AuthPage, Odoo accounts — the only
// password accounts on the portal). Supabase's recovery link opens this page
// with a one-time token in the URL; supabase-js turns it into a session on
// load (PASSWORD_RECOVERY), and the form sets the new password on that
// session. Nothing here is a login link: the account keeps its password.
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useI18n } from '../hooks/useI18n';
import { withUTM } from '../utils/utm';

type Ready = 'checking' | 'ready' | 'expired';

export const ResetPassword: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [ready, setReady] = useState<Ready>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === 'PASSWORD_RECOVERY' || (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION'))) setReady('ready');
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled && session) setReady('ready');
    });
    // The token in the URL is parsed asynchronously; a page opened without one
    // (or with a used/expired link) never gets a session.
    const timer = setTimeout(() => { if (!cancelled) setReady((r) => (r === 'checking' ? 'expired' : r)); }, 4000);
    return () => { cancelled = true; subscription.unsubscribe(); clearTimeout(timer); };
  }, []);

  const save = async () => {
    if (busy) return;
    if (password.length < 8) { setError(t('auth.odoo.account.errors.passwordShort')); return; }
    if (password !== confirm) { setError(t('auth.odoo.account.errors.passwordMismatch')); return; }
    setBusy(true);
    setError(null);
    try {
      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) { setError(updErr.message); return; }
      setSaved(true);
      setTimeout(() => navigate(withUTM('/dashboard')), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('auth.odoo.account.errors.unexpected'));
    } finally {
      setBusy(false);
    }
  };

  const inputClass = 'w-full pl-12 pr-12 py-3.5 text-base border-2 border-navy/10 rounded-xl focus:ring-2 focus:ring-navy focus:border-transparent bg-white transition-all';

  return (
    <div className="min-h-screen bg-porcelain flex items-start justify-center px-6 pt-16 pb-24 font-instrument">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm border border-navy/[0.08] rounded-3xl shadow-sm p-7 sm:p-9">
        <h1 className="text-2xl sm:text-3xl font-general font-bold text-navy mb-2">{t('auth.odoo.reset.title')}</h1>
        <p className="text-sm sm:text-base text-slate-blue mb-6">{t('auth.odoo.reset.subtitle')}</p>

        {ready === 'checking' && (
          <div className="flex items-center gap-2 text-slate-blue text-sm"><Loader2 className="w-4 h-4 animate-spin" /><span>{t('auth.odoo.reset.checking')}</span></div>
        )}

        {ready === 'expired' && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-amber-800 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div><p className="font-semibold">{t('auth.odoo.reset.expiredTitle')}</p><p>{t('auth.odoo.reset.expiredBody')}</p></div>
            </div>
            <button type="button" onClick={() => navigate(withUTM('/signin'))} className="text-navy hover:underline text-sm font-medium">{t('auth.odoo.reset.requestNew')}</button>
          </div>
        )}

        {ready === 'ready' && saved && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div><p className="font-semibold">{t('auth.odoo.reset.savedTitle')}</p><p>{t('auth.odoo.reset.savedBody')}</p></div>
          </div>
        )}

        {ready === 'ready' && !saved && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save(); }}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{error}</span>
              </div>
            )}
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-navy mb-1.5">{t('auth.odoo.reset.newPassword')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-blue" />
                <input id="new-password" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className={inputClass} />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-blue hover:text-navy" aria-label={show ? 'Hide password' : 'Show password'}>
                  {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-slate-blue mt-1">{t('auth.odoo.account.passwordHint')}</p>
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-navy mb-1.5">{t('auth.odoo.reset.confirmPassword')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-blue" />
                <input id="confirm-password" type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" className={inputClass} />
              </div>
            </div>
            <button type="submit" disabled={busy || !password || !confirm}
              className="w-full bg-navy hover:bg-navy-hover disabled:bg-muted-blue text-white font-general font-semibold text-base py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
              {busy ? <><Loader2 className="w-5 h-5 animate-spin" /><span>{t('auth.odoo.reset.saving')}</span></> : <span>{t('auth.odoo.reset.save')}</span>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
