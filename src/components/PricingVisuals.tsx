import React from 'react';
import { CheckCircle } from 'lucide-react';
import { PricingTier, usePricingCalculations } from './PricingCalculations';

interface PricingVisualsProps {
  selectedUsers: number;
  onUsersChange: (users: number) => void;
  openModal: () => void;
}

export const PricingVisuals: React.FC<PricingVisualsProps> = ({
  selectedUsers,
  onUsersChange,
  openModal
}) => {
  const { pricingTiers, currentTier, monthlyPrice, originalPrice, savings } = usePricingCalculations(selectedUsers, onUsersChange);

  return (
    <section id="pricing" className="py-20 bg-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Volume Pricing That Scales With You
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Per user pricing. Start free, upgrade when you're ready. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards Container */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Main Pricing Card */}
          <div className="bg-white text-gray-900 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
            
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="/Finit Icon Blue.svg" 
                alt="VoiceLink" 
                className="w-12 h-12"
              />
              <div>
                <h3 className="text-2xl font-bold text-gray-900">VoiceLink Pro</h3>
                <p className="text-gray-600">Perfect for growing teams</p>
              </div>
            </div>

            {/* User Selection */}
            <div className="mb-6">
              <label htmlFor="users" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Users
              </label>
              <select
                id="users"
                value={selectedUsers}
                onChange={(e) => onUsersChange(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                {Array.from({ length: 100 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>
                    {num} user{num !== 1 ? 's' : ''}
                  </option>
                ))}
                <option value={150}>150 users</option>
                <option value={200}>200 users</option>
                <option value={500}>500 users</option>
                <option value={1000}>1000+ users</option>
              </select>
            </div>

            {/* Pricing Display */}
            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center space-x-2 mb-2">
                <span className="text-5xl font-bold text-gray-900">€{monthlyPrice.toFixed(2)}</span>
                <span className="text-xl text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">
                €{currentTier.pricePerUser.toFixed(2)}/user/month • {selectedUsers} user{selectedUsers !== 1 ? 's' : ''}
              </p>
              {savings > 0 && (
                <p className="text-green-600 font-medium mt-2">
                  Save €{savings.toFixed(2)}/month compared to starter pricing
                </p>
              )}
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
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={openModal}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Start Free Trial</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              14-day free trial • No credit card required
            </p>
          </div>

          {/* Volume Discount Table */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold mb-4 text-center">Volume Discount Tiers</h3>
            <p className="text-gray-300 text-center mb-8">Automatic discounts applied based on team size</p>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-2 font-semibold">Plan</th>
                    <th className="text-left py-3 px-2 font-semibold">Team Size</th>
                    <th className="text-left py-3 px-2 font-semibold">Price per User</th>
                    <th className="text-left py-3 px-2 font-semibold">Discount</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingTiers.map((tier, index) => (
                    <tr 
                      key={index} 
                      className={`border-b border-white/10 ${
                        tier.name === currentTier.name ? 'bg-white/10 rounded-lg' : ''
                      }`}
                    >
                      <td className="py-4 px-2 font-medium">{tier.name}</td>
                      <td className="py-4 px-2 text-gray-300">
                        {tier.maxUsers ? `${tier.minUsers}–${tier.maxUsers} users` : `${tier.minUsers}+ users`}
                      </td>
                      <td className="py-4 px-2 font-semibold">€{tier.pricePerUser.toFixed(2)}</td>
                      <td className="py-4 px-2">
                        {tier.discount > 0 ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tier.discount >= 50 ? 'bg-blue-500/20 text-blue-300' :
                            tier.discount >= 30 ? 'bg-green-500/20 text-green-300' :
                            'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {tier.discountLabel}
                          </span>
                        ) : (
                          <span className="text-gray-400">{tier.discountLabel}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <p className="text-sm text-gray-400 mt-6 text-center">
              All plans include unlimited WhatsApp voice notes, real-time CRM sync, and priority support
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};