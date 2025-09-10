import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Statement</h1>
            <h2 className="text-xl font-semibold text-blue-600 mb-4">FINIT VOICELINK</h2>
            <p className="text-sm text-gray-600">Version: 18/08/2025</p>
          </div>
        </div>

        {/* Privacy Policy Content */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="prose max-w-none">
            <div className="mb-8">
              <p className="text-lg leading-relaxed mb-6">
                Thank you for visiting Finit VoiceLink!
              </p>
              
              <p className="leading-relaxed mb-6">
                The protection of your privacy and personal data is of the utmost importance to us. We make every effort to safeguard your privacy and to ensure that you can entrust your personal data to us securely. We strive to handle your personal data in a safe and discreet manner at all times, and appropriate security measures have been taken to prevent loss, alteration, access by unauthorized persons and/or any other unlawful processing of your personal data.
              </p>

              <p className="leading-relaxed mb-6">
                This privacy statement concerns the processing of personal data by us through our platform: <a href="https://voicelink.me/" className="text-blue-600 hover:underline">https://voicelink.me/</a>
              </p>

              <p className="leading-relaxed mb-8">
                We want to be transparent about how we process your personal data and what we do with it. You can read more about this in this privacy statement.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Who are we?</h3>
              
              <p className="leading-relaxed mb-4">
                FINIT SOLUTIONS, established at Guldensporenlaan 9, 3120 Tremelo and registered in the Crossroads Bank for Enterprises under number 1020.600.643 (RPR Leuven)
              </p>
              
              <p className="leading-relaxed mb-6">
                (Hereinafter "Finit Solutions", "we" or "us")
              </p>

              <p className="leading-relaxed mb-4">
                You can contact us using the following contact details:
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-blue-900 mb-3">Contact Information</h4>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">E-mail:</span>{' '}
                    <a href="mailto:contact@finitsolutions.be" className="text-blue-600 hover:underline">
                      contact@finitsolutions.be
                    </a>
                  </p>
                  <div>
                    <span className="font-medium">Telephone:</span>
                    <div className="ml-4">
                      <a href="tel:+32495702314" className="text-blue-600 hover:underline block">
                        +32 (0)495 702 314
                      </a>
                      <a href="tel:+32468029945" className="text-blue-600 hover:underline block">
                        +32 (0)468 029 945
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <p className="leading-relaxed">
                We always strive to process your personal data in accordance with the applicable legal provisions on the protection of personal data, including Regulation (EU) 2016/679 of 27 April 2016 on the protection of natural persons with regard to the processing of personal data and on the free movement of such data, and repealing Directive 95/46/EC (hereinafter, the "GDPR"), as well as the applicable national implementing legislation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;