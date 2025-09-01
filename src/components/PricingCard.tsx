import React from 'react';
import { Check, Star } from 'lucide-react';
import { PricingPlan } from '../types/stripe';
import { formatPrice } from '../lib/stripe';

interface PricingCardProps {
  plan: PricingPlan;
  onSelectPlan: (priceId: string) => void;
  loading?: boolean;
  currentPlan?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({ 
  plan, 
  onSelectPlan, 
  loading = false,
  currentPlan = false 
}) => {
  return (
    <div className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
      plan.popular ? 'border-blue-500 scale-105' : 'border-gray-200 hover:border-blue-300'
    }`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
            <Star className="w-4 h-4" />
            <span>Most Popular</span>
          </div>
        </div>
      )}
      
      <div className="p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
          <p className="text-gray-600 mb-4">{plan.description}</p>
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-bold text-gray-900">
              {formatPrice(plan.price, plan.currency)}
            </span>
            <span className="text-gray-600 ml-1">/{plan.interval}</span>
          </div>
        </div>

        <ul className="space-y-4 mb-8">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => onSelectPlan(plan.id)}
          disabled={loading || currentPlan}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
            currentPlan
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : plan.popular
              ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
              : 'bg-gray-900 hover:bg-gray-800 text-white hover:shadow-lg'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : currentPlan ? (
            'Current Plan'
          ) : (
            `Choose ${plan.name}`
          )}
        </button>
      </div>
    </div>
  );
};