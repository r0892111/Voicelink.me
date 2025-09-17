import React from 'react';
import { ArrowLeft, Mail, Phone, MessageCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Support: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('navigation.support')}</h1>
            <h2 className="text-xl font-semibold text-blue-600 mb-4">FINIT SOLUTIONS</h2>
            <p className="text-gray-600">{t('dashboard.support.description')}</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('contact.title')}</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Email Support */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Email Support</h3>
                  <p className="text-blue-700">Get help via email</p>
                </div>
              </div>
              <div className="space-y-2">
                <a 
                  href="mailto:contact@finitsolutions.be" 
                  className="text-blue-600 hover:underline font-medium text-lg block"
                >
                  contact@finitsolutions.be
                </a>
                <p className="text-sm text-blue-600">We typically respond within 24 hours</p>
              </div>
            </div>

            {/* Phone Support */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Phone Support</h3>
                  <p className="text-green-700">Speak with our team</p>
                </div>
              </div>
              <div className="space-y-2">
                <a 
                  href="tel:+32495702314" 
                  className="text-green-600 hover:underline font-medium block"
                >
                  +32 (0)495 702 314
                </a>
                <a 
                  href="tel:+32468029945" 
                  className="text-green-600 hover:underline font-medium block"
                >
                  +32 (0)468 029 945
                </a>
                <p className="text-sm text-green-600">Monday - Friday, 9:00 AM - 6:00 PM CET</p>
              </div>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Information</h2>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Finit Solutions</h3>
                <p className="text-gray-700">Guldensporenlaan 9</p>
                <p className="text-gray-700">3120 Tremelo</p>
                <p className="text-gray-700">Belgium</p>
              </div>
              
              <div className="pt-3 border-t border-gray-300">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Company Registration:</span> 1020.600.643 (RPR Leuven)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Hours */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Clock className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Support Hours</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Email Support</h3>
              <p className="text-gray-600">Available 24/7</p>
              <p className="text-sm text-gray-500">We respond within 24 hours during business days</p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Phone Support</h3>
              <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM CET</p>
              <p className="text-sm text-gray-500">For urgent matters and technical support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;