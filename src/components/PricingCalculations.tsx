import React from 'react';

// Pricing tier definitions
export interface PricingTier {
  name: string;
  minUsers: number;
  maxUsers: number;
  pricePerUser: number;
  discount: number;
  discountText: string;
}

export const pricingTiers: PricingTier[] = [
  { name: 'Starter', minUsers: 1, maxUsers: 4, pricePerUser: 29.90, discount: 0, discountText: '—' },
  { name: 'Team', minUsers: 5, maxUsers: 9, pricePerUser: 27.00, discount: 10, discountText: '10% off' },
  { name: 'Business', minUsers: 10, maxUsers: 24, pricePerUser: 24.00, discount: 20, discountText: '20% off' },
  { name: 'Growth', minUsers: 25, maxUsers: 49, pricePerUser: 21.00, discount: 30, discountText: '30% off' },
  { name: 'Scale', minUsers: 50, maxUsers: 99, pricePerUser: 18.00, discount: 40, discountText: '40% off' },
  { name: 'Enterprise', minUsers: 100, maxUsers: Infinity, pricePerUser: 15.00, discount: 50, discountText: '50%+ off' }
];

// Pricing calculation functions
export const getCurrentTier = (users: number): PricingTier => {
  return pricingTiers.find(tier => users >= tier.minUsers && users <= tier.maxUsers) || pricingTiers[0];
};

export const calculatePricing = (users: number) => {
  const tier = getCurrentTier(users);
  const monthlyPrice = tier.pricePerUser * users;
  const originalPrice = pricingTiers[0].pricePerUser * users;
  const savings = originalPrice - monthlyPrice;
  
  return {
    tier,
    monthlyPrice,
    originalPrice,
    savings,
    pricePerUser: tier.pricePerUser
  };
};

// Custom hook for pricing calculations
export const usePricingCalculations = (selectedUsers: number) => {
  return React.useMemo(() => calculatePricing(selectedUsers), [selectedUsers]);
};