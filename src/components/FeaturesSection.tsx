import React from 'react';
import { MessageCircle, Zap, Shield, Globe, Users, BarChart3 } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: MessageCircle,
      title: "WhatsApp Integration",
      description: "Send voice messages directly through WhatsApp - no new apps to learn or install."
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description: "Voice messages are transcribed and processed instantly using advanced AI technology."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Enterprise-grade security with end-to-end encryption for all your business communications."
    },
    {
      icon: Globe,
      title: "Multi-language Support",
      description: "Works in 50+ languages with automatic language detection and translation capabilities."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share insights across your team with automatic CRM updates and notifications."
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Get detailed analytics on your communication patterns and CRM data quality."
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need to streamline your CRM workflow
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            VoiceLink bridges the gap between quick voice communication and structured CRM data, 
            making your sales process more efficient than ever.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <IconComponent className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};