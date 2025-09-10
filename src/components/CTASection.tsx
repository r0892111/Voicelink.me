import React from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';

interface CTASectionProps {
  openModal: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ openModal }) => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border border-white rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 border border-white rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white rounded-full"></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <div className="mb-8">
          <MessageCircle className="w-16 h-16 text-white mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your CRM Workflow?
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Join thousands of teams already using VoiceLink to capture, process, and sync their voice communications seamlessly.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button
            onClick={openModal}
            className="group bg-white hover:bg-gray-50 text-blue-600 font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center space-x-3"
          >
            <span>Start Your Free Trial</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="text-blue-100 text-sm">
            <div>✓ 14-day free trial</div>
            <div>✓ No credit card required</div>
            <div>✓ Setup in minutes</div>
          </div>
        </div>
      </div>
    </section>
  );
};