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
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/20" style={{ 
          background: 'linear-gradient(135deg, rgba(28, 44, 85, 0.9) 0%, rgba(255, 255, 255, 0.9) 50%, rgba(247, 230, 155, 0.9) 100%)'
        }}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/')}>
                {!isHomepage && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <ArrowLeft className="w-4 h-4 text-white" />
                  </div>
                )}
                {/* Blue logo on light background */}
                <img 
                  src="/Finit Voicelink White.svg" 
                  alt="VoiceLink" 
                  className="h-10 w-auto group-hover:opacity-80 transition-opacity"
                />
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-white/90 hover:text-white transition-colors font-medium">Features</a>
                <a href="#pricing" className="text-white/90 hover:text-white transition-colors font-medium">Pricing</a>
                
                {user ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white font-medium">{user.name}</span>
                      <span className="text-xs bg-white/20 text-white/90 px-2 py-1 rounded-full capitalize backdrop-blur-sm">
                        {user.platform}
                      </span>
                    </div>
                    <button
                      onClick={signOut}
                      className="flex items-center space-x-1 text-white/90 hover:text-white transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={openModal}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium py-2.5 px-6 rounded-xl transition-all duration-200 hover:shadow-lg border border-white/30"
                  >
                    Sign In
                  </button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-white/90 hover:text-white"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden mt-4 pb-4 border-t border-white/20">
                <div className="flex flex-col space-y-4 pt-4">
                  <a href="#features" className="text-white/90 hover:text-white transition-colors font-medium">Features</a>
                  <a href="#pricing" className="text-white/90 hover:text-white transition-colors font-medium">Pricing</a>
                  {!user && (
                    <button
                      onClick={openModal}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium py-2.5 px-6 rounded-xl transition-all duration-200 text-left border border-white/30"
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