import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Disclaimer: React.FC = () => {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Disclaimer</h1>
            <h2 className="text-xl font-semibold text-blue-600 mb-4">FINIT SOLUTIONS</h2>
          </div>
        </div>

        {/* Disclaimer Content */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="prose max-w-none">
            <div className="mb-8">
              <p className="text-lg leading-relaxed mb-6">
                Thank you for visiting the Finit Solutions website or our product page for VoiceLink!
              </p>
              
              <p className="leading-relaxed mb-6">
                This disclaimer applies whenever you, the website visitor, use the website{' '}
                <a href="https://www.finitsolutions.be" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  https://www.finitsolutions.be
                </a>{' '}
                and all of its subdomains or the SaaS platform{' '}
                <a href="https://www.voicelink.me" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  https://www.voicelink.me
                </a>{' '}
                (hereinafter the "Websites").
              </p>

              <p className="leading-relaxed mb-6">
                Both Websites are managed by and are the exclusive property of:
              </p>

              <p className="leading-relaxed mb-4">
                Finit Solutions, established at Guldensporenlaan 9, 3120 Tremelo and registered in the Crossroads Bank for Enterprises under number 1020.600.643 (RPR Leuven) (hereinafter "Finit Solutions", "we" or "us").
              </p>

              <p className="leading-relaxed mb-4">
                You can always contact us via:
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">E-mail:</span>{' '}
                    <a href="mailto:contact@finitsolutions.be" className="text-blue-600 hover:underline">
                      contact@finitsolutions.be
                    </a>
                  </p>
                  <div>
                    <span className="font-medium">Tel.:</span>
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

              <p className="leading-relaxed mb-8">
                By visiting and using our Websites, you accept the conditions set out below:
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">General</h3>
              
              <p className="leading-relaxed mb-4">
                In this disclaimer, the following terms shall have the meaning indicated:
              </p>

              <p className="leading-relaxed mb-4">
                <strong>use:</strong> loading, logging in, retrieving, consulting, reading, viewing, listening, editing, completing (forms), sending, (temporarily) copying, storing, forwarding, distributing, using services, performing legal acts (e.g. buying, renting) or any other action or use of the Websites;
              </p>

              <p className="leading-relaxed mb-4">
                <strong>you:</strong> the natural or legal person, whether represented or not, who gains access to and/or uses these Websites;
              </p>

              <p className="leading-relaxed mb-4">
                <strong>content:</strong> includes texts, images, hyperlinks, audio and/or video fragments and/or other objects, text or content contained in the Websites;
              </p>

              <p className="leading-relaxed mb-6">
                <strong>damage:</strong> direct or indirect damage of any kind, such as loss of data or objects, loss of income, profit or other economic losses.
              </p>

              <p className="leading-relaxed mb-4">
                We reserve the right to deny you access to and/or use of the Websites and the services offered thereon if you fail to comply with the provisions and conditions of this disclaimer. We are entitled to monitor access to and use of the Websites.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Content of the Websites</h3>
              
              <p className="leading-relaxed mb-6">
                The information collected via the Websites (through references or hyperlinks to other websites and apps not owned by us) and other content you consult is of a purely informative nature. We can under no circumstances be held liable for information, images, texts, hyperlinks, or works of intellectual or industrial property on websites not owned by us.
              </p>

              <p className="leading-relaxed mb-6">
                We provide the content of the Websites "as is", without warranty or guarantee as to accuracy or completeness, suitability or fitness for a particular purpose or otherwise. Despite the care we devote to managing the Websites, it is possible that certain information provided and/or published is incomplete or incorrect. Printing, spelling or other similar errors in documents or other content of any kind, published by us or by third parties on the Websites, can under no circumstances create any obligation or give rise to any liability towards us or our affiliated companies.
              </p>

              <p className="leading-relaxed mb-6">
                We endeavor to regularly update and/or supplement the Websites. The content of the Websites is therefore subject to change and may be modified without prior notice and at our discretion. We and our affiliated companies cannot be held liable for the consequences of any update, supplement or modification of the content of the Websites (desktop and mobile).
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Intellectual Property (IP)</h3>
              
              <p className="leading-relaxed mb-6">
                All intellectual, industrial and other (proprietary) rights in the Websites and in all information located on or placed on the Websites, in whatever form, are vested in us, our affiliated companies and/or our licensors. The Websites and their content are intended solely for private use and may not be used for commercial purposes. The Websites and their content may not be reproduced, transferred, distributed, circulated, commercialized or disclosed without our prior express consent. By posting any information on the Websites, you accept the transfer of all rights therein to us.
              </p>

              <p className="leading-relaxed mb-6">
                We can under no circumstances be held liable for information, images, texts, hyperlinks or works of intellectual or industrial property placed on the Websites by you or by third parties. We are not responsible for verifying the accuracy and compliance with applicable laws and regulations of the information provided, in particular images, texts, hyperlinks and other works with intellectual, industrial or other property rights, or for the existence of third-party intellectual property rights. We reserve the right to refuse and/or remove from the Websites any information that infringes (or may infringe) applicable law or regulations or the intellectual, industrial or other property rights of third parties.
              </p>

              <p className="leading-relaxed mb-6">
                Unauthorized or improper use of the Websites or their content may constitute an infringement of intellectual or industrial property rights, data protection regulations, publications and/or communication in the broadest sense. You represent and warrant that your access to and use of the Websites and any information you may upload to the Websites in any form is in accordance with applicable law and regulations and does not infringe any intellectual, industrial or other rights of third parties. You undertake to fully indemnify and hold us, our affiliated companies and our licensors harmless from and against any damage, judicial or other measures, judgments and all other possible costs arising from your access to and use of the Websites and your submission of information, images, texts, hyperlinks or works of intellectual or industrial property, and for any third-party claims arising therefrom or related thereto.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy and Data Protection</h3>
              
              <p className="leading-relaxed mb-6">
                We value your privacy and are committed to protecting your personal data in accordance with applicable privacy and data protection regulations, in particular the General Data Protection Regulation and the applicable national implementing laws and regulations.
              </p>

              <p className="leading-relaxed mb-4">
                If you wish to learn more about data processing via the website, you can consult our website privacy statement here: <a href="https://finitsolutions.be/privacy/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://finitsolutions.be/privacy/</a>.
              </p>

              <p className="leading-relaxed mb-6">
                If you wish to learn more about data processing via the platform, you can consult our SaaS platform privacy statement here: <a href="https://voicelink.me/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://voicelink.me/privacy</a>.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Governing Law and Jurisdiction</h3>
              
              <p className="leading-relaxed mb-6">
                The Websites are governed by Belgian law. In the event of any dispute, complaint or claim relating to the Websites, their content or this disclaimer, the courts of Leuven shall have exclusive jurisdiction, except where you are a consumer within the meaning of Article I.1, 2° of the Belgian Code of Economic Law, in which case the courts of your place of residence shall have jurisdiction.
              </p>

              <p className="leading-relaxed mb-6">
                In case of disputes, complaints or claims, a printed version of this disclaimer shall be considered a legally binding document in judicial and/or administrative proceedings.
              </p>
            </div>
          </div>

          <p className="leading-relaxed mb-6">
            <strong>Language of the Disclaimer</strong> – The Dutch version of this Disclaimer shall at all times be the binding and official version. Any translations of this Disclaimer are provided for convenience and informational purposes only. Users may request a copy of the official Dutch version by contacting us at{' '}
            <a href="mailto:contact@finitsolutions.be" className="text-blue-600 hover:underline">
              contact@finitsolutions.be
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;