import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Clear any stored authentication data
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 pt-16">
        <div className="bg-white rounded-xl shadow-sm p-8 relative">
          <button
            onClick={handleSignOut}
            className="absolute top-4 right-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to your CRM Dashboard
          </h1>
          <p className="text-gray-600">
            You have successfully authenticated with your CRM platform. 
            Your dashboard content will appear here.
          </p>
        </div>
      </main>
    </div>
  );
};