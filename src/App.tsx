import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Users, LogOut, User, CreditCard } from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { AuthCallback } from './components/AuthCallback';
import { Dashboard } from './components/Dashboard';
import { BillingPage } from './components/BillingPage';
import { useAuth } from './hooks/useAuth';

function App() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { user, loading, signOut } = useAuth();

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">CRM Hub</span>
          </div>
          
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => window.location.href = '/billing'}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Billing</span>
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-900 font-medium">{user.name}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
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
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-md"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Routes */}
      <Routes>
        <Route path="/" element={
          <main className="max-w-7xl mx-auto px-6 py-8">
            {user ? (
              <Dashboard />
            ) : (
              <div className="text-center py-16">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Welcome to CRM Hub
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Connect with your favorite CRM platform to get started
                </p>
                <button
                  onClick={openModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg"
                >
                  Get Started
                </button>
              </div>
            )}
          </main>
        } />
        <Route path="/auth/:platform/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/billing" element={<BillingPage />} />
      </Routes>

      {!user && <AuthModal isOpen={isModalOpen} onClose={closeModal} />}
    </div>
  );
}

export default App;