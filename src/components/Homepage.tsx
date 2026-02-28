import React from 'react';
import { Zap, MessageCircle, Play, ArrowRight, CheckCircle, ChevronDown, Star, PhoneOff, StickyNote, TrendingDown, Snowflake } from 'lucide-react';
import { HowItWorksDemo } from './HowItWorksDemo';
import { HeroDemo } from './HeroDemo';
import { PricingSection } from './PricingSection';
import { LogoCarousel } from './ui/LogoCarousel';
import { SectionDivider } from './ui/SectionDivider';
import { ScrollAnimation } from './ui/ScrollAnimation';
import { useConsent } from '../contexts/ConsentContext';
import { useI18n } from '../hooks/useI18n';
import { useNavigate } from 'react-router-dom';
import { trackCTAClick } from '../utils/analytics';
import { withUTM } from '../utils/utm';
import { usePageTransition } from '../hooks/usePageTransition';

interface HomepageProps {
  openContactModal: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({ openContactModal }) => {
  const { openSettings } = useConsent();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { navigateWithTransition } = usePageTransition();
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  return (
    <div className="min-h-screen bg-porcelain relative font-instrument">

      {/* ───────── 1. HERO ───────── */}
      <HeroDemo />

      {/* Divider: Hero → Problem Agitation */}
      <SectionDivider fromColor="#FDFBF7" toColor="#1A2D63" variant={1} />

      {/* ───────── 3. PROBLEM AGITATION ───────── */}
      <section className="bg-navy py-14 md:py-20 relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollAnimation>
            <div className="text-center mb-16 md:mb-20">
              <h2 className="font-general text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] text-white mb-5">
                {t('problemAgitation.title')}
              </h2>
              <p className="text-lg md:text-xl font-instrument font-medium text-white/50 max-w-2xl mx-auto">
                {t('problemAgitation.subtitle')}
              </p>
            </div>
          </ScrollAnimation>
          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            {([
              { n: 1, Icon: PhoneOff },
              { n: 2, Icon: StickyNote },
              { n: 3, Icon: TrendingDown },
              { n: 4, Icon: Snowflake },
            ]).map(({ n, Icon }) => (
              <ScrollAnimation key={n} delay={n * 100}>
                <div
                  className="group backdrop-blur-sm rounded-2xl border border-white/[0.10] p-7 md:p-9 hover:border-white/[0.16] transition-all duration-300 flex gap-5 items-center"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 16px rgba(0,0,0,0.25), 0 8px 32px rgba(0,0,0,0.15)',
                  }}
                >
                  <Icon className="w-9 h-9 md:w-10 md:h-10 text-white flex-shrink-0" strokeWidth={1.25} />
                  <p className="font-instrument font-medium text-base md:text-lg leading-relaxed text-white/90">
                    {t(`problemAgitation.pain${n}`)}
                  </p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Divider: Problem Agitation → How It Works */}
      <SectionDivider fromColor="#1A2D63" toColor="#FDFBF7" variant={2} />

      {/* ───────── 4. HOW IT WORKS ───────── */}
      <section id="how-it-works" className="pt-20 pb-8 relative z-10 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollAnimation>
            <div className="text-center mb-20">
              <h2 className="font-general text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] text-navy mb-6">
                {t('howItWorks.title')}
              </h2>
              <p className="text-lg md:text-xl font-instrument font-medium text-navy/60 max-w-3xl mx-auto">
                {t('howItWorks.subtitle')}
              </p>
            </div>
          </ScrollAnimation>
          <HowItWorksDemo />
        </div>
      </section>

      {/* Divider: How It Works → Integrations */}
      <SectionDivider fromColor="#FDFBF7" toColor="#FDFBF7" variant={0} />

      {/* ───────── 6. INTEGRATIONS ───────── */}
      <ScrollAnimation>
        <section className="py-8 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-general text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] text-navy mb-8 flex items-center justify-center gap-5 whitespace-nowrap">
                {t('integrations.titleBefore')}
                <img src="/Logo_Teamleader_Default_CMYK.png" alt="Teamleader" style={{ height: '9rem', marginTop: '-1.1rem', marginLeft: '-1.5rem' }} className="inline-block" />
              </h2>
              <button
                onClick={() => { trackCTAClick('try_free_integrations', '/'); navigateWithTransition(withUTM('/test')); }}
                className="relative z-10 bg-navy hover:bg-navy-hover text-white font-medium text-[15px] py-3.5 px-8 rounded-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] mb-8"
                style={{ marginTop: '-6.5rem' }}
              >
                {t('integrations.tryForFree')}
              </button>
              <div className="flex flex-col items-center gap-3 text-lg md:text-xl font-instrument font-medium text-navy">
                <span className="flex items-center gap-2.5"><span className="text-navy">✓</span> {t('integrations.bullet1')}</span>
                <span className="flex items-center gap-2.5"><span className="text-navy">✓</span> {t('integrations.bullet2')}</span>
                <span className="flex items-center gap-2.5"><span className="text-navy">✓</span> {t('integrations.bullet3')}</span>
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-slate-blue mb-4 font-instrument max-w-xl mx-auto">{t('features.dontSeeYourCrm')}</p>
              <button
                onClick={() => { trackCTAClick('contact_for_custom', '/'); openContactModal(); }}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-white border border-navy/30 rounded-full shadow-lg hover:border-navy/50 hover:shadow-xl hover:scale-[1.02] transition-all group"
              >
                <span className="text-[15px] font-medium text-navy">{t('features.contactForCustom')}</span>
                <MessageCircle className="w-4 h-4 text-navy/50 group-hover:text-navy transition-colors" />
              </button>
            </div>
          </div>
        </section>
      </ScrollAnimation>

      {/* Divider: Integrations → Testimonials (porcelain → navy) */}
      <SectionDivider fromColor="#FDFBF7" toColor="#1A2D63" variant={1} />

      {/* ───────── 7. TESTIMONIALS (on navy bg) ───────── */}
      <section className="py-24 relative z-10 bg-navy">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollAnimation>
            <h2 className="font-general text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] text-white text-center mb-16">
              {t('testimonials.title')}
            </h2>
          </ScrollAnimation>

          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map((n) => (
              <ScrollAnimation key={n} delay={n * 150}>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-8 hover:bg-white/15 transition-all duration-300">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-glow-blue text-glow-blue" />)}
                  </div>
                  <p className="font-general text-lg md:text-xl font-semibold italic text-white/90 leading-relaxed mb-6">
                    "{t(`testimonials.quote${n}`)}"
                  </p>
                  <p className="font-instrument text-glow-blue text-sm font-medium">— {t(`testimonials.author${n}`)}</p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Divider: Testimonials → Pricing (navy → porcelain) */}
      <SectionDivider fromColor="#1A2D63" toColor="#FDFBF7" variant={2} />

      {/* ───────── 8. PRICING ───────── */}
      <ScrollAnimation>
        <section id="pricing" className="py-24 relative z-10 scroll-mt-24">
          <PricingSection
            openContactModal={openContactModal}
          />
        </section>
      </ScrollAnimation>

      {/* Divider: Pricing → FAQ */}
      <SectionDivider fromColor="#FDFBF7" toColor="#FDFBF7" variant={3} />

      {/* ───────── 9. FAQ ───────── */}
      <ScrollAnimation>
        <section className="py-24 relative z-10">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="font-general text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] text-navy text-center mb-16">
              {t('faq.title')}
            </h2>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <ScrollAnimation key={n} delay={n * 60}>
                  <div className="bg-white rounded-2xl border border-navy/[0.06] shadow-lg overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === n ? null : n)}
                      className="w-full flex items-center justify-between p-6 text-left"
                    >
                      <span className="font-instrument font-medium text-[15px] md:text-base text-navy pr-4">{t(`faq.q${n}`)}</span>
                      <ChevronDown className={`w-5 h-5 text-navy/50 flex-shrink-0 transition-transform duration-300 ${openFaq === n ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${openFaq === n ? 'max-h-96 pb-6' : 'max-h-0'}`}>
                      <p className="px-6 font-instrument text-[15px] text-slate-blue leading-relaxed">
                        {t(`faq.a${n}`)}
                      </p>
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>
      </ScrollAnimation>

      {/* Divider: FAQ → Final CTA */}
      <SectionDivider fromColor="#FDFBF7" toColor="#FDFBF7" variant={0} />

      {/* ───────── 10. FINAL CTA ───────── */}
      <ScrollAnimation>
        <section className="py-24 relative z-10">
          <div className="max-w-4xl mx-auto px-6">
            <div className="rounded-3xl bg-white shadow-2xl border border-navy/[0.06] p-12 lg:p-16 text-center relative overflow-hidden">
              {/* Glow effect */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-glow-blue/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-glow-blue/15 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <h2 className="font-general text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] text-navy mb-6">
                  {t('finalCta.title')}
                </h2>
                <p className="text-base md:text-lg font-instrument font-medium text-slate-blue leading-relaxed mb-10 max-w-2xl mx-auto">
                  {t('finalCta.subtitle')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => { trackCTAClick('start_free_trial', '/'); navigateWithTransition(withUTM('/test')); }}
                    className="group bg-navy hover:bg-navy-hover text-white font-medium text-[15px] py-4 px-8 rounded-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center space-x-2"
                  >
                    <img src="/Finit Voicelink Blue.svg" alt={t('common.voiceLink')} className="w-5 h-5 mr-1 invert brightness-200" />
                    <span>{t('finalCta.startFreeTrial')}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => { trackCTAClick('watch_demo', '/'); const el = document.getElementById('how-it-works'); if (el) window.scrollTo({ top: el.offsetTop - 10, behavior: 'smooth' }); }}
                    className="group border-2 border-navy text-navy font-medium text-[15px] py-4 px-8 rounded-full transition-all duration-300 hover:bg-navy/5 flex items-center justify-center space-x-2"
                  >
                    <Play className="w-5 h-5" />
                    <span>{t('finalCta.watchDemo')}</span>
                  </button>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-muted-blue">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-navy" />
                    <span className="text-sm">{t('finalCta.freeTrialFeatures.freeTrialDays')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-navy" />
                    <span className="text-sm">{t('finalCta.freeTrialFeatures.noSetupFees')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-navy" />
                    <span className="text-sm">{t('finalCta.freeTrialFeatures.cancelAnytime')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollAnimation>

      {/* Divider: Final CTA → Footer (porcelain → navy) */}
      <SectionDivider fromColor="#FDFBF7" toColor="#1A2D63" variant={2} />

      {/* ───────── 11. FOOTER ───────── */}
      <footer className="text-white py-12 relative z-10 bg-navy">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex items-center space-x-3">
              <img
                src="/Finit Voicelink White.svg"
                alt={t('common.voiceLink')}
                className="h-8 w-auto"
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 text-sm text-white/40">
              <span>{t('footer.copyright')}</span>
              <a href="/privacy-policy" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
              <a href="/saas-agreement" className="hover:text-white transition-colors">{t('footer.saasAgreement')}</a>
              <a href="/disclaimer" className="hover:text-white transition-colors">{t('footer.disclaimer')}</a>
              <a href="/cookie-policy" className="hover:text-white transition-colors">{t('footer.cookiePolicy')}</a>
              <button
                onClick={() => openSettings()}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                {t('footer.cookieSettings')}
              </button>
              <a href="/support" className="hover:text-white transition-colors">{t('footer.support')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
