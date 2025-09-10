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
                We, Finit Solutions, established at Guldensporenlaan 9, 3120 Tremelo and registered in the Crossroads Bank for Enterprises under number 1020.600.643 (RPR Leuven) (hereinafter "Finit Solutions", "we" or "us"), wish to inform visitors to our platform through this cookie statement about which cookies and/or similar technologies are used on our platform, why we do so and how you can delete or disable cookies.
              </p>

              <p className="leading-relaxed mb-8">
                This cookie statement may be amended by us if new developments give cause to do so. You can always find the most current version of the cookie statement on our platform.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What is a cookie?</h3>

              <p className="leading-relaxed mb-6">
                A cookie is, in general, a small text and number file that we send and store in your web browser or on your mobile device during a visit to our platform. When you next visit our platform with the same web browser or the same device, this information is sent back to our platform. Cookies help us, for example, to remember your preferences when using our platform (e.g. your language choice), unless you have adjusted your browser settings so that it will refuse those cookies.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Types of cookies</h3>

              <p className="leading-relaxed mb-4">
                There are different types of cookies. Cookies can be classified according to their origin:
              </p>

              <p className="leading-relaxed mb-4">
                <strong>First party cookies</strong> are technical cookies that are placed by us and that ensure that our platform functions properly. This increases the quality of our products and services.
              </p>

              <p className="leading-relaxed mb-6">
                <strong>Third party cookies</strong> are cookies that are placed by a domain name other than that of our platform. If a user visits a website and a third party places a cookie via that website, then that is a third party cookie. For cookies placed by third parties, we kindly refer you to the statements that these parties provide on their respective websites. Please note: we cannot exert any influence on the content of those statements nor on the content of the cookies of these third parties.
              </p>

              <p className="leading-relaxed mb-4">
                Cookies can also be divided according to function, including:
              </p>

              <p className="leading-relaxed mb-4">
                <strong>Essential or strictly necessary cookies</strong> are (as their name indicates) necessary to enable the platform to function properly or to provide a service requested by you, e.g. by establishing a specific connection. We may place these cookies without your prior consent;
              </p>

              <p className="leading-relaxed mb-6">
                <strong>Non-essential cookies</strong> are cookies that may be placed for statistical, social, targeting and commercial purposes. They are not related to the purely technical support of the platform. Non-essential cookies can be first party or third party cookies and may only be placed and used by us insofar as you have given us your prior consent via the cookie banner.
              </p>

              <p className="leading-relaxed mb-4">
                Different types of non-essential cookies can be distinguished:
              </p>

              <p className="leading-relaxed mb-4">
                <strong>Functional cookies</strong> ensure that certain non-essential functionalities of the platform work properly.
              </p>

              <p className="leading-relaxed mb-4">
                <strong>Cookies for statistical purposes</strong> allow, among other things, to determine which pages of the platform you visit, where your computer is located, etc.
              </p>

              <p className="leading-relaxed mb-4">
                <strong>Cookies for social purposes</strong> make it possible for the user to directly share the content of the visited platform with others via social media.
              </p>

              <p className="leading-relaxed mb-4">
                <strong>Cookies for targeting purposes</strong> allow a profile to be built based on your browsing behavior so that the displayed advertisements are tailored to your interests.
              </p>

              <p className="leading-relaxed mb-6">
                <strong>Cookies for tracking purposes</strong> allow your internet behavior to be followed over time.
              </p>

              <p className="leading-relaxed mb-4">
                Cookies can also be divided according to their lifespan:
              </p>

              <p className="leading-relaxed mb-4">
                <strong>Fixed-duration cookies:</strong> These cookies remain on the user's device for the duration determined in the cookie. They are activated each time the user visits the platform that placed this cookie. Most non-essential cookies are fixed-duration cookies.
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
                Please read our <a href="https://voicelink.me/privacypolicy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">privacy statement</a> to learn about how we process personal data, how we secure them, how long we retain them and what privacy rights you have.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Accepting cookies</h3>

              <p className="leading-relaxed mb-4">
                On your first visit to our platform, a cookie banner appears. By means of this cookie banner, we inform you about which cookies we use, and we ask you whether we may use certain cookies. You are free to agree to this or not.
              </p>

              <p className="leading-relaxed mb-6">
                Please note that some functionalities on our platform may not work or may not work fully if not all cookies are accepted.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Managing cookies (deleting or disabling)</h3>

              <p className="leading-relaxed mb-4">
                If you do not want websites to place cookies on your computer or if you wish to delete your cookies, you can change your cookie settings in your web browser.
              </p>

              <p className="leading-relaxed mb-4">
                These settings are usually found in the 'Options' or 'Preferences' menu of your web browser. You can also adjust your settings so that your browser refuses all cookies or only third-party cookies.
              </p>

              <p className="leading-relaxed mb-4">
                To better understand these settings, the following links may be useful. If not, you should consult the 'Help' function in your web browser for more details.
              </p>

              <p className="leading-relaxed mb-4">
                Useful information about cookies can be found at:{' '}
                <a
                  href="http://www.allaboutcookies.org/"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  http://www.allaboutcookies.org/
                </a>{' '}
                and{' '}
                <a
                  href="http://www.youronlinechoices.com/be-nl/"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  http://www.youronlinechoices.com/be-nl/
                </a>
                .
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Your rights</h3>

              <p className="leading-relaxed mb-6">
                To give you more control over the processing of your personal data, you have a number of rights. These rights are, among others, laid down in Articles 15-22 GDPR.
              </p>

              <p className="leading-relaxed mb-4">You have the following rights:</p>

              <p className="leading-relaxed mb-4">
                <strong>The right of access to the personal data that we process about you (Art. 15 GDPR):</strong><br />
                You have the right to know from us at any time whether or not we process your personal data. If we process them, then you have the right to access these personal data and to receive additional information regarding:
              </p>

              <ul className="list-disc list-inside mb-6 ml-4 space-y-1">
                <li>the purposes of the processing;</li>
                <li>the categories of personal data concerned;</li>
                <li>the recipients or categories of recipients (in particular recipients in third countries);</li>
                <li>the retention period or, if that is not possible, the criteria used to determine that period;</li>
                <li>the existence of your privacy rights;</li>
                <li>the right to lodge a complaint with the supervisory authority;</li>
                <li>the source of the personal data if we obtain personal data via a third party;</li>
                <li>the existence of automated decision-making.</li>
              </ul>

              <p className="leading-relaxed mb-6">
                If we cannot give you access to your personal data (for example due to legal obligations), we will inform you why that is not possible.
                You can also obtain a free copy of the processed personal data in an intelligible form. Please note, we may charge a reasonable fee to cover our administrative costs for each additional copy you request.
              </p>

              <p className="leading-relaxed mb-4">
                <strong>Right to erasure ('right to be forgotten') (Art. 17 GDPR):</strong><br />
                In certain cases, you can ask us to erase your personal data. Please also note that your right to be forgotten is not absolute. We have the right to continue to retain your personal data where this is necessary for, among other things, the performance of the contract, compliance with a legal obligation or the establishment, exercise or defense of legal claims. We will inform you further about this in our response to your request.
              </p>

              <p className="leading-relaxed mb-4">
                <strong>The right to rectification and completion (Art. 16 GDPR):</strong><br />
                When your personal data are incorrect, outdated or incomplete, you can ask us to rectify these inaccuracies or incompleteness.
              </p>

              <p className="leading-relaxed mb-4">
                <strong>The right to data portability (Art. 20 GDPR):</strong><br />
                You also have the right, under certain conditions, to have the personal data that you have provided to us for the performance of the contract or for which you have given consent, transferred by us to another controller. Insofar as technically possible, we will provide your personal data directly to the new controller.
              </p>

              <p className="leading-relaxed mb-4">
                <strong>The right to restriction of processing (Art. 18 GDPR):</strong><br />
                If one of the following elements applies, you can ask us to restrict the processing of your personal data:
              </p>

              <ul className="list-disc list-inside mb-6 ml-4 space-y-1">
                <li>you contest the accuracy of those personal data (in this case, their use will be restricted for a period enabling us to verify the accuracy of the personal data);</li>
                <li>the processing of your personal data is unlawful;</li>
                <li>we no longer need your personal data for the original processing purposes, but you need them for the establishment, exercise or defense of legal claims;</li>
                <li>as long as no decision has been taken on the exercise of your right to object to the processing, you can request restriction of the use of your personal data.</li>
              </ul>

              <p className="leading-relaxed mb-4">
                <strong>The right to object (Art. 21 GDPR):</strong><br />
                On grounds relating to your particular situation, you can object to the processing of your personal data if this processing is based on our legitimate interest or the performance of a task carried out in the public interest. In that case, we will cease the processing of your personal data, unless we can demonstrate compelling and legitimate grounds for the processing which override yours, or where the processing of the personal data is related to the establishment, exercise or defense of legal claims.
              </p>

              <p className="leading-relaxed mb-4">
                <strong>The right not to be subject to automated decision-making (Article 22 GDPR):</strong><br />
                You have the right not to be subject to a decision that is made solely on the basis of automated data processing and that significantly affects you or has legal consequences and that is taken without substantial human intervention.
              </p>

              <p className="leading-relaxed mb-4">
                In three situations you cannot rely on this right:
              </p>

              <ul className="list-disc list-inside mb-6 ml-4 space-y-1">
                <li>if a law permits this (for example to prevent tax fraud);</li>
                <li>if the decision-making is based on the explicit consent of the data subject; or</li>
                <li>if this is necessary for entering into, or the performance of, a contract (note that in such cases we will always assess on a case-by-case basis whether there are less privacy-intrusive methods to conclude or perform the contract).</li>
              </ul>

              <p className="leading-relaxed mb-4">
                <strong>The right to withdraw your consent (Art. 7 GDPR):</strong><br />
                Where your personal data are processed on the basis of your consent, you can withdraw this consent at any time upon simple request.
              </p>

              <p className="leading-relaxed mb-6">
                <strong>The right to lodge a complaint with the supervisory authority (Art. 77(1) GDPR):</strong><br />
                We do our utmost to protect your personal data. If you have a complaint about the way we process your personal data, you can notify us via our contact details as stated under the heading "Questions?", so that we can address it as quickly as possible.
                You can also lodge a complaint with the supervisory authority for data protection. A list of the supervisory authorities within the European Union can be consulted via the following hyperlink:{' '}
                <a
                  href="https://www.edpb.europa.eu/about-edpb/about-edpb/members_nl"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://www.edpb.europa.eu/about-edpb/about-edpb/members_nl
                </a>
                .
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Exercising your rights</h3>

              <p className="leading-relaxed mb-4">
                To exercise these rights, you can contact us via the contact details included under the heading "Questions?". To verify your identity, we ask you to send a copy of the front of your identity card. We ask you to make your national register number and photograph on your identity card illegible. In any case, we will process your identity card data solely to verify your identity and will neither store nor register them in our systems.
              </p>

              <p className="leading-relaxed mb-6">
                You can exercise all these rights free of charge, unless your request is manifestly unfounded or excessive (for example due to its repetitive character). In that case, we have the right to charge you a reasonable fee or to refuse to comply with your request.
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

              {/* Language note */}
              <div className="text-sm text-gray-600">
                <strong>Language of the Cookie Statement —</strong> The Dutch version of this Cookie Statement shall at all times be the binding and official version. Any translations are provided for convenience only. You may request a copy of the official Dutch version by contacting us at{' '}
                <a href="mailto:contact@finitsolutions.be" className="text-blue-600 hover:underline">
                  contact@finitsolutions.be
                </a>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;