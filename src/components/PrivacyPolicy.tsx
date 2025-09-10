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

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Minors</h3>
          
          <p className="leading-relaxed mb-6">
            We do not intend to collect personal data from persons under the age of 16. These minors may not provide us with personal data or a declaration of consent without the permission of the person holding parental authority.
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Cookies</h3>
          
          <p className="leading-relaxed mb-6">
            We also use cookies, mainly to continuously optimize our platform for users. For more specific information about the cookies we use, you can consult our cookie statement: <a href="/cookie-policy" className="text-blue-600 hover:underline">Cookie Policy</a>.
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your privacy rights</h3>
          
          <p className="leading-relaxed mb-6">
            To give you more control over the processing of your personal data, you have a number of rights. These rights are, among others, laid down in Articles 15-22 GDPR.
          </p>

          <p className="leading-relaxed mb-6">
            You have the following rights:
          </p>

          <p className="leading-relaxed mb-4">
            <strong>Right of access to the personal data we process about you (Article 15 GDPR):</strong><br />
            You have the right to know at any time whether or not we process your personal data. If we do, you have the right to access these personal data and to receive additional information regarding:
          </p>

          <ul className="list-disc list-inside mb-6 ml-4 space-y-1">
            <li>the purposes of the processing;</li>
            <li>the categories of personal data concerned;</li>
            <li>the recipients or categories of recipients (in particular recipients in third countries);</li>
            <li>the retention period or, if that is not possible, the criteria used to determine that period;</li>
            <li>the existence of your privacy rights;</li>
            <li>the right to lodge a complaint with the supervisory authority;</li>
            <li>the source of the personal data if we obtained personal data from a third party;</li>
            <li>the existence of automated decision-making.</li>
          </ul>

          <p className="leading-relaxed mb-6">
            If we cannot give you access to your personal data (for example due to legal obligations), we will inform you why this is not possible.
            You may also obtain a free copy of the processed personal data in an intelligible form. Please note, however, that we may charge a reasonable fee to cover our administrative costs for each additional copy you request.
          </p>

          <p className="leading-relaxed mb-4">
            <strong>Right to erasure ("right to be forgotten") (Article 17 GDPR):</strong><br />
            In certain cases, you may request us to erase your personal data. Please note that your right to erasure is not absolute. We are entitled to continue to retain your personal data where necessary for, among other things, the performance of the contract, compliance with a legal obligation, or the establishment, exercise, or defense of legal claims. We will inform you further about this in our response to your request.
          </p>

          <p className="leading-relaxed mb-4">
            <strong>Right to rectification (Article 16 GDPR):</strong><br />
            When your personal data are incorrect, outdated, or incomplete, you may ask us to rectify these inaccuracies or complete the data.
          </p>

          <p className="leading-relaxed mb-4">
            <strong>Right to data portability (Article 20 GDPR):</strong><br />
            You also have the right, under certain conditions, to have the personal data you have provided to us for the performance of the contract or for which you have given consent, transmitted to another controller. Where technically feasible, we will transfer your personal data directly to the new controller.
          </p>

          <p className="leading-relaxed mb-4">
            <strong>Right to restriction of processing (Article 18 GDPR):</strong><br />
            If one of the following applies, you may request us to restrict the processing of your personal data:
          </p>

          <ul className="list-disc list-inside mb-6 ml-4 space-y-1">
            <li>you contest the accuracy of those personal data (in this case, their use will be restricted for a period enabling us to verify their accuracy);</li>
            <li>the processing of your personal data is unlawful;</li>
            <li>we no longer need your personal data for the original purposes, but you need them for the establishment, exercise, or defense of legal claims;</li>
            <li>as long as no decision has been made regarding the exercise of your right to object to processing, you may request restriction of the use of your personal data.</li>
          </ul>

          <p className="leading-relaxed mb-4">
            <strong>Right to object (Article 21 GDPR):</strong><br />
            On grounds relating to your particular situation, you may object to the processing of your personal data if that processing is based on our legitimate interest or the performance of a task carried out in the public interest. In such case, we will cease processing your personal data, unless we demonstrate compelling legitimate grounds for the processing which override your interests, rights and freedoms, or where the processing is related to the establishment, exercise, or defense of legal claims.
          </p>

          <p className="leading-relaxed mb-4">
            <strong>Right not to be subject to automated decision-making (Article 22 GDPR):</strong><br />
            You have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects concerning you or significantly affects you, and which is made without substantial human involvement.
          </p>

          <p className="leading-relaxed mb-4">
            In three situations you cannot rely on this right:
          </p>

          <ul className="list-disc list-inside mb-6 ml-4 space-y-1">
            <li>where such decision-making is authorized by law (e.g. to prevent tax fraud);</li>
            <li>where the decision-making is based on the explicit consent of the data subject; or</li>
            <li>where this is necessary for entering into, or performance of, a contract (note that in such cases we will always assess on a case-by-case basis whether less privacy-intrusive methods exist to conclude or perform the contract).</li>
          </ul>

          <p className="leading-relaxed mb-4">
            <strong>Right to withdraw consent (Article 7 GDPR):</strong><br />
            Where your personal data are processed based on your consent, you may withdraw that consent at any time upon simple request.
          </p>

          <p className="leading-relaxed mb-4">
            <strong>Right to lodge a complaint with the supervisory authority (Article 77(1) GDPR):</strong><br />
            You may lodge a complaint with the supervisory authority for data protection. A list of supervisory authorities within the European Union can be found via the following hyperlink: <a href="https://www.edpb.europa.eu/about-edpb/about-edpb/members_nl" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://www.edpb.europa.eu/about-edpb/about-edpb/members_nl</a>.
          </p>

          <p className="leading-relaxed mb-4">
            The authority supervising our organization is the Data Protection Authority, with the following contact details:
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-blue-900 mb-3">Data Protection Authority</h4>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Website:</span>{' '}
                <a href="https://www.gegevensbeschermingsautoriteit.be" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  https://www.gegevensbeschermingsautoriteit.be
                </a>
              </p>
              <div>
                <span className="font-medium">Contact details:</span>
                <div className="ml-4">
                  <p>Gegevensbeschermingsautoriteit</p>
                  <p>Drukpersstraat 35, 1000 Brussels</p>
                  <p>+32 (0)2 274 48 00</p>
                  <p>+32 (0)2 274 48 35</p>
                  <a href="mailto:contact@apd-gba.be" className="text-blue-600 hover:underline">
                    contact@apd-gba.be
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Exercising your rights</h3>
          
          <p className="leading-relaxed mb-6">
            To exercise these rights, you can contact us via the contact details under the heading "Who are we?". To verify your identity, we ask you to send us a copy of the front of your identity card. We request that you render your national register number and photograph illegible. In any case, we will only process the identity card data for the purpose of verifying your identity and will not store or register them in our systems.
          </p>

          <p className="leading-relaxed mb-6">
            You can exercise all these rights free of charge, unless your request is manifestly unfounded or excessive (for example, due to its repetitive nature). In such case, we are entitled to charge you a reasonable fee or to refuse to comply with your request.
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Retention of your personal data</h3>
          
          <p className="leading-relaxed mb-6">
            We retain your personal data for as long as necessary to achieve the intended purpose. You should note that many (legal) retention periods require personal data to be kept. Where no retention obligation exists, the data are routinely erased once the purpose for which they were collected has been achieved.
          </p>

          <p className="leading-relaxed mb-6">
            In addition, we may retain personal data if you have given us consent for this, or if it is possible that we need these data in the context of legal proceedings. In the latter case, we must use certain personal data as evidence. For that purpose, we retain certain personal data in accordance with the statutory limitation period, which may be up to thirty years; the usual limitation period for personal legal claims is ten years.
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Sources of personal data</h3>
          
          <p className="leading-relaxed mb-6">
            We process the personal data that you provide to us voluntarily. If additional personal data are required, it will be indicated whether or not you are obliged to provide them and what the consequences are if you do not. Failure to provide personal data may result in us not being able to deliver our products and services to you.
          </p>

          <p className="leading-relaxed mb-4">
            In particular, we may receive your personal data from the following sources:
          </p>

          <ul className="list-disc list-inside mb-6 ml-4 space-y-1">
            <li>Our external partners and independent service providers;</li>
            <li>Our online payment services partner;</li>
            <li>Your CRM partner;</li>
            <li>Publicly accessible sources and official registers (such as the Crossroads Bank for Enterprises or public websites).</li>
          </ul>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Categories of recipients</h3>
          
          <p className="leading-relaxed mb-6">
            Within our organization, we ensure that your personal data are only accessible to persons who need them to comply with contractual and legal obligations.
            We will only transfer your personal data to third parties in accordance with legal provisions or where you have given your consent. In certain cases, our employees are supported by external service providers in the performance of their duties.
          </p>

          <p className="leading-relaxed mb-6">
            Apart from this, we do not transfer personal data to third parties, unless we are obliged to do so on the basis of legal provisions (e.g. transfers to public authorities such as supervisory or law enforcement bodies).
          </p>

          <p className="leading-relaxed mb-4">
            In particular, we identify the following categories of recipients:
          </p>

          <ul className="list-disc list-inside mb-6 ml-4 space-y-1">
            <li>Public authorities or regulatory bodies when they request this in the context of compliance with a judgment or ruling, law, regulation, standard, or legal procedure;</li>
            <li>External (IT) service providers that enable us to offer you functionalities on the platform;</li>
            <li>External (legal and financial) advisors and consultants;</li>
            <li>Your CRM partner;</li>
            <li>Our online payment services partner;</li>
            <li>External marketing and communication partners who support us in setting up and carrying out campaigns, newsletters, and other communications.</li>
          </ul>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Transfers to third countries outside the European Economic Area ("EEA")</h3>
          
          <p className="leading-relaxed mb-6">
            We only transfer your personal data to processors or controllers in third countries if we are legally authorized to do so or if this is necessary for handling a case.
            Where such transfers are required, we take the necessary measures to ensure that your personal data are highly protected and that all transfers of personal data outside the EEA take place lawfully.
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Security of your personal data</h3>
          
          <p className="leading-relaxed mb-6">
            The security of your personal data is important to us. We have taken reasonable and appropriate technical and organizational security measures to protect your personal data as well as possible against accidental or intentional manipulation, loss, destruction, or access by unauthorized persons.
            Unfortunately, the transmission of information via the internet is not completely secure. Although we do our utmost to protect your personal data, we cannot guarantee the security of personal data transmitted to us via the internet.
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Questions or complaints?</h3>
          
          <p className="leading-relaxed mb-6">
            You may always contact us by telephone, e-mail, or letter using the contact details under the heading "Who are we?". We will be happy to answer your questions.
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Changes</h3>
          
          <p className="leading-relaxed mb-6">
            In order to take into account feedback or to reflect changes in our processing activities, we may amend this privacy statement from time to time. We therefore invite you to always consult the latest version of this privacy statement on our platform.
          </p>

          <p className="leading-relaxed mb-6">
            <strong>Language of the Agreement</strong> – The Dutch version of this Agreement shall at all times be the binding and official version. Any translations of this Agreement are provided for convenience and informational purposes only. Users may request a copy of the official Dutch version by contacting us at{' '}
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

export default PrivacyPolicy;