import React from 'react';
import { Users, Zap, Settings, X } from 'lucide-react';

function App() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleSignIn = async (platform: string) => {
    try {
      let authUrl = '';
      
      switch (platform) {
        case 'Teamleader':
          authUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/teamleader-auth`;
          break;
        case 'Pipedrive':
          authUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pipedrive-auth`;
          break;
        case 'Odoo':
          authUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/odoo-auth`;
          break;
        default:
          console.error('Unknown platform:', platform);
          return;
      }

      // Redirect to the authentication endpoint
      window.location.href = authUrl;
      
    } catch (error) {
      console.error(`Error signing in with ${platform}:`, error);
    }
  };

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

      {/* Main Content Area - Blank */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Content will go here */}
      </main>

      {/* Sign-in Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Platform</h2>
              <p className="text-gray-600">Sign in with your preferred CRM platform</p>
            </div>

            {/* Sign-in Options */}
            <div className="space-y-4">
              {/* Teamleader Button */}
              <button
                onClick={() => handleSignIn('Teamleader')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center justify-center space-x-3"
              >
                <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                  <span className="text-emerald-600 font-bold text-sm">T</span>
                </div>
                <span>Sign in with Teamleader</span>
              </button>

              {/* Pipedrive Button */}
              <button
                onClick={() => handleSignIn('Pipedrive')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center justify-center space-x-3"
              >
                <Zap className="w-6 h-6" />
                <span>Sign in with Pipedrive</span>
              </button>

              {/* Odoo Button */}
              <button
                onClick={() => handleSignIn('Odoo')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center justify-center space-x-3"
              >
                <Settings className="w-6 h-6" />
                <span>Sign in with Odoo</span>
              </button>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                Secure authentication powered by OAuth 2.0
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;