import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Users } from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { AuthCallback } from './components/AuthCallback';
import { Dashboard } from './components/Dashboard';

function App() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

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
            <button
              onClick={openModal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-md"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Routes */}
      <Routes>
        <Route path="/" element={
          <main className="max-w-7xl mx-auto px-6 py-8">
            {/* Blank main content */}
          </main>
        } />
        <Route path="/auth/:platform/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>

      <AuthModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}

export default App;