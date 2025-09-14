import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { BillingPeriodSwitch, BillingPeriod } from './BillingPeriodSwitch';

interface PricingSectionProps {
  selectedUsers: number;
  setSelectedUsers: (users: number) => void;
  openModal: () => void;
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
  openModal
}) => {
  const [billingPeriod, setBillingPeriod] = React.useState<BillingPeriod>('monthly');
  const [customInput, setCustomInput] = React.useState('');
  const [isCustom, setIsCustom] = React.useState(false);
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
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: '#1C2C55' }}>
          Volume Pricing That Scales With You
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
          Per user pricing. Start free, upgrade when you're ready. No hidden fees.
        </p>
      </div>
      
      <div className="flex items-center justify-center mb-12">
        <BillingPeriodSwitch 
          billingPeriod={billingPeriod}
          onBillingPeriodChange={setBillingPeriod}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-stretch">
        {/* Pricing Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100 animate-fade-in-left h-full flex flex-col" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center space-x-3 mb-6">
            <img 
              src="/Finit Icon Blue.svg" 
              alt="VoiceLink" 
              className="w-12 h-12"
            />
            <div>
              <h3 className="text-2xl font-bold" style={{ color: '#1C2C55' }}>VoiceLink Pro</h3>
              <p className="text-gray-600">Perfect for growing teams</p>
            </div>
          </div>

          <div className="space-y-6 mb-8 flex-grow h-full flex flex-col justify-center">
            {[
              'Unlimited WhatsApp voice notes',
              'Real-time CRM sync',
              'Native WhatsApp integration',
              'Multi-language support',
              'Priority support'
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1C2C55' }}>
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <label htmlFor="users" className="block text-sm font-medium text-gray-700 mb-3">
              Number of Users
            </label>
            <select
              id="users"
              value={isCustom ? 'custom' : selectedUsers.toString()}
              onChange={(e) => handleUserCountChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            >
              {predefinedOptions.map(num => (
                <option key={num} value={num}>
                  {num} user{num !== 1 ? 's' : ''}
                </option>
              ))}
              <option value="custom">Custom amount</option>
            </select>
            
            {isCustom && (
              <input
                type="number"
                min="1"
                value={customInput}
                onChange={handleCustomInputChange}
                placeholder="Enter number of users"
                className="w-full mt-3 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            )}
            
          </div>

          {pricing.isEnterprise ? (
            <div className="text-center mb-8 mt-auto">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl">
                <div className="mb-4">
                  <h4 className="text-2xl font-bold mb-2" style={{ color: '#1C2C55' }}>
                    Enterprise Pricing
                  </h4>
                  <p className="text-gray-600">
                    Custom pricing for {selectedUsers}+ users
                  </p>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-700">
                    <span>✓</span>
                    <span>Dedicated account manager</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-700">
                    <span>✓</span>
                    <span>Custom integrations & features</span>
                  </div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                  Get Custom Quote
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center mb-8 mt-auto">
              <div className="flex items-baseline justify-center space-x-2 mb-2">
                <span className="text-5xl font-bold" style={{ color: '#1C2C55' }}>
                  €{pricing.pricePerUser.toFixed(2)}
                </span>
                <span className="text-xl text-gray-600">/user/month</span>
              </div>
              <p className="text-gray-600 mb-2">
                {selectedUsers} user{selectedUsers !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-gray-500">
                Total: €{(billingPeriod === 'yearly' ? pricing.price * 12 : pricing.price).toFixed(2)}/{billingPeriod}
              </p>
              {pricing.savings > 0 && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-semibold text-sm">
                    Annual Savings: €{pricing.savings.toFixed(2)}
                  </p>
                  <p className="text-green-600 text-xs mt-1">
                    20% discount applied for yearly billing
                  </p>
                </div>
              )}
            </div>
          )}

          {!pricing.isEnterprise && (
            <div className="mt-auto">
              <button
                onClick={openModal}
                className="w-full text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 flex items-center justify-center space-x-2 group"
                style={{ backgroundColor: '#1C2C55' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F1A3A'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C2C55'}
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <p className="text-center text-sm text-gray-500 mt-4">
                14-day free trial • No credit card required
              </p>
            </div>
          )}
        </div>

        {/* Volume Discount Table */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100 animate-fade-in-right h-full flex flex-col" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: '#1C2C55' }}>
            Volume Discount Tiers
          </h3>
          <p className="text-gray-600 text-center mb-8">
            Automatic discounts applied based on team size
          </p>

          <div className="overflow-hidden rounded-2xl border border-gray-200 flex-grow">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Plan</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Team Size</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price per User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Discount</th>
                </tr>
              </thead>
              <tbody>
                {pricingTiers.map((tier, index) => {
                  const isCurrentTier = tier.name === pricing.tier.name;
                  const isEnterpriseTier = tier.name === 'Enterprise';
                  return (
                    <tr 
                      key={tier.name}
                      className={`border-b border-gray-100 transition-all duration-300 ${
                        isCurrentTier 
                          ? 'bg-blue-50 border-blue-200 shadow-sm' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className={`px-6 py-4 font-medium ${
                        isCurrentTier ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {tier.name}
                        {isCurrentTier && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Current
                          </span>
                        )}
                      </td>
                      <td className={`px-6 py-4 ${
                        isCurrentTier ? 'text-blue-800' : 'text-gray-600'
                      }`}>
                        {tier.minUsers}–{tier.maxUsers || '∞'} users
                      </td>
                      <td className={`px-6 py-4 font-semibold ${
                        isCurrentTier ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {isEnterpriseTier ? (
                          <span className="text-gray-500">Custom</span>
                        ) : (
                          `€${(billingPeriod === 'monthly' ? tier.monthlyPricePerUser : tier.yearlyPricePerUser).toFixed(2)}`
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEnterpriseTier ? (
                          <button className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                            Contact Us
                          </button>
                        ) : tier.discount > 0 ? (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            tier.discount >= 50 ? 'bg-blue-100 text-blue-800' :
                            tier.discount >= 30 ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {tier.discount}% off
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

          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 text-center">
              All plans include unlimited WhatsApp voice notes, real-time CRM sync, and priority support.
              {billingPeriod === 'yearly' && ' Yearly plans include 20% discount and priority onboarding.'}
            </p>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-5" style={{ backgroundColor: '#1C2C55' }}></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-5" style={{ backgroundColor: '#F7E69B' }}></div>
        </div>
      </div>
    </div>
  );
};