/* eslint-disable react/no-unescaped-entities */
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SaasAgreementPage() {
  const navigate = useNavigate();

  return (
    <main className="pt-20 min-h-screen bg-gray-50">
      <section className="relative py-16 md:py-24">
        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Navigation */}
            <div className="mb-8">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </button>
            </div>

            {/* Badge */}
            <p className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-600 mb-6">
              <span>Software as a Service Agreement</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </p>

            {/* Title */}
            <h1 className="text-4xl font-bold mb-8 text-center">
              SOFTWARE AS A SERVICE AGREEMENT
            </h1>

            <div className="prose prose-lg max-w-none bg-white rounded-lg shadow-sm p-8">
              
              {/* BETWEEN */}
              <h2 className="text-2xl font-semibold mt-8 mb-4">
                BETWEEN:
              </h2>
              
              <div className="ml-6 mb-4">
                <p className="mb-2">
                  <strong>1. FINIT SOLUTIONS</strong>, located at Guldensporenlaan 9, 3120 Tremelo and registered in the Crossroads Bank for Enterprises under number 1020.600.643 (RPR Leuven);
                </p>
                <p className="ml-4 mb-4">
                  Hereinafter referred to as "<strong>FINIT SOLUTIONS</strong>";
                </p>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">AND:</h3>
              
              <div className="ml-6 mb-6">
                <p className="mb-2">
                  <strong>2.</strong> The <strong>"Customer"</strong>;
                </p>
                <p className="ml-4">
                  Hereinafter also referred to individually as "Party" or jointly as "<strong>Parties</strong>".
                </p>
              </div>

              {/* CONSIDERING THAT */}
              <h2 className="text-2xl font-semibold mt-8 mb-4">
                CONSIDERING THAT:
              </h2>
              
              <div className="ml-6 space-y-4">
                <p>
                  <strong>(i)</strong> FINIT SOLUTIONS has developed a "software as a service" solution that uses artificial intelligence to convert spoken input into CRM data and implement it in the CRM system used by the Customer. Called: "VoiceLink";
                </p>
                <p>
                  <strong>(ii)</strong> FINIT SOLUTIONS has developed a "software as a service" solution that uses artificial intelligence to structure and categorize all files on the Customer's drive. Called: <em>"FilePilot"</em>
                </p>
                <p>
                  <strong>(iii)</strong> The Customer wishes to use at least one of FINIT SOLUTIONS' "software as a service" solutions (hereinafter also referred to as "Solutions") in the context of its commercial activities;
                </p>
                <p>
                  <strong>(iv)</strong> FINIT SOLUTIONS wishes to make its Solutions available to the Customer in accordance with the terms and conditions set out in this "software as a service agreement" (hereinafter the "Agreement").
                </p>
              </div>

              <h2 className="text-2xl font-semibold mt-8 mb-4">
                THE PARTIES AGREE AS FOLLOWS:
              </h2>

              {/* Article 1 */}
              <h3 className="text-xl font-semibold mt-8 mb-3 underline">
                Article 1 - Monthly fee
              </h3>
              
              <p className="mb-4">
                The monthly fee charged to the Customer for the Software and Services consists of:
              </p>

              {/* Pricing Table */}
              <div className="overflow-x-auto mt-4 mb-6">
                <table className="w-full border border-gray-300 text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 border-r font-semibold bg-gray-50">VoiceLink</td>
                      <td className="p-3 border-r">From 1 user</td>
                      <td className="p-3">29 EUR per month per user</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 border-r"></td>
                      <td className="p-3 border-r">From 5 users</td>
                      <td className="p-3">25 EUR per month per user</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 border-r"></td>
                      <td className="p-3 border-r">From 10 users</td>
                      <td className="p-3">22 EUR per month per user</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 border-r"></td>
                      <td className="p-3 border-r">From 25 users</td>
                      <td className="p-3">19 EUR per month per user</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 border-r"></td>
                      <td className="p-3 border-r">From 50 users</td>
                      <td className="p-3">17 EUR per month per user</td>
                    </tr>
                    <tr>
                      <td className="p-3 border-r"></td>
                      <td className="p-3 border-r">From 100 users</td>
                      <td className="p-3">14 EUR per month per user</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Article 2 */}
              <h3 className="text-xl font-semibold mt-8 mb-3 underline">
                Article 2 - Method of concluding the Agreement
              </h3>
              
              <p className="mb-4">
                The Agreement is concluded by its acceptance by the Customer during the online checkout process, whereby one or more of the Solutions are purchased via its Platform.
              </p>
              
              <p className="mb-6">
                This Agreement and its Annexes will be delivered to the Customer prior to the completion of the order.
              </p>

              {/* List of Appendices */}
              <h3 className="text-xl font-semibold mt-8 mb-3 underline">
                List of Appendices:
              </h3>
              
              <div className="ml-6 mb-8">
                <p>1. General Terms and Conditions</p>
              </div>

              {/* APPENDIX 1 */}
              <div className="border-t-2 border-gray-300 pt-8 mt-12">
                <h2 className="text-2xl font-bold text-center mb-8">
                  APPENDIX 1 – GENERAL TERMS AND CONDITIONS
                </h2>

                {/* Definitions */}
                <h3 className="text-lg font-semibold mt-8 mb-4 underline">
                  1. Definitions
                </h3>
                
                <p className="mb-4">
                  In the Agreement, the following words, when used with a capital letter, shall have the following meanings:
                </p>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full border border-gray-300 text-sm">
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3 border-r font-semibold bg-gray-50 w-1/4">Appendix</td>
                        <td className="p-3">The appendices to this Agreement, which form an integral part of the Agreement.</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 border-r font-semibold bg-gray-50">Services</td>
                        <td className="p-3">The provision of access to the Software via the Platform, as well as the provision of related services, as further described in this Agreement and on the Platform.</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 border-r font-semibold bg-gray-50">Feedback</td>
                        <td className="p-3">All feedback, comments, suggestions, or materials (including, to the extent disclosed to FINIT SOLUTIONS, all modifications made by the Customer) that the Customer may provide to FINIT SOLUTIONS about or in connection with the Software and/or Services, including all ideas, concepts, know-how, or techniques contained therein.</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 border-r font-semibold bg-gray-50">Users</td>
                        <td className="p-3">The Customer's employees who are authorized by the Customer to access the Software.</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 border-r font-semibold bg-gray-50">Intellectual property rights or IP</td>
                        <td className="p-3">All brands, logos, trademarks, service marks, internet domain names, models and designs, patents, copyrights (including all rights relating to software) and moral rights, protection of Confidential Information, rights relating to databases, know-how and other rights, as well as all other industrial and intellectual rights, whether registered or not, including those for which a registration application has been filed, as well as all equivalent rights or means of protection that lead to a similar result anywhere in the world.</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 border-r font-semibold bg-gray-50">Agreement</td>
                        <td className="p-3">This software as a service agreement, including the Appendices, which are deemed to form an integral part of this Agreement.</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 border-r font-semibold bg-gray-50">Force Majeure</td>
                        <td className="p-3">Any delay or failure by a Party to fulfill its obligations under this Agreement that is beyond the reasonable control of that Party and that cannot reasonably be avoided, foreseen, or circumvented by that Party through the use of reasonable effort, including but not limited to delays or failures-performance resulting from acts of the Belgian or European public authorities, fire, flood, earthquake, epidemic, pandemic (including COVID-19, its variants, and any government decisions related thereto) or any other health condition that has a major international impact on the economy and/or daily life, quarantine restrictions and/or travel bans, terrorism or war (whether declared or not), cargo embargo, export restrictions, natural disasters, sabotage, expropriations, riots, civil unrest, energy shortages, explosions, defective equipment, failure of installations or materials due to fire, absence of social peace and strikes, failure of public utilities or suppliers.</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 border-r font-semibold bg-gray-50">Software</td>
                        <td className="p-3">The "software as a service" solution provided by FINIT SOLUTIONS as set out in the Agreement.</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 border-r font-semibold bg-gray-50">Confidential Information</td>
                        <td className="p-3">Certain technical, economic, commercial, financial, and/or any other information disclosed by FINIT SOLUTIONS to the Customer under this Agreement and designated as "confidential" or with a similar term. Confidential Information also includes the existence and provisions of the Agreement.</td>
                      </tr>
                      <tr>
                        <td className="p-3 border-r font-semibold bg-gray-50">VoiceLink or Platform</td>
                        <td className="p-3">The SaaS platform offered by FINIT SOLUTIONS, accessible via <a href="https://voicelink.me" className="text-blue-600 hover:underline">https://voicelink.me</a>. In this Agreement, the terms "Platform," "Finit Platform," and "VoiceLink" are used interchangeably and always refer to the same platform. Access is activated by the Customer via the chosen CRM authentication (e.g. Odoo, Teamleader, Pipedrive, etc.). In principle, FINIT SOLUTIONS does not issue separate login details; authentication is carried out via the CRM provider (single sign-on/OAuth), unless expressly agreed otherwise.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Continue with remaining articles... */}
                <h3 className="text-lg font-semibold mt-8 mb-4 underline">
                  2. Conditions and restrictions on the right of access
                </h3>
                
                <div className="space-y-4">
                  <p>
                    <strong>A.</strong> During the term of the Agreement, FINIT SOLUTIONS grants the Customer, and the Users designated by the Customer for whom an account has been created on the Platform, a non-transferable, non-exclusive, non-sublicensable, revocable, and limited right of access to the Software and Services via the Website. The right of use is expressly limited to the use of the Software and Services for the Customer's independent and internal use. FINIT SOLUTIONS grants the Customer a right of use of the Software only. All rights of FINIT SOLUTIONS not expressly granted under this Agreement remain with FINIT SOLUTIONS. In the event of a breach of this Article 2.1, the Customer shall pay FINIT SOLUTIONS a fixed compensation equal to twenty-five thousand (25,000) EUR per third party (who is not an end customer) for whom the Customer uses the Software and Services, without prejudice to FINIT SOLUTIONS' right to claim compensation for actual damage.
                  </p>
                  
                  <p>
                    <strong>B.</strong> The Customer acknowledges and accepts that the Agreement is a service agreement and that FINIT SOLUTIONS will not provide copies of the Software to the Customer and/or the Users as part of the Services.
                  </p>
                  
                  <p>
                    <strong>C.</strong> The Customer acknowledges and accepts that the Software and Services only contain the functionality and other features that the Customer finds at the time of delivery of access to the Software and Services ("as is"). The Customer remains responsible and liable at all times for the content of the data and information entered via VoiceLink (including voice messages and customer data). FINIT SOLUTIONS acts solely as a processing and transmission channel and does not keep this data on a structural basis: the data is forwarded directly to the Customer's CRM. The Customer cannot hold FINIT SOLUTIONS liable in any way for the content, accuracy, or completeness of this data.
                  </p>
                </div>

                {/* Additional sections would continue here... */}
                <div className="mt-12 p-6 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This is a comprehensive legal agreement. For the complete terms and conditions, including all articles covering liability, intellectual property, termination, and other important provisions, please contact FINIT SOLUTIONS directly or consult the full legal document.
                  </p>
                </div>

                {/* Article 3 */}
                <h3 className="text-lg font-semibold mt-8 mb-4 underline">
                  3. Conditions and restrictions on the right of access
                </h3>
                
                <div className="space-y-4">
                  <p>
                    <strong>A.</strong> Upon explicit acceptance of this Agreement, FINIT SOLUTIONS will grant the Customer and Users access to the Platform, where the Software and Services are made available under the terms and conditions set out in this Agreement.
                  </p>
                  
                  <p>
                    <strong>B.</strong> The Customer undertakes to:
                  </p>
                  
                  <div className="ml-6 space-y-3">
                    <p>
                      <strong>i.</strong> use the Software and Services and/or allow them to be used by the Users solely for the Customer's independent internal use, with the sole purpose of optimizing the Customer\'s business processes;
                    </p>
                    
                    <p>
                      <strong>ii.</strong> ensure that the Users comply fully with the provisions of this Agreement insofar as relevant;
                    </p>
                    
                    <p>
                      <strong>iii.</strong> keep the access data to the Platform, including CRM authentication (tokens, API keys, or single sign-on data), strictly personal and not disclose it, as well as ensure that Users keep their access data strictly personal and do not disclose it;
                    </p>
                    
                    <p>
                      <strong>iv.</strong> not to make any modifications or changes to the Software and not to create any derivative works based on the Software;
                    </p>
                    
                    <p>
                      <strong>v.</strong> not to copy, resell, license, lend, or otherwise commercialize any part of the Software and Services without the prior explicit and written consent of FINIT SOLUTIONS;
                    </p>
                    
                    <p>
                      <strong>vi.</strong> not to attempt to gain unauthorized access to any part of the Software or the systems and/or networks of FINIT SOLUTIONS;
                    </p>
                    
                    <p>
                      <strong>vii.</strong> not reverse engineer, decompile, decode, disassemble, or derive any source code from the Software;
                    </p>
                    
                    <p>
                      <strong>viii.</strong> not use scripts, bots, spiders, or other automated mechanisms to collect information or otherwise interact with the Software without the prior written consent of FINIT SOLUTIONS;
                    </p>
                    
                    <p>
                      <strong>ix.</strong> not interfere with or damage any part of the Software, including, without limitation, through the use of poorly secured systems, viruses, bots, Trojan horses, malicious code, flood pings, (distributed) denial-of-service attacks, packet or IP spoofing, falsified routing or electronic mail address information, or similar methods or technology;
                    </p>
                    
                    <p>
                      <strong>x.</strong> not to remove, modify, or obscure any trademarks or other indications of Intellectual Property Rights in the Software;
                    </p>
                    
                    <p>
                      <strong>xi.</strong> to use the Software and Services only in a manner that complies with all applicable laws, regulations, rules, and codes;
                    </p>
                    
                    <p>
                      <strong>xii.</strong> not to use the Software and Services in any manner that could damage the name, reputation, or rights of FINIT SOLUTIONS;
                    </p>
                    
                    <p>
                      <strong>xiii.</strong> not to use the Software and Services to interfere with other customers of FINIT SOLUTIONS or other internet users or to cause damage to the systems or networks of FINIT SOLUTIONS or its customers;
                    </p>
                    
                    <p>
                      <strong>xiv.</strong> to impose obligations and conditions at least equivalent to those set out in this Article 3.B on the Users.
                    </p>
                  </div>
                  
                  <p>
                    <strong>C.</strong> The Customer shall indemnify and hold FINIT SOLUTIONS harmless for any breaches caused by itself or the Users of the provisions of Article 3.B, which are considered essential terms of this Agreement, or for any other breach of this Agreement.
                  </p>
                </div>

                {/* Contact Information */}
                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Contact Information</h4>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}