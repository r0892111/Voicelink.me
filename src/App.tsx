import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LogOut, User, Menu, X, ArrowLeft, Cookie, ArrowRight } from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { AuthCallback } from './components/AuthCallback';
import { Dashboard } from './components/Dashboard';
import { SuccessPage } from './components/SuccessPage';
import { Homepage } from './components/Homepage';
import { ContactFormModal } from './components/ContactFormModal';
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

function App() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { user, loading, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on the homepage
  const isHomepage = location.pathname === '/';

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openContactModal = () => {
    setIsContactModalOpen(true);
  };

  const closeContactModal = () => {
    setIsContactModalOpen(false);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ConsentProvider>
      <RTLProvider>
        <div className="min-h-screen bg-white">
          {/* Navigation */}
          <nav className="fixed top-0 left-0 right-0 z-[9999] bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/')}>
                  {!isHomepage && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
                      <ArrowLeft className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                  {/* Blue logo on light background */}
                  <img 
                    src="/Finit Voicelink Blue.svg" 
                    alt={t('common.voiceLink')} 
                    className="h-10 w-auto group-hover:opacity-80 transition-opacity"
                  />
                </div>
                
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                  {isHomepage && (
                    <>
                      {isHomepage && (
                        <>
                          <a href="#features" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50">{t('navigation.features')}</a>
                          <a href="#pricing" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50">{t('navigation.pricing')}</a>
                          <button
                            onClick={() => window.open('https://calendly.com/alex-finitsolutions/30min', '_blank')}
                            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                            </svg>
                            <span>Schedule Online Meeting</span>
                          </button>
                          <button
                            onClick={openContactModal}
                            className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50"
                          >
                            Contact Us
                          </button>
                        </>
                      )}
                    </>
                  )}
                  
                  {/* Language Switcher */}
                  <LanguageSwitcher />
                  
                  {user ? (
                    <div className="flex items-center space-x-6">
                     {isHomepage && (
                       <button
                         onClick={() => navigate('/dashboard')}
                         className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-50"
                       >
                         {t('navigation.dashboard')}
                       </button>
                     )}
                      <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-gray-200">
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-sm">
                          <User className="w-4 h-4 text-white" />
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
                        className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-red-50 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('navigation.signOut')}</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={openModal}
                      className="group text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 flex items-center justify-center space-x-2"
                      style={{ backgroundColor: '#1C2C55' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F1A3A'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C2C55'}
                    >
                      <span>{t('navigation.getStarted')}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

              {/* Mobile Menu */}
              {isMobileMenuOpen && (
                <div className="md:hidden mt-4 pb-4 border-t border-gray-100">
                  <div className="flex flex-col space-y-4 pt-4">
                    <a href="#features" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50">{t('navigation.features')}</a>
                    <a href="#pricing" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50">{t('navigation.pricing')}</a>
                    <button
                      onClick={() => window.open('https://calendly.com/alex-finitsolutions/30min', '_blank')}
                      className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50 text-left"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                      </svg>
                      <span>Schedule Online Meeting</span>
                    </button>
                    <button
                      onClick={openContactModal}
                      className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50 text-left"
                    >
                      Contact Us
                    </button>
                    
                    {/* Mobile Language Switcher */}
                    <div className="px-3 py-2">
                      <LanguageSwitcher />
                    </div>
                    
                    {user ? (
                      <div className="flex flex-col space-y-3 pt-2 border-t border-gray-100">
                       {isHomepage && (
                         <button
                           onClick={() => navigate('/dashboard')}
                           className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-50 text-left"
                         >
                           {t('navigation.dashboard')}
                         </button>
                       )}
                        <div className="flex items-center space-x-3 px-3 py-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="text-gray-900 font-semibold text-sm">{user.name}</div>
                            <div className="text-xs text-gray-500 capitalize">{user.platform}</div>
                          </div>
                        </div>
                        <button
                          onClick={signOut}
                          className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-red-50 font-medium text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t('navigation.signOut')}</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={openModal}
                        className="group text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 flex items-center justify-center space-x-2"
                        style={{ backgroundColor: '#1C2C55' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F1A3A'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C2C55'}
                      >
                        <span>{t('navigation.getStarted')}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Routes */}
          <div className="pt-20">
            <Routes>
              <Route path="/" element={<Homepage openModal={openModal} openContactModal={openContactModal} />} />
              <Route path="/auth/:platform/callback" element={<AuthCallback />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/saas-agreement" element={<SaasAgreement />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/support" element={<Support />} />
            </Routes>
          </div>

          {!user && <AuthModal isOpen={isModalOpen} onClose={closeModal} />}
          <ContactFormModal isOpen={isContactModalOpen} onClose={closeContactModal} />
          
          {/* Cookie Banner */}
          <CookieBanner />
          
          {/* Cookie Settings Modal - Always available */}
          <CookieSettingsModal />

          {/* Cookie Settings Footer Link */}
          <div className="fixed bottom-4 right-4 z-40">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openCookieSettings'))}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-sm font-medium text-gray-700 hover:text-gray-900"
              aria-label={t('common.changeLanguage')}
            >
              <Cookie className="w-4 h-4" />
              <span className="hidden sm:inline">Cookie Settings</span>
            </button>
          </div>
        </div>
      </RTLProvider>
    </ConsentProvider>
  );
}

export default App;