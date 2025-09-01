import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Users, Zap, Settings, ShoppingBag } from 'lucide-react';
import { UserInfoCard } from './UserInfoCard';
import { BuyButton } from './BuyButton';

export const Dashboard: React.FC = () => {
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
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center space-x-3 mb-4">
          {user && getPlatformIcon(user.platform)}
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'User'}!
          </h1>
        </div>
        <p className="text-gray-600">
          You're connected to {user?.platform && user.platform.charAt(0).toUpperCase() + user.platform.slice(1)}. 
          Your CRM data and tools are ready to use.
        </p>
      </div>

      {/* Platform Info */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Platform</h3>
            <div className="flex items-center space-x-2">
              {user && getPlatformIcon(user.platform)}
              <span className="capitalize font-medium">{user?.platform}</span>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* User Information */}
      {user?.user_info && (
        <UserInfoCard 
          platform={user.platform}
          userInfo={user.user_info}
          email={user.email}
        />
      )}

      {/* Quick Purchase Section */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center space-x-2 mb-6">
          <ShoppingBag className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Upgrade Your Experience</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BuyButton
            priceId="price_premium_monthly"
            productName="Premium Monthly"
            price="$29.99/mo"
            description="Advanced CRM features and priority support"
          />
          
          <BuyButton
            priceId="price_premium_yearly"
            productName="Premium Yearly"
            price="$299.99/yr"
            description="Save 17% with annual billing"
          />
          
          <BuyButton
            priceId="price_addon_analytics"
            productName="Analytics Add-on"
            price="$9.99"
            description="One-time purchase for advanced analytics"
          />
        </div>
      </div>
    </div>
  );
};