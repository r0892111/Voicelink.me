import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LogOut, User, Menu, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { AuthPage } from './components/AuthPage';
import { AuthCallback } from './components/AuthCallback';
import { Dashboard } from './components/Dashboard';
import { SuccessPage } from './components/SuccessPage';
import { WhatsAppVerificationPage } from './components/WhatsAppVerificationPage';
import { WhatsAppAuthPage } from './components/WhatsAppAuthPage';
import { Homepage } from './components/Homepage';
import { ContactFormModal } from './components/ContactFormModal';
import { TestSignup } from './components/TestSignup';
import { FieldServiceLanding } from './components/FieldServiceLanding';
import { InstallatorsLanding } from './components/InstallatorsLanding';
import { B2BSalesLanding } from './components/B2BSalesLanding';
import { HeroLanding } from './components/HeroLanding';
import SaasAgreement from './components/SaasAgreement';
import PrivacyPolicy from './components/PrivacyPolicy';
import Disclaimer from './components/Disclaimer';
import CookiePolicy from './components/CookiePolicy';
import Support from './components/Support';
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

  // Scroll listener for nav styling
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if we're on the homepage
  const isHomepage = location.pathname === '/';

  // Check if we're on the landing page (hide navigation)
  const isLandingPage = location.pathname === '/landing';
  const isSignupPage = location.pathname === '/signup';

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
          {!isLandingPage && !isSignupPage && (
          <nav className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
            {/* ── White logo on hero (homepage only, fades out on scroll) ── */}
            {isHomepage && (
              <div
                className="absolute pointer-events-auto cursor-pointer group transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
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

            {/* ── Centered nav pill ── */}
            <div className="flex justify-center" style={{ paddingTop: scrolled ? '12px' : '20px', transition: 'padding-top 0.5s cubic-bezier(0.4,0,0.2,1)' }}>
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
                <div className="hidden md:flex items-center space-x-0.5">
                  {isHomepage && (
                    <>
                      <button
                        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className="text-gray-600 hover:text-gray-900 font-medium transition-all duration-200 px-4 py-2 rounded-full hover:bg-navy/5 font-instrument hover:shadow-sm"
                      >{t('navigation.features')}</button>
                      <button
                        onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className="text-gray-600 hover:text-gray-900 font-medium transition-all duration-200 px-4 py-2 rounded-full hover:bg-navy/5 font-instrument hover:shadow-sm"
                      >{t('navigation.pricing')}</button>
                      <button
                        onClick={() => window.open('https://calendly.com/alex-finitsolutions/30min', '_blank')}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium transition-all duration-200 px-4 py-2 rounded-full hover:bg-navy/5 font-instrument hover:shadow-sm"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                        </svg>
                        <span>Schedule Online Meeting</span>
                      </button>
                      <button
                        onClick={openContactModal}
                        className="text-gray-600 hover:text-gray-900 font-medium transition-all duration-200 px-4 py-2 rounded-full hover:bg-navy/5 font-instrument hover:shadow-sm"
                      >
                        Contact Us
                      </button>
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

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="pointer-events-auto md:hidden mx-4 mt-2 bg-porcelain/95 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-navy/[0.06]">
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                    className="text-gray-600 hover:text-gray-900 font-general font-medium transition-all duration-200 px-4 py-3 rounded-xl hover:bg-gray-50 hover:shadow-sm text-left"
                  >{t('navigation.features')}</button>
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                    className="text-gray-600 hover:text-gray-900 font-general font-medium transition-all duration-200 px-4 py-3 rounded-xl hover:bg-gray-50 hover:shadow-sm text-left"
                  >{t('navigation.pricing')}</button>
                  <button
                    onClick={() => window.open('https://calendly.com/alex-finitsolutions/30min', '_blank')}
                    className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 font-general font-medium transition-all duration-200 px-4 py-3 rounded-xl hover:bg-gray-50 hover:shadow-sm text-left"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                    </svg>
                    <span>Schedule Online Meeting</span>
                  </button>
                  <button
                    onClick={openContactModal}
                    className="text-gray-600 hover:text-gray-900 font-general font-medium transition-all duration-200 px-4 py-3 rounded-xl hover:bg-gray-50 hover:shadow-sm text-left"
                  >
                    Contact Us
                  </button>

                  {/* Mobile Language Switcher */}
                  <div className="px-4 py-2">
                    <LanguageSwitcher />
                  </div>

                  {user ? (
                    <div className="flex flex-col space-y-2 pt-3 border-t border-gray-200/50">
                     {isHomepage && (
                       <button
                         onClick={() => navigate(withUTM('/dashboard'))}
                         className="text-blue-600 hover:text-blue-700 font-medium transition-all duration-200 px-4 py-3 rounded-xl hover:bg-blue-50 hover:shadow-sm text-left"
                       >
                         {t('navigation.dashboard')}
                       </button>
                     )}
                      <div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                        <div className="w-9 h-9 bg-navy rounded-xl flex items-center justify-center shadow-sm">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-gray-900 font-semibold text-sm">{user.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{user.platform}</div>
                        </div>
                      </div>
                      <button
                        onClick={signOut}
                        className="flex items-center space-x-3 text-red-600 hover:text-red-700 transition-all duration-200 px-4 py-3 rounded-xl hover:bg-red-50 hover:shadow-sm font-medium text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('navigation.signOut')}</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigateWithTransition(withUTM('/signup'))}
                      className="group text-white font-semibold py-3 px-7 rounded-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center space-x-2 bg-navy hover:bg-navy-hover"
                    >
                      <span>{t('navigation.getStarted')}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </nav>
          )}

          {/* Routes */}
          <div className={isLandingPage || isSignupPage || isHomepage ? "" : "pt-20"}>
            <Routes>
              <Route path="/" element={<Homepage openContactModal={openContactModal} />} />
              <Route path="/signup" element={<AuthPage />} />
              <Route path="/test" element={<TestSignup />} />
              <Route path="/landing" element={<HeroLanding />} />
              <Route path="/lp/field-service" element={<FieldServiceLanding />} />
              <Route path="/lp/installateurs" element={<InstallatorsLanding />} />
              <Route path="/lp/b2b-sales" element={<B2BSalesLanding />} />
              <Route path="/auth/:platform/callback" element={<AuthCallback />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/whatsapp-auth" element={<WhatsAppAuthPage />} />
              <Route path="/verify-whatsapp" element={<WhatsAppVerificationPage />} />
              <Route path="/verify-whatsapp/*" element={<WhatsAppVerificationPage />} />
              <Route path="/saas-agreement" element={<SaasAgreement />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/support" element={<Support />} />
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
