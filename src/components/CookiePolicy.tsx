import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CookiePolicy: React.FC = () => {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cookie Statement</h1>
            <p className="text-sm text-gray-600">Version 20.08.2025</p>
          </div>
        </div>

        {/* Cookie Policy Content */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="prose max-w-none">
            <div className="mb-8">
              <p className="text-lg leading-relaxed mb-6">
                Thank you for visiting our platform!
              </p>
              
              <p className="leading-relaxed mb-8">
                We, Finit Solutions, established at Guldensporenlaan 9, 3120 Tremelo and registered in the Crossroads Bank for Enterprises under number 1020.600.643 (RPR Leuven) (hereinafter "Finit Solutions", "we" or "us"), wish to inform visitors of our platform through this cookie statement about which cookies and/or similar technologies are used on our platform, why we use them, and how you can delete or disable cookies.
              </p>

              <p className="leading-relaxed mb-8">
                This cookie statement may be updated by us if new developments give cause to do so. The most current version of the cookie statement can always be found on our platform.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What is a cookie?</h3>
              
              <p className="leading-relaxed mb-6">
                A cookie is generally a small text and number file that we send and store in your web browser or on your mobile device during a visit to our platform. When you next visit our platform with the same web browser or device, this information is sent back to our platform. Cookies help us to, for example, remember your preferences when using our platform (e.g. your language choice), unless you have adjusted your browser settings to refuse such cookies.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Types of cookies</h3>
              
              <p className="leading-relaxed mb-4">
                Cookies can be divided according to their origin:
              </p>

              <p className="leading-relaxed mb-4">
                <strong>First party cookies</strong> are technical cookies placed by us that ensure our platform functions properly. This improves the quality of our products and services.
              </p>

              <p className="leading-relaxed mb-6">
                <strong>Third party cookies</strong> are cookies placed by a domain name other than that of our platform. If a user visits a website and a third party places a cookie via that website, that is a third party cookie. For cookies placed by third parties, we refer you to the statements these parties provide on their respective websites. Please note: we have no influence on the content of these statements or the content of the cookies of such third parties.
              </p>

              <p className="leading-relaxed mb-4">
                Cookies can also be categorized by function:
              </p>

              <p className="leading-relaxed mb-4">
                <strong>Essential or strictly necessary cookies</strong> are (as the name suggests) necessary to enable the platform to function properly or to provide a service you request, e.g. to establish a particular connection. We may place these cookies without your prior consent.
              </p>

              <p className="leading-relaxed mb-4">
                <strong>Non-essential cookies</strong> are cookies that may be placed for statistical, social, targeting and commercial purposes. They are not related to the purely technical support of the platform. Non-essential cookies may be first party or third party cookies and may only be placed and used by us if you have given your prior consent via the cookie banner.
              </p>

              <p className="leading-relaxed mb-4">
                Different types of non-essential cookies can be distinguished:
              </p>

              <p className="leading-relaxed mb-4">
                <strong>Functional cookies</strong> ensure that certain non-essential functionalities of the platform work properly.
              </p>

              <p className="leading-relaxed mb-4">
                <strong>Statistical cookies</strong> allow us to determine which pages of the platform you visit, where your computer is located, etc.
              </p>

              <p className="leading-relaxed mb-4">
                <strong>Social cookies</strong> enable users to directly share the content of the platform visited with others via social media.
              </p>

              <p className="leading-relaxed mb-4">
                <strong>Targeting cookies</strong> allow a profile to be built based on your browsing behavior so that displayed ads are tailored to your interests.
              </p>

              <p className="leading-relaxed mb-6">
                <strong>Tracking cookies</strong> allow your internet behavior to be followed over time.
              </p>

              <p className="leading-relaxed mb-4">
                Cookies can also be divided according to their lifespan:
              </p>

              <p className="leading-relaxed mb-4">
                <strong>Persistent cookies:</strong> These cookies remain on the user's device for the duration specified in the cookie. They are activated each time the user visits the platform that placed that cookie. Most non-essential cookies are persistent cookies.
              </p>

              <p className="leading-relaxed mb-6">
                <strong>Session cookies:</strong> These cookies allow us to simplify and link a user's actions during a browser session. A browser session begins when a user opens the browser window and ends when they close the browser window. Session cookies are placed temporarily. Once you close the browser, all session cookies are deleted. Most functional cookies are session cookies.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Information about the use of cookies on our platform</h3>
              
              <p className="leading-relaxed mb-6">
                When you use the platform, the following cookies are used:
              </p>

              {/* Cookie Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left border-b border-gray-300">Name</th>
                      <th className="p-3 text-left border-b border-gray-300">Type</th>
                      <th className="p-3 text-left border-b border-gray-300">Origin</th>
                      <th className="p-3 text-left border-b border-gray-300">Description</th>
                      <th className="p-3 text-left border-b border-gray-300">Retention period</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-300">
                      <td className="p-3 align-top border-r border-gray-300"></td>
                      <td className="p-3 align-top border-r border-gray-300"></td>
                      <td className="p-3 align-top border-r border-gray-300"></td>
                      <td className="p-3 align-top border-r border-gray-300"></td>
                      <td className="p-3 align-top"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="leading-relaxed mb-6">
                Please read our privacy statement ([HYPERLINK]) to learn more about how we process and protect personal data, how long we retain them, and what privacy rights you have.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Accepting cookies</h3>
              
              <p className="leading-relaxed mb-4">
                On your first visit to our platform, a cookie banner appears. Through this banner, we inform you about which cookies we use and ask whether we may use certain cookies. You are free to agree or not.
              </p>

              <p className="leading-relaxed mb-6">
                Please note that some functionalities of our platform may not work or may not work fully if not all cookies are accepted.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Managing cookies (deleting or disabling)</h3>
              
              <p className="leading-relaxed mb-4">
                If you do not want websites to place cookies on your computer, or if you wish to delete your cookies, you can change your cookie settings in your web browser.
              </p>

              <p className="leading-relaxed mb-4">
                These settings are usually found in the 'Options' or 'Preferences' menu of your web browser. You can also adjust your settings so that your browser refuses all cookies or only third-party cookies.
              </p>

              <p className="leading-relaxed mb-4">
                To better understand these settings, the following links may be useful. Otherwise, consult the 'Help' function in your web browser for more details.
              </p>

              <p className="leading-relaxed mb-4">
                Useful information about cookies can be found at:
              </p>

              <p className="leading-relaxed mb-4">
                <a href="http://www.allaboutcookies.org/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  http://www.allaboutcookies.org/
                </a>
              </p>

              <p className="leading-relaxed mb-6">
                <a href="http://www.youronlinechoices.com/be-nl/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  http://www.youronlinechoices.com/be-nl/
                </a>
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Your rights</h3>
              
              <p className="leading-relaxed mb-6">
                To give you more control over the processing of your personal data, you have a number of rights. These rights are, among others, laid down in Articles 15-22 GDPR.
              </p>

              <p className="leading-relaxed mb-4">
                You have the following rights:
              </p>

              <p className="leading-relaxed mb-4">
                <strong>Right of access (Article 15 GDPR):</strong> You have the right to know at any time whether or not we process your personal data. If we do, you have the right to access them and to receive additional information about the purposes, categories of data, recipients, retention period, existence of rights, right to lodge a complaint, source of the data (if obtained from third parties), and the existence of automated decision-making. If we cannot provide access (e.g. due to legal obligations), we will inform you why. You may also obtain a free copy of the processed personal data in an intelligible form (we may charge a reasonable fee for administrative costs for additional copies).
              </p>

              <p className="leading-relaxed mb-4">
                <strong>Right to erasure ("right to be forgotten") (Article 17 GDPR):</strong> You may request erasure of your personal data in certain cases. This right is not absolute; we may retain personal data if necessary for the performance of the contract, compliance with a legal obligation, or the establishment, exercise, or defense of legal claims.
              </p>

              <p className="leading-relaxed mb-4">
                <strong>Right to rectification (Article 16 GDPR):</strong> If your personal data are inaccurate, outdated or incomplete, you may request us to correct or complete them.
              </p>

              <p className="leading-relaxed mb-4">
                <strong>Right to data portability (Article 20 GDPR):</strong> Under certain conditions, you have the right to have the personal data you provided to us transferred to another controller, or to receive them yourself. Where technically feasible, we will transfer them directly to the new controller.
              </p>

              <p className="leading-relaxed mb-4">
                <strong>Right to restriction of processing (Article 18 GDPR):</strong> You may request restriction of processing if (i) you contest the accuracy of the data, (ii) the processing is unlawful, (iii) we no longer need the data but you require them for legal claims, or (iv) a decision is pending on your objection to processing.
              </p>

              <p className="leading-relaxed mb-4">
                <strong>Right to object (Article 21 GDPR):</strong> You may object to processing of your personal data on grounds relating to your particular situation, if the processing is based on legitimate interest or on a task carried out in the public interest. We will cease processing unless we demonstrate compelling legitimate grounds, or the processing is related to legal claims.
              </p>

              <p className="leading-relaxed mb-4">
                <strong>Right not to be subject to automated decision-making (Article 22 GDPR):</strong> You have the right not to be subject to a decision based solely on automated processing (including profiling) that significantly affects you or produces legal effects, without substantial human involvement. Exceptions apply if permitted by law, based on explicit consent, or necessary for contract performance (always assessed case by case).
              </p>

              <p className="leading-relaxed mb-4">
                <strong>Right to withdraw consent (Article 7 GDPR):</strong> Where processing is based on consent, you may withdraw that consent at any time by simple request.
              </p>

              <p className="leading-relaxed mb-6">
                <strong>Right to lodge a complaint (Article 77(1) GDPR):</strong> You may lodge a complaint with the supervisory authority for data protection. A list of EU supervisory authorities is available here: <a href="https://www.edpb.europa.eu/about-edpb/about-edpb/members_nl" className=\"text-blue-600 hover:underline" target=\"_blank" rel="noopener noreferrer">https://www.edpb.europa.eu/about-edpb/about-edpb/members_nl</a>.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Exercising your rights</h3>
              
              <p className="leading-relaxed mb-4">
                To exercise these rights, you can contact us via the contact details under "Questions?". To verify your identity, we may ask you to send us a copy of the front of your identity card. We request that you make your national register number and photo illegible. In any case, we will process such ID data solely to verify your identity and will not store or register them in our systems.
              </p>

              <p className="leading-relaxed mb-6">
                You may exercise all these rights free of charge, unless your request is manifestly unfounded or excessive (e.g. repetitive). In such case, we are entitled to charge a reasonable fee or to refuse your request.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Questions?</h3>
              
              <p className="leading-relaxed mb-4">
                You can always contact us via the following contact details:
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;