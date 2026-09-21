// ── OdooConnectForm ───────────────────────────────────────────────────────────
// Presentational: the dashboard's inline "Connect Odoo" step (same shape as
// WhatsAppConnectForm). All state and the submit come from useOdooConnect.
// The API key input is type=password with autocomplete off; nothing here
// stores anything.

import React from 'react';
import { AlertCircle, Loader2, Globe, Database, User, KeyRound, ExternalLink, ArrowRight } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

export interface OdooConnectFormProps {
  open: boolean;
  url: string;
  db: string;
  login: string;
  apiKey: string;
  busy: boolean;
  error: string | null;
  errorCode: string | null;
  onUrlChange(v: string): void;
  onDbChange(v: string): void;
  onLoginChange(v: string): void;
  onApiKeyChange(v: string): void;
  onSubmit(): void;
}

const KNOWN_CODES = new Set([
  'missing_fields', 'odoo_bad_url', 'odoo_unreachable', 'odoo_bad_credentials', 'odoo_db_unknown',
  'odoo_crm_missing', 'odoo_plan_gate', 'odoo_error', 'odoo_already_linked', 'not_configured',
  'db_error', 'unauthorized', 'unexpected',
]);

const inputClass = 'w-full pl-10 pr-3 py-2.5 text-sm border border-navy/10 rounded-xl focus:ring-2 focus:ring-navy focus:border-transparent bg-white transition-all';

export const OdooConnectForm: React.FC<OdooConnectFormProps> = ({
  open, url, db, login, apiKey, busy, error, errorCode,
  onUrlChange, onDbChange, onLoginChange, onApiKeyChange, onSubmit,
}) => {
  const { t } = useI18n();
  const message = errorCode
    ? (KNOWN_CODES.has(errorCode) ? t(`auth.odoo.errors.${errorCode}`) : (error || t('auth.odoo.errors.unexpected')))
    : null;
  return (
    <div className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ maxHeight: open ? '900px' : '0px' }}>
      <div className="border border-t-0 border-navy/[0.09] rounded-b-2xl bg-white/70 backdrop-blur-sm px-5 py-5">
        <div className="mb-4 p-3 bg-navy/5 border border-navy/10 rounded-xl text-xs font-instrument text-slate-blue space-y-1">
          <p>{t('auth.odoo.howTo')}</p>
          <p>{t('auth.odoo.planNote')}</p>
          <a href="https://www.odoo.com/documentation/19.0/developer/reference/external_api.html#api-keys" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-navy hover:underline font-medium">
            <span>{t('auth.odoo.docsLink')}</span><ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {message && (
          <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-instrument">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        <form className="space-y-3" autoComplete="off" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <div>
            <label htmlFor="odoo-url" className="block text-xs font-instrument font-medium text-navy mb-1">{t('auth.odoo.url')}</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-blue" />
              <input id="odoo-url" type="url" value={url} onChange={(e) => onUrlChange(e.target.value)} placeholder="https://yourcompany.odoo.com" inputMode="url" spellCheck={false} className={inputClass} />
            </div>
            <p className="text-[11px] text-navy/45 font-instrument mt-1">{t('auth.odoo.urlHint')}</p>
          </div>
          <div>
            <label htmlFor="odoo-db" className="block text-xs font-instrument font-medium text-navy mb-1">{t('auth.odoo.db')}</label>
            <div className="relative">
              <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-blue" />
              <input id="odoo-db" type="text" value={db} onChange={(e) => onDbChange(e.target.value)} placeholder="yourcompany" spellCheck={false} className={inputClass} />
            </div>
            <p className="text-[11px] text-navy/45 font-instrument mt-1">{t('auth.odoo.dbHint')}</p>
          </div>
          <div>
            <label htmlFor="odoo-login" className="block text-xs font-instrument font-medium text-navy mb-1">{t('auth.odoo.login')}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-blue" />
              <input id="odoo-login" type="text" value={login} onChange={(e) => onLoginChange(e.target.value)} placeholder="voicelink@yourcompany.com" autoComplete="off" spellCheck={false} className={inputClass} />
            </div>
            <p className="text-[11px] text-navy/45 font-instrument mt-1">{t('auth.odoo.loginHint')}</p>
          </div>
          <div>
            <label htmlFor="odoo-key" className="block text-xs font-instrument font-medium text-navy mb-1">{t('auth.odoo.apiKey')}</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-blue" />
              <input id="odoo-key" type="password" value={apiKey} onChange={(e) => onApiKeyChange(e.target.value)} placeholder="••••••••••••••••" autoComplete="new-password" spellCheck={false} className={inputClass} />
            </div>
            <p className="text-[11px] text-navy/45 font-instrument mt-1">{t('auth.odoo.apiKeyHint')}</p>
          </div>
          <button type="submit" disabled={busy || !url || !db || !login || !apiKey}
            className="w-full inline-flex items-center justify-center gap-2 bg-navy text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-navy-hover disabled:bg-muted-blue transition-colors">
            {busy ? <><Loader2 className="w-4 h-4 animate-spin" /><span>{t('auth.odoo.connecting')}</span></> : <><span>{t('auth.odoo.connect')}</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
};
