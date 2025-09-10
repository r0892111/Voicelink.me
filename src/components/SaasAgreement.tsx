/* eslint-disable react/no-unescaped-entities */
"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function SaasAgreementPage() {
  return (
    <main className="pt-20">
      <section className="relative py-16 md:py-24 bg-background">
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Badge */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-6"
            >
              <span>Software as a Service Agreement</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </motion.p>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl font-bold mb-2"
            >
              {/* PASTE EXACT DOCUMENT TITLE HERE (no edits) */}
            </motion.h1>

            {/* Meta line (optional: version/date) */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-muted-foreground mb-8"
            >
              {/* If you want a version/date line, paste it here exactly as-is */}
            </motion.p>

            {/* Body */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="prose prose-lg dark:prose-invert max-w-none"
            >
              {/* ===== Start of Part 1 text (paste verbatim) ===== */}

              {/* Section: BETWEEN */}
              <h2 className="text-2xl font-semibold mt-8 mb-4" id="between">BETWEEN:</h2>
              <p>
                {/* Paste clause 1 exactly as provided (Finit Solutions identification) */}
              </p>
              <p>
                {/* Paste clause 2 exactly as provided (Customer) */}
              </p>

              {/* Section: CONSIDERING THAT */}
              <h2 className="text-2xl font-semibold mt-8 mb-4" id="considering">CONSIDERING THAT:</h2>
              <ol>
                <li>
                  {/* (i) Paste exactly */}
                </li>
                <li>
                  {/* (ii) Paste exactly */}
                </li>
                <li>
                  {/* (iii) Paste exactly */}
                </li>
                <li>
                  {/* (iv) Paste exactly */}
                </li>
              </ol>

              <h2 className="text-2xl font-semibold mt-8 mb-4" id="agreement-open">
                THE PARTIES AGREE AS FOLLOWS:
              </h2>

              {/* Article 1 */}
              <h3 className="text-xl font-semibold mt-8 mb-3" id="article-1">
                Article 1 Monthly fee
              </h3>
              <p>
                {/* Paste the introductory sentence exactly */}
              </p>

              {/* Pricing Table (VoiceLink tiers) */}
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm border border-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left">VoiceLink</th>
                      <th className="p-3 text-left">Users</th>
                      <th className="p-3 text-left">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Replace each row with the exact tier lines you provide */}
                    <tr className="border-t">
                      <td className="p-3 align-top">VoiceLink</td>
                      <td className="p-3 align-top">From 1 user</td>
                      <td className="p-3 align-top">29 EUR per month per user</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 align-top">VoiceLink</td>
                      <td className="p-3 align-top">From 5 users</td>
                      <td className="p-3 align-top">25 EUR per month per user</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 align-top">VoiceLink</td>
                      <td className="p-3 align-top">From 10 users</td>
                      <td className="p-3 align-top">22 EUR per month per user</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 align-top">VoiceLink</td>
                      <td className="p-3 align-top">From 25 users</td>
                      <td className="p-3 align-top">19 EUR per month per user</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 align-top">VoiceLink</td>
                      <td className="p-3 align-top">From 50 users</td>
                      <td className="p-3 align-top">17 EUR per month per user</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3 align-top">VoiceLink</td>
                      <td className="p-3 align-top">From 100 users</td>
                      <td className="p-3 align-top">14 EUR per month per user</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Article 2 */}
              <h3 className="text-xl font-semibold mt-8 mb-3" id="article-2">
                Article 2 Method of concluding the Agreement
              </h3>
              <p>
                {/* Paste the Article 2 paragraph(s) exactly */}
              </p>
              <p>
                {/* Paste the sentence about Agreement & Annexes delivery exactly */}
              </p>

              {/* ===== End of Part 1 text ===== */}
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
