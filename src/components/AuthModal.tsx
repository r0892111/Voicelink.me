import React from 'react';
import { X, Loader2, AlertCircle, Download, ChevronDown, ChevronUp, Mail, Lock, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AuthProvider } from '../types/auth';
import { AuthService } from '../services/authService';
import { authProviders } from '../config/authProviders';
import { useI18n } from '../hooks/useI18n';
import { StripeService } from '../services/stripeService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loadingProvider, setLoadingProvider] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const processingRef = React.useRef(false);

  const [showSelfHostedLogin, setShowSelfHostedLogin] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSignup, setIsSignup] = React.useState(false);
  const [emailLoading, setEmailLoading] = React.useState(false);
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [redirectingMessage, setRedirectingMessage] = React.useState<string | null>(null);
  const termsCheckboxRef = React.useRef<HTMLInputElement>(null);

  // TEMPORARY: Set to true to re-enable Pipedrive and Teamleader
  const disabledProviders = ['pipedrive', 'teamleader'];

  // Handle modal animation
  React.useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleSignIn = async (provider: AuthProvider) => {
  // Prevent double calls using ref
  if (processingRef.current || loadingProvider) return;

  // Check if user agreed to terms
  if (!agreedToTerms) {
    setError(t('validation.agreeToTerms'));
    termsCheckboxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    termsCheckboxRef.current?.focus();
    return;
  }
  try {
    processingRef.current = true;
    setLoadingProvider(provider.name);
    setError(null);

    // Set platform in localStorage immediately
    localStorage.setItem('userPlatform', provider.name);
    localStorage.setItem('auth_provider', provider.name);

    let authService: AuthService;

    switch (provider.name) {
      case 'teamleader':
        authService = AuthService.createTeamleaderAuth();
        break;
      case 'pipedrive':
        authService = AuthService.createPipedriveAuth();
        break;
      case 'odoo':
        authService = AuthService.createOdooAuth();
        break;
      default:
        console.error('Unknown provider:', provider.name);
        return;
    }

    const result = await authService.initiateAuth();

    if (!result.success && result.error) {
      setError(`${t('auth.authenticationFailedFor', { provider: provider.displayName })}: ${result.error}`);
      // Clear platform if auth failed
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

  const handleEmailAuth = async () => {
    if (!email || !password) {
      setEmailError('Please enter both email and password');
      return;
    }

    if (!agreedToTerms) {
      setError(t('validation.agreeToTerms'));
      setEmailError('Please agree to the SaaS Agreement below');
      termsCheckboxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      termsCheckboxRef.current?.focus();
      return;
    }

    setEmailLoading(true);
    setEmailError(null);
    setError(null);

    try {
      if (isSignup) {
        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signupError) throw signupError;

        if (data.user) {
          // Create entry in odoo_users table
          const { error: odooUserError } = await supabase
            .from('odoo_users')
            .insert({
              user_id: data.user.id,
              odoo_user_id: data.user.id,
            });

          if (odooUserError) {
            console.error('Error creating odoo_users entry:', odooUserError);
          }

          // Create entry in users table
          const { error: userError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: email,
              name: email.split('@')[0],
            });

          if (userError) {
            console.error('Error creating users entry:', userError);
          }

          localStorage.setItem('userPlatform', 'odoo');
          localStorage.setItem('auth_provider', 'odoo');

          // Create Stripe customer
          setRedirectingMessage(t('auth.preparingCheckout') || 'Setting up your account...');
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              const customerResponse = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-stripe-customer`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                  },
                  body: JSON.stringify({ provider: 'odoo' }),
                }
              );

              const customerResult = await customerResponse.json();
              if (!customerResult.success) {
                console.error('Failed to create Stripe customer:', customerResult.error);
              } else {
                console.log('Stripe customer created:', customerResult.customer_id);
              }
            }
          } catch (customerError) {
            console.error('Error creating Stripe customer:', customerError);
          }

          // Redirect to Stripe checkout for subscription
          setRedirectingMessage(t('auth.redirectingToCheckout') || 'Redirecting to checkout...');
          try {
            await StripeService.createCheckoutSession({
              priceId: 'price_1S5o6zLPohnizGblsQq7OYCT',
              quantity: 1,
              successUrl: `${window.location.origin}/dashboard`,
              cancelUrl: `${window.location.origin}/dashboard`,
              crmProvider: 'odoo',
            });
          } catch (checkoutError) {
            console.error('Checkout error:', checkoutError);
            setRedirectingMessage(null);
            // If checkout fails, still navigate to dashboard
            navigate('/dashboard');
          }
        }
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) throw loginError;

        if (data.user) {
          localStorage.setItem('userPlatform', 'odoo');
          localStorage.setItem('auth_provider', 'odoo');
          navigate('/dashboard');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setEmailError(errorMessage);
      console.error('Email auth error:', err);
    } finally {
      setEmailLoading(false);
    }
  };

  // Reset processing state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setIsAnimating(false);
      processingRef.current = false;
      setLoadingProvider(null);
      setError(null);
      setEmailError(null);
      setAgreedToTerms(false);
      setShowSelfHostedLogin(false);
      setEmail('');
      setPassword('');
      setIsSignup(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-20 transition-all duration-300 ${
        isAnimating ? 'bg-opacity-60' : 'bg-opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 relative transition-all duration-300 ease-out ${
          isAnimating
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Redirecting Message */}
        {redirectingMessage && (
          <div className="absolute inset-0 bg-white bg-opacity-95 rounded-2xl flex flex-col items-center justify-center z-50">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-900">{redirectingMessage}</p>
            <p className="text-sm text-gray-600 mt-2">Please wait...</p>
          </div>
        )}

        {/* Modal Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img
              src="/Finit Voicelink Blue.svg"
              alt={t('common.voiceLink')}
              className="h-8 w-auto"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('auth.modal.title')}</h2>
          <p className="text-lg text-gray-600 mb-4">{t('auth.modal.subtitle')}</p>
          
          {/* Free Trial Banner */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-green-800 font-semibold text-lg">{t('auth.modal.freeTrialBanner')}</span>
            </div>
            <p className="text-green-700 text-sm">
              {t('auth.modal.freeTrialDescription')}
            </p>
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Sign-in Options */}
        <div className="space-y-4 mb-8">
          {authProviders.map((provider) => {
            const isLoading = loadingProvider === provider.name;
            const isDisabled = disabledProviders.includes(provider.name);

            // Get the appropriate logo image for each CRM
            const getProviderLogo = (providerName: string) => {
              switch (providerName) {
                case 'teamleader':
                  return '/Teamleader_Icon.svg';
                case 'pipedrive':
                  return '/Pipedrive_id-7ejZnwv_0.svg';
                case 'odoo':
                  return '/odoo_logo.svg';
                default:
                  return null;
              }
            };

            return (
              <button
                key={provider.name}
                onClick={() => !isDisabled && handleSignIn(provider)}
                disabled={loadingProvider !== null || isDisabled}
                className={`group w-full bg-white border-2 border-gray-200 text-gray-800 font-semibold py-5 px-8 rounded-2xl transition-all duration-300 flex items-center justify-between transform relative overflow-hidden ${
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-gray-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="flex items-center justify-center w-full">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-600 mr-3" />
                      <span className="text-lg text-gray-600">Connecting to {provider.displayName}...</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center transition-colors ${
                        !isDisabled && 'group-hover:bg-gray-100'
                      }`}>
                        <img
                          src={getProviderLogo(provider.name)}
                          alt={provider.displayName}
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                      <div className="text-left">
                        <div className="text-lg font-semibold text-gray-900">
                          {provider.name === 'teamleader' && t('auth.modal.connectTeamleader')}
                          {provider.name === 'pipedrive' && t('auth.modal.connectPipedrive')}
                          {provider.name === 'odoo' && t('auth.modal.connectOdoo')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {isDisabled ? 'Temporarily unavailable' : (
                            provider.name === 'odoo' ? 'For Odoo.com accounts only' : t('auth.modal.startTrialInstantly')
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-colors ${
                      !isDisabled && 'group-hover:bg-gray-200'
                    }`}>
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Self-hosted Odoo Login */}
        <div className="mb-6">
          <button
            onClick={() => setShowSelfHostedLogin(!showSelfHostedLogin)}
            className="w-full p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-purple-900">
                    Using Self-Hosted Odoo?
                  </h4>
                  <p className="text-xs text-purple-700">
                    Click to login with email & password
                  </p>
                </div>
              </div>
              {showSelfHostedLogin ? (
                <ChevronUp className="w-5 h-5 text-purple-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-purple-600" />
              )}
            </div>
          </button>

          {showSelfHostedLogin && (
            <div className="mt-4 p-6 bg-white border-2 border-purple-200 rounded-xl space-y-4">
              <div className="text-center mb-4">
                <h5 className="text-lg font-semibold text-gray-900 mb-1">
                  {isSignup ? 'Create Account' : 'Sign In'}
                </h5>
                <p className="text-sm text-gray-600">
                  For self-hosted Odoo instances
                </p>
              </div>

              {emailError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-medium">Error</p>
                    <p className="text-sm text-red-700">{emailError}</p>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={handleEmailAuth}
                disabled={emailLoading || !email || !password || !agreedToTerms}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {emailLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isSignup ? 'Creating Account...' : 'Signing In...'}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>{isSignup ? 'Create Account' : 'Sign In'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsSignup(!isSignup)}
                className="w-full text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                {isSignup ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </button>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">
                  After logging in:
                </p>
                <ol className="text-xs text-gray-600 space-y-1 ml-4 list-decimal">
                  <li>Go to Dashboard → Odoo Settings</li>
                  <li>Enter your Odoo database name and API key</li>
                  <li>Start using VoiceLink!</li>
                </ol>
                <a
                  href="/ODOO_CUSTOM_SETUP.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-medium text-purple-600 hover:text-purple-800 mt-3"
                >
                  <Download className="w-3 h-3 mr-1" />
                  View setup guide
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-gray-200">
          {/* Terms Agreement Checkbox */}
          <div className="mb-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                ref={termsCheckboxRef}
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-2"
              />
              <span className="text-sm text-gray-700">
                I agree to the{' '}
                <a
                  href="/saas-agreement"
                  className="text-blue-600 hover:underline font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  SaaS Agreement
                </a>
              </span>
            </label>
            
            {/* Download Options */}
            <div className="mt-3 ml-7 flex items-center space-x-4 text-xs text-gray-600">
              <span>Download:</span>
              <a
                href="/SaaS Agreement en-US.pdf"
                download="SaaS_Agreement_English.pdf"
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>English Version</span>
              </a>
              <a
                href="/SaaS Overeenkomst.docx.pdf"
                download="SaaS_Overeenkomst_Dutch.pdf"
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Dutch Version (Official)</span>
              </a>
            </div>
          </div>

          {/* Privacy Policy Notice */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 text-center">
              By connecting your CRM, you acknowledge our{' '}
              <a 
                href="/privacy-policy" 
                className="text-blue-600 hover:underline" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
            </p>
          </div>

          {/* Sign In Option */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-2">
              {t('auth.modal.alreadyHaveAccount')}
            </p>
            <p className="text-xs text-gray-500">
              {t('auth.modal.signInDescription')}
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div className="flex flex-col items-center space-y-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs text-gray-600 font-medium">{t('auth.modal.secureOauth')}</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs text-gray-600 font-medium">{t('auth.modal.noSetupFees')}</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs text-gray-600 font-medium">{t('auth.modal.cancelAnytime')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};