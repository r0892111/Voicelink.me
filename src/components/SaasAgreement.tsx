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

                {/* Article 4 */}
                <h3 className="text-lg font-semibold mt-8 mb-4 underline">
                  4. Compensation
                </h3>
                
                <div className="space-y-4">
                  <p>
                    The Customer shall pay a monthly fee, consisting of a fixed price per Solution, per User for the Services and the Software. The effective monthly fee owed by the Customer to FINIT SOLUTIONS shall be determined at the end of each month based on the actual formula (i.e., the effective applicable fixed fee, the number of users, and the Solutions) purchased by the Customer in the previous month. If FINIT SOLUTIONS determines that certain actions or behaviors are being taken that circumvent or attempt to circumvent the calculation of the monthly fee, FINIT SOLUTIONS has the right to charge the Customer a higher fee, after prior written notification to the Customer.
                  </p>
                  
                  <p>
                    FINIT SOLUTIONS' invoices are payable immediately and are processed exclusively via the Stripe payment platform. The Customer may use the payment methods supported by Stripe for this purpose. Payment constitutes an essential obligation under this Agreement.
                  </p>
                  
                  <p>
                    If an automatic payment via Stripe fails, access to the Software and Services will be automatically suspended until the payment has been successfully completed. In that case, FINIT SOLUTIONS is not obliged to continue providing the Services.
                  </p>
                  
                  <p>
                    Without limiting its other rights or remedies, FINIT SOLUTIONS has the right to suspend or terminate access to the Software and Services in whole or in part in the event that the Customer pays any invoice late, without the Customer being able to claim compensation from FINIT SOLUTIONS for any interruption in availability.
                  </p>
                  
                  <p>
                    The amount of the monthly fee is inclusive of VAT. The Customer is responsible for the payment of all other taxes and/or costs relating to the Software and the Services, including, but not limited to, hardware costs and internet connection costs.
                  </p>
                  
                  <p>
                    The prices stated in this Agreement may be adjusted by FINIT SOLUTIONS at any time if necessary to compensate for an increase in its own costs. FINIT SOLUTIONS shall notify the Customer of the price change at least one (1) month before the date on which the new prices take effect. If the Customer does not agree with the intended price change, it may notify FINIT SOLUTIONS thereof within a period of seven (7) days after receipt of the notification of the price change. If the Parties fail to reach agreement on the price change, the Customer is entitled to terminate the Agreement with due observance of Article 6 of this Agreement.
                  </p>
                {/* Article 5 */}
                <h3 className="text-lg font-semibold mt-8 mb-4 underline">
                  5. Developments and integrations
                </h3>
                
                <div className="space-y-4">
                  <p>
                    Unless otherwise agreed in writing between the Parties, the Customer agrees and accepts that FINIT SOLUTIONS has no obligation to upgrade or update the Software, or to provide any or specific information relating to the Software. FINIT SOLUTIONS and/or the owners of any Information may remove such Information from time to time without prior notice, to the extent permitted by applicable law.
                  </p>
                  
                  <p>
                    The Customer will receive all updates, upgrades, and new functionalities of the Software free of charge, unless FINIT SOLUTIONS releases the new functionalities as a separate module. FINIT SOLUTIONS reserves the right to modify the functionalities of the Software and Services at any time in order to improve the quality and/or user experience of the Software and Services.
                  </p>
                  
                  <p>
                    The Customer may also subscribe to the FINIT SOLUTIONS mailing list without obligation to receive a newsletter informing them of updates and changes to the Software and Services. This communication is optional and does not form an essential part of the service provision.
                  </p>
                  
                  <p>
                    If FINIT SOLUTIONS integrates certain functionalities into the Software that have been produced by another supplier (so-called "software integrations"), FINIT SOLUTIONS does not provide any guarantees to the Customer other than those provided by that supplier.
                  </p>
                </div>
                </div>
                {/* Article 6 */}
                <h3 className="text-lg font-semibold mt-8 mb-4 underline">
                  6. Duration and termination
                </h3>
                
                <div className="space-y-4">
                  <p>
                    This Agreement shall enter into force on the date of its acceptance and shall be valid for an initial term of one (1) month. Unless the Agreement is terminated by one of the Parties by written notice to the other Party no later than the month preceding the month in which termination is intended, it shall be tacitly renewed for successive periods of one (1) year.
                  </p>
                  
                  <p>
                    Either Party may terminate this Agreement without liability and with immediate effect by giving written notice to the other Party if that Party:
                  </p>
                  
                  <div className="ml-6 space-y-3">
                    <p>
                      <strong>a)</strong> breaches a material provision of the Agreement and the breach is not:
                    </p>
                    <div className="ml-6 space-y-2">
                      <p>
                        <strong>i.</strong> cured within thirty (30) calendar days after receipt of a notice from the first Party requesting it to remedy the breach; or
                      </p>
                      <p>
                        <strong>ii.</strong> can be remedied;
                      </p>
                    </div>
                    
                    <p>
                      <strong>b)</strong> becomes insolvent or bankrupt, is placed under administration or guardianship, initiates liquidation proceedings, enters into a voluntary arrangement with its creditors, or in the event of a similar occurrence under the law of its place of residence; or
                    </p>
                    
                    <p>
                      <strong>c)</strong> is unable to perform a material obligation under the Agreement for three (3) months or longer as a result of Force Majeure.
                    </p>
                  </div>
                  
                  <p>
                    Upon termination of the Agreement for any reason:
                  </p>
                  
                  <div className="ml-6 space-y-2">
                    <p>
                      <strong>•</strong> The Customer and Users shall immediately cease using the Software and Services;
                    </p>
                    <p>
                      <strong>•</strong> All outstanding amounts shall become immediately due and payable to FINIT SOLUTIONS.
                    </p>
                  </div>
                  
                  <p>
                    Since VoiceLink acts solely as a processing and transmission channel and does not structurally store any data, the platform does not provide a separate export functionality. All data processed via VoiceLink is stored directly in the Customer's CRM. It is the sole responsibility of the Customer to ensure that, at the end of the Agreement, the data is stored and/or exported in its own CRM. FINIT SOLUTIONS is not liable for any loss of data after termination of the Agreement.
                  </p>
                  
                  <p>
                    Provisions which, by their nature, are intended to continue even after the termination or dissolution of the Agreement shall remain in force after the termination or dissolution of the Agreement.
                  </p>
                </div>

                {/* Article 7 */}
                <h3 className="text-lg font-semibold mt-8 mb-4 underline">
                  7. Liability
                </h3>
                
                <div className="space-y-4">
                  <p>
                    FINIT SOLUTIONS will perform the Agreement in accordance with applicable Belgian regulations and current industry standards. FINIT SOLUTIONS' obligations under the Agreement are best efforts obligations and not result obligations, unless otherwise agreed in writing between the Parties.
                  </p>
                  
                  <p>
                    FINIT SOLUTIONS shall endeavor to ensure the availability of the Software and the Services, but in no event guarantees uninterrupted availability of the Software and the Services. FINIT SOLUTIONS shall strive for 99% availability of the Software and the Services ("uptime"). The Software and Services will not be available in the event of (i) maintenance of the Software, (ii) development of the Software, and (iii) Force Majeure as further defined in Article 11 of the Agreement, in which case the Customer will be notified of such unavailability in a timely manner. In the event of maintenance or development of the Software, the Customer will be notified at least seven (7) days in advance of the unavailability. The Customer cannot hold FINIT SOLUTIONS liable for the unavailability of the Software or the Services, except in the event of intent or gross negligence on the part of FINIT SOLUTIONS or its appointees.
                  </p>
                  
                  <p>
                    Unless expressly agreed otherwise in this Agreement, FINIT SOLUTIONS makes no express or implied warranties with respect to the Software and the Services, including, without limitation, any warranty of fitness for a particular purpose, availability, or error-free, virus-free, and/or uninterrupted operation of the Software or the Services.
                  </p>
                  
                  <p>
                    FINIT SOLUTIONS cannot be held liable for indirect or consequential damages, including but not limited to loss of profits, loss of goodwill, any damage resulting from or caused by the loss, interruption or damage of data, loss of income, loss of turnover, damage to reputation, loss of opportunities, business interruptions or loss of expected savings.
                  </p>
                  
                  <p>
                    To the extent permitted by law, FINIT SOLUTIONS' liability is limited to (i) a maximum of the monthly fee actually paid by the Customer to FINIT SOLUTIONS during the six (6) months prior to the event causing the damage, or (ii) a maximum amount of twenty-five thousand (25,000) EUR, whichever is lower. This limitation of liability applies regardless of whether the act or omission is attributable to FINIT SOLUTIONS itself or to its employees or subcontractors and applies regardless of the applicable liability regime, including, but not limited to, contractual liability, liability in tort, criminal liability, or strict liability.
                  </p>
                  
                  <p>
                    FINIT SOLUTIONS' liability under this Agreement may only be invoked if FINIT SOLUTIONS is notified in writing by the Customer of the damage as soon as reasonably possible, and in any case no later than thirty (30) days after the alleged damage occurred. Such notification does not affect the Customer's obligation to take all reasonable measures to limit the damage suffered as much as possible.
                  </p>
                  
                  <p>
                    FINIT SOLUTIONS's agents shall not be liable under this Agreement, and any claim for breach of the Agreement by FINIT SOLUTIONS or its agents shall be brought directly against FINIT SOLUTIONS.
                  </p>
                </div>
                {/* Article 8 */}
                <h3 className="text-lg font-semibold mt-8 mb-4 underline">
                  8. Confidential Information
                </h3>
                
                <div className="space-y-4">
                  <p>
                    The Parties undertake to treat the Confidential Information of the other Party as confidential and to protect it with measures that they apply to their own confidential information, but in no case with less protection than commercially reasonable measures. Neither Party shall disclose the Confidential Information it has obtained in the context of the performance of this Agreement to third parties (except for its employees, independent service providers, (legal) advisors, and directors) without the prior written consent of the other Party. Both Parties undertake to limit access to the other Party's Confidential Information to those persons who reasonably need to have access to the other Party's Confidential Information and also undertake to take the necessary steps to ensure that those persons undertake not to disclose the other Party's Confidential Information to third parties.
                  </p>
                  
                  <p>
                    However, the foregoing confidentiality obligation shall not apply to information:
                  </p>
                  
                  <div className="ml-6 space-y-3">
                    <p>
                      <strong>a)</strong> that was in the public domain before it was transferred to a Party, or after such transfer, without negligence or fault on its part; or
                    </p>
                    
                    <p>
                      <strong>b)</strong> which was lawfully received from a third party without any restriction, in the absence of any breach of this Agreement; or
                    </p>
                    
                    <p>
                      <strong>c)</strong> that was independently and in good faith developed by a Party's employees who did not have access to the aforementioned Confidential Information; or
                    </p>
                    
                    <p>
                      <strong>d)</strong> that must be disclosed to comply with mandatory legal requirements, a court or official order or decree, provided that timely written prior notice of such legal action is given to the disclosing Party (unless prohibited by law) to enable the disclosing Party to seek appropriate legal remedy. If no appropriate legal remedy is available before or on the date the receiving Party is required to comply with the request, the disclosing Party shall be entitled to disclose that portion of the Confidential Information that it determines it is legally required to disclose.
                    </p>
                  </div>
                  
                  <p>
                    The receiving Party may not disclose Confidential Information consisting of a combination of information solely because one or more elements of the information fall under the above exceptions, if the combination itself does not.
                  </p>
                  
                  <p>
                    The obligations set forth in this article of the Agreement shall remain in effect throughout the term of this Agreement and for a period of five (5) years after its termination.
                  </p>
                </div>

                {/* Article 9 */}
                <h3 className="text-lg font-semibold mt-8 mb-4 underline">
                  9. Intellectual Property Rights
                </h3>
                
                <div className="space-y-4">
                  <p>
                    All IP owned by a Party prior to the entry into force of this Agreement or created by a Party outside the scope of this Agreement (without using Confidential Information) shall remain the property of that Party. Neither Party shall be entitled to use the other Party's IP without permission. All IP relating to the Software and Services shall remain the exclusive property of FINIT SOLUTIONS and/or its licensors and shall not be transferred to the Customer and/or Users. The Customer and/or Users may not derive any rights from the Software and Services other than those expressly granted in this Agreement.
                  </p>
                  
                  <p>
                    All IP developed or otherwise created in the context of the Agreement shall be the exclusive property of FINIT SOLUTIONS from the moment of its creation. At the request of FINIT SOLUTIONS, the Customer shall, without additional compensation, assist FINIT SOLUTIONS with all appropriate and legal means to obtain, maintain, protect, and enforce its IP, including executing and issuing all instruments or affidavits that FINIT SOLUTIONS deems necessary to obtain, maintain, protect, and enforce such rights.
                  </p>
                  
                  <p>
                    The Customer hereby grants FINIT SOLUTIONS a worldwide, royalty-free, non-exclusive, perpetual, and irrevocable license to use, copy, modify, or otherwise exploit the Feedback for any purpose, including incorporating or implementing the Feedback into the Software and/or Services. The Customer agrees that FINIT SOLUTIONS may exploit all Feedback without any restriction or obligation due to intellectual, industrial or other (property) rights or otherwise. For the avoidance of doubt, Feedback shall not be considered Confidential Information of the Customer, and nothing in this Agreement shall limit FINIT SOLUTIONS' right to independently use, develop, evaluate or market products and services, whether or not the Feedback is incorporated therein or otherwise.
                  </p>
                </div>

                {/* Contact Information */}
                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}