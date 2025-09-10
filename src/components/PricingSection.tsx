import React from 'react';
import { Check, Star } from 'lucide-react';

interface PricingSectionProps {
  openModal: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ openModal }) => {
  const features = [
    'Unlimited WhatsApp voice notes',
    'Real-time CRM synchronization',
    'Multi-language transcription',
    'Advanced AI processing',
    'Team collaboration tools',
    'Analytics dashboard',
    'Priority support',
    'Enterprise security'
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
              <div className="flex items-center justify-center space-x-2">
                <Star className="w-6 h-6 text-yellow-300 fill-current" />
                <h3 className="text-2xl font-bold text-white">VoiceLink Pro</h3>
                <Star className="w-6 h-6 text-yellow-300 fill-current" />
              </div>
              <p className="text-center text-blue-100 mt-2">Perfect for growing teams</p>
            </div>
            
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <span className="text-5xl font-bold text-gray-900">€29.99</span>
                  <span className="text-xl text-gray-500">/month</span>
                </div>
                <p className="text-gray-600">per user • billed monthly</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <button
                  onClick={openModal}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 mb-4"
                >
                  Start Free Trial
                </button>
                <p className="text-sm text-gray-500">14-day free trial • No credit card required</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6">Need more users? Volume discounts available:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-gray-900">5-9 users</div>
                <div className="text-xs text-green-600">10% off</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-gray-900">10-24 users</div>
                <div className="text-xs text-green-600">20% off</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-gray-900">25-49 users</div>
                <div className="text-xs text-green-600">30% off</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-gray-900">50+ users</div>
                <div className="text-xs text-green-600">40% off</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};