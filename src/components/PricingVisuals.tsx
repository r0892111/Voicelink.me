import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { pricingTiers, usePricingCalculations } from './PricingCalculations';

interface PricingVisualsProps {
  selectedUsers: number;
  setSelectedUsers: (users: number) => void;
  openModal: () => void;
}

export const PricingVisuals: React.FC<PricingVisualsProps> = ({
  selectedUsers,
  setSelectedUsers,
  openModal
}) => {
  const { tier, monthlyPrice, originalPrice, savings, pricePerUser } = usePricingCalculations(selectedUsers);

  return (
    <section id="pricing" className="py-24 relative overflow-hidden" style={{ backgroundColor: '#1C2C55' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Volume Pricing That Scales With You
          </h2>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Per user pricing. Start free, upgrade when you're ready. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Card - VoiceLink Pro */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl animate-fade-in-left" style={{ animationDelay: '0.2s' }}>
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

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {[
                'Unlimited WhatsApp voice notes',
                'Real-time CRM sync',
                'Native WhatsApp integration',
                'Multi-language support',
                'Priority support'
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1C2C55' }}>
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* User Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Users
              </label>
              <select
                value={selectedUsers}
                onChange={(e) => setSelectedUsers(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200].map(num => (
                  <option key={num} value={num}>
                    {num} user{num !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing Display */}
            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center space-x-2 mb-2">
                <span className="text-4xl font-bold" style={{ color: '#1C2C55' }}>
                  €{monthlyPrice.toFixed(2)}
                </span>
                <span className="text-gray-600">/month</span>
              </div>
              <div className="text-sm text-gray-500">
                €{pricePerUser.toFixed(2)}/user/month • {selectedUsers} user{selectedUsers !== 1 ? 's' : ''}
              </div>
              {savings > 0 && (
                <div className="text-sm text-green-600 font-medium mt-1">
                  Save €{savings.toFixed(2)}/month vs Starter pricing
                </div>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={openModal}
              className="w-full text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
              style={{ backgroundColor: '#1C2C55' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F1A3A'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C2C55'}
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              14-day free trial • No credit card required
            </p>
          </div>

          {/* Right Card - Volume Discount Tiers */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl animate-fade-in-right" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-2xl font-bold mb-2" style={{ color: '#1C2C55' }}>Volume Discount Tiers</h3>
            <p className="text-gray-600 mb-6">Automatic discounts applied based on team size</p>

            {/* Pricing Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Plan</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Team Size</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Price per User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Discount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pricingTiers.map((pricingTier, index) => {
                    const isCurrentTier = pricingTier.name === tier.name;
                    return (
                      <tr 
                        key={index} 
                        className={`transition-colors ${
                          isCurrentTier 
                            ? 'bg-yellow-50 border-l-4 border-l-yellow-400' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className={`px-4 py-3 text-sm font-medium ${
                          isCurrentTier ? 'text-yellow-800' : 'text-gray-900'
                        }`}>
                          {pricingTier.name}
                          {isCurrentTier && (
                            <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                              Current
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {pricingTier.maxUsers === Infinity 
                            ? `${pricingTier.minUsers}+ users`
                            : `${pricingTier.minUsers}–${pricingTier.maxUsers} users`
                          }
                        </td>
                        <td className={`px-4 py-3 text-sm font-medium ${
                          isCurrentTier ? 'text-yellow-800' : 'text-gray-900'
                        }`}>
                          €{pricingTier.pricePerUser.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {pricingTier.discount > 0 ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              pricingTier.discount >= 30 
                                ? 'bg-green-100 text-green-800'
                                : pricingTier.discount >= 20
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {pricingTier.discountText}
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

            <p className="text-sm text-gray-500 mt-6 text-center">
              All plans include unlimited WhatsApp voice notes, real-time CRM sync, and priority support
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};