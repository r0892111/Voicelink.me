import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 pt-16">
        <div className="bg-white rounded-xl shadow-sm p-8 relative">
          {/* User Info Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to your CRM Dashboard, {user.name}!
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