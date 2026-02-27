import React from 'react';
import { Loader2, AlertCircle, Mail, Lock, UserPlus, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AuthProvider } from '../types/auth';
import { AuthService } from '../services/authService';
import { authProviders } from '../config/authProviders';
import { useI18n } from '../hooks/useI18n';
import { StripeService } from '../services/stripeService';
import { withUTM } from '../utils/utm';
import { trackSignupStart } from '../utils/analytics';
import { LanguageSwitcher } from './LanguageSwitcher';
import { usePageTransition } from '../hooks/usePageTransition';

export const AuthPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { navigateWithTransition } = usePageTransition();
  const [loadingProvider, setLoadingProvider] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const processingRef = React.useRef(false);

  const [showOdooTypeSelection, setShowOdooTypeSelection] = React.useState(false);
  const [showSelfHostedLogin, setShowSelfHostedLogin] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSignup, setIsSignup] = React.useState(true);
  const [globalAuthMode, setGlobalAuthMode] = React.useState<'signup' | 'login'>('signup');
  const [emailLoading, setEmailLoading] = React.useState(false);
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [redirectingMessage, setRedirectingMessage] = React.useState<string | null>(null);

  const disabledProviders: string[] = [];

  /* ─── Auth handlers (unchanged) ─── */

  const handleSignIn = async (provider: AuthProvider) => {
    if (processingRef.current || loadingProvider) return;
    if (provider.name === 'odoo') { setShowOdooTypeSelection(true); return; }

    try {
      processingRef.current = true;
      setLoadingProvider(provider.name);
      setError(null);
      if (globalAuthMode === 'signup') trackSignupStart();

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

  const handleOdooCloudAuth = async () => {
    try {
      processingRef.current = true;
      setLoadingProvider('odoo');
      setError(null);
      if (globalAuthMode === 'signup') trackSignupStart();

      localStorage.setItem('userPlatform', 'odoo');
      localStorage.setItem('auth_provider', 'odoo');

      const authService = AuthService.createOdooAuth();
      const result = await authService.initiateAuth();
      if (!result.success && result.error) {
        setError(`${t('auth.authenticationFailedFor', { provider: 'Odoo' })}: ${result.error}`);
        localStorage.removeItem('userPlatform');
        localStorage.removeItem('auth_provider');
      }
    } catch (error) {
      setError(`Error signing in with Odoo: ${error instanceof Error ? error.message : 'Unknown error'}`);
      localStorage.removeItem('userPlatform');
      localStorage.removeItem('auth_provider');
    } finally {
      setLoadingProvider(null);
      processingRef.current = false;
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) { setEmailError('Please enter both email and password'); return; }
    if (isSignup && password !== confirmPassword) { setEmailError('Passwords do not match'); return; }
    if (isSignup && password.length < 6) { setEmailError('Password must be at least 6 characters'); return; }

    setEmailLoading(true);
    setEmailError(null);
    setError(null);

    try {
      if (isSignup) {
        trackSignupStart();
        const { data, error: signupError } = await supabase.auth.signUp({ email, password });
        if (signupError) throw signupError;

        if (data.user) {
          setRedirectingMessage(t('auth.preparingCheckout') || 'Setting up your account...');
          const userName = email.split('@')[0];

          const { error: odooUserError } = await supabase.from('odoo_users').insert({
            user_id: data.user.id, odoo_user_id: data.user.id,
            user_info: { email, name: userName },
          });
          if (odooUserError) console.error('Error creating odoo_users entry:', odooUserError);

          const { error: userError } = await supabase.from('users').insert({
            id: data.user.id, email, name: userName,
          });
          if (userError) console.error('Error creating users entry:', userError);

          localStorage.setItem('userPlatform', 'odoo');
          localStorage.setItem('auth_provider', 'odoo');

          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              const customerResponse = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-stripe-customer`,
                { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` }, body: JSON.stringify({ provider: 'odoo' }) }
              );
              const customerResult = await customerResponse.json();
              if (!customerResult.success) console.error('Failed to create Stripe customer:', customerResult.error);
              else console.log('Stripe customer created:', customerResult.customer_id);
            }
          } catch (customerError) { console.error('Error creating Stripe customer:', customerError); }

          setRedirectingMessage(t('auth.redirectingToCheckout') || 'Redirecting to checkout...');
          try {
            await StripeService.createCheckoutSession({ priceId: 'price_1S5o6zLPohnizGblsQq7OYCT', quantity: 1, successUrl: `${window.location.origin}/dashboard`, cancelUrl: `${window.location.origin}/dashboard`, crmProvider: 'odoo' });
            return;
          } catch (checkoutError) { console.error('Checkout error:', checkoutError); setRedirectingMessage(null); navigate(withUTM('/dashboard')); return; }
        }
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;

        if (data.user) {
          localStorage.setItem('userPlatform', 'odoo');
          localStorage.setItem('auth_provider', 'odoo');
          setRedirectingMessage(t('auth.checkingSubscription') || 'Checking your subscription...');

          try {
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-subscription?provider=odoo`,
              { method: 'GET', headers: { Authorization: `Bearer ${data.session.access_token}`, 'Content-Type': 'application/json' } }
            );
            const result = await response.json();
            const hasActiveSubscription = result.success && result.subscription && (result.subscription.subscription_status === 'active' || result.subscription.subscription_status === 'trialing');

            if (hasActiveSubscription) { navigate(withUTM('/dashboard')); return; }
            else {
              setRedirectingMessage(t('auth.redirectingToCheckout') || 'Redirecting to checkout...');
              try {
                await StripeService.createCheckoutSession({ priceId: 'price_1S5o6zLPohnizGblsQq7OYCT', quantity: 1, successUrl: `${window.location.origin}/dashboard`, cancelUrl: `${window.location.origin}/dashboard`, crmProvider: 'odoo' });
                return;
              } catch (checkoutError) { console.error('Checkout error during login:', checkoutError); setRedirectingMessage(null); navigate(withUTM('/dashboard')); return; }
            }
          } catch (subscriptionError) { console.error('Error checking subscription:', subscriptionError); navigate(withUTM('/dashboard')); return; }
        }
      }
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Authentication failed');
      console.error('Email auth error:', err);
    } finally { setEmailLoading(false); }
  };

  const getProviderLogo = (providerName: string) => {
    switch (providerName) {
      case 'teamleader': return '/Teamleader_Icon.svg';
      case 'pipedrive': return '/Pipedrive_id-7ejZnwv_0.svg';
      case 'odoo': return '/odoo_logo.svg';
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

  /* ─── Sub-screens ─── */

  const renderOdooTypeSelection = () => (
    <div className="w-full max-w-lg ml-auto mr-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-general font-bold text-navy mb-4">{t('auth.chooseYourOdooType')}</h1>
        <p className="text-lg sm:text-xl font-instrument text-slate-blue">{t('auth.selectOdooInstallationType')}</p>
      </div>

      <div className="space-y-4 mb-8">
        <button
          onClick={handleOdooCloudAuth}
          disabled={loadingProvider === 'odoo'}
          className="w-full p-5 sm:p-6 bg-white border-2 border-navy/10 rounded-2xl hover:bg-navy/5 hover:border-navy/20 transition-all text-left group shadow-sm hover:shadow-md"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1"><img src="/odoo_logo.svg" alt="Odoo" className="h-8 w-8 sm:h-10 sm:w-10" /></div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-general font-semibold text-navy mb-1">{t('auth.odooCloudTitle')}</h3>
              <p className="text-sm sm:text-base font-instrument text-slate-blue">{t('auth.odooCloudDescription')}</p>
            </div>
            {loadingProvider === 'odoo' && <Loader2 className="w-6 h-6 text-navy animate-spin" />}
          </div>
        </button>

        <button
          onClick={() => { setShowOdooTypeSelection(false); setShowSelfHostedLogin(true); setIsSignup(globalAuthMode === 'signup'); }}
          className="w-full p-5 sm:p-6 bg-white border-2 border-navy/10 rounded-2xl hover:bg-navy/5 hover:border-navy/20 transition-all text-left group shadow-sm hover:shadow-md"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1"><img src="/odoo_logo.svg" alt="Odoo" className="h-8 w-8 sm:h-10 sm:w-10" /></div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-general font-semibold text-navy mb-1">{t('auth.selfHostedOdooTitle')}</h3>
              <p className="text-sm sm:text-base font-instrument text-slate-blue">{t('auth.selfHostedOdooDescription')}</p>
            </div>
          </div>
        </button>
      </div>

      <button onClick={() => setShowOdooTypeSelection(false)} className="w-full py-3 text-base font-instrument text-slate-blue hover:text-navy transition-colors">
        ← {t('auth.backToLoginOptions')}
      </button>
    </div>
  );

  const renderSelfHostedLogin = () => (
    <div className="w-full max-w-lg ml-auto mr-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-general font-bold text-navy mb-4">
          {isSignup ? t('auth.createAccount') : t('auth.signIn')}
        </h1>
        <p className="text-lg sm:text-xl font-instrument text-slate-blue">{t('auth.forSelfHostedInstances')}</p>
      </div>

      <div className="space-y-5">
        {isSignup && (
          <div className="p-4 sm:p-5 bg-navy/5 border border-navy/10 rounded-xl">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm sm:text-base font-general font-semibold text-navy mb-1">{t('auth.importantEmailAddress')}</p>
                <p className="text-sm sm:text-base font-instrument text-slate-blue">{t('auth.emailMatchWarning')}</p>
              </div>
            </div>
          </div>
        )}

        {emailError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1"><p className="text-sm text-red-800 font-medium">{t('auth.error')}</p><p className="text-sm text-red-700">{emailError}</p></div>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm sm:text-base font-instrument font-medium text-navy mb-2">
            {t('auth.email')} {isSignup && <span className="text-red-500">*</span>}
          </label>
          {isSignup && <p className="text-xs sm:text-sm font-instrument text-slate-blue mb-2">{t('auth.mustMatchOdooEmail')}</p>}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-blue" />
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"
              className="w-full pl-12 pr-4 py-3.5 text-base border-2 border-navy/10 rounded-xl focus:ring-2 focus:ring-navy focus:border-transparent bg-white transition-all" />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm sm:text-base font-instrument font-medium text-navy mb-2">
            {t('auth.password')} {isSignup && <span className="text-red-500">*</span>}
          </label>
          {isSignup && <p className="text-xs sm:text-sm font-instrument text-slate-blue mb-2">{t('auth.chooseSecurePassword')}</p>}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-blue" />
            <input type={showPassword ? "text" : "password"} id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full pl-12 pr-14 py-3.5 text-base border-2 border-navy/10 rounded-xl focus:ring-2 focus:ring-navy focus:border-transparent bg-white transition-all" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-blue hover:text-navy">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isSignup && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm sm:text-base font-instrument font-medium text-navy mb-2">
              {t('auth.confirmPassword')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-blue" />
              <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••"
                className="w-full pl-12 pr-14 py-3.5 text-base border-2 border-navy/10 rounded-xl focus:ring-2 focus:ring-navy focus:border-transparent bg-white transition-all" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-blue hover:text-navy">
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        <button onClick={handleEmailAuth} disabled={emailLoading || !email || !password || (isSignup && !confirmPassword)}
          className="w-full bg-navy hover:bg-navy-hover disabled:bg-muted-blue text-white font-general font-semibold text-lg py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2">
          {emailLoading
            ? <><Loader2 className="w-5 h-5 animate-spin" /><span>{isSignup ? t('auth.creatingAccount') : t('auth.signingIn')}</span></>
            : <><UserPlus className="w-5 h-5" /><span>{isSignup ? t('auth.createAccount') : t('auth.signIn')}</span></>}
        </button>

        {isSignup && (
          <p className="text-sm font-instrument text-muted-blue text-center leading-relaxed">
            {t('auth.passiveTermsConsent')}{' '}
            <a href="/saas-agreement" className="text-navy hover:underline" target="_blank" rel="noopener noreferrer">{t('validation.saasAgreement')}</a>
            {' '}{t('common.and')}{' '}
            <a href="/privacy-policy" className="text-navy hover:underline" target="_blank" rel="noopener noreferrer">{t('validation.privacyPolicy')}</a>
          </p>
        )}

        <div className="flex items-center justify-center pt-2">
          <button onClick={() => { const m = isSignup ? 'login' : 'signup'; setGlobalAuthMode(m); setShowSelfHostedLogin(false); setShowOdooTypeSelection(false); setIsSignup(m === 'signup'); setEmailError(null); setConfirmPassword(''); }}
            className="text-base text-navy hover:underline font-general font-medium">
            {isSignup ? t('auth.alreadyHaveAccountSignIn') : t('auth.needAccountSignUp')}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <button onClick={() => { setShowSelfHostedLogin(false); setShowOdooTypeSelection(true); }}
          className="text-base text-slate-blue hover:text-navy transition-colors flex items-center space-x-1 mx-auto">
          <span>←</span><span>{t('auth.backToOdooOptions')}</span>
        </button>
      </div>
    </div>
  );

  /* ─── Main CRM-provider form ─── */

  const renderMainForm = () => {
    const btnAnimClasses = ['auth-animate-btn-1', 'auth-animate-btn-2', 'auth-animate-btn-3'];
    return (
    <div className="w-full max-w-lg ml-auto mr-8">
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
              className={`${btnAnimClasses[idx] || 'auth-animate-btn-3'} group w-full bg-white border-2 border-navy/10 text-navy font-semibold py-4 px-5 sm:px-7 rounded-2xl transition-all duration-300 flex items-center justify-between shadow-sm ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-navy/20 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'}`}>
              {isLoading ? (
                <div className="flex items-center justify-center w-full">
                  <Loader2 className="w-6 h-6 animate-spin text-navy mr-3" />
                  <span className="text-lg font-instrument text-slate-blue">{t('auth.connectingTo', { provider: provider.displayName })}</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-navy/5 rounded-xl flex items-center justify-center transition-colors ${!isDisabled && 'group-hover:bg-navy/10'}`}>
                      <img src={getProviderLogo(provider.name) || ''} alt={provider.displayName} className="w-7 h-7 object-contain" />
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-general font-semibold text-navy">
                        {provider.name === 'teamleader' && t('auth.page.continueTeamleader')}
                        {provider.name === 'pipedrive' && t('auth.page.continuePipedrive')}
                        {provider.name === 'odoo' && t('auth.page.continueOdoo')}
                      </div>
                      <div className="text-sm font-instrument text-muted-blue">
                        {isDisabled ? t('auth.temporarilyUnavailable') : (provider.name === 'odoo' ? t('auth.forOdooAccountsOnly') : t('auth.modal.startTrialInstantly'))}
                      </div>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center transition-colors ${!isDisabled && 'group-hover:bg-navy/10'}`}>
                    <ArrowRight className="w-5 h-5 text-navy" />
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

      {/* Top bar — back pill, logo, language switcher */}
      <div className="relative z-20 flex items-start justify-between px-6 sm:px-10 py-4 auth-animate-topbar shrink-0">
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => navigateWithTransition(withUTM('/'))}
            className="group inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-navy/5 group-hover:bg-navy/10 transition-colors duration-200">
              <ArrowLeft className="w-3 h-3 text-navy group-hover:-translate-x-0.5 transition-all" />
            </div>
            <span className="text-sm font-instrument font-medium text-navy">{t('auth.backToHome')}</span>
          </button>
          <img
            src="/Finit Voicelink White.svg"
            alt={t('common.voiceLink')}
            className="h-12 sm:h-14 w-auto"
          />
        </div>
        <div>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0" style={{ marginTop: '-9vh' }}>
        {/* Left side: form — pushed toward center */}
        <div className="w-full lg:w-[55%] flex items-center justify-end relative z-10 px-6 sm:px-10 lg:pl-4 lg:pr-0">
          {redirectingMessage && (
            <div className="absolute inset-0 bg-porcelain/95 flex flex-col items-center justify-center z-50">
              <Loader2 className="w-14 h-14 text-navy animate-spin mb-5" />
              <p className="text-xl font-general font-medium text-navy">{redirectingMessage}</p>
              <p className="text-base font-instrument text-slate-blue mt-2">{t('auth.pleaseWait')}</p>
            </div>
          )}

          {showOdooTypeSelection ? renderOdooTypeSelection()
            : showSelfHostedLogin ? renderSelfHostedLogin()
            : renderMainForm()}
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
    </div>
  );
};
