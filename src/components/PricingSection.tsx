import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

interface PricingSectionProps {
  selectedUsers: number;
  setSelectedUsers: (users: number) => void;
  openModal: () => void;
}

interface PricingTier {
  name: string;
  minUsers: number;
  maxUsers: number | null;
  pricePerUser: number;
  discount: number;
}

const pricingTiers: PricingTier[] = [
  { name: 'Starter', minUsers: 1, maxUsers: 4, pricePerUser: 29.90, discount: 0 },
  { name: 'Team', minUsers: 5, maxUsers: 9, pricePerUser: 27.00, discount: 10 },
  { name: 'Business', minUsers: 10, maxUsers: 24, pricePerUser: 24.00, discount: 20 },
  { name: 'Growth', minUsers: 25, maxUsers: 49, pricePerUser: 21.00, discount: 30 },
  { name: 'Scale', minUsers: 50, maxUsers: 99, pricePerUser: 18.00, discount: 40 },
  { name: 'Enterprise', minUsers: 100, maxUsers: null, pricePerUser: 15.00, discount: 50 },
];

const getCurrentTier = (users: number): PricingTier => {
  return pricingTiers.find(tier => 
    users >= tier.minUsers && (tier.maxUsers === null || users <= tier.maxUsers)
  ) || pricingTiers[0];
};

const calculatePricing = (users: number) => {
  const tier = getCurrentTier(users);
  const monthlyPrice = tier.pricePerUser * users;
  const originalPrice = 29.90 * users;
  const savings = originalPrice - monthlyPrice;
  
  return {
    tier,
    monthlyPrice,
    originalPrice,
    savings,
    pricePerUser: tier.pricePerUser
  };
};

export const PricingSection: React.FC<PricingSectionProps> = ({
  selectedUsers,
  setSelectedUsers,
  openModal
}) => {
  const pricing = calculatePricing(selectedUsers);

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: '#1C2C55' }}>
          Volume Pricing That Scales With You
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Per user pricing. Start free, upgrade when you're ready. No hidden fees.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Pricing Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100 animate-fade-in-left" style={{ animationDelay: '0.4s' }}>
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

          <div className="space-y-4 mb-8">
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
              value={selectedUsers}
              onChange={(e) => setSelectedUsers(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            >
              {Array.from({ length: 100 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>
                  {num} user{num !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="text-center mb-8">
            <div className="flex items-baseline justify-center space-x-2 mb-2">
              <span className="text-5xl font-bold" style={{ color: '#1C2C55' }}>
                €{pricing.monthlyPrice.toFixed(2)}
              </span>
              <span className="text-xl text-gray-600">/month</span>
            </div>
            <p className="text-gray-600">
              €{pricing.pricePerUser.toFixed(2)}/user/month • {selectedUsers} user{selectedUsers !== 1 ? 's' : ''}
            </p>
            {pricing.savings > 0 && (
              <p className="text-green-600 font-medium mt-2">
                Save €{pricing.savings.toFixed(2)}/month vs starter pricing
              </p>
            )}
          </div>

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

        {/* Volume Discount Table */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100 animate-fade-in-right" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: '#1C2C55' }}>
            Volume Discount Tiers
          </h3>
          <p className="text-gray-600 text-center mb-8">
            Automatic discounts applied based on team size
          </p>

          <div className="overflow-hidden rounded-2xl border border-gray-200">
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
                        €{tier.pricePerUser.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        {tier.discount > 0 ? (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
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
              All plans include unlimited WhatsApp voice notes, real-time CRM sync, and priority support
            </p>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-5" style={{ backgroundColor: '#1C2C55' }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-5" style={{ backgroundColor: '#F7E69B' }}></div>
      </div>
    </div>
  );
};