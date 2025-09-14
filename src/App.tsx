import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Users, LogOut, User, Menu, X, ArrowLeft } from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { AuthCallback } from './components/AuthCallback';
import { Dashboard } from './components/Dashboard';
import { BuyButton } from './components/BuyButton';
import { SuccessPage } from './components/SuccessPage';
import { Homepage } from './components/Homepage';
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

function App() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { user, loading, signOut } = useAuth();
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
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
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
                  alt="VoiceLink" 
                  className="h-10 w-auto group-hover:opacity-80 transition-opacity"
                />
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50">Features</a>
                <a href="#pricing" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50">Pricing</a>
                
                {user ? (
                  <div className="flex items-center space-x-6">
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
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={openModal}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 transform"
                  >
                    Sign In
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
                  <a href="#features" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50">Features</a>
                  <a href="#pricing" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50">Pricing</a>
                  
                  {user ? (
                    <div className="flex flex-col space-y-3 pt-2 border-t border-gray-100">
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
                        <span>Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={openModal}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 text-left shadow-lg"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>
                        {user.platform}
                      </span>
                    </div>
                    <button
                      onClick={signOut}
                      className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={openModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-xl transition-all duration-200 hover:shadow-lg"
                  >
                    Sign In
                  </button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden mt-4 pb-4 border-t border-gray-100">
                <div className="flex flex-col space-y-4 pt-4">
                  <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
                  <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
                  {!user && (
                    <button
                      onClick={openModal}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-xl transition-all duration-200 text-left"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Homepage openModal={openModal} />} />
          <Route path="/auth/:platform/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/saas-agreement" element={<SaasAgreement />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/support" element={<Support />} />
        </Routes>

        {!user && <AuthModal isOpen={isModalOpen} onClose={closeModal} />}
        
        {/* Cookie Banner */}
        <CookieBanner />
        
        {/* Cookie Settings Modal - Always available */}
        <CookieSettingsModal />
      </div>
    </ConsentProvider>
  );
}

export default App;