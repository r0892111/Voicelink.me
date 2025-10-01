import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { BillingPeriodSwitch, BillingPeriod } from './BillingPeriodSwitch';
import { useI18n } from '../hooks/useI18n';

interface PricingSectionProps {
  selectedUsers: number;
  setSelectedUsers: (users: number) => void;
  openModal: () => void;
  openContactModal: () => void;
}

interface PricingTier {
  name: string;
  minUsers: number;
  maxUsers: number | null;
  monthlyPricePerUser: number;
  yearlyPricePerUser: number;
  discount: number;
}

const pricingTiers: PricingTier[] = [
  { name: 'Starter', minUsers: 1, maxUsers: 4, monthlyPricePerUser: 29.90, yearlyPricePerUser: 23.92, discount: 0 },
  { name: 'Team', minUsers: 5, maxUsers: 9, monthlyPricePerUser: 27.00, yearlyPricePerUser: 21.60, discount: 10 },
  { name: 'Business', minUsers: 10, maxUsers: 24, monthlyPricePerUser: 24.00, yearlyPricePerUser: 19.20, discount: 20 },
  { name: 'Growth', minUsers: 25, maxUsers: 49, monthlyPricePerUser: 21.00, yearlyPricePerUser: 16.80, discount: 30 },
  { name: 'Scale', minUsers: 50, maxUsers: 99, monthlyPricePerUser: 18.00, yearlyPricePerUser: 14.40, discount: 40 },
  { name: 'Enterprise', minUsers: 100, maxUsers: null, monthlyPricePerUser: 15.00, yearlyPricePerUser: 12.00, discount: 50 },
];

const getCurrentTier = (users: number): PricingTier => {
  return pricingTiers.find(tier => 
    users >= tier.minUsers && (tier.maxUsers === null || users <= tier.maxUsers)
  ) || pricingTiers[0];
};

const getTierDisplayName = (users: number): string => {
  const tier = getCurrentTier(users);
  return `VoiceLink ${tier.name}`;
};

const calculatePricing = (users: number, billingPeriod: BillingPeriod) => {
  const tier = getCurrentTier(users);
  const pricePerUser = billingPeriod === 'monthly' ? tier.monthlyPricePerUser : tier.yearlyPricePerUser;
  const monthlyPrice = pricePerUser * users;
  const monthlyEquivalent = tier.monthlyPricePerUser * users;
  const yearlyEquivalent = monthlyEquivalent * 12;
  const isEnterprise = tier.name === 'Enterprise';
  
  let savings = 0;
  if (billingPeriod === 'monthly') {
    // No savings for monthly billing
    savings = 0;
  } else {
    // Yearly savings: difference between paying monthly vs yearly
    const currentYearlyPrice = monthlyPrice * 12;
    savings = yearlyEquivalent - currentYearlyPrice;
  }
  
  return {
    tier,
    price: monthlyPrice,
    originalPrice: billingPeriod === 'monthly' ? monthlyEquivalent : yearlyEquivalent,
    savings,
    pricePerUser,
    billingPeriod,
    isEnterprise
  };
};

export const PricingSection: React.FC<PricingSectionProps> = ({
  selectedUsers,
  setSelectedUsers,
  openModal,
  openContactModal
}) => {
  const { t } = useI18n();
  const [billingPeriod, setBillingPeriod] = React.useState<BillingPeriod>('monthly');
  const [isCustom, setIsCustom] = React.useState(false);
  const [customInput, setCustomInput] = React.useState('');
  const pricing = calculatePricing(selectedUsers, billingPeriod);

  // Predefined user options
  const predefinedOptions = [1, 2, 3, 5, 10, 25, 50, 100];
  
  const handleUserCountChange = (value: string) => {
    if (value === 'custom') {
      setIsCustom(true);
      setCustomInput('');
    } else {
      setIsCustom(false);
      setSelectedUsers(parseInt(value));
    }
  };
  
  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomInput(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setSelectedUsers(numValue);
    }
  };

  return (
    <div className="max-w-7xl mx-auto mobile-spacing">
      <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="mobile-text-3xl font-bold mb-4 sm:mb-6" style={{ color: '#1C2C55' }}>
          {t('pricing.title')}
        </h2>
        <p className="mobile-text-lg text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-12">
          {t('pricing.subtitle')}
        </p>
      </div>
      
      <div className="flex items-center justify-center mb-8 sm:mb-12">
        <BillingPeriodSwitch 
          billingPeriod={billingPeriod}
          onBillingPeriodChange={setBillingPeriod}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-stretch">
        {/* Pricing Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100 animate-fade-in-left h-full flex flex-col mobile-card" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center space-x-3 mb-4 sm:mb-6">
            <img 
              src="/Finit Icon Blue.svg" 
              alt={t('common.voiceLink')} 
              className="w-10 sm:w-12 h-10 sm:h-12"
            />
            <div>
              <h3 className="mobile-text-xl font-bold" style={{ color: '#1C2C55' }}>{getTierDisplayName(selectedUsers)}</h3>
              <p className="mobile-text-sm text-gray-600">{t('pricing.perfectForTeams')}</p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            {[
              t('pricing.features.unlimitedVoiceNotes'),
              t('pricing.features.realtimeCrmSync'),
              t('pricing.features.nativeWhatsappIntegration'),
              t('pricing.features.multiLanguageSupport'),
              t('pricing.features.prioritySupport')
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1C2C55' }}>
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="mobile-text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label htmlFor="users" className="block text-sm font-medium text-gray-700 mb-3">
              {t('pricing.numberOfUsers')}
            </label>
            <select
              id="users"
              value={isCustom ? 'custom' : selectedUsers.toString()}
              onChange={(e) => handleUserCountChange(e.target.value)}
              className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent mobile-text-base tap-target"
            >
              {predefinedOptions.map(num => (
                <option key={num} value={num}>
                  {t('pricing.users', { count: num })}
                </option>
              ))}
              <option value="custom">{t('pricing.customAmount')}</option>
            </select>
            
            {isCustom && (
              <input
                type="number"
                min="1"
                value={customInput}
                onChange={handleCustomInputChange}
                placeholder={t('pricing.enterNumberOfUsers')}
                className="w-full mt-3 px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent mobile-text-base tap-target"
              />
            )}
            
          </div>

          {pricing.isEnterprise ? (
            <div className="text-center mb-6 mt-auto">
              <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl sm:rounded-2xl">
                <div className="mb-4">
                  <h4 className="mobile-text-xl font-bold mb-2" style={{ color: '#1C2C55' }}>
                    {t('pricing.enterprisePricing')}
                  </h4>
                  <p className="mobile-text-sm text-gray-600">
                    {t('pricing.customPricingFor', { count: selectedUsers })}
                  </p>
                </div>
                <div className="space-y-2 sm:space-y-3 mb-4">
                  <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-700">
                    <span>✓</span>
                    <span>{t('pricing.dedicatedAccountManager')}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-700">
                    <span>✓</span>
                    <span>{t('pricing.customIntegrations')}</span>
                  </div>
                </div>
                <button 
                  onClick={openContactModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 sm:px-6 py-3 rounded-xl transition-colors tap-target mobile-text-sm"
                >
                  {t('pricing.getCustomQuote')}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center mb-6 mt-auto">
              <div className="flex items-baseline justify-center space-x-2 mb-2">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold" style={{ color: '#1C2C55' }}>
                  €{pricing.pricePerUser.toFixed(2)}
                </span>
                <span className="mobile-text-base text-gray-600">{t('pricing.perUserPerMonth')}</span>
              </div>
              <p className="mobile-text-sm text-gray-600 mb-2">
                {t('pricing.users', { count: selectedUsers })}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                {t('pricing.total', { 
                  amount: (billingPeriod === 'yearly' ? pricing.price * 12 : pricing.price).toFixed(2),
                  period: billingPeriod === 'yearly' ? t('pricing.yearly') : t('pricing.monthly')
                })}
              </p>
              {pricing.savings > 0 && (
                <div className="mt-3 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-semibold text-xs sm:text-sm">
                    {t('pricing.annualSavings', { amount: pricing.savings.toFixed(2) })}
                  </p>
                  <p className="text-green-600 text-xs mt-1">
                    {t('pricing.yearlyDiscount')}
                  </p>
                </div>
              )}
            </div>
          )}

          {!pricing.isEnterprise && (
            <div className="mt-auto">
              <button
                onClick={openModal}
                className="w-full text-white font-semibold mobile-btn rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center space-x-2 group tap-target"
                style={{ backgroundColor: '#1C2C55' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F1A3A'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C2C55'}
              >
                <span>{t('pricing.startFreeTrial')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <p className="text-center text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                {t('pricing.freeTrial')}
              </p>
            </div>
          )}
        </div>

        {/* Volume Discount Table */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100 animate-fade-in-right h-full flex flex-col mobile-card" style={{ animationDelay: '0.6s' }}>
          <h3 className="mobile-text-xl font-bold mb-4 sm:mb-6 text-center" style={{ color: '#1C2C55' }}>
            {t('pricing.volumeDiscountTiers')}
          </h3>
          <p className="mobile-text-sm text-gray-600 text-center mb-4 sm:mb-6">
            {t('pricing.automaticDiscounts')}
          </p>
          <div className="text-center mb-4 sm:mb-6">
            <p className="mobile-text-sm text-gray-600">
              {t('pricing.automaticDiscounts')}
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-gray-200 flex-grow mb-4">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">{t('pricing.plan')}</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">{t('pricing.teamSize')}</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">{t('pricing.pricePerUser')}</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">{t('pricing.discount')}</th>
                </tr>
              </thead>
              <tbody>
                {pricingTiers.map((tier, index) => {
                  const isCurrentTier = tier.name === pricing.tier.name;
                  const isEnterpriseTier = tier.name === 'Enterprise';
                  const isStarterTier = tier.name === 'Starter';
                  return (
                    <tr 
                      key={tier.name}
                      className={`border-b border-gray-100 transition-all duration-300 ${
                        isCurrentTier 
                          ? 'bg-blue-50 hover:bg-blue-100'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className={`px-3 sm:px-6 py-3 sm:py-4 font-medium ${
                        isCurrentTier ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {tier.name}
                        {isCurrentTier && (
                          <span className="ml-1 sm:ml-2 inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {t('pricing.current')}
                          </span>
                        )}
                      </td>
                      <td className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm ${
                        isCurrentTier ? 'text-blue-800' : 'text-gray-600'
                      }`}>
                        {tier.minUsers}–{tier.maxUsers || '∞'} users
                      </td>
                      <td className={`px-3 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm ${
                        isCurrentTier ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {isEnterpriseTier ? (
                          <span className="text-gray-500">{t('pricing.custom')}</span>
                        ) : (
                          `€${(billingPeriod === 'monthly' ? tier.monthlyPricePerUser : tier.yearlyPricePerUser).toFixed(2)}`
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        {isEnterpriseTier ? (
                          <button 
                           onClick={openContactModal}
                           className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer tap-target">
                            {t('pricing.contactUs')}
                          </button>
                        ) : tier.discount > 0 ? (
                          <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            tier.discount >= 50 ? 'bg-blue-100 text-blue-800' :
                            tier.discount >= 30 ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {t('pricing.off', { percent: tier.discount })}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
            <p className="text-xs sm:text-sm text-gray-600 text-center">
              {t('pricing.allPlansInclude')}
            </p>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 rounded-full opacity-5" style={{ backgroundColor: '#1C2C55' }}></div>
        <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 rounded-full opacity-5" style={{ backgroundColor: '#F7E69B' }}></div>
      </div>
    </div>
  );
};