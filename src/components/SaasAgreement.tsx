import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SaasAgreement: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
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
          
          <div className="flex items-center space-x-3 mb-4">
            <img 
              src="/Finit Voicelink Blue.svg" 
              alt="VoiceLink" 
              className="h-8 w-auto"
            />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Software as a Service Agreement
          </h1>
          <p className="text-gray-600">
            Last updated: [DATE TO BE ADDED]
          </p>
        </div>

        {/* Agreement Content */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="prose max-w-none">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-yellow-800 text-sm font-medium">
                📝 Template Notice: This is a template SaaS agreement. Please customize the content according to your specific terms and conditions.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement Overview</h2>
            <p className="text-gray-700 mb-6">
              This Software as a Service Agreement ("Agreement") is entered into between Finit Solutions ("Company", "we", "us") 
              and the customer ("Customer", "you") for the use of VoiceLink services.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
            <p className="text-gray-700 mb-6">
              VoiceLink provides voice-to-CRM integration services, allowing users to send WhatsApp voice notes that are 
              automatically processed and synchronized with supported CRM platforms.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Subscription Terms</h2>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Subscription fees are billed monthly in advance</li>
              <li>Pricing is per user per month as displayed on our website</li>
              <li>Free trial period of 14 days is provided for new customers</li>
              <li>Subscriptions automatically renew unless cancelled</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Privacy and Security</h2>
            <p className="text-gray-700 mb-6">
              We are committed to protecting your data. All voice recordings and CRM data are processed securely and 
              in accordance with applicable data protection regulations including GDPR.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Service Availability</h2>
            <p className="text-gray-700 mb-6">
              We strive to maintain 99.9% uptime for our services. Scheduled maintenance will be communicated in advance 
              when possible.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-700 mb-6">
              [TO BE CUSTOMIZED] - Standard limitation of liability clauses will be added here.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Termination</h2>
            <p className="text-gray-700 mb-6">
              Either party may terminate this agreement with 30 days written notice. Upon termination, 
              access to the service will be discontinued.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Information</h2>
            <p className="text-gray-700 mb-6">
              For questions about this agreement, please contact us at:
              <br />
              Email: [CONTACT EMAIL TO BE ADDED]
              <br />
              Address: [COMPANY ADDRESS TO BE ADDED]
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 text-sm">
                If you have any questions about this SaaS Agreement, please don't hesitate to contact our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};