// ── useOdooConnect ────────────────────────────────────────────────────────────
// State for the dashboard's "Connect Odoo" step (trial-first sign-up, spec
// VoiceLink docs/crm-onboarding/odoo/specs/D3-portal.md rev. 2026-09-20).
// On mount it asks odoo-account to make sure the account has its row (a
// placeholder until the connect) and learns whether the Odoo is connected.
// Submitting posts the credentials ONCE to odoo-connect with the session
// JWT; the key lives in this hook's state for that request and nowhere else.

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { AuthUser } from './useAuth';

export type OdooStatus = 'unknown' | 'pending' | 'connected';

export interface OdooConnect {
  status: OdooStatus;
  instance: string | null;
  login: string | null;
  open: boolean;
  url: string;
  db: string;
  odooLogin: string;
  apiKey: string;
  busy: boolean;
  error: string | null;
  errorCode: string | null;
  success: boolean;
  toggle(): void;
  setUrl(v: string): void;
  setDb(v: string): void;
  setOdooLogin(v: string): void;
  setApiKey(v: string): void;
  submit(): Promise<void>;
}

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

/** Odoo Online: the database is the subdomain. Self-hosted: nothing to derive. */
export function deriveOdooDb(url: string): string {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    const m = host.match(/^([a-z0-9-]+)\.odoo\.com$/);
    return m ? m[1] : '';
  } catch {
    return '';
  }
}

export function useOdooConnect(user: AuthUser | null): OdooConnect {
  const [status, setStatus] = useState<OdooStatus>('unknown');
  const [instance, setInstance] = useState<string | null>(null);
  const [login, setLogin] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [url, setUrlState] = useState('');
  const [db, setDbState] = useState('');
  const [dbTouched, setDbTouched] = useState(false);
  const [odooLogin, setOdooLogin] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isOdoo = user?.platform === 'odoo';

  useEffect(() => {
    if (!user || !isOdoo) return;
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      try {
        const language = (localStorage.getItem('i18nextLng') || navigator.language || 'nl').slice(0, 2);
        const res = await fetch(`${FN_BASE}/odoo-account`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ language }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (data?.success && data.status === 'connected') {
          setStatus('connected');
          setInstance(data.instance ?? null);
          setLogin(data.login ?? null);
        } else if (data?.success) {
          setStatus('pending');
        }
      } catch {
        /* the step just stays "not connected"; the next load retries */
      }
    })();
    return () => { cancelled = true; };
  }, [user, isOdoo]);

  const setUrl = useCallback((v: string) => {
    setUrlState(v);
    if (!dbTouched) setDbState(deriveOdooDb(v));
  }, [dbTouched]);

  const setDb = useCallback((v: string) => {
    setDbTouched(true);
    setDbState(v);
  }, []);

  const submit = useCallback(async () => {
    if (busy) return;
    const cleanUrl = url.trim().replace(/\/+$/, '');
    const cleanDb = db.trim();
    const cleanLogin = odooLogin.trim();
    const cleanKey = apiKey.replace(/\s+/g, '');
    if (!cleanUrl || !cleanDb || !cleanLogin || !cleanKey) { setErrorCode('missing_fields'); setError(null); return; }
    if (!/^https:\/\/[^/?#]+$/i.test(cleanUrl)) { setErrorCode('odoo_bad_url'); setError(null); return; }
    setBusy(true);
    setError(null);
    setErrorCode(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setErrorCode('unauthorized'); return; }
      const language = (localStorage.getItem('i18nextLng') || navigator.language || 'nl').slice(0, 2);
      const res = await fetch(`${FN_BASE}/odoo-connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ url: cleanUrl, db: cleanDb, login: cleanLogin, api_key: cleanKey, language }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setErrorCode(typeof data?.code === 'string' ? data.code : 'unexpected');
        setError(typeof data?.error === 'string' ? data.error : null);
        return;
      }
      setApiKey('');
      setStatus('connected');
      setInstance(data.instance ?? cleanUrl);
      setLogin(data.login ?? cleanLogin);
      setSuccess(true);
      setOpen(false);
    } catch (e) {
      setErrorCode('unexpected');
      setError(e instanceof Error ? e.message : null);
    } finally {
      setBusy(false);
    }
  }, [busy, url, db, odooLogin, apiKey]);

  return {
    status, instance, login, open, url, db, odooLogin, apiKey, busy, error, errorCode, success,
    toggle: () => { setOpen((o) => !o); setError(null); setErrorCode(null); },
    setUrl, setDb, setOdooLogin, setApiKey, submit,
  };
}
