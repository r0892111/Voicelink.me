import React from 'react';
import { useI18n } from '../hooks/useI18n';

export type BillingPeriod = 'monthly' | 'yearly';

interface BillingPeriodSwitchProps {
  billingPeriod: BillingPeriod;
  onBillingPeriodChange: (period: BillingPeriod) => void;
}

export const BillingPeriodSwitch: React.FC<BillingPeriodSwitchProps> = ({
  billingPeriod,
  onBillingPeriodChange
}) => {
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="bg-gray-100 rounded-full p-1 flex items-center">
        <button
          onClick={() => onBillingPeriodChange('monthly')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            billingPeriod === 'monthly'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('pricing.monthly')}
        </button>
        <button
          onClick={() => onBillingPeriodChange('yearly')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 relative ${
            billingPeriod === 'yearly'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('pricing.yearly')}
          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
            {t('pricing.save20')}
          </span>
        </button>
      </div>
    </div>
  );
};