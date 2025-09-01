import { PricingPlan } from '../types/stripe';

export const pricingPlans: PricingPlan[] = [
  {
    id: 'price_starter_monthly',
    name: 'Starter',
    description: 'Perfect for small teams getting started with CRM integration',
    price: 2900, // $29.00
    currency: 'usd',
    interval: 'month',
    features: [
      'Connect 1 CRM platform',
      'Basic dashboard',
      'Email support',
      'Up to 1,000 contacts',
      'Standard integrations'
    ]
  },
  {
    id: 'price_professional_monthly',
    name: 'Professional',
    description: 'Advanced features for growing businesses',
    price: 5900, // $59.00
    currency: 'usd',
    interval: 'month',
    popular: true,
    features: [
      'Connect all CRM platforms',
      'Advanced analytics',
      'Priority support',
      'Up to 10,000 contacts',
      'Custom integrations',
      'WhatsApp notifications',
      'Advanced reporting'
    ]
  },
  {
    id: 'price_enterprise_monthly',
    name: 'Enterprise',
    description: 'Full-featured solution for large organizations',
    price: 12900, // $129.00
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited CRM connections',
      'Custom dashboard',
      'Dedicated support',
      'Unlimited contacts',
      'API access',
      'White-label options',
      'Advanced security',
      'Custom workflows'
    ]
  }
];