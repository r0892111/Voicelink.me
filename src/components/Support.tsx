import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, Send, MessageCircle, ChevronDown, Clock, FileText, HelpCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../hooks/useI18n';
import { withUTM } from '../utils/utm';
import { usePageTransition } from '../hooks/usePageTransition';

interface SupportProps {
  openContactModal: () => void;
}

const Support: React.FC<SupportProps> = ({ openContactModal }) => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { navigateWithTransition } = usePageTransition();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqKeys = [
    'supportPage.faq.setup',
    'supportPage.faq.whatsapp',
    'supportPage.faq.crm',
    'supportPage.faq.languages',
    'supportPage.faq.billing',
    'supportPage.faq.data',
  ];

  return (
    <div className="min-h-screen bg-porcelain relative font-instrument">

      {/* ───────── HERO ───────── */}
      <section className="pt-28 pb-10 md:pt-32 md:pb-14">
        <div className="max-w-5xl mx-auto px-6">
          <button
            onClick={() => navigate(withUTM('/'))}
            className="group flex items-center gap-2 text-navy/50 hover:text-navy text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            {t('navigation.backToHome')}
          </button>

          <div className="max-w-2xl">
            <h1 className="font-general text-4xl sm:text-5xl md:text-6xl font-bold text-navy leading-[1.1] mb-5">
              {t('supportPage.hero.title')}
            </h1>
            <p className="text-lg md:text-xl font-instrument text-navy/55 leading-relaxed">
              {t('supportPage.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* ───────── CONTACT CARDS ───────── */}
      <section className="pb-16 md:pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-5">

            {/* Email Card */}
            <a
              href="mailto:contact@finitsolutions.be"
              className="group bg-white rounded-2xl p-7 md:p-8 border border-navy/[0.06] hover:border-navy/15 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center mb-5">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-general text-xl font-bold text-navy mb-2">
                {t('supportPage.contact.email.title')}
              </h3>
              <p className="text-navy/50 text-sm leading-relaxed mb-4">
                {t('supportPage.contact.email.description')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-navy font-semibold text-sm">
                  contact@finitsolutions.be
                </span>
                <ArrowRight className="w-4 h-4 text-navy/30 group-hover:text-navy group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="flex items-center gap-2 mt-3 text-navy/40 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>{t('supportPage.contact.email.response')}</span>
              </div>
            </a>

            {/* Phone Card */}
            <a
              href="tel:+32495702314"
              className="group bg-white rounded-2xl p-7 md:p-8 border border-navy/[0.06] hover:border-navy/15 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center mb-5">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-general text-xl font-bold text-navy mb-2">
                {t('supportPage.contact.phone.title')}
              </h3>
              <p className="text-navy/50 text-sm leading-relaxed mb-4">
                {t('supportPage.contact.phone.description')}
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-navy font-semibold text-sm">+32 495 70 23 14</span>
                  <ArrowRight className="w-4 h-4 text-navy/30 group-hover:text-navy group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="text-navy/60 text-sm block">+32 468 02 99 45</span>
              </div>
              <div className="flex items-center gap-2 mt-3 text-navy/40 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>{t('supportPage.contact.phone.hours')}</span>
              </div>
            </a>

            {/* Contact Form Card */}
            <button
              onClick={openContactModal}
              className="group bg-white rounded-2xl p-7 md:p-8 border border-navy/[0.06] hover:border-navy/15 hover:shadow-lg transition-all duration-300 text-left"
            >
              <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center mb-5">
                <Send className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-general text-xl font-bold text-navy mb-2">
                {t('supportPage.contact.form.title')}
              </h3>
              <p className="text-navy/50 text-sm leading-relaxed mb-4">
                {t('supportPage.contact.form.description')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-navy font-semibold text-sm">
                  {t('supportPage.contact.form.cta')}
                </span>
                <ArrowRight className="w-4 h-4 text-navy/30 group-hover:text-navy group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>

          </div>
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section className="pb-14 md:pb-18">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-navy/[0.06] rounded-xl flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-navy/60" />
              </div>
              <h2 className="font-general text-2xl md:text-3xl font-bold text-navy">
                {t('supportPage.faq.title')}
              </h2>
            </div>

            <div className="space-y-3">
              {faqKeys.map((key, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-navy/[0.06] overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left group"
                  >
                    <span className="font-general font-semibold text-navy text-[15px] md:text-base pr-4 leading-snug">
                      {t(`${key}.q`)}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-navy/30 flex-shrink-0 transition-transform duration-200 ${
                        openFaq === index ? 'rotate-180 text-navy/60' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="px-5 md:px-6 pb-5 md:pb-6 text-navy/55 text-sm leading-relaxed -mt-1">
                      {t(`${key}.a`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── RESOURCES ───────── */}
      <section className="pb-14 md:pb-18">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <div className="bg-white rounded-2xl p-6 border border-navy/[0.06]">
              <div className="w-10 h-10 bg-navy/[0.06] rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-5 h-5 text-navy/60" />
              </div>
              <h3 className="font-general font-bold text-navy text-base mb-1.5">
                {t('supportPage.resources.privacy.title')}
              </h3>
              <p className="text-navy/45 text-sm mb-4 leading-relaxed">
                {t('supportPage.resources.privacy.description')}
              </p>
              <button
                onClick={() => navigate(withUTM('/privacy-policy'))}
                className="text-navy font-semibold text-sm hover:text-navy-hover transition-colors flex items-center gap-1.5"
              >
                {t('supportPage.resources.readMore')}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-navy/[0.06]">
              <div className="w-10 h-10 bg-navy/[0.06] rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-5 h-5 text-navy/60" />
              </div>
              <h3 className="font-general font-bold text-navy text-base mb-1.5">
                {t('supportPage.resources.saas.title')}
              </h3>
              <p className="text-navy/45 text-sm mb-4 leading-relaxed">
                {t('supportPage.resources.saas.description')}
              </p>
              <button
                onClick={() => navigate(withUTM('/saas-agreement'))}
                className="text-navy font-semibold text-sm hover:text-navy-hover transition-colors flex items-center gap-1.5"
              >
                {t('supportPage.resources.readMore')}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-navy/[0.06]">
              <div className="w-10 h-10 bg-navy/[0.06] rounded-xl flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5 text-navy/60" />
              </div>
              <h3 className="font-general font-bold text-navy text-base mb-1.5">
                {t('supportPage.resources.whatsapp.title')}
              </h3>
              <p className="text-navy/45 text-sm mb-4 leading-relaxed">
                {t('supportPage.resources.whatsapp.description')}
              </p>
              <a
                href="https://wa.me/32495702314"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy font-semibold text-sm hover:text-navy-hover transition-colors flex items-center gap-1.5"
              >
                {t('supportPage.resources.whatsapp.cta')}
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ───────── CTA ───────── */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-navy rounded-2xl p-8 md:p-12 text-center">
            <div className="relative z-10">
              <h2 className="font-general text-2xl md:text-3xl font-bold text-white mb-3">
                {t('supportPage.cta.title')}
              </h2>
              <p className="text-white/50 font-instrument text-base md:text-lg mb-7 max-w-lg mx-auto">
                {t('supportPage.cta.subtitle')}
              </p>
              <button
                onClick={() => navigateWithTransition(withUTM('/signup'))}
                className="group bg-white text-navy font-semibold text-sm py-3 px-7 rounded-full hover:bg-white/90 transition-all duration-200 inline-flex items-center gap-2"
              >
                {t('supportPage.cta.button')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Support;
