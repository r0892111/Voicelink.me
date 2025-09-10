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

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Some definitions explained</h3>
              
              <p className="leading-relaxed mb-6">
                For the purposes of this privacy statement, "personal data" means: all information relating to an identified or identifiable natural person ("the data subject"). A natural person is considered identifiable if he or she can be identified, directly or indirectly, in particular by reference to an identifier such as a name, identification number, location data, an online identifier or to one or more elements specific to the physical, physiological, genetic, mental, economic, cultural or social identity of that natural person. In other words, it concerns all information on the basis of which a person can be identified. This includes, for example, your name, first name, date of birth, telephone number and e-mail address, but also your IP address.
              </p>

              <p className="leading-relaxed mb-6">
                The concept of "processing" is very broad and covers, among other things, the collection, recording, organization, storage, updating, modification, retrieval, consultation, use, disclosure, combination, archiving and deletion of data.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Controller of your personal data ("data controller")</h3>
              
              <p className="leading-relaxed mb-4">
                Finit Solutions is responsible for processing your personal data.
              </p>
              
              <p className="leading-relaxed mb-6">
                As referred to in the GDPR, we are the "data controller" of your personal data. This means concretely that Finit Solutions, possibly together with others, determines the purpose and means of processing your personal data.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Which personal data do we process, why and on what legal basis?</h3>
              
              <p className="leading-relaxed mb-4">
                In the table below you will find:
              </p>

              <p className="leading-relaxed mb-4">
                column 1: which categories of personal data we process (the "Categories of personal data");
              </p>

              <p className="leading-relaxed mb-4">
                column 2: why we do this (the "Purposes");
              </p>

              <p className="leading-relaxed mb-4">
                column 3: on which legal basis the processing activity is based (the "Legal basis"); and
              </p>

              <p className="leading-relaxed mb-6">
                column 4: how long we process your personal data (the "Retention period").
              </p>

              <p className="leading-relaxed mb-4">
                Each processing activity of your personal data is carried out for one or more specific purposes.
              </p>
              
              <p className="leading-relaxed mb-4">
                In addition, there is always a demonstrable legal basis for each processing. The applicable legal basis, which you will find in the third column "Legal basis", has the following meaning:
              </p>

              <p className="leading-relaxed mb-4">
                Consent: you have given consent to the processing of personal data for one or more specific purposes;
              </p>

              <p className="leading-relaxed mb-4">
                Legitimate interest: the processing is necessary for the purposes of the legitimate interests pursued by us or by a third party, except where your interests or fundamental rights and freedoms which require protection of personal data override those interests;
              </p>

              <p className="leading-relaxed mb-4">
                Contract: the processing is necessary for the performance of a contract to which you are a party, or in order to take steps at your request prior to entering into a contract;
              </p>

              <p className="leading-relaxed mb-6">
                Legal obligation: the processing is necessary for compliance with a legal obligation to which we, as the data controller, are subject.
              </p>
            </div>

            {/* Privacy Data Table */}
            <div className="overflow-x-auto mt-8">
              <table className="w-full text-sm border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left border-b border-gray-300">Categories of Personal Data</th>
                    <th className="p-3 text-left border-b border-gray-300">Purposes</th>
                    <th className="p-3 text-left border-b border-gray-300">Legal Basis</th>
                    <th className="p-3 text-left border-b border-gray-300">Retention Period</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-300">
                    <td className="p-3 align-top border-r border-gray-300">
                      (Electronic) identification data; and Device data
                    </td>
                    <td className="p-3 align-top border-r border-gray-300">
                      To provide you with access to our platform
                    </td>
                    <td className="p-3 align-top border-r border-gray-300">
                      Consent for non-essential cookies; Legitimate interest of Finit
                      Solutions to present itself with a well-functioning platform and
                      in your own interest to be able to use it smoothly
                    </td>
                    <td className="p-3 align-top">
                      Until the end of your visit to our platform or until the relevant
                      cookie is automatically deleted
                    </td>
                  </tr>
                  <tr className="border-t border-gray-300">
                    <td className="p-3 align-top border-r border-gray-300">
                      Identification and contact details; Password; Employment-related
                      data; and Financial data
                    </td>
                    <td className="p-3 align-top border-r border-gray-300">
                      To allow you to create an account on our platform
                    </td>
                    <td className="p-3 align-top border-r border-gray-300">Contract</td>
                    <td className="p-3 align-top">
                      For the period your account remains active and up to 1 year
                      thereafter
                    </td>
                  </tr>
                  <tr className="border-t border-gray-300">
                    <td className="p-3 align-top border-r border-gray-300">
                      Identification and contact details; Content of your message; and
                      Employment-related data
                    </td>
                    <td className="p-3 align-top border-r border-gray-300">
                      To respond to your request or message to create a tailor-made
                      solution and to prepare a customized quotation
                    </td>
                    <td className="p-3 align-top border-r border-gray-300">Consent</td>
                    <td className="p-3 align-top">
                      For the duration of processing your request or message
                    </td>
                  </tr>
                  <tr className="border-t border-gray-300">
                    <td className="p-3 align-top border-r border-gray-300">
                      Identification and contact details; Password; Employment-related
                      data; and Financial data (via Stripe: card details, transaction
                      references, payment status, subscription details)
                    </td>
                    <td className="p-3 align-top border-r border-gray-300">
                      To enable you to conclude a subscription for one of our solutions
                      and to execute the payment thereof
                    </td>
                    <td className="p-3 align-top border-r border-gray-300">
                      Contract and legal obligation (accounting and tax legislation)
                    </td>
                    <td className="p-3 align-top">
                      For as long as you use one of our solutions via subscription and
                      up to 7 years thereafter (tax retention period)
                    </td>
                  </tr>
                  <tr className="border-t border-gray-300">
                    <td className="p-3 align-top border-r border-gray-300">
                      CRM identification data (such as user ID, tokens, API keys, refresh
                      tokens)
                    </td>
                    <td className="p-3 align-top border-r border-gray-300">
                      To grant you access to your CRM and to establish the connection
                      with our solution
                    </td>
                    <td className="p-3 align-top border-r border-gray-300">Contract</td>
                    <td className="p-3 align-top">
                      For the duration of your active account or until the connection is
                      revoked
                    </td>
                  </tr>
                  <tr className="border-t border-gray-300">
                    <td className="p-3 align-top border-r border-gray-300">
                      Telephone number and verification code (WhatsApp verification)
                    </td>
                    <td className="p-3 align-top border-r border-gray-300">
                      To link and verify your WhatsApp account
                    </td>
                    <td className="p-3 align-top border-r border-gray-300">Contract</td>
                    <td className="p-3 align-top">
                      For the duration of your active account
                    </td>
                  </tr>
                  <tr className="border-t border-gray-300">
                    <td className="p-3 align-top border-r border-gray-300">
                      Identification and contact details; Content of WhatsApp messages
                      and voice notes; Usage data; and other customer information you
                      voluntarily dictate (such as phone numbers, emails, names, notes,
                      conversation content)
                    </td>
                    <td className="p-3 align-top border-r border-gray-300">
                      To deliver the solution you use, to automatically process your
                      messages and to place them in your CRM
                    </td>
                    <td className="p-3 align-top border-r border-gray-300">Contract</td>
                    <td className="p-3 align-top">
                      As short as possible; raw audio messages are automatically deleted
                      within 7 days after processing; only the output forwarded to your
                      CRM is retained in accordance with your CRM's retention periods
                    </td>
                  </tr>
                  <tr className="border-t border-gray-300">
                    <td className="p-3 align-top border-r border-gray-300">Identification and contact details</td>
                    <td className="p-3 align-top border-r border-gray-300">
                      To send you service emails in case of malfunctions, security
                      updates or upgrades
                    </td>
                    <td className="p-3 align-top border-r border-gray-300">Contract</td>
                    <td className="p-3 align-top">
                      For as long as you use one of our solutions
                    </td>
                  </tr>
                  <tr className="border-t border-gray-300">
                    <td className="p-3 align-top border-r border-gray-300">
                      (Electronic) identification and contact details; logs
                    </td>
                    <td className="p-3 align-top border-r border-gray-300">
                      To record and store logs in order to detect fraud and abuse
                    </td>
                    <td className="p-3 align-top border-r border-gray-300">
                      Legitimate interest (to detect fraud and misuse of our solutions
                      and to take appropriate action)
                    </td>
                    <td className="p-3 align-top">
                      For 30 days following the registration of the logs; If an anomaly
                      is detected, up to 10 years after registration or until any legal
                      proceedings are concluded
                    </td>
                  </tr>
                  <tr className="border-t border-gray-300">
                    <td className="p-3 align-top border-r border-gray-300">
                      Identification and contact details to establish your identity (with
                      official documents and photo)
                    </td>
                    <td className="p-3 align-top border-r border-gray-300">
                      To handle your request to exercise your rights
                    </td>
                    <td className="p-3 align-top border-r border-gray-300">
                      Legal obligation (Article 12(2) GDPR)
                    </td>
                    <td className="p-3 align-top">
                      As long as necessary to process your request (and in the event of
                      legal proceedings: until their conclusion)
                    </td>
                  </tr>
                  <tr className="border-t border-gray-300">
                    <td className="p-3 align-top border-r border-gray-300">
                      Identification and contact details; all data necessary to defend
                      our rights
                    </td>
                    <td className="p-3 align-top border-r border-gray-300">To defend our rights</td>
                    <td className="p-3 align-top border-r border-gray-300">
                      Legitimate interest (legal defense)
                    </td>
                    <td className="p-3 align-top">
                      Until the end of the legal claim or for as long as a legal claim
                      may be possible
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;