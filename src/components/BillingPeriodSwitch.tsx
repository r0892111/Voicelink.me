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
    <div className="flex items-center justify-center">
      <div className="bg-navy/[0.04] rounded-full p-1.5 flex items-center">
        <button
          onClick={() => onBillingPeriodChange('monthly')}
          className={`px-8 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
            billingPeriod === 'monthly'
              ? 'bg-white text-navy shadow-sm'
              : 'text-slate-blue hover:text-navy'
          }`}
        >
          {t('pricing.monthly')}
        </button>
        <button
          onClick={() => onBillingPeriodChange('yearly')}
          className={`px-8 py-2.5 rounded-full text-sm font-medium transition-all duration-300 relative ${
            billingPeriod === 'yearly'
              ? 'bg-white text-navy shadow-sm'
              : 'text-slate-blue hover:text-navy'
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
