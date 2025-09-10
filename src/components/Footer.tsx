import React from 'react';
import { MessageCircle, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <MessageCircle className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold">VoiceLink</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Transform your voice communications into structured CRM data instantly. 
              The future of customer relationship management is here.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <a href="mailto:contact@finitsolutions.be" className="text-gray-400 hover:text-white transition-colors">
                  contact@finitsolutions.be
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400">+32 (0)495 702 314</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400">Guldensporenlaan 9, 3120 Tremelo, Belgium</span>
              </div>
            </div>
          </div>
          
          {/* Product Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Product</h3>
            <ul className="space-y-3">
              <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="/support" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          
          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Legal</h3>
            <ul className="space-y-3">
              <li><a href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/saas-agreement" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/disclaimer" className="text-gray-400 hover:text-white transition-colors">Disclaimer</a></li>
              <li><a href="/cookie-policy" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Finit Solutions. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-4 md:mt-0">
              Made with ❤️ in Belgium
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};