import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  UserPlus,
  Link2,
  MessageCircle,
  Mic,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../hooks/useI18n';
import { withUTM } from '../utils/utm';
import { usePageTransition } from '../hooks/usePageTransition';
import { HowItWorksDemo } from './HowItWorksDemo';

interface Step {
  title: string;
  body: string;
  example: string;
}

interface ExampleRow {
  goal: string;
  say: string;
}

interface Tip {
  title: string;
  body: string;
}

interface FaqItem {
  q: string;
  a: string;
}

const STEP_ICONS = [UserPlus, Link2, MessageCircle, Mic];

export function GettingStarted() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { navigateWithTransition } = usePageTransition();
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const steps = (t('gettingStartedPage.steps.items', { returnObjects: true }) as Step[]) ?? [];
  const examples = (t('gettingStartedPage.examples.items', { returnObjects: true }) as ExampleRow[]) ?? [];
  const tips = (t('gettingStartedPage.tips.items', { returnObjects: true }) as Tip[]) ?? [];
  const faqs = (t('gettingStartedPage.faq.items', { returnObjects: true }) as FaqItem[]) ?? [];

  const stepCtas: Array<{ label: string; href: string } | null> = [
    { label: t('gettingStartedPage.steps.signupCta'), href: '/signup' },
    null,
    null,
    null,
  ];

  return (
    <div className="min-h-screen bg-porcelain relative font-instrument">
      {/* ───────── HERO ───────── */}
      <section className="pt-28 pb-10 md:pt-32 md:pb-14">
        <div className="max-w-5xl mx-auto px-6">
          <button
            onClick={() => navigate(withUTM('/'))}
            className="group flex items-center gap-2 text-navy/65 hover:text-navy text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            {t('navigation.backToHome')}
          </button>

          <div className="max-w-2xl">
            <div className="flex items-center gap-2.5 text-navy/65 mb-3">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest font-semibold">
                {t('gettingStartedPage.hero.eyebrow')}
              </span>
            </div>
            <h1 className="font-general text-4xl sm:text-5xl md:text-6xl font-bold text-navy leading-[1.1] mb-5">
              {t('gettingStartedPage.hero.title')}
            </h1>
            <p className="text-lg md:text-xl font-instrument text-navy/75 leading-relaxed">
              {t('gettingStartedPage.hero.subtitle')}
            </p>
          </div>

          <div className="mt-10 md:mt-12 max-w-4xl">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-navy/5 border border-navy/[0.09] shadow-lg shadow-navy/[0.06]">
              <iframe
                src="https://www.youtube-nocookie.com/embed/RTIQvTAZ4dA?rel=0&modestbranding=1"
                title={t('gettingStartedPage.hero.videoTitle')}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───────── STEPS ───────── */}
      <section className="pb-16 md:pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-navy/70 text-base md:text-lg mb-8 max-w-2xl">
            {t('gettingStartedPage.steps.intro')}
          </p>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = STEP_ICONS[index] ?? UserPlus;
              const cta = stepCtas[index];
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-7 md:p-8 border border-navy/[0.09] hover:border-navy/20 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-5">
                    {/* Number + icon column */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs uppercase tracking-widest font-semibold text-navy/55">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Content column */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-general text-xl md:text-2xl font-bold text-navy mb-2">
                        {step.title}
                      </h3>
                      <p className="text-navy/75 text-[15px] md:text-base leading-relaxed mb-4">
                        {step.body}
                      </p>
                      {cta && (
                        <button
                          onClick={() => navigateWithTransition(withUTM(cta.href))}
                          className="group/cta inline-flex items-center gap-2 bg-navy text-white font-semibold text-sm py-2.5 px-5 rounded-full hover:bg-navy-hover transition-all duration-200 mb-4"
                        >
                          {cta.label}
                          <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-0.5 transition-transform" />
                        </button>
                      )}
                      <div className="bg-navy/[0.05] rounded-xl px-4 py-3 border border-navy/[0.08]">
                        <p className="text-xs uppercase tracking-widest font-semibold text-navy/55 mb-1">
                          {t('gettingStartedPage.steps.exampleLabel')}
                        </p>
                        <p className="text-navy/85 text-sm leading-relaxed">{step.example}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── HOW IT WORKS ───────── */}
      <section className="pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="font-general text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] text-navy mb-3 md:mb-4">
              {t('howItWorks.title')}
            </h2>
            <p className="text-lg md:text-xl font-instrument font-medium text-navy/60 max-w-3xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>
          <HowItWorksDemo />
        </div>
      </section>

      {/* ───────── EXAMPLES ───────── */}
      <section className="pb-16 md:pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl mb-8">
            <div className="flex items-center gap-2.5 text-navy/65 mb-3">
              <Mic className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest font-semibold">
                {t('gettingStartedPage.examples.eyebrow')}
              </span>
            </div>
            <h2 className="font-general text-3xl md:text-4xl font-bold text-navy leading-tight mb-3">
              {t('gettingStartedPage.examples.title')}
            </h2>
            <p className="text-navy/70 text-base md:text-lg leading-relaxed">
              {t('gettingStartedPage.examples.intro')}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-navy/[0.09] overflow-hidden">
            <div className="hidden md:grid grid-cols-[260px_1fr] gap-4 px-6 py-3 bg-navy/[0.04] border-b border-navy/[0.08]">
              <p className="text-xs uppercase tracking-widest font-semibold text-navy/60">
                {t('gettingStartedPage.examples.colGoal')}
              </p>
              <p className="text-xs uppercase tracking-widest font-semibold text-navy/60">
                {t('gettingStartedPage.examples.colSay')}
              </p>
            </div>
            <ul className="divide-y divide-navy/[0.07]">
              {examples.map((row, index) => (
                <li
                  key={index}
                  className="md:grid md:grid-cols-[260px_1fr] gap-4 px-6 py-4 hover:bg-navy/[0.025] transition-colors"
                >
                  <p className="font-general font-semibold text-navy text-sm mb-1.5 md:mb-0">
                    {row.goal}
                  </p>
                  <p className="text-navy/75 text-sm leading-relaxed italic">{row.say}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───────── TIPS ───────── */}
      <section className="pb-16 md:pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl mb-8">
            <div className="flex items-center gap-2.5 text-navy/65 mb-3">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest font-semibold">
                {t('gettingStartedPage.tips.eyebrow')}
              </span>
            </div>
            <h2 className="font-general text-3xl md:text-4xl font-bold text-navy leading-tight">
              {t('gettingStartedPage.tips.title')}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-navy/[0.09]"
              >
                <div className="w-10 h-10 bg-navy/[0.08] rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-5 h-5 text-navy/75" />
                </div>
                <h3 className="font-general font-bold text-navy text-base mb-2">
                  {tip.title}
                </h3>
                <p className="text-navy/70 text-sm leading-relaxed">{tip.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section className="pb-14 md:pb-18">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-navy/[0.08] rounded-xl flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-navy/75" />
              </div>
              <h2 className="font-general text-2xl md:text-3xl font-bold text-navy">
                {t('gettingStartedPage.faq.title')}
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-navy/[0.09] overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    aria-expanded={openFaq === index}
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left group"
                  >
                    <span className="font-general font-semibold text-navy text-[15px] md:text-base pr-4 leading-snug">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-navy/45 flex-shrink-0 transition-transform duration-200 ${
                        openFaq === index ? 'rotate-180 text-navy/75' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openFaq === index ? 'max-h-[640px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="px-5 md:px-6 pb-5 md:pb-6 text-navy/72 text-sm md:text-[15px] leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              ))}
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
                {t('gettingStartedPage.cta.title')}
              </h2>
              <p className="text-white/75 font-instrument text-base md:text-lg mb-7 max-w-lg mx-auto">
                {t('gettingStartedPage.cta.subtitle')}
              </p>
              <button
                onClick={() => navigateWithTransition(withUTM('/signup'))}
                className="group bg-white text-navy font-semibold text-sm py-3 px-7 rounded-full hover:bg-white/90 transition-all duration-200 inline-flex items-center gap-2"
              >
                {t('gettingStartedPage.cta.button')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default GettingStarted;
