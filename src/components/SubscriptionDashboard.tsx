import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Crown, Users, Zap, Settings } from 'lucide-react';
import { UserInfoCard } from './UserInfoCard';
import { WhatsAppVerification } from './WhatsAppVerification';

export const SubscriptionDashboard: React.FC = () => {
  const { user } = useAuth();

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'teamleader':
        return <Users className="w-6 h-6 text-emerald-600" />;
      case 'pipedrive':
        return <Zap className="w-6 h-6 text-orange-500" />;
      case 'odoo':
        return <Settings className="w-6 h-6 text-purple-600" />;
      default:
        return <Users className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Premium Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-sm p-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Crown className="w-8 h-8 text-yellow-300" />
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.name || 'Premium User'}!
          </h1>
        </div>
        <p className="text-blue-100">
          You have an active subscription. Enjoy all premium features including WhatsApp integration.
        </p>
      </div>

      {/* Platform Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-4">
          {user && getPlatformIcon(user.platform)}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Connected Platform: {user?.platform ? user.platform.charAt(0).toUpperCase() + user.platform.slice(1) : 'Unknown'}
            </h2>
            <p className="text-gray-600">Your CRM integration is active</p>
          </div>
        </div>
        {user?.user_info && (
          <UserInfoCard 
            platform={user.platform}
            userInfo={user.user_info}
            email={user.email}
          />
        )}
      </div>

      {/* WhatsApp Integration */}
      <WhatsAppVerification />

      {/* Premium Features */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Premium Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-green-800">WhatsApp Notifications</span>
            </div>
            <p className="text-sm text-green-600">Get instant updates via WhatsApp</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-blue-800">Advanced Analytics</span>
            </div>
            <p className="text-sm text-blue-600">Detailed insights and reports</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="font-medium text-purple-800">Priority Support</span>
            </div>
            <p className="text-sm text-purple-600">24/7 dedicated assistance</p>
          </div>
        </div>
      </div>
    </div>
  );
};