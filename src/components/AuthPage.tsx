import React from 'react';
import { Loader2, AlertCircle, ArrowRight, ArrowLeft, Globe, Database, User, KeyRound, ExternalLink } from 'lucide-react';
import { AuthProvider } from '../types/auth';
import { AuthService } from '../services/authService';
import { authProviders } from '../config/authProviders';
import { useI18n } from '../hooks/useI18n';
import { withUTM } from '../utils/utm';
import { trackSignupStart } from '../utils/analytics';
import { LanguageSwitcher } from './LanguageSwitcher';
import { usePageTransition } from '../hooks/usePageTransition';
import { clearTestFlow } from '../utils/testFlow';

interface AuthPageProps {
  initialMode?: 'signup' | 'login';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'signup' }) => {
  const { t } = useI18n();
  const { navigateWithTransition } = usePageTransition();
  const [loadingProvider, setLoadingProvider] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const processingRef = React.useRef(false);

  const [globalAuthMode, setGlobalAuthMode] = React.useState<'signup' | 'login'>(initialMode);
  const [redirectingMessage, setRedirectingMessage] = React.useState<string | null>(null);

  // Odoo credentials form (spec D3, OD-17). The key lives in component state
  // for the one request that carries it — never localStorage, never the URL,
  // never the portal's own tables.
  const [showOdooConnect, setShowOdooConnect] = React.useState(false);
  const [odooUrl, setOdooUrl] = React.useState('');
  const [odooDb, setOdooDb] = React.useState('');
  const [odooDbTouched, setOdooDbTouched] = React.useState(false);
  const [odooLogin, setOdooLogin] = React.useState('');
  const [odooKey, setOdooKey] = React.useState('');
  const [odooLoading, setOdooLoading] = React.useState(false);
  const [odooError, setOdooError] = React.useState<string | null>(null);

  // Catermonkey and Odoo ship "coming soon": both flows are built but not yet
  // accepted end to end with a real phone (Odoo: OD-20). Remove a name from
  // this list to go live — everything behind the button is already wired.
  // `?enable=odoo` switches one on for THIS visit only: the acceptance
  // tester's door, not something a visitor stumbles into.
  const enabledByQuery = React.useMemo(
    () => new Set((new URLSearchParams(window.location.search).get('enable') || '').split(',').map((v) => v.trim()).filter(Boolean)),
    [],
  );
  const disabledProviders: string[] = ['catermonkey', 'odoo'].filter((name) => !enabledByQuery.has(name));

  // Clear any leftover test-user flags on mount. If the visitor is on /signup,
  // they're doing the real flow — stale keys from a prior /test-dashboard
  // session would otherwise cause AuthCallback to mark the new account as a
  // test user and inject a phantom WhatsApp number. The TTL guard in
  // consumeTestFlow is a second line of defence; this explicit clear is the
  // first.
  React.useEffect(() => {
    clearTestFlow();
  }, []);

  /* ─── Auth handlers (unchanged) ─── */

  const handleSignIn = async (provider: AuthProvider) => {
    if (processingRef.current || loadingProvider) return;
    if (provider.kind === 'credentials') {
      // No redirect: the form on this page does the connecting.
      setError(null);
      setOdooError(null);
      setShowOdooConnect(true);
      return;
    }

    try {
      processingRef.current = true;
      setLoadingProvider(provider.name);
      setError(null);
      if (globalAuthMode === 'signup') trackSignupStart();

      if (provider.name === 'catermonkey') {
        // VoiceLink's backend owns the MCP OAuth flow; the start URL lives in
        // AuthService so /test/catermonkey uses the very same code path.
        const result = await AuthService.createCatermonkeyMcpAuth().initiateAuth();
        if (!result.success && result.error) setError(result.error);
        return;
      }

      localStorage.setItem('userPlatform', provider.name);
      localStorage.setItem('auth_provider', provider.name);

      let authService: AuthService;
      switch (provider.name) {
        case 'teamleader': authService = AuthService.createTeamleaderAuth(); break;
        case 'pipedrive': authService = AuthService.createPipedriveAuth(); break;
        default: console.error('Unknown provider:', provider.name); return;
      }

      const result = await authService.initiateAuth();
      if (!result.success && result.error) {
        setError(`${t('auth.authenticationFailedFor', { provider: provider.displayName })}: ${result.error}`);
        localStorage.removeItem('userPlatform');
        localStorage.removeItem('auth_provider');
      }
    } catch (error) {
      setError(`Error signing in with ${provider.displayName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      localStorage.removeItem('userPlatform');
      localStorage.removeItem('auth_provider');
    } finally {
      setLoadingProvider(null);
      processingRef.current = false;
    }
  };

  /* ─── Odoo: credentials form (spec D3, OD-17) ───
     The odoo-connect edge function has VoiceLink prove the key against the
     instance and store it, creates or reuses the portal account keyed by
     the Odoo identity (never by e-mail), and answers with a session link. */

  const deriveOdooDb = (url: string): string => {
    // Odoo Online: the database is the subdomain (VERIFIED #9 — every Online
    // database seen so far). Self-hosted: nothing to derive, the user types it.
    try {
      const host = new URL(url.trim()).hostname.toLowerCase();
      const m = host.match(/^([a-z0-9-]+)\.odoo\.com$/);
      return m ? m[1] : '';
    } catch {
      return '';
    }
  };

  const handleOdooUrlChange = (value: string) => {
    setOdooUrl(value);
    if (!odooDbTouched) setOdooDb(deriveOdooDb(value));
  };

  const ODOO_ERROR_CODES = ['odoo_bad_url', 'odoo_unreachable', 'odoo_bad_credentials', 'odoo_db_unknown', 'odoo_crm_missing', 'odoo_plan_gate', 'odoo_error', 'not_configured', 'db_error', 'session_failed'];
  const odooErrorText = (code: unknown, fallback: unknown): string => {
    if (typeof code === 'string' && ODOO_ERROR_CODES.includes(code)) return t(`auth.odoo.errors.${code}`);
    return typeof fallback === 'string' && fallback ? fallback : t('auth.odoo.errors.unexpected');
  };

  const handleOdooConnect = async () => {
    if (odooLoading) return;
    const url = odooUrl.trim().replace(/\/+$/, '');
    const db = odooDb.trim();
    const login = odooLogin.trim();
    const apiKey = odooKey.replace(/\s+/g, ''); // pasted with spaces or line breaks
    if (!url || !db || !login || !apiKey) { setOdooError(t('auth.odoo.errors.missing_fields')); return; }
    if (!/^https:\/\/[^/?#]+$/i.test(url)) { setOdooError(t('auth.odoo.errors.odoo_bad_url')); return; }

    setOdooLoading(true);
    setOdooError(null);
    if (globalAuthMode === 'signup') trackSignupStart();
    try {
      const language = (localStorage.getItem('i18nextLng') || navigator.language || 'nl').slice(0, 2);
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/odoo-connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ url, db, login, api_key: apiKey, redirect_uri: `${window.location.origin}/dashboard`, language }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result?.success || typeof result.session_url !== 'string') {
        setOdooError(odooErrorText(result?.code, result?.error));
        return;
      }
      setOdooKey('');
      localStorage.setItem('userPlatform', 'odoo');
      localStorage.setItem('auth_provider', 'odoo');
      setRedirectingMessage(t('auth.odoo.connected'));
      window.location.href = result.session_url;
    } catch (err) {
      setOdooError(err instanceof Error ? err.message : t('auth.odoo.errors.unexpected'));
    } finally {
      setOdooLoading(false);
    }
  };

  const getProviderLogo = (providerName: string) => {
    switch (providerName) {
      case 'teamleader': return '/Teamleader_Icon.svg';
      case 'pipedrive': return '/Pipedrive_id-7ejZnwv_0.svg';
      case 'odoo': return '/odoo_logo.svg';
      case 'catermonkey': return '/Catermonkey_Icon.png';
      default: return null;
    }
  };

  /* ─────────────────────────────────────────────
     Decorative SVG — diagonal corner waves
     Same 3-layer pattern as SectionDivider:
       1. Navy fill (corner area)
       2. Navy accent stripe (#1A2D63)
       3. Light accent stripe (#7B8DB5)
     ───────────────────────────────────────────── */
  const CornerWaves = () => (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none hidden md:block auth-animate-waves"
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* ── Top-left corner ──
          Navy fill extends all the way past the light stripe to eliminate gaps */}
      <path
        d="M-30,-30 L330,-30 C260,100 340,210 200,300 C60,390 110,460 -30,530 Z"
        fill="#1A2D63"
      />
      {/* Light accent stripe — thicker, endpoints bleed past viewport edges */}
      <path
        d="M310,-25 C250,90 330,200 195,290 C60,380 110,450 -25,520
           L-10,540 C105,475 65,395 210,305 C345,215 265,105 328,-10 L310,-25 Z"
        fill="#7B8DB5"
      />

      {/* ── Bottom-right corner ──
          Navy fill extends all the way past the light stripe */}
      <path
        d="M1470,930 L1110,930 C1180,800 1100,690 1240,600 C1380,510 1330,440 1470,370 Z"
        fill="#1A2D63"
      />
      {/* Light accent stripe — thicker, endpoints bleed past viewport edges */}
      <path
        d="M1130,925 C1190,800 1110,690 1245,600 C1380,510 1330,450 1465,380
           L1450,360 C1335,435 1375,495 1230,585 C1095,675 1175,795 1112,910 L1130,925 Z"
        fill="#7B8DB5"
      />
    </svg>
  );

  /* ─── Sub-screen: Connect Odoo ─── */

  const odooInputClass = 'w-full pl-12 pr-4 py-3.5 text-base border-2 border-navy/10 rounded-xl focus:ring-2 focus:ring-navy focus:border-transparent bg-white transition-all';

  const renderOdooConnect = () => (
    <div className="w-full max-w-lg mx-auto lg:ml-auto lg:mr-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-general font-bold text-navy mb-3">{t('auth.odoo.title')}</h1>
        <p className="text-lg sm:text-xl font-instrument text-slate-blue">{t('auth.odoo.subtitle')}</p>
      </div>

      <div className="p-4 sm:p-5 bg-navy/5 border border-navy/10 rounded-xl mb-5">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm sm:text-base font-instrument text-slate-blue space-y-1.5">
            <p>{t('auth.odoo.howTo')}</p>
            <p>{t('auth.odoo.planNote')}</p>
            <a href="https://www.odoo.com/documentation/19.0/developer/reference/external_api.html#api-keys" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-navy hover:underline font-medium">
              <span>{t('auth.odoo.docsLink')}</span><ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {odooError && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{odooError}</p>
        </div>
      )}

      <form className="space-y-4" autoComplete="off" onSubmit={(e) => { e.preventDefault(); handleOdooConnect(); }}>
        <div>
          <label htmlFor="odoo-url" className="block text-sm sm:text-base font-instrument font-medium text-navy mb-1.5">{t('auth.odoo.url')} <span className="text-red-500">*</span></label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-blue" />
            <input type="url" id="odoo-url" value={odooUrl} onChange={(e) => handleOdooUrlChange(e.target.value)} placeholder="https://yourcompany.odoo.com" inputMode="url" spellCheck={false} className={odooInputClass} />
          </div>
          <p className="text-xs sm:text-sm font-instrument text-slate-blue mt-1">{t('auth.odoo.urlHint')}</p>
        </div>

        <div>
          <label htmlFor="odoo-db" className="block text-sm sm:text-base font-instrument font-medium text-navy mb-1.5">{t('auth.odoo.db')} <span className="text-red-500">*</span></label>
          <div className="relative">
            <Database className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-blue" />
            <input type="text" id="odoo-db" value={odooDb} onChange={(e) => { setOdooDbTouched(true); setOdooDb(e.target.value); }} placeholder="yourcompany" spellCheck={false} className={odooInputClass} />
          </div>
          <p className="text-xs sm:text-sm font-instrument text-slate-blue mt-1">{t('auth.odoo.dbHint')}</p>
        </div>

        <div>
          <label htmlFor="odoo-login" className="block text-sm sm:text-base font-instrument font-medium text-navy mb-1.5">{t('auth.odoo.login')} <span className="text-red-500">*</span></label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-blue" />
            <input type="text" id="odoo-login" value={odooLogin} onChange={(e) => setOdooLogin(e.target.value)} placeholder="voicelink@yourcompany.com" autoComplete="off" spellCheck={false} className={odooInputClass} />
          </div>
          <p className="text-xs sm:text-sm font-instrument text-slate-blue mt-1">{t('auth.odoo.loginHint')}</p>
        </div>

        <div>
          <label htmlFor="odoo-key" className="block text-sm sm:text-base font-instrument font-medium text-navy mb-1.5">{t('auth.odoo.apiKey')} <span className="text-red-500">*</span></label>
          <div className="relative">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-blue" />
            <input type="password" id="odoo-key" value={odooKey} onChange={(e) => setOdooKey(e.target.value)} placeholder="••••••••••••••••" autoComplete="new-password" spellCheck={false} className={odooInputClass} />
          </div>
          <p className="text-xs sm:text-sm font-instrument text-slate-blue mt-1">{t('auth.odoo.apiKeyHint')}</p>
        </div>

        <button type="submit" disabled={odooLoading || !odooUrl || !odooDb || !odooLogin || !odooKey}
          className="w-full bg-navy hover:bg-navy-hover disabled:bg-muted-blue text-white font-general font-semibold text-lg py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2">
          {odooLoading
            ? <><Loader2 className="w-5 h-5 animate-spin" /><span>{t('auth.odoo.connecting')}</span></>
            : <><span>{t('auth.odoo.connect')}</span><ArrowRight className="w-5 h-5" /></>}
        </button>

        {globalAuthMode === 'signup' && (
          <p className="text-sm font-instrument text-muted-blue text-center leading-relaxed">
            {t('auth.passiveTermsConsent')}{' '}
            <a href="/saas-agreement" className="text-navy hover:underline" target="_blank" rel="noopener noreferrer">{t('validation.saasAgreement')}</a>
            {' '}{t('common.and')}{' '}
            <a href="/privacy-policy" className="text-navy hover:underline" target="_blank" rel="noopener noreferrer">{t('validation.privacyPolicy')}</a>
          </p>
        )}
      </form>

      <div className="mt-6">
        <button type="button" onClick={() => { setShowOdooConnect(false); setOdooError(null); }} disabled={odooLoading}
          className="text-base text-slate-blue hover:text-navy transition-colors flex items-center space-x-1 mx-auto">
          <span>←</span><span>{t('auth.odoo.back')}</span>
        </button>
      </div>
    </div>
  );

  /* ─── Main CRM-provider form ─── */

  const renderMainForm = () => {
    const btnAnimClasses = ['auth-animate-btn-1', 'auth-animate-btn-2', 'auth-animate-btn-3'];
    return (
    <div className="w-full max-w-lg mx-auto lg:ml-auto lg:mr-8">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-general font-bold text-navy mb-3 text-center leading-tight auth-animate-title">
        {globalAuthMode === 'signup' ? t('auth.modal.title') : t('auth.signInToAccount')}
      </h1>

      <p className="text-lg sm:text-xl font-instrument text-slate-blue mb-6 text-center auth-animate-subtitle">
        {globalAuthMode === 'signup' ? t('auth.page.signupSubtitle') : t('auth.modal.subtitle')}
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /><span className="text-sm sm:text-base">{error}</span>
        </div>
      )}

      <div className="space-y-3 mb-6">
        {authProviders.map((provider, idx) => {
          const isLoading = loadingProvider === provider.name;
          const isDisabled = disabledProviders.includes(provider.name);
          return (
            <button key={provider.name} onClick={() => !isDisabled && handleSignIn(provider)} disabled={loadingProvider !== null || isDisabled}
              className={`${btnAnimClasses[idx] || 'auth-animate-btn-3'} group w-full bg-white border-2 border-navy/10 text-navy font-semibold py-2.5 sm:py-4 px-4 sm:px-7 rounded-2xl transition-all duration-300 flex items-center justify-between shadow-sm ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-navy/20 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'}`}>
              {isLoading ? (
                <div className="flex items-center justify-center w-full">
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-navy mr-3" />
                  <span className="text-base sm:text-lg font-instrument text-slate-blue">{t('auth.connectingTo', { provider: provider.displayName })}</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-navy/5 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${!isDisabled && 'group-hover:bg-navy/10'}`}>
                      {getProviderLogo(provider.name)
                        ? <img src={getProviderLogo(provider.name) || ''} alt={provider.displayName} className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
                        : <provider.icon className="w-6 h-6 sm:w-7 sm:h-7 text-navy" aria-hidden="true" />}
                    </div>
                    <div className="text-left">
                      <div className="text-sm sm:text-lg font-general font-semibold text-navy leading-tight">
                        {provider.name === 'teamleader' && t('auth.page.continueTeamleader')}
                        {provider.name === 'pipedrive' && t('auth.page.continuePipedrive')}
                        {provider.name === 'odoo' && t('auth.page.continueOdoo')}
                        {provider.name === 'catermonkey' && t('auth.page.continueCatermonkey')}
                      </div>
                      <div className="text-xs sm:text-sm font-instrument text-muted-blue mt-0.5">
                        {isDisabled ? (['catermonkey', 'odoo'].includes(provider.name) ? t('auth.page.comingSoon') : t('auth.temporarilyUnavailable'))
                          : provider.name === 'odoo' ? t('auth.page.odooSubtitle')
                          : provider.name === 'catermonkey' ? t('auth.page.catermonkeySubtitle')
                          : t('auth.modal.startTrialInstantly')}
                      </div>
                    </div>
                  </div>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-navy/5 flex-shrink-0 flex items-center justify-center transition-colors ${!isDisabled && 'group-hover:bg-navy/10'}`}>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-navy" />
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>

      <div className="auth-animate-footer">
        {globalAuthMode === 'signup' && (
          <div className="mb-4">
            <p className="text-sm font-instrument text-muted-blue text-center leading-relaxed">
              {t('auth.passiveTermsConsent')}{' '}
              <a href="/saas-agreement" className="text-navy hover:underline" target="_blank" rel="noopener noreferrer">{t('validation.saasAgreement')}</a>
              {' '}{t('common.and')}{' '}
              <a href="/privacy-policy" className="text-navy hover:underline" target="_blank" rel="noopener noreferrer">{t('validation.privacyPolicy')}</a>
            </p>
          </div>
        )}

        <div className="text-center">
          <button onClick={() => { setGlobalAuthMode(globalAuthMode === 'signup' ? 'login' : 'signup'); setError(null); }}
            className="text-base font-instrument text-slate-blue hover:text-navy transition-colors">
            {globalAuthMode === 'signup' ? t('auth.alreadyHaveAccountSignIn') : t('auth.needAccountSignUp')}
          </button>
        </div>
      </div>
    </div>
    );
  };

  /* ─── Page layout ─── */

  return (
    <div className="h-screen bg-porcelain relative overflow-hidden flex flex-col">
      <CornerWaves />

      {/* Top-left corner wave — mobile only */}
      <svg
        className="absolute left-0 pointer-events-none block md:hidden"
        style={{ top: '-8px' }}
        width="128" height="240"
        viewBox="-30 -30 255 480"
        overflow="visible"
        aria-hidden="true"
      >
        <path d="M-30,-30 L220,-30 C170,60 230,140 130,200 C30,260 60,310 -30,360 L-30,430 Z" fill="#1A2D63" />
        <path d="M222,-55 C177,25 220,135 125,195 C30,255 30,318 -55,368 L-34,397 C31,352 30,272 140,212 C240,157 197,42 236,-25 L222,-55 Z" fill="#7B8DB5" />
      </svg>
      {/* Bottom-right corner wave — mobile only */}
      <svg
        className="absolute bottom-0 right-0 pointer-events-none block md:hidden"
        style={{ bottom: '-6px' }}
        width="143" height="250"
        viewBox="1183 440 285 500"
        aria-hidden="true"
      >
        <path d="M1470,940 L1240,940 C1240,750 1200,690 1320,645 C1450,598 1400,540 1470,460 Z" fill="#1A2D63" />
        <path d="M1248,940 C1248,755 1205,693 1325,648 C1455,601 1405,543 1475,465 L1470,452 C1398,535 1448,595 1318,642 C1195,688 1232,750 1232,940 L1248,940 Z" fill="#7B8DB5" />
      </svg>

      {/* Top bar — back pill, logo, language switcher */}
      <div className="relative z-20 flex items-center justify-between px-6 sm:px-10 py-4 auth-animate-topbar shrink-0">
        <div className="flex flex-col items-start gap-4">
          <button
            onClick={() => navigateWithTransition(withUTM('/'))}
            className="group inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 text-navy group-hover:-translate-x-0.5 transition-all" />
            <span className="hidden md:inline text-sm font-instrument font-medium text-navy">{t('auth.backToHome')}</span>
          </button>
          <img
            src="/Finit Voicelink White.svg"
            alt={t('common.voiceLink')}
            className="hidden md:block h-12 sm:h-14 w-auto"
          />
        </div>
        {/* Mobile-only: centered blue logo */}
        <img
          src="/Finit Voicelink Blue.svg"
          alt={t('common.voiceLink')}
          className="block md:hidden absolute left-1/2 -translate-x-1/2 h-9 w-auto pointer-events-none"
        />
        <div>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0 md:-mt-[9vh]">
        {/* Left side: form — centered on mobile, pushed toward center on desktop */}
        <div className="w-full lg:w-[55%] flex items-center justify-center lg:justify-end relative z-10 px-6 sm:px-10 lg:pl-4 lg:pr-0 pb-[32vh] lg:pb-0">
          {redirectingMessage && (
            <div className="absolute inset-0 bg-porcelain/95 backdrop-blur-sm flex flex-col items-center justify-center z-50 px-6">
              <div className="w-14 h-14 rounded-2xl bg-navy/[0.05] flex items-center justify-center mb-5">
                <Loader2 className="w-6 h-6 text-navy/60 animate-spin" />
              </div>
              <p className="text-lg font-general font-semibold text-navy text-center">{redirectingMessage}</p>
              <p className="text-sm font-instrument text-navy/55 mt-1.5 text-center">{t('auth.pleaseWait')}</p>
            </div>
          )}

          {showOdooConnect ? renderOdooConnect() : renderMainForm()}
        </div>

        {/* Right side: phone mock — vertically centered */}
        <div className="hidden lg:flex w-[45%] items-center justify-start relative z-10 auth-animate-phone" style={{ marginTop: '-3vh', marginLeft: '-1rem' }}>
          <img
            src="/whatsapp phone mock.png"
            alt="VoiceLink WhatsApp integration"
            className="relative z-10"
            style={{
              width: 'clamp(250px, 30vw, 650px)',
              transform: 'rotate(5deg)',
              filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.15)) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1))',
            }}
          />
        </div>
      </div>
      {/* Mobile phone mock — pinned to bottom, behind form content */}
      <div className="block lg:hidden absolute left-1/2 -translate-x-1/2 pointer-events-none z-0" style={{ top: '65vh', width: 'min(380px, 88vw)' }}>
        <img
          src="/whatsapp phone mock.png"
          alt=""
          aria-hidden="true"
          style={{
            width: '100%',
            height: 'auto',
            transform: 'rotate(5deg)',
            filter: 'drop-shadow(0 12px 20px rgba(0, 0, 0, 0.15))',
          }}
        />
      </div>
    </div>
  );
};
