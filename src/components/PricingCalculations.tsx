import React from 'react';

interface PricingTier {
  name: string;
  minUsers: number;
  maxUsers: number | null;
  pricePerUser: number;
  discount: number;
  discountLabel: string;
}

interface PricingCalculationsProps {
  selectedUsers: number;
  onUsersChange: (users: number) => void;
}

export const PricingCalculations: React.FC<PricingCalculationsProps> = ({
  selectedUsers,
  onUsersChange
}) => {
  const pricingTiers: PricingTier[] = [
    { name: 'Starter', minUsers: 1, maxUsers: 4, pricePerUser: 29.90, discount: 0, discountLabel: '—' },
    { name: 'Team', minUsers: 5, maxUsers: 9, pricePerUser: 27.00, discount: 10, discountLabel: '10% off' },
    { name: 'Business', minUsers: 10, maxUsers: 24, pricePerUser: 24.00, discount: 20, discountLabel: '20% off' },
    { name: 'Growth', minUsers: 25, maxUsers: 49, pricePerUser: 21.00, discount: 30, discountLabel: '30% off' },
    { name: 'Scale', minUsers: 50, maxUsers: 99, pricePerUser: 18.00, discount: 40, discountLabel: '40% off' },
    { name: 'Enterprise', minUsers: 100, maxUsers: null, pricePerUser: 15.00, discount: 50, discountLabel: '50%+ off' }
  ];

  const getCurrentTier = (): PricingTier => {
    return pricingTiers.find(tier => 
      selectedUsers >= tier.minUsers && (tier.maxUsers === null || selectedUsers <= tier.maxUsers)
    ) || pricingTiers[0];
  };

  const currentTier = getCurrentTier();
  const monthlyPrice = currentTier.pricePerUser * selectedUsers;
  const originalPrice = 29.90 * selectedUsers;
  const savings = originalPrice - monthlyPrice;

  return {
    pricingTiers,
    currentTier,
    monthlyPrice,
    originalPrice,
    savings,
    selectedUsers,
    onUsersChange
  };
};

// Export the hook for use in other components
export const usePricingCalculations = (selectedUsers: number, onUsersChange: (users: number) => void) => {
  const pricingTiers: PricingTier[] = [
    { name: 'Starter', minUsers: 1, maxUsers: 4, pricePerUser: 29.90, discount: 0, discountLabel: '—' },
    { name: 'Team', minUsers: 5, maxUsers: 9, pricePerUser: 27.00, discount: 10, discountLabel: '10% off' },
    { name: 'Business', minUsers: 10, maxUsers: 24, pricePerUser: 24.00, discount: 20, discountLabel: '20% off' },
    { name: 'Growth', minUsers: 25, maxUsers: 49, pricePerUser: 21.00, discount: 30, discountLabel: '30% off' },
    { name: 'Scale', minUsers: 50, maxUsers: 99, pricePerUser: 18.00, discount: 40, discountLabel: '40% off' },
    { name: 'Enterprise', minUsers: 100, maxUsers: null, pricePerUser: 15.00, discount: 50, discountLabel: '50%+ off' }
  ];

  const getCurrentTier = (): PricingTier => {
    return pricingTiers.find(tier => 
      selectedUsers >= tier.minUsers && (tier.maxUsers === null || selectedUsers <= tier.maxUsers)
    ) || pricingTiers[0];
  };

  const currentTier = getCurrentTier();
  const monthlyPrice = currentTier.pricePerUser * selectedUsers;
  const originalPrice = 29.90 * selectedUsers;
  const savings = originalPrice - monthlyPrice;

  return {
    pricingTiers,
    currentTier,
    monthlyPrice,
    originalPrice,
    savings
  };
};

export type { PricingTier };