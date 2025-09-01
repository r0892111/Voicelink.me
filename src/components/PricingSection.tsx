import React, { useState } from 'react';
import { PricingCard } from './PricingCard';
import { pricingPlans } from '../config/pricing';
import { StripeService } from '../services/stripeService';

interface PricingSectionProps {
  currentSubscription?: any;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ currentSubscription }) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = async (priceId: string) => {
    setLoading(priceId);
    
    try {
      const result = await StripeService.createCheckoutSession(priceId);
      
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        console.error('Failed to create checkout session:', result.error);
        alert(`Failed to start checkout: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('An error occurred while starting checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
        <p className="text-xl text-gray-600">
          Select the perfect plan for your CRM integration needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingPlans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            onSelectPlan={handleSelectPlan}
            loading={loading === plan.id}
            currentPlan={currentSubscription?.price_id === plan.id}
          />
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">
          All plans include secure OAuth integration and 24/7 uptime monitoring
        </p>
        <p className="text-sm text-gray-500">
          Need a custom solution? <a href="mailto:support@crmhub.com" className="text-blue-600 hover:text-blue-700">Contact our sales team</a>
        </p>
      </div>
    </div>
  );
};