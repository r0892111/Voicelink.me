import React from 'react';
import { ArrowRight, Play, CheckCircle } from 'lucide-react';

interface HeroSectionProps {
  openModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ openModal }) => {
  return (
    <section className="pt-32 pb-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight">
            Transform Voice to CRM Data Instantly
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
            Send WhatsApp voice messages and watch them automatically sync with your CRM. 
            Turn conversations into structured data in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button
              onClick={openModal}
              className="group bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 flex items-center space-x-3"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <a
              href="https://www.youtube.com/watch?v=wVaR0NwPNHc"
              target="_blank"
              rel="noopener noreferrer"
              className="group border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex items-center space-x-3"
            >
              <Play className="w-5 h-5" />
              <span>Watch Demo</span>
            </a>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Setup in 2 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};