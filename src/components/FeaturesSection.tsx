import React from 'react';
import { MessageCircle, Zap, Shield, Globe, Users, BarChart3 } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'WhatsApp Integration',
      description: 'Send voice messages directly through WhatsApp and watch them sync automatically with your CRM.',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Zap,
      title: 'Real-time Processing',
      description: 'Voice messages are processed and converted to structured data within seconds of sending.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption ensures your voice data and CRM information remain completely secure.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Globe,
      title: 'Multi-language Support',
      description: 'Supports 50+ languages with accurate transcription and context understanding.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Share voice insights across your team with automatic notifications and updates.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track voice message patterns, response times, and CRM data quality improvements.',
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for Modern Teams
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to transform voice communication into actionable CRM data
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white"
              >
                <div className={`w-14 h-14 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};