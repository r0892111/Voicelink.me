import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface PricingSectionProps {
  openModal: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ openModal }) => {
  const [selectedUsers, setSelectedUsers] = useState(1);
  
  const userOptions = [
    { value: 1, label: '1 user' },
    { value: 5, label: '5 users' },
    { value: 10, label: '10 users' },
    { value: 25, label: '25 users' },
    { value: 50, label: '50 users' },
    { value: 100, label: '100+ users' }
  ];

  const getPrice = (users: number) => {
    if (users >= 100) return 15.00;
    if (users >= 50) return 18.00;
    if (users >= 25) return 21.00;
    if (users >= 10) return 24.00;
    if (users >= 5) return 27.00;
    return 29.90;
  };

  const getDiscount = (users: number) => {
    if (users >= 100) return '50%+ off';
    if (users >= 50) return '40% off';
    if (users >= 25) return '30% off';
    if (users >= 10) return '20% off';
    if (users >= 5) return '10% off';
    return '';
  };

  const currentPrice = getPrice(selectedUsers);
  const totalPrice = currentPrice * selectedUsers;

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Volume Pricing That Scales With You
          </h2>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Per user pricing. Start free, upgrade when you're ready. No hidden fees.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto relative z-10">
          {/* Left Card - VoiceLink Pro */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 hover:bg-white transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="/Finit Icon Blue.svg" 
                alt="VoiceLink" 
                className="h-12 w-auto"
              />
              <div>
                <h3 className="text-2xl font-bold text-slate-800">VoiceLink Pro</h3>
                <p className="text-slate-600">Perfect for growing teams</p>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="users" className="block text-sm font-medium text-slate-700 mb-2">
                Number of Users
              </label>
              <select
                id="users"
                value={selectedUsers}
                onChange={(e) => setSelectedUsers(Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-800"
              >
                {userOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center space-x-1 mb-2">
                <span className="text-5xl font-bold text-slate-800">€{currentPrice.toFixed(2)}</span>
                <span className="text-slate-600">/month</span>
              </div>
              <p className="text-slate-600">
                €{currentPrice.toFixed(2)}/user/month • {selectedUsers} user{selectedUsers !== 1 ? 's' : ''}
              </p>
              {selectedUsers > 1 && (
                <p className="text-lg font-semibold text-blue-600 mt-2">
                  Total: €{totalPrice.toFixed(2)}/month
                </p>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">Unlimited WhatsApp voice notes</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">Real-time CRM sync</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">Native WhatsApp integration</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">Multi-language support</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">Priority support</span>
              </div>
            </div>

            <button
              onClick={openModal}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Start Free Trial</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <p className="text-center text-sm text-slate-500 mt-3">
              14-day free trial • No credit card required
            </p>
          </div>

          {/* Right Card - Volume Discount Tiers */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 hover:bg-white transition-all duration-300">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Volume Discount Tiers</h3>
              <p className="text-slate-600">Automatic discounts applied based on team size</p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Plan</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Team Size</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Price per User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Discount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">Starter</td>
                    <td className="px-4 py-3 text-sm text-slate-600">1–4 users</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">€29.90</td>
                    <td className="px-4 py-3 text-sm text-slate-500">—</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">Team</td>
                    <td className="px-4 py-3 text-sm text-slate-600">5–9 users</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">€27.00</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        10% off
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">Business</td>
                    <td className="px-4 py-3 text-sm text-slate-600">10–24 users</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">€24.00</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        20% off
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">Growth</td>
                    <td className="px-4 py-3 text-sm text-slate-600">25–49 users</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">€21.00</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        30% off
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">Scale</td>
                    <td className="px-4 py-3 text-sm text-slate-600">50–99 users</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">€18.00</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        40% off
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">Enterprise</td>
                    <td className="px-4 py-3 text-sm text-slate-600">100+ users</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">€15.00</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        50%+ off
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-center text-sm text-slate-500 mt-6">
              All plans include unlimited WhatsApp voice notes, real-time CRM sync, and priority support
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};