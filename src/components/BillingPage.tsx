import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SubscriptionStatus } from './SubscriptionStatus';
import { OrderHistory } from './OrderHistory';
import { PricingSection } from './PricingSection';
import { StripeService } from '../services/stripeService';
import { StripeSubscription, StripeOrder } from '../types/stripe';

export const BillingPage: React.FC = () => {
  const [subscription, setSubscription] = useState<StripeSubscription | null>(null);
  const [orders, setOrders] = useState<StripeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadBillingData();
    
    // Handle success/cancel redirects from Stripe
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success) {
      // Refresh data after successful payment
      setTimeout(() => {
        loadBillingData();
      }, 2000);
    }
  }, [searchParams]);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const [subscriptionData, ordersData] = await Promise.all([
        StripeService.getUserSubscription(),
        StripeService.getUserOrders()
      ]);
      
      setSubscription(subscriptionData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    
    try {
      const result = await StripeService.createPortalSession();
      
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        console.error('Failed to create portal session:', result.error);
        alert(`Failed to open billing portal: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      alert('An error occurred while opening the billing portal. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscriptions</h1>
        </div>

        {/* Success/Cancel Messages */}
        {searchParams.get('success') && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Payment Successful!</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Your subscription has been activated. It may take a few moments to update.
            </p>
          </div>
        )}

        {searchParams.get('canceled') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Payment Canceled</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              Your payment was canceled. You can try again anytime.
            </p>
          </div>
        )}

        <div className="space-y-8">
          {/* Subscription Status */}
          <SubscriptionStatus 
            subscription={subscription}
            onManageSubscription={handleManageSubscription}
            loading={portalLoading}
          />

          {/* Pricing Plans (only show if no active subscription) */}
          {(!subscription || subscription.subscription_status !== 'active') && (
            <PricingSection currentSubscription={subscription} />
          )}

          {/* Order History */}
          <OrderHistory orders={orders} />
        </div>
      </div>
    </div>
  );
};