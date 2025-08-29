import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Clear any stored authentication data
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">CRM Hub</span>
          </div>
          
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
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