import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LogOut, User, Menu, X, ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { AuthPage } from './components/AuthPage';
import { AuthCallback } from './components/AuthCallback';
import { SuccessPage } from './components/SuccessPage';
import { Homepage } from './components/Homepage';
import { Dashboard } from './components/Dashboard';
import { ContactFormModal } from './components/ContactFormModal';
import { FieldServiceLanding } from './components/FieldServiceLanding';
import { InstallatorsLanding } from './components/InstallatorsLanding';
import { B2BSalesLanding } from './components/B2BSalesLanding';
import { HeroLanding } from './components/HeroLanding';
import SaasAgreement from './components/SaasAgreement';
import PrivacyPolicy from './components/PrivacyPolicy';
import Disclaimer from './components/Disclaimer';
import CookiePolicy from './components/CookiePolicy';
import Support from './components/Support';
import { TestSignup } from './components/TestSignup';
import { TestDashboard } from './components/TestDashboard';
import { InviteAccept } from './components/InviteAccept';
import { useAuth } from './hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { ConsentProvider } from './contexts/ConsentContext';
import { CookieBanner } from './components/CookieBanner';
import { CookieSettingsModal } from './components/CookieSettingsModal';
import { RTLProvider } from './components/RTLProvider';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useI18n } from './hooks/useI18n';
import { AnalyticsListener } from './components/AnalyticsListener';
import { withUTM } from './utils/utm';
import { NoiseOverlay } from './components/ui/NoiseOverlay';
import { PageTransitionProvider, usePageTransition } from './hooks/usePageTransition';

function App() {
  const [isContactModalOpen, setIsContactModalOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const { user, loading, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { navigateWithTransition } = usePageTransition();

  // Debug routing
  React.useEffect(() => {
    console.log('Current location:', location.pathname, location.search);
  }, [location]);

  // After OAuth magic-link redirect, Supabase sends the user back to the site
  // root (/) with an #access_token hash. Detect that case and forward to the
  // correct destination. Test users go straight to /test-dashboard to avoid
  // a double-mount through /dashboard.
  React.useEffect(() => {
    if (!loading && user && location.pathname === '/' && window.location.hash.includes('access_token')) {
      const isTestUserFlow = localStorage.getItem('is_test_user_flow') === 'true';
      if (isTestUserFlow) {
        localStorage.removeItem('is_test_user_flow');
        localStorage.removeItem('test_user_phone');
        navigate('/test-dashboard', { replace: true });
      } else {
        navigate(withUTM('/dashboard'), { replace: true });
      }
    }
  }, [user, loading, location.pathname]);

  // Scroll listener for nav styling
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  // Check if we're on the homepage
  const isHomepage = location.pathname === '/';

  // Check if we're on the landing page (hide navigation)
  const isLandingPage = location.pathname === '/landing';
  const isSignupPage = location.pathname === '/signup';
  const isInvitePage = location.pathname === '/invite';
  const isTestPage = location.pathname === '/test' || location.pathname === '/test-dashboard';

  const openContactModal = () => {
    setIsContactModalOpen(true);
  };

  const closeContactModal = () => {
    setIsContactModalOpen(false);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="dot-loader" />
      </div>
    );
  }

  return (
    <ConsentProvider>
      <RTLProvider>
        <AnalyticsListener />
        <div className={`min-h-screen bg-porcelain font-instrument ${isSignupPage ? 'h-screen overflow-hidden' : ''}`}>
          <NoiseOverlay />
          {/* Navigation */}
          {!isLandingPage && !isSignupPage && !isInvitePage && !isTestPage && (
          <nav className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
            {/* ── White logo on hero (homepage only, fades out on scroll) — desktop only ── */}
            {isHomepage && (
              <div
                className="hidden min-[868px]:block absolute pointer-events-auto cursor-pointer group transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                  top: scrolled ? '16px' : '28px',
                  left: 'clamp(12px, 1.5vw, 28px)',
                  opacity: scrolled ? 0 : 1,
                  transform: scrolled ? 'translateX(-20px) scale(0.9)' : 'translateX(0) scale(1)',
                  pointerEvents: scrolled ? 'none' : 'auto',
                  transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
                }}
                onClick={() => navigate(withUTM('/'))}
              >
                <img
                  src="/Finit Voicelink White.svg"
                  alt={t('common.voiceLink')}
                  className="h-12 w-auto group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>
            )}

            {/* ── Centered nav pill — desktop only ── */}
            <div className="hidden min-[868px]:flex justify-center" style={{ paddingTop: scrolled ? '12px' : '20px', transition: 'padding-top 0.5s cubic-bezier(0.4,0,0.2,1)' }}>
              <div className="pointer-events-auto bg-porcelain/80 backdrop-blur-xl shadow-lg border border-navy/[0.06] rounded-full px-2 py-1.5 flex items-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                {/* Logo inside pill — slides in when scrolled past hero (or always on non-homepage) */}
                <div
                  className={`flex items-center cursor-pointer group overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    scrolled || !isHomepage ? 'max-w-[180px] opacity-100 pl-2 pr-1' : 'max-w-0 opacity-0 pl-0 pr-0'
                  }`}
                  onClick={() => navigate(withUTM('/'))}
                >
                  {!isHomepage && (
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-gray-100 group-hover:to-gray-200 transition-all duration-200 shadow-sm mr-2 flex-shrink-0">
                      <ArrowLeft className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-800" />
                    </div>
                  )}
                  <img
                    src="/Finit Voicelink Blue.svg"
                    alt={t('common.voiceLink')}
                    className="h-6 w-auto flex-shrink-0 group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  {/* Divider after logo */}
                  <div className="w-px h-5 bg-navy/10 ml-3 flex-shrink-0" />
                </div>

                {/* Desktop Navigation */}
                <div className="hidden min-[868px]:flex items-center space-x-0.5">
                  {isHomepage && (
                    <>
                      <button
                        onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className="text-gray-600 hover:text-gray-900 font-medium transition-all duration-200 px-4 py-2 rounded-full hover:bg-navy/5 font-instrument hover:shadow-sm"
                      >{t('navigation.howItWorks')}</button>
                      <button
                        onClick={() => document.getElementById('crm-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className="text-gray-600 hover:text-gray-900 font-medium transition-all duration-200 px-4 py-2 rounded-full hover:bg-navy/5 font-instrument hover:shadow-sm"
                      >{t('navigation.integrations')}</button>
                      <button
                        onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className="text-gray-600 hover:text-gray-900 font-medium transition-all duration-200 px-4 py-2 rounded-full hover:bg-navy/5 font-instrument hover:shadow-sm"
                      >{t('navigation.pricing')}</button>
                      <button
                        onClick={openContactModal}
                        className="text-gray-600 hover:text-gray-900 font-medium transition-all duration-200 px-4 py-2 rounded-full hover:bg-navy/5 font-instrument hover:shadow-sm"
                      >
                        {t('navigation.contact')}
                      </button>
                      <a
                        href="https://finitsolutions.be"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 font-medium transition-all duration-200 px-4 py-2 rounded-full hover:bg-navy/5 font-instrument hover:shadow-sm"
                      >
                        {t('navigation.maatwerkAI')}
                      </a>
                    </>
                  )}

                  {/* Language Switcher */}
                  <LanguageSwitcher />

                  {user ? (
                    <div className="flex items-center space-x-2">
                     {isHomepage && (
                       <button
                         onClick={() => navigate(withUTM('/dashboard'))}
                         className="text-blue-600 hover:text-blue-700 font-medium transition-all duration-200 px-4 py-2 rounded-full hover:bg-blue-50 hover:shadow-sm"
                       >
                         {t('navigation.dashboard')}
                       </button>
                     )}
                      <div className="flex items-center space-x-3 bg-gradient-to-r from-white to-gray-50 rounded-full px-3 py-1.5 shadow-sm border border-gray-200/60 hover:shadow-md transition-all duration-200">
                        <div className="w-7 h-7 bg-navy rounded-lg flex items-center justify-center shadow-sm">
                          <User className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-semibold text-sm leading-tight">{user.name}</span>
                          <span className="text-xs text-gray-500 capitalize leading-tight">
                            {user.platform}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={signOut}
                        className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-all duration-200 px-3 py-2 rounded-full hover:bg-red-50 hover:shadow-sm font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('navigation.signOut')}</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigateWithTransition(withUTM('/signup'))}
                      className="group text-white font-semibold py-2.5 px-6 rounded-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center space-x-2 bg-navy hover:bg-navy-hover"
                    >
                      <span>{t('navigation.getStarted')}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>

              </div>
            </div>

          </nav>
          )}

          {/* Mobile hamburger button — always visible */}
          {!isLandingPage && !isSignupPage && !isInvitePage && !isMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
              className="min-[868px]:hidden fixed top-3 right-4 z-[10000] p-2.5 bg-white/90 backdrop-blur-sm shadow-sm text-gray-700 hover:text-gray-900 hover:bg-white rounded-full transition-all duration-200"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          {/* Full-screen mobile menu overlay */}
          {!isLandingPage && !isSignupPage && !isInvitePage && isMobileMenuOpen && (
            <div className="min-[868px]:hidden fixed inset-0 z-[10000] bg-porcelain flex flex-col overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-10 pb-6 flex-shrink-0">
                <img
                  src="/Finit Voicelink Blue.svg"
                  alt="VoiceLink"
                  className="h-10 w-auto cursor-pointer"
                  onClick={() => { setIsMobileMenuOpen(false); navigate(withUTM('/')); }}
                />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-navy/8 text-navy/70 hover:bg-navy/12 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Primary CTA */}
              <div className="px-6 pb-6 flex-shrink-0">
                {user ? (
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); navigate(withUTM('/dashboard')); }}
                    className="w-full bg-navy hover:bg-navy-hover text-white font-semibold py-4 rounded-full flex items-center justify-center gap-2 text-base transition-colors"
                  >
                    <span>{t('navigation.dashboard')}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); navigateWithTransition(withUTM('/signup')); }}
                    className="w-full bg-navy hover:bg-navy-hover text-white font-semibold py-4 rounded-full flex items-center justify-center gap-2 text-base transition-colors"
                  >
                    <span>{t('navigation.getStarted')}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Nav links */}
              <div className="flex-1 px-6">
                <div className="divide-y divide-navy/[0.08]">
                  {/* Language switcher — first item */}
                  <div className="py-4">
                    <LanguageSwitcher />
                  </div>
                  {isHomepage ? (
                    <>
                      <button
                        onClick={() => { setIsMobileMenuOpen(false); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                        className="w-full flex items-center justify-between py-3.5 text-navy font-general font-medium text-xl text-left active:opacity-60 transition-opacity"
                      >
                        <span>{t('navigation.howItWorks')}</span>
                        <ChevronRight className="w-5 h-5 text-navy/30 flex-shrink-0" />
                      </button>
                      <button
                        onClick={() => { setIsMobileMenuOpen(false); document.getElementById('crm-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                        className="w-full flex items-center justify-between py-3.5 text-navy font-general font-medium text-xl text-left active:opacity-60 transition-opacity"
                      >
                        <span>{t('navigation.integrations')}</span>
                        <ChevronRight className="w-5 h-5 text-navy/30 flex-shrink-0" />
                      </button>
                      <button
                        onClick={() => { setIsMobileMenuOpen(false); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                        className="w-full flex items-center justify-between py-3.5 text-navy font-general font-medium text-xl text-left active:opacity-60 transition-opacity"
                      >
                        <span>{t('navigation.pricing')}</span>
                        <ChevronRight className="w-5 h-5 text-navy/30 flex-shrink-0" />
                      </button>
                      <button
                        onClick={() => { setIsMobileMenuOpen(false); openContactModal(); }}
                        className="w-full flex items-center justify-between py-3.5 text-navy font-general font-medium text-xl text-left active:opacity-60 transition-opacity"
                      >
                        <span>{t('navigation.contact')}</span>
                        <ChevronRight className="w-5 h-5 text-navy/30 flex-shrink-0" />
                      </button>
                      <a
                        href="https://finitsolutions.be"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full flex items-center justify-between py-3.5 text-navy font-general font-medium text-xl active:opacity-60 transition-opacity"
                      >
                        <span>{t('navigation.maatwerkAI')}</span>
                        <ChevronRight className="w-5 h-5 text-navy/30 flex-shrink-0" />
                      </a>
                    </>
                  ) : (
                    <button
                      onClick={() => { setIsMobileMenuOpen(false); navigate(withUTM('/')); }}
                      className="w-full flex items-center justify-between py-3.5 text-navy font-general font-medium text-xl text-left active:opacity-60 transition-opacity"
                    >
                      <span>{t('navigation.home')}</span>
                      <ChevronRight className="w-5 h-5 text-navy/30 flex-shrink-0" />
                    </button>
                  )}
                  {user && (
                    <button
                      onClick={() => { setIsMobileMenuOpen(false); signOut(); }}
                      className="w-full flex items-center justify-between py-3.5 text-red-500 font-general font-medium text-xl text-left active:opacity-60 transition-opacity"
                    >
                      <span>{t('navigation.signOut')}</span>
                      <LogOut className="w-5 h-5 text-red-400 flex-shrink-0" />
                    </button>
                  )}
                </div>
              </div>

              {/* Phone card */}
              <div className="mx-6 mt-3 flex-shrink-0">
                <p className="text-xl font-bold text-navy font-general mb-3 text-center">{t('navigation.urgentQuestions')}</p>
                <div className="bg-white rounded-2xl px-6 py-5 text-center border border-navy/[0.06] shadow-lg flex-shrink-0">
                  <p className="text-xs font-semibold tracking-widest text-navy/40 uppercase mb-2">{t('navigation.callUs')}</p>
                  <a
                    href="tel:+32495702314"
                    className="block text-3xl font-bold text-navy tracking-tight leading-none underline underline-offset-4 decoration-navy/30 active:opacity-60 transition-opacity"
                  >
                    +32 495 70 23 14
                  </a>
                  <div className="w-8 h-px bg-navy/15 mx-auto my-3" />
                  <p className="text-sm text-navy/50">{t('navigation.callHours')}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pt-4 pb-10 flex-shrink-0 flex flex-col items-center gap-4">
                {user && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-navy font-semibold text-sm leading-tight">{user.name}</div>
                      <div className="text-navy/50 text-xs capitalize leading-tight">{user.platform}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Routes */}
          <div className={isLandingPage || isSignupPage || isInvitePage || isHomepage || isTestPage ? "" : "pt-20"}>
            <Routes>
              <Route path="/" element={<Homepage openContactModal={openContactModal} />} />
              <Route path="/signup" element={<AuthPage />} />
              <Route path="/landing" element={<HeroLanding />} />
              <Route path="/invite" element={<InviteAccept />} />
              <Route path="/lp/field-service" element={<FieldServiceLanding />} />
              <Route path="/lp/installateurs" element={<InstallatorsLanding />} />
              <Route path="/lp/b2b-sales" element={<B2BSalesLanding />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/auth/:platform/callback" element={<AuthCallback />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/saas-agreement" element={<SaasAgreement />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/support" element={<Support />} />
              <Route path="/test" element={<TestSignup />} />
              <Route path="/test-dashboard" element={<TestDashboard />} />
              {/* Fallback route for debugging */}
              <Route path="*" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">No route matched: {location.pathname}</h1><p>Available routes: /, /dashboard, /verify-whatsapp, etc.</p></div>} />
            </Routes>
          </div>

          <ContactFormModal isOpen={isContactModalOpen} onClose={closeContactModal} />

          {/* Cookie Banner */}
          <CookieBanner />

          {/* Cookie Settings Modal - Always available */}
          <CookieSettingsModal />

        </div>
      </RTLProvider>
    </ConsentProvider>
  );
}

export default App;
