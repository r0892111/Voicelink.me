import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { useI18n } from '../hooks/useI18n';
import { Users, Zap, Settings, ShoppingBag } from 'lucide-react';
import { UserInfoCard } from './UserInfoCard';
import { BuyButton } from './BuyButton';
import { SubscriptionDashboard } from './SubscriptionDashboard';
import { supabase } from '../lib/supabase';
import { StripeService } from '../services/stripeService';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { hasActiveSubscription, loading: subscriptionLoading } = useSubscription();
  const { t } = useI18n();
  const navigate = useNavigate();

  // Check for pending subscription check after magic link redirect (for Teamleader auth)
  useEffect(() => {
    const checkPendingSubscription = async () => {
      const pendingCheck = sessionStorage.getItem('pending_subscription_check');
      const authPlatform = sessionStorage.getItem('auth_platform');
      
      if (pendingCheck === 'true' && authPlatform) {
        // Wait a bit for session to be established
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Clear the flag
          sessionStorage.removeItem('pending_subscription_check');
          sessionStorage.removeItem('auth_platform');
          
          // Check subscription status
          const provider = localStorage.getItem('auth_provider') || localStorage.getItem('userPlatform') || authPlatform;
          
          try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-subscription?provider=${provider || 'unknown'}`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
            });

            const result = await response.json();
            const hasActiveSub = result.success && (result.subscription?.subscription_status === 'active' || result.subscription?.subscription_status === 'trialing');

            if (!hasActiveSub) {
              // User doesn't have subscription, redirect to Stripe checkout
              await StripeService.createCheckoutSession({
                priceId: 'price_1S5o6zLPohnizGblsQq7OYCT',
                quantity: 1,
                successUrl: `${window.location.origin}/dashboard`,
                cancelUrl: `${window.location.origin}/dashboard`,
              });
            }
            // If has subscription, Dashboard will show SubscriptionDashboard automatically
          } catch (error) {
            console.error('Error checking subscription after magic link:', error);
          }
        }
      }
    };
    
    if (user) {
      checkPendingSubscription();
    }
  }, [user, navigate]);

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
          <p className="text-gray-600">{t('common.loadingDashboard')}</p>
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
            {t('dashboard.welcome', { name: user?.name || 'User' })}
          </h1>
        </div>
        <p className="text-gray-600">
          {t('dashboard.connectedToPlatform', { 
            platform: user?.platform && user.platform.charAt(0).toUpperCase() + user.platform.slice(1) 
          })}
        </p>
      </div>

      {/* Platform Info */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.platformInformation')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">{t('common.platform')}</h3>
            <div className="flex items-center space-x-2">
              {user && getPlatformIcon(user.platform)}
              <span className="capitalize font-medium">{user?.platform}</span>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">{t('userInfo.emailAddress')}</h3>
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
          <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.upgradeExperience')}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BuyButton
            priceId="price_1S5o6zLPohnizGblsQq7OYCT"
            productName={t('common.premiumMonthly')}
            price="€29.90/mo"
            description={t('common.advancedCrmFeatures')}
          />
          
        </div>
      </div>
    </div>
  );
};