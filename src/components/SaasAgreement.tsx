/* eslint-disable react/no-unescaped-entities */
import { ChevronRight } from "lucide-react";

export default function SaasAgreementPage() {
  return (
    <main className="pt-20">
      <section className="relative py-16 md:py-24 bg-background">
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Badge */}
            <p className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-600 mb-6">
              <span>Software as a Service Agreement</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </p>

            {/* Title */}
            <h1 className="text-4xl font-bold mb-2">
              SOFTWARE AS A SERVICE AGREEMENT
            </h1>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {/* BETWEEN */}
              <h2 className="text-2xl font-semibold mt-8 mb-4" id="between">
                BETWEEN:
              </h2>
              <p>
                FINIT SOLUTIONS, located at Guldensporenlaan 9, 3120 Tremelo and registered in the Crossroads Bank for Enterprises under number 1020.600.643 (RPR Leuven);
              </p>
              <p>
                Hereinafter referred to as "FINIT SOLUTIONS";
              </p>
              <h3 className="text-xl font-semibold mt-8 mb-3">AND:</h3>
              <p>
                 The "Customer";
              </p>
              <p>
                Hereinafter also referred to individually as "Party" or jointly as "Parties".
              </p>

              {/* CONSIDERING THAT */}
              <h2 className="text-2xl font-semibold mt-8 mb-4" id="considering">
                CONSIDERING THAT:
              </h2>
              <p>
                FINIT SOLUTIONS has developed a "software as a service" solution that uses artificial intelligence to convert spoken input into CRM data and implement it in the CRM system used by the Customer. Called: "VoiceLink";
              </p>
              <p>
                FINIT SOLUTIONS has developed a "software as a service" solution that uses artificial intelligence to structure and categorize all files on the Customer's drive. Called: "FilePilot" 
              </p>
              <p>
                The Customer wishes to use at least one of FINIT SOLUTIONS' "software as a service" solutions (hereinafter also referred to as "Solutions") in the context of its commercial activities;
              </p>
              <p>
                FINIT SOLUTIONS wishes to make its Solutions available to the Customer in accordance with the terms and conditions set out in this "software as a service agreement" (hereinafter the "Agreement").
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4" id="agree">
                THE PARTIES AGREE AS FOLLOWS:
              </h2>

              {/* Article 1 */}
              <h3 className="text-xl font-semibold mt-8 mb-3" id="article-1">
                Article 1 	Monthly fee
              </h3>
              <p>
                The monthly fee charged to the Customer for the Software and Services consists of:
              </p>

              {/* Pricing list as table rendering, preserving exact strings */}
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm border border-border">
                  <tbody>
                    <tr className="border-t">
                      <td className="p-3 align-top">VoiceLink</td>
                      <td className="p-3 align-top"></td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 align-top">From 1 user</td>
                      <td className="p-3 align-top">29 EUR per month per user</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 align-top"></td>
                      <td className="p-3 align-top"></td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 align-top">From 5 users</td>
                      <td className="p-3 align-top">25 EUR per month per user</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 align-top"></td>
                      <td className="p-3 align-top"></td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 align-top">From 10 users</td>
                      <td className="p-3 align-top">22 EUR per month per user</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 align-top"></td>
                      <td className="p-3 align-top"></td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 align-top">From 25 users</td>
                      <td className="p-3 align-top">19 EUR per month per user</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 align-top"></td>
                      <td className="p-3 align-top"></td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 align-top">From 50 users</td>
                      <td className="p-3 align-top">17 EUR per month per user</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 align-top"></td>
                      <td className="p-3 align-top"></td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 align-top">From 100 users</td>
                      <td className="p-3 align-top">14 EUR per month per user</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Article 2 */}
              <h3 className="text-xl font-semibold mt-8 mb-3" id="article-2">
                Article 2 	Method of concluding the Agreement
              </h3>
              <p>
                The Agreement is concluded by its acceptance by the Customer during the online checkout process, whereby one or more of the Solutions are purchased via its Platform. 
              </p>
              <p>
                This Agreement and its Annexes will be delivered to the Customer prior to the completion of the order. 
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
