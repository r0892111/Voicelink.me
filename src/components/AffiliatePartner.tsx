import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, CheckCircle, AlertCircle } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { trackCTAClick } from '../utils/analytics';

interface AccordionItem {
  titleKey: string;
  contentKey: string;
}

export const AffiliatePartner: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    companyName: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const accordionItems: AccordionItem[] = [
    { titleKey: 'affiliate.accordion.commission.title', contentKey: 'affiliate.accordion.commission.content' },
    { titleKey: 'affiliate.accordion.attribution.title', contentKey: 'affiliate.accordion.attribution.content' },
    { titleKey: 'affiliate.accordion.roles.title', contentKey: 'affiliate.accordion.roles.content' },
    { titleKey: 'affiliate.accordion.pricing.title', contentKey: 'affiliate.accordion.pricing.content' },
    { titleKey: 'affiliate.accordion.duration.title', contentKey: 'affiliate.accordion.duration.content' },
    { titleKey: 'affiliate.accordion.exclusivity.title', contentKey: 'affiliate.accordion.exclusivity.content' },
    { titleKey: 'affiliate.accordion.gdpr.title', contentKey: 'affiliate.accordion.gdpr.content' },
  ];

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('https://alexfinit.app.n8n.cloud/webhook/f87b677c-d386-4a41-abed-465c7e7742d9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          companyName: formData.companyName,
          description: formData.description || null,
        }),
      });

      if (!response.ok) throw new Error('Submission failed');
      setSubmitStatus('success');
      
      setTimeout(() => {
        setFormData({
          name: '',
          phone: '',
          email: '',
          companyName: '',
          description: ''
        });
        setSubmitStatus('idle');
      }, 2000);
      
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCalendlyClick = () => {
    trackCTAClick('Book Calendly Call - Affiliate', '/affiliate');
    // TODO: Replace [CALENDLY_URL_PLACEHOLDER] with actual Calendly URL (e.g., https://calendly.com/your-team/affiliate-call)
    window.open('https://calendly.com/karel-finitsolutions/kennismaking-finit-solutions', '_blank');
  };

  const handlePartnerCTA = () => {
    trackCTAClick('Become Partner - Affiliate', '/affiliate');
    document.getElementById('affiliate-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-porcelain font-instrument">
      {/* Hero Section */}
      <section className="pt-28 sm:pt-32 lg:pt-36 pb-6 sm:pb-8 px-6 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[2fr_1fr] gap-8 lg:gap-12 items-center">
            {/* Text column */}
            <div className="space-y-5 sm:space-y-7 text-center lg:text-left">
              <h1 className="font-general font-bold text-[2rem] leading-[1.1] sm:text-5xl lg:text-6xl sm:leading-[1.08] text-navy">
                {t('affiliate.hero.title')}
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-blue max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {t('affiliate.hero.subtitle')}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-1 sm:pt-2">
                <button
                  onClick={handlePartnerCTA}
                  className="group text-white font-semibold py-4 px-8 rounded-full bg-navy hover:bg-navy-hover transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center space-x-2"
                >
                  <span>{t('affiliate.hero.cta1')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleCalendlyClick}
                  className="group border-2 border-navy text-navy font-semibold py-4 px-8 rounded-full transition-all duration-300 hover:scale-[1.02] hover:bg-navy/5 flex items-center justify-center space-x-2"
                >
                  <span>{t('affiliate.hero.cta2')}</span>
                </button>
              </div>

              <button
                onClick={() => navigate('/partner/login')}
                className="text-slate-blue hover:text-navy text-sm font-medium underline underline-offset-4 transition-colors"
              >
                {t('affiliate.hero.loginLink')}
              </button>
            </div>

            {/* Phone mockup column — desktop only */}
            <div className="hidden lg:flex justify-center lg:justify-end">
              <img
                src="/whatsapp phone mock.png"
                alt="VoiceLink WhatsApp conversation showing CRM updates from voice notes"
                style={{
                  width: 'auto',
                  height: 'clamp(320px, 46vh, 500px)',
                  transform: 'rotate(5deg)',
                  filter: 'drop-shadow(0 12px 20px rgba(0, 0, 0, 0.22)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))',
                }}
                draggable={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="pt-2 sm:pt-4 pb-8 sm:pb-12 px-6 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center font-general font-bold text-3xl sm:text-4xl md:text-5xl leading-[1.15] text-navy mb-6 sm:mb-8">
            {t('affiliate.howItWorks.title')}
          </h2>

          <div className="grid sm:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className="group relative bg-white rounded-2xl border border-navy/[0.07] shadow-sm p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-navy text-white font-general font-bold text-xl mb-5 shadow-sm">
                  {step}
                </div>
                <h3 className="font-general font-semibold text-navy text-lg mb-2">
                  {t(`affiliate.howItWorks.step${step}.title`)}
                </h3>
                <p className="text-slate-blue text-[15px] leading-relaxed">
                  {t(`affiliate.howItWorks.step${step}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Partner */}
      <section className="py-8 sm:py-10 px-6 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center font-general font-bold text-3xl sm:text-4xl md:text-5xl leading-[1.15] text-navy mb-6 sm:mb-8">
            {t('affiliate.whyPartner.title')}
          </h2>

          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="group bg-white rounded-2xl p-6 sm:p-8 border border-navy/[0.07] shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-navy/[0.06] flex items-center justify-center mb-5 transition-colors duration-300 group-hover:bg-navy/10">
                  <CheckCircle className="w-6 h-6 text-navy" strokeWidth={1.75} />
                </div>
                <h3 className="font-general font-semibold text-navy text-lg mb-2">
                  {t(`affiliate.whyPartner.point${item}.title`)}
                </h3>
                <p className="text-slate-blue text-[15px] leading-relaxed">
                  {t(`affiliate.whyPartner.point${item}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Details Accordion */}
      <section className="py-8 sm:py-10 px-6 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center font-general font-bold text-3xl sm:text-4xl md:text-5xl leading-[1.15] text-navy mb-3 sm:mb-4">
            {t('affiliate.accordion.title')}
          </h2>
          <p className="text-center text-slate-blue text-sm sm:text-base mb-6 sm:mb-8 max-w-2xl mx-auto">
            {t('affiliate.accordion.subtitle')}
          </p>

          <div className="space-y-3">
            {accordionItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-navy/[0.07] shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                  className="w-full flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 text-left gap-4 hover:bg-navy/[0.015] transition-colors duration-150"
                >
                  <h3 className="font-instrument font-semibold text-[15px] sm:text-base text-navy leading-snug pr-2">
                    {t(item.titleKey)}
                  </h3>
                  <ChevronDown
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-navy/40 flex-shrink-0 transition-transform duration-300 ${
                      activeAccordion === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    activeAccordion === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden min-h-0">
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1 font-instrument text-[14px] sm:text-[15px] text-slate-blue leading-relaxed whitespace-pre-wrap">
                      {t(item.contentKey)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conversion Section */}
      <section className="py-8 sm:py-10 px-6 sm:px-8" id="affiliate-form-section">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center font-general font-bold text-3xl sm:text-4xl md:text-5xl leading-[1.15] text-navy mb-3 sm:mb-4">
            {t('affiliate.conversion.title')}
          </h2>
          <p className="text-center text-slate-blue text-sm sm:text-base mb-7 sm:mb-9 max-w-2xl mx-auto">
            {t('affiliate.conversion.subtitle')}
          </p>

          <div className="grid md:grid-cols-2 gap-5 sm:gap-6 items-start">
            {/* Form Column */}
            <div className="bg-white rounded-2xl border border-navy/[0.07] shadow-sm p-6 sm:p-8">
              <h3 className="font-general font-semibold text-lg sm:text-xl text-navy mb-5 sm:mb-6">
                {t('affiliate.conversion.form.title')}
              </h3>

              <form onSubmit={handleFormSubmit} className="space-y-5">
                {submitStatus === 'success' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-700 font-instrument text-sm">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{t('affiliate.conversion.form.success')}</span>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-600 font-instrument text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{t('affiliate.conversion.form.error')}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-navy/70 mb-2">
                    {t('affiliate.conversion.form.name')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2.5 border border-navy/15 rounded-full bg-white text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-navy/70 mb-2">
                    {t('affiliate.conversion.form.phone')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2.5 border border-navy/15 rounded-full bg-white text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-navy/70 mb-2">
                    {t('affiliate.conversion.form.email')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2.5 border border-navy/15 rounded-full bg-white text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-navy/70 mb-2">
                    {t('affiliate.conversion.form.company')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2.5 border border-navy/15 rounded-full bg-white text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-navy/70 mb-2">
                    {t('affiliate.conversion.form.context')}
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={4}
                    placeholder={t('affiliate.conversion.form.contextPlaceholder')}
                    className="w-full px-4 py-2.5 border border-navy/15 rounded-xl bg-white text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40 transition-colors text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || submitStatus === 'success'}
                  className="w-full px-6 py-3 bg-navy hover:bg-navy-hover text-white rounded-full font-semibold disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('affiliate.conversion.form.submitting')}</span>
                    </>
                  ) : (
                    <span>{t('affiliate.conversion.form.submit')}</span>
                  )}
                </button>
              </form>
            </div>

            {/* Calendly Column */}
            <div className="bg-white rounded-2xl border border-navy/[0.07] shadow-sm p-6 sm:p-8">
              <h3 className="font-general font-semibold text-lg sm:text-xl text-navy mb-5 sm:mb-6">
                {t('affiliate.conversion.calendly.title')}
              </h3>
              <p className="text-slate-blue text-sm sm:text-base leading-relaxed mb-6">
                {t('affiliate.conversion.calendly.subtitle')}
              </p>
              <button
                onClick={handleCalendlyClick}
                className="w-full group border-2 border-navy text-navy font-semibold py-3.5 sm:py-4 px-6 sm:px-8 rounded-full transition-all duration-300 hover:scale-[1.02] hover:bg-navy/5 flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <span>{t('affiliate.conversion.calendly.cta')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-6 sm:mt-8 pt-6 border-t border-navy/[0.07]">
                <p className="text-sm text-navy/60 leading-relaxed">
                  {t('affiliate.conversion.calendly.contactBefore')}
                  <a
                    href="mailto:voicelink@finitsolutions.be"
                    className="font-semibold text-navy hover:underline"
                  >
                    voicelink@finitsolutions.be
                  </a>
                  {t('affiliate.conversion.calendly.contactAfter')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
