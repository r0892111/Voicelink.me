// ── UserGuidePreview ─────────────────────────────────────────────────────────
// Concise "how to talk to VoiceLink" section for the homepage. Shows 4 voice
// note examples side-by-side with the CRM outcomes they produce, plus a
// compact Do / Don't strip. Intentionally shorter than the full dashboard
// guide — this is marketing-surface, the full reference lives on
// /dashboard/guide once the user is logged in.

import { Mic, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { ScrollAnimation } from './ui/ScrollAnimation';

interface Example {
  youSay: string;
  outcomes: string[];
}

const EXAMPLES: Example[] = [
  {
    youSay:
      '"Just met Jan at Delta NV. They want a 15% discount on the premium package. Follow up with him next Friday."',
    outcomes: [
      'Meeting report logged on Delta NV',
      'Deal updated with 15% discount note',
      'Task "Follow up with Jan" created — due Friday',
    ],
  },
  {
    youSay:
      '"Add Sarah Leclercq as a contact at Delta NV, she\'s the new procurement manager."',
    outcomes: [
      'Contact Sarah Leclercq created',
      'Linked to Delta NV with role "Procurement Manager"',
    ],
  },
  {
    youSay:
      '"I just called Marc Peeters for 15 minutes about the contract renewal. He wants a new quote by Friday."',
    outcomes: [
      'Call logged on Marc Peeters — 15 min',
      'Task "Prepare new quote for Marc" created — due Friday',
    ],
  },
  {
    youSay: '"The SEO contract with Alpha Solutions is won."',
    outcomes: ['Deal status updated to Won', 'Associated task marked complete'],
  },
];

const TIPS = [
  'Use real names — "Delta NV" beats "that company".',
  'Combine several actions in one message — VoiceLink orders them.',
  'Speak any of 4 languages: EN / NL / FR / DE.',
];

export function UserGuidePreview() {
  return (
    <section className="py-16 md:py-24 relative z-10 bg-porcelain">
      <div className="max-w-6xl mx-auto px-6">
        <ScrollAnimation>
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-navy/[0.08] rounded-full px-4 py-1.5 mb-5 shadow-sm">
              <Mic className="w-3.5 h-3.5 text-navy/60" />
              <span className="text-sm font-medium text-navy/65">How you use it</span>
            </div>
            <h2 className="font-general text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] text-navy mb-4">
              Just say what happened.
            </h2>
            <p className="text-lg md:text-xl font-instrument font-medium text-navy/55 max-w-2xl mx-auto leading-relaxed">
              No keywords, no syntax. Speak the way you'd tell a colleague — VoiceLink
              turns it into the right CRM actions.
            </p>
          </div>
        </ScrollAnimation>

        {/* ── Voice note examples ── */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-12">
          {EXAMPLES.map((ex, i) => (
            <ScrollAnimation key={ex.youSay} delay={i * 80}>
              <article className="group h-full bg-white/80 backdrop-blur-sm rounded-3xl border border-navy/[0.07] shadow-sm p-6 md:p-7 hover:shadow-md transition-shadow duration-300 flex flex-col">
                {/* You say */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <Mic className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-xs uppercase tracking-widest font-semibold text-navy/45">
                      You say
                    </span>
                  </div>
                  <p className="text-navy/80 text-[15px] md:text-base italic leading-relaxed pl-9">
                    {ex.youSay}
                  </p>
                </div>

                {/* Arrow separator */}
                <div className="flex items-center gap-2 pl-9 mb-4">
                  <ArrowRight className="w-3.5 h-3.5 text-navy/25" />
                  <div className="flex-1 h-px bg-navy/[0.08]" />
                </div>

                {/* VoiceLink does */}
                <div className="mt-auto">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-7 h-7 rounded-lg bg-navy flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-xs uppercase tracking-widest font-semibold text-navy/45">
                      VoiceLink does
                    </span>
                  </div>
                  <ul className="space-y-1.5 pl-9">
                    {ex.outcomes.map((o) => (
                      <li key={o} className="flex items-start gap-2 text-sm text-navy/70 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </ScrollAnimation>
          ))}
        </div>

        {/* ── Tips strip ── */}
        <ScrollAnimation>
          <div className="bg-navy rounded-3xl p-7 md:p-9 relative overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)',
              }}
              aria-hidden
            />
            <div className="relative">
              <p className="text-xs uppercase tracking-widest font-semibold text-white/50 mb-4">
                Quick tips
              </p>
              <ul className="grid md:grid-cols-3 gap-4 md:gap-6">
                {TIPS.map((tip, i) => (
                  <li key={tip} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 text-white/90 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-white/80 text-sm md:text-base leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
