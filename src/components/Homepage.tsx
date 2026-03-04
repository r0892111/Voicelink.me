import React from 'react';
import { Zap, MessageCircle, Play, ArrowRight, CheckCircle, ChevronDown, Star, PhoneOff, StickyNote, TrendingDown, Snowflake, Phone, Mail, Linkedin } from 'lucide-react';
import { HowItWorksDemo } from './HowItWorksDemo';
import { HeroDemo, CrmPreviewCards } from './HeroDemo';
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

const faqContentNl: React.ReactNode[] = [
  // 1. Hoe werkt VoiceLink precies?
  <div className="space-y-3">
    <p>Je stuurt gewoon een WhatsApp-bericht naar VoiceLink. Dat kan een spraakbericht of een gewoon tekstbericht zijn, net zoals je naar een collega of vriend zou sturen.</p>
    <p>VoiceLink begrijpt wat je bedoelt en verwerkt dat automatisch in je CRM. Denk bijvoorbeeld aan:</p>
    <ul className="space-y-1.5 mt-1">
      {['een notitie toevoegen aan een contact of bedrijf', 'een taak of follow-up aanmaken', 'een meeting registreren', 'een contact of bedrijf aanmaken', 'offertes, producten, deals of tijdsregistraties aanpassen'].map((item) => (
        <li key={item} className="flex gap-2.5 items-start">
          <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-navy/30 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
    <p>Je kan dus gewoon zeggen of typen wat je gedaan hebt, zoals:</p>
    <div className="bg-navy/[0.04] border-l-2 border-navy/20 rounded-r-lg px-4 py-3 text-navy/60 italic text-[13px] md:text-[14px]">
      "Meeting gehad met Jan van ABC, stuur hem morgen een offerte en noteer dat hij interesse heeft in product X."
    </div>
    <p>VoiceLink zet dit om naar de juiste acties in je CRM. Meestal duurt dat minder dan 30 seconden.</p>
    <p className="font-semibold text-navy">Je hoeft dus niets meer manueel in te geven in je CRM.</p>
  </div>,

  // 2. Moet ik een app installeren?
  <div className="space-y-3">
    <p>Nee. VoiceLink werkt gewoon via WhatsApp, de app die je al gebruikt.</p>
    <p>Wanneer je je gratis proefperiode start, gebeurt het volgende:</p>
    <ol className="space-y-2 mt-1">
      {['Je verbindt je CRM met VoiceLink.', 'Je geeft je WhatsApp-nummer in.', 'Je ontvangt een verificatiecode via WhatsApp van het VoiceLink-nummer.', 'Je voert die code één keer in je dashboard in.'].map((step, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span className="mt-[1px] flex-shrink-0 w-5 h-5 rounded-full bg-navy/10 text-navy text-[11px] font-semibold flex items-center justify-center">{i + 1}</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
    <p>Vanaf dat moment kan je altijd berichten sturen naar het VoiceLink-nummer, en worden ze automatisch verwerkt in je CRM.</p>
    <p className="font-semibold text-navy">Geen extra app, geen nieuw wachtwoord.</p>
  </div>,

  // 3. Hoe lang duurt de installatie?
  <div className="space-y-3">
    <p>De installatie duurt meestal ongeveer twee minuten.</p>
    <p>Je verbindt eerst je CRM en verifieert daarna je WhatsApp-nummer. Dat is alles.</p>
    <p>Je hoeft niets technisch te installeren en er is geen IT-kennis nodig. Updates en onderhoud gebeuren automatisch op de achtergrond.</p>
  </div>,

  // 4. Hoe weet VoiceLink wat ik bedoel?
  <div className="space-y-3">
    <p>VoiceLink herkent automatisch namen, bedrijven, deals, producten, taken en andere gegevens die al in je CRM staan.</p>
    <p>Als je bijvoorbeeld zegt:</p>
    <div className="bg-navy/[0.04] border-l-2 border-navy/20 rounded-r-lg px-4 py-3 text-navy/60 italic text-[13px] md:text-[14px]">
      "Bel morgen terug naar Sarah van Studio Nova en voeg een notitie toe dat ze interesse heeft in het premium pakket."
    </div>
    <p>dan zal VoiceLink:</p>
    <ul className="space-y-1.5 mt-1">
      {['het juiste contact en bedrijf vinden of aanmaken', 'de notitie toevoegen'].map((item) => (
        <li key={item} className="flex gap-2.5 items-start">
          <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-navy/30 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
    <p>Bestaat iets nog niet in je CRM? Dan kan VoiceLink het automatisch aanmaken.</p>
    <p>Als er twijfel is tussen meerdere opties, vraagt VoiceLink gewoon even welke je bedoelt.</p>
  </div>,

  // 5. Zijn mijn gegevens veilig?
  <div className="space-y-3">
    <p className="font-semibold text-navy">Ja. VoiceLink is gebouwd volgens de Europese GDPR-regels.</p>
    <p>We vragen enkel toegang tot wat nodig is om je CRM te kunnen bijwerken. Je CRM-wachtwoord wordt nooit opgeslagen of zichtbaar voor ons.</p>
    <p>Spraakberichten worden alleen gebruikt om je bericht te verwerken en worden daarna niet bewaard.</p>
    <p className="font-semibold text-navy">Je gegevens blijven dus veilig en onder jouw controle.</p>
  </div>,

  // 6. Wat kost VoiceLink na de gratis proefperiode?
  <div className="space-y-3">
    <p>Je kan VoiceLink 14 dagen gratis testen.</p>
    <p>Daarna kies je een abonnement dat past bij jouw gebruik of teamgrootte. De prijzen zijn transparant en maandelijks opzegbaar.</p>
    <p>Voor de actuele tarieven kan je onze prijzenpagina bekijken.</p>
  </div>,

  // 7. Werkt VoiceLink in meerdere talen?
  <div className="space-y-3">
    <p>Ja. VoiceLink begrijpt vrijwel alle talen.</p>
    <p>Je kan je bericht inspreken of typen in de taal die voor jou het meest natuurlijk voelt, bijvoorbeeld Nederlands, Engels, Frans, Duits of Spaans.</p>
    <p>VoiceLink zal je bericht verwerken en altijd reageren in dezelfde taal waarin jij sprak of typte.</p>
    <p>Werk je met internationale klanten of een meertalig team? Dan kan iedereen VoiceLink gewoon gebruiken in zijn of haar eigen taal.</p>
  </div>,
];

export const Homepage: React.FC<HomepageProps> = ({ openContactModal }) => {
  const { openSettings } = useConsent();
  const { t, currentLanguage } = useI18n();
  const navigate = useNavigate();
  const { navigateWithTransition } = usePageTransition();
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  return (
    <div className="min-h-screen bg-porcelain relative font-instrument">

      {/* ───────── 1. HERO ───────── */}
      <HeroDemo />

      {/* ───────── 4. HOW IT WORKS ───────── */}
      <section id="how-it-works" className="pt-28 md:pt-0 pb-4 2xl:pb-8 relative z-10 scroll-mt-24">
        {/* Decorative corner — flows from hero bottom-right (desktop) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M1470,-30 L1239.5,-30 C1239.5,90 1225.5,115 1320.5,138 C1430.5,162 1415.5,176 1470,190 Z"
            fill="#1A2D63"
          />
          <path
            d="M1248,-30 C1248,87 1232.5,112 1326,136 C1435.5,159 1420.5,173 1476,186
               L1471,198 C1410.5,183 1428.5,168 1319,145 C1218.5,123 1232,87 1232,-30 L1248,-30 Z"
            fill="#7B8DB5"
          />
        </svg>
        {/* Decorative corner — mobile/tablet top-right */}
        <svg
          className="absolute top-0 right-0 pointer-events-none block md:hidden"
          style={{ top: '-6px' }}
          width="128" height="115"
          viewBox="1213 -30 255 230"
          aria-hidden="true"
        >
          <path
            d="M1470,-30 L1239.5,-30 C1239.5,90 1225.5,115 1320.5,138 C1430.5,162 1415.5,176 1470,190 Z"
            fill="#1A2D63"
          />
          <path
            d="M1248,-30 C1248,87 1232.5,112 1326,136 C1435.5,159 1420.5,173 1476,186
               L1471,198 C1410.5,183 1428.5,168 1319,145 C1218.5,123 1232,87 1232,-30 L1248,-30 Z"
            fill="#7B8DB5"
          />
        </svg>
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-6">
          <ScrollAnimation>
            <div className="text-center mb-6 md:mb-10 2xl:mb-14">
              <h2 className="font-general text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-bold leading-[1.15] text-navy mb-2 md:mb-6">
                {t('howItWorks.title')}
              </h2>
              <p className="text-lg md:text-xl xl:text-2xl font-instrument font-medium text-navy/60 max-w-3xl mx-auto">
                {t('howItWorks.subtitle')}
              </p>
            </div>
          </ScrollAnimation>
          <HowItWorksDemo />
        </div>
      </section>

      {/* Divider: How It Works → Problem Agitation */}
      <SectionDivider fromColor="#FDFBF7" toColor="#1A2D63" variant={1} />

      {/* ───────── 3. PROBLEM AGITATION ───────── */}
      <section className="bg-navy py-6 md:py-8 relative z-10">
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

      {/* Divider: Problem Agitation → CRM Preview */}
      <SectionDivider fromColor="#1A2D63" toColor="#FDFBF7" variant={2} />

      {/* ───────── 5. CRM PREVIEW ("Ontdek wat VoiceLink doet in je CRM") ───────── */}
      <div id="crm-preview" className="scroll-mt-24">
        <CrmPreviewCards />
      </div>

      {/* Divider: CRM Preview → Integrations */}
      <SectionDivider fromColor="#FDFBF7" toColor="#FDFBF7" variant={0} />

      {/* ───────── 6. INTEGRATIONS ───────── */}
      <ScrollAnimation>
        <section id="integrations" className="pt-2 pb-6 relative z-10 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="font-general text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] text-navy mb-6 flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-x-3 -translate-x-6 translate-y-6 sm:translate-x-0 sm:translate-y-0 md:translate-x-6">
                <span>{t('integrations.titleBefore')}</span>
                <img
                  src="/Logo_Teamleader_Default_CMYK.png"
                  alt="Teamleader"
                  className="h-28 md:h-32 lg:h-36 -mt-12 sm:-mt-2 md:-mt-6 lg:-mt-8 self-end md:translate-y-[5px] md:-translate-x-6"
                />
              </h2>
              <button
                onClick={() => { trackCTAClick('try_free_integrations', '/'); navigateWithTransition(withUTM('/signup')); }}
                className="relative z-10 bg-navy hover:bg-navy-hover text-white font-medium text-[15px] py-3.5 px-8 rounded-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] mb-8"
              >
                {t('integrations.tryForFree')}
              </button>
              <div className="flex flex-col items-start gap-3 text-base md:text-xl font-instrument font-medium text-navy w-fit mx-auto">
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
      <section className="py-10 relative z-10 bg-navy">
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
                  <p className="font-general text-lg md:text-xl font-semibold italic text-white/90 leading-relaxed">
                    "{t(`testimonials.quote${n}`)}"
                  </p>
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
        <section id="pricing" className="py-8 2xl:py-12 relative z-10 scroll-mt-24">
          <PricingSection
            openContactModal={openContactModal}
          />
        </section>
      </ScrollAnimation>

      {/* Divider: Pricing → FAQ */}
      <SectionDivider fromColor="#FDFBF7" toColor="#FDFBF7" variant={3} />

      {/* ───────── 9. FAQ ───────── */}
      <ScrollAnimation>
        <section className="pt-6 pb-14 2xl:pt-8 2xl:pb-20 relative z-10">
          <div className="max-w-3xl 2xl:max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="font-general text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl font-bold leading-[1.15] text-navy text-center mb-12 2xl:mb-20">
              {t('faq.title')}
            </h2>

            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <ScrollAnimation key={n} delay={n * 50}>
                  <div className="bg-white rounded-2xl border border-navy/[0.07] shadow-sm overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === n ? null : n)}
                      className="w-full flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 text-left gap-4 hover:bg-navy/[0.015] transition-colors duration-150"
                    >
                      <span className="font-instrument font-semibold text-[14px] sm:text-[15px] md:text-base text-navy leading-snug">{t(`faq.q${n}`)}</span>
                      <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-navy/40 flex-shrink-0 transition-transform duration-300 ${openFaq === n ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${openFaq === n ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden min-h-0">
                        <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1 font-instrument text-[13px] sm:text-[14px] text-slate-blue leading-relaxed [&_p]:leading-relaxed [&_ul]:space-y-1.5 [&_ol]:space-y-2">
                          {currentLanguage === 'nl'
                            ? faqContentNl[n - 1]
                            : <p>{t(`faq.a${n}`)}</p>
                          }
                        </div>
                      </div>
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
        <section className="py-14 relative z-10">
          <div className="max-w-4xl mx-auto px-6">
            <div className="rounded-3xl bg-white shadow-2xl border border-navy/[0.06] p-12 lg:p-16 text-center relative overflow-hidden">
              {/* Glow effect */}
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
                    onClick={() => { trackCTAClick('start_free_trial', '/'); navigateWithTransition(withUTM('/signup')); }}
                    className="group bg-navy hover:bg-navy-hover text-white font-medium text-[15px] py-4 px-8 rounded-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center space-x-2"
                  >
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

                <div className="mt-8 flex flex-col sm:flex-row w-fit mx-auto items-start sm:items-center gap-y-2 sm:gap-x-8 text-muted-blue">
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
      <footer className="text-white bg-navy relative z-10">
        {/* Upper CTA + contact area */}
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-12">
          <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-16">

            {/* Left: headline + subline + three CTA buttons */}
            <div className="flex-1 flex flex-col gap-6">
              <div>
                <h2 className="font-general text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-snug mb-4 whitespace-pre-line">
                  {t('footer.ctaHeadline')}
                </h2>
                <p className="text-white/60 font-instrument text-lg leading-relaxed max-w-lg">
                  {t('footer.ctaSubline')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <button
                onClick={() => { trackCTAClick('start_free_trial', '/'); navigateWithTransition(withUTM('/signup')); }}
                className="group bg-white text-navy font-semibold text-sm py-3 px-6 rounded-full hover:bg-white/90 transition-all duration-200 flex items-center gap-2 w-fit"
              >
                {t('finalCta.startFreeTrial')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => { const el = document.getElementById('how-it-works'); if (el) window.scrollTo({ top: el.offsetTop - 10, behavior: 'smooth' }); }}
                className="group border border-white/25 text-white font-semibold text-sm py-3 px-6 rounded-full hover:bg-white/10 transition-all duration-200 flex items-center gap-2 w-fit"
              >
                <Play className="w-4 h-4" />
                {t('finalCta.watchDemo')}
              </button>
              <button
                onClick={openContactModal}
                className="border border-white/25 text-white font-semibold text-sm py-3 px-6 rounded-full hover:bg-white/10 transition-all duration-200 w-fit"
              >
                {t('navigation.contact')}
              </button>
              </div>
            </div>

            {/* Right: contact info card */}
            <div className="lg:w-80 xl:w-96 flex-shrink-0 w-full sm:w-auto">
              <div className="border border-white/15 rounded-2xl p-7 bg-white/[0.04]">
                <h3 className="font-semibold text-base text-white mb-5">{t('navigation.contact')}</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 text-white/60 text-sm">
                    <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/40" />
                    <div className="space-y-1 leading-relaxed">
                      <div>+32 495 70 23 14</div>
                      <div>+32 468 02 99 45</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-white/60 text-sm">
                    <Mail className="w-4 h-4 flex-shrink-0 text-white/40" />
                    <a href="mailto:contact@finitsolutions.be" className="hover:text-white transition-colors">
                      contact@finitsolutions.be
                    </a>
                  </div>
                  <div className="flex items-center gap-4 text-white/60 text-sm">
                    <Linkedin className="w-4 h-4 flex-shrink-0 text-white/40" />
                    <a href="https://www.linkedin.com/company/finitsolutions/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <img
              src="/Finit Voicelink White.svg"
              alt="VoiceLink"
              className="h-8 w-auto"
            />
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/35">
              <span>BTW: BE1020600643</span>
              <a href="/privacy-policy" className="hover:text-white/70 transition-colors">{t('footer.privacy')}</a>
              <a href="/cookie-policy" className="hover:text-white/70 transition-colors">{t('footer.cookiePolicy')}</a>
              <a href="/disclaimer" className="hover:text-white/70 transition-colors">{t('footer.disclaimer')}</a>
              <button onClick={() => openSettings()} className="hover:text-white/70 transition-colors cursor-pointer">
                {t('footer.cookieSettings')}
              </button>
            </div>
            <span className="text-xs text-white/35">{t('footer.copyright')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
