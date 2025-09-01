import React from 'react';
import { Calendar, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';
import { StripeSubscription } from '../types/stripe';
import { formatPrice, formatDate } from '../lib/stripe';

interface SubscriptionStatusProps {
  subscription: StripeSubscription | null;
  onManageSubscription: () => void;
  loading?: boolean;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ 
  subscription, 
  onManageSubscription,
  loading = false 
}) => {
  if (!subscription) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
          <p className="text-gray-600 mb-4">
            You don't have an active subscription. Choose a plan to get started.
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'trialing':
        return 'text-blue-600 bg-blue-100';
      case 'past_due':
      case 'unpaid':
        return 'text-red-600 bg-red-100';
      case 'canceled':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'trialing':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Subscription Status</h3>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.subscription_status)}`}>
          {getStatusIcon(subscription.subscription_status)}
          <span className="capitalize">{subscription.subscription_status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {subscription.current_period_start && subscription.current_period_end && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900">Billing Period</span>
            </div>
            <p className="text-gray-600 text-sm">
              {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
            </p>
          </div>
        )}

        {subscription.payment_method_brand && subscription.payment_method_last4 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900">Payment Method</span>
            </div>
            <p className="text-gray-600 text-sm">
              {subscription.payment_method_brand.toUpperCase()} •••• {subscription.payment_method_last4}
            </p>
          </div>
        )}
      </div>

      {subscription.cancel_at_period_end && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">Subscription Ending</span>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            Your subscription will end on {subscription.current_period_end && formatDate(subscription.current_period_end)}
          </p>
        </div>
      )}

      <button
        onClick={onManageSubscription}
        disabled={loading}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Loading...</span>
          </div>
        ) : (
          'Manage Subscription'
        )}
      </button>
    </div>
  );
};