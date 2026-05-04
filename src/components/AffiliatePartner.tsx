import React, { useState } from 'react';
import { ArrowRight, ChevronDown, CheckCircle, AlertCircle } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { trackCTAClick } from '../utils/analytics';

interface AccordionItem {
  titleKey: string;
  contentKey: string;
}

export const AffiliatePartner: React.FC = () => {
  const { t } = useI18n();
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
      <section className="pt-44 pb-20 px-6 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[2fr_1fr] gap-12 items-center">
            {/* Text column */}
            <div className="space-y-8 text-center lg:text-left">
              <h1 className="font-general font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight text-navy">
                {t('affiliate.hero.title')}
              </h1>

              <p className="text-lg sm:text-xl text-slate-blue max-w-3xl mx-auto lg:mx-0">
                {t('affiliate.hero.subtitle')}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
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
            </div>

            {/* Phone mockup column */}
            <div className="flex justify-center lg:justify-end">
              <img
                src="/whatsapp phone mock.png"
                alt="VoiceLink WhatsApp conversation showing CRM updates from voice notes"
                style={{
                  width: 'auto',
                  height: 'clamp(364px, 65vh, 624px)',
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
      <section className="py-20 px-6 sm:px-8 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center font-general font-bold text-3xl sm:text-4xl text-navy mb-16">
            {t('affiliate.howItWorks.title')}
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-navy text-white font-bold text-lg">
                  {step}
                </div>
                <h3 className="font-general font-semibold text-navy text-lg">
                  {t(`affiliate.howItWorks.step${step}.title`)}
                </h3>
                <p className="text-slate-blue text-sm">
                  {t(`affiliate.howItWorks.step${step}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Partner */}
      <section className="py-20 px-6 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center font-general font-bold text-3xl sm:text-4xl text-navy mb-16">
            {t('affiliate.whyPartner.title')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-2xl p-8 border border-navy/10">
                <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-navy" />
                </div>
                <h3 className="font-general font-semibold text-navy text-lg mb-3">
                  {t(`affiliate.whyPartner.point${item}.title`)}
                </h3>
                <p className="text-slate-blue text-sm leading-relaxed">
                  {t(`affiliate.whyPartner.point${item}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Details Accordion */}
      <section className="py-20 px-6 sm:px-8 bg-white/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center font-general font-bold text-3xl sm:text-4xl text-navy mb-4">
            {t('affiliate.accordion.title')}
          </h2>
          <p className="text-center text-slate-blue mb-12 max-w-2xl mx-auto">
            {t('affiliate.accordion.subtitle')}
          </p>

          <div className="space-y-3">
            {accordionItems.map((item, index) => (
              <div
                key={index}
                className="border border-navy/15 rounded-xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 hover:bg-navy/5 transition-colors text-left"
                >
                  <h3 className="font-semibold text-navy text-lg pr-4">
                    {t(item.titleKey)}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-navy flex-shrink-0 transition-transform duration-300 ${
                      activeAccordion === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {activeAccordion === index && (
                  <div className="px-6 pb-6 border-t border-navy/10 bg-navy/2">
                    <div className="text-slate-blue text-sm leading-relaxed space-y-3 whitespace-pre-wrap">
                      {t(item.contentKey)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conversion Section */}
      <section className="py-20 px-6 sm:px-8" id="affiliate-form-section">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center font-general font-bold text-3xl sm:text-4xl text-navy mb-16">
            {t('affiliate.conversion.title')}
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Form Column */}
            <div>
              <h3 className="font-general font-semibold text-xl text-navy mb-6">
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
            <div>
              <h3 className="font-general font-semibold text-xl text-navy mb-6">
                {t('affiliate.conversion.calendly.title')}
              </h3>
              <p className="text-slate-blue text-sm mb-6">
                {t('affiliate.conversion.calendly.subtitle')}
              </p>
              <button
                onClick={handleCalendlyClick}
                className="w-full group border-2 border-navy text-navy font-semibold py-4 px-8 rounded-full transition-all duration-300 hover:scale-[1.02] hover:bg-navy/5 flex items-center justify-center space-x-2 text-base"
              >
                <span>{t('affiliate.conversion.calendly.cta')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-8 p-6 bg-navy/5 rounded-2xl border border-navy/10">
                <p className="text-sm text-navy/60 leading-relaxed">
                  {t('affiliate.conversion.calendly.info')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
