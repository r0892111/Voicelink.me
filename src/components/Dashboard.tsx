import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { Users, Zap, Settings, ShoppingBag } from 'lucide-react';
import { UserInfoCard } from './UserInfoCard';
import { BuyButton } from './BuyButton';
import { SubscriptionDashboard } from './SubscriptionDashboard';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hasActiveSubscription, loading: subscriptionLoading } = useSubscription();

  // Redirect non-authenticated users to homepage
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  // Don't render anything for non-authenticated users
  if (!user) {
    return null;
  }

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

  // Show loading state while checking subscription
  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show subscription dashboard if user has active subscription
  if (hasActiveSubscription) {
    return <SubscriptionDashboard />;
  }

  // Show regular dashboard for users without subscription
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
            priceId="price_1S2ZQPLPohnizGblvhj9qbK3"
            productName="Premium Monthly"
            price="€29.99/mo"
            description="Advanced CRM features and priority support"
          />
          
        </div>
      </div>
    </div>
  );
};