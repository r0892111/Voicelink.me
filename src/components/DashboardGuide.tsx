import {
  BookOpen,
  Mic,
  Zap,
  ListChecks,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Brain,
  Eye,
  AlertTriangle,
  Wrench,
  Lightbulb,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

interface Step     { title: string; body: string }
interface Row      { goal: string; example: string }
interface Dialogue { situation: string; voicelink: string; you: string }
interface Issue    { problem: string; cause: string; fix: string }
interface Tip      { title: string; body: string }
interface Limit    { title: string; body: string }
interface RefItem  { label: string; body: string }

export function DashboardGuide() {
  const { t } = useI18n();

  const steps        = (t('userGuide.quickStart.steps',      { returnObjects: true }) as Step[])     ?? [];
  const cheatRows    = (t('userGuide.cheatSheet.rows',       { returnObjects: true }) as Row[])      ?? [];
  const dos          = (t('userGuide.tips.dos',              { returnObjects: true }) as Tip[])      ?? [];
  const donts        = (t('userGuide.tips.donts',            { returnObjects: true }) as Tip[])      ?? [];
  const confirms     = (t('userGuide.talkingBack.confirmations', { returnObjects: true }) as string[]) ?? [];
  const dialogues    = (t('userGuide.talkingBack.dialogues', { returnObjects: true }) as Dialogue[]) ?? [];
  const limits       = (t('userGuide.limits.items',          { returnObjects: true }) as Limit[])    ?? [];
  const troubleRows  = (t('userGuide.troubleshooting.rows',  { returnObjects: true }) as Issue[])    ?? [];
  const refCards     = (t('userGuide.reference.cards',       { returnObjects: true }) as RefItem[])  ?? [];

  return (
    <div className="max-w-4xl mx-auto px-6 pt-10 pb-16 font-instrument">
      {/* ── HEADER ── */}
      <header className="mb-10">
        <div className="flex items-center gap-2.5 text-navy/50 mb-2">
          <BookOpen className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">{t('userGuide.eyebrow')}</span>
        </div>
        <h1 className="font-general font-bold text-navy text-3xl sm:text-4xl tracking-tight mb-3">
          {t('userGuide.title')}
        </h1>
        <p className="text-navy/65 text-lg leading-relaxed max-w-2xl">
          {t('userGuide.intro')}
        </p>
      </header>

      {/* ── QUICK START ── */}
      <Section icon={Zap} eyebrow={t('userGuide.quickStart.eyebrow')} title={t('userGuide.quickStart.title')}>
        <div className="grid sm:grid-cols-3 gap-3 mb-5">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-5"
            >
              <div className="w-8 h-8 rounded-full bg-navy text-white text-sm font-bold font-general flex items-center justify-center mb-3">
                {i + 1}
              </div>
              <h3 className="font-general font-semibold text-navy text-base mb-1">{s.title}</h3>
              <p className="text-navy/60 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <Callout>
          <p className="text-navy/80 italic mb-2 text-[15px] leading-relaxed">
            {t('userGuide.quickStart.calloutQuote')}
          </p>
          <p className="text-navy/55 text-sm">
            {t('userGuide.quickStart.calloutSummaryPrefix')}{' '}
            <strong className="text-navy/80">{t('userGuide.quickStart.calloutSummaryBold')}</strong>{' '}
            {t('userGuide.quickStart.calloutSummarySuffix')}
          </p>
        </Callout>
      </Section>

      {/* ── CHEAT SHEET ── */}
      <Section icon={ListChecks} eyebrow={t('userGuide.cheatSheet.eyebrow')} title={t('userGuide.cheatSheet.title')}>
        <p className="text-navy/60 text-sm mb-5 leading-relaxed">
          {t('userGuide.cheatSheet.introPrefix')}{' '}
          <strong className="text-navy/80">{t('userGuide.cheatSheet.introBold')}</strong>
          {t('userGuide.cheatSheet.introSuffix')}
        </p>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[220px_1fr] gap-4 px-5 py-3 bg-navy/[0.03] border-b border-navy/[0.07]">
            <p className="text-xs uppercase tracking-widest font-semibold text-navy/45">{t('userGuide.cheatSheet.colGoal')}</p>
            <p className="text-xs uppercase tracking-widest font-semibold text-navy/45">{t('userGuide.cheatSheet.colSay')}</p>
          </div>
          <ul className="divide-y divide-navy/[0.05]">
            {cheatRows.map((r) => (
              <li key={r.goal} className="md:grid md:grid-cols-[220px_1fr] gap-4 px-5 py-3.5">
                <p className="font-general font-semibold text-navy text-sm mb-1 md:mb-0">{r.goal}</p>
                <p className="text-navy/65 text-sm italic leading-relaxed">{r.example}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ── TIPS ── */}
      <Section icon={Lightbulb} eyebrow={t('userGuide.tips.eyebrow')} title={t('userGuide.tips.title')}>
        <div className="grid md:grid-cols-2 gap-4">
          <TipColumn title={t('userGuide.tips.doLabel')}   items={dos}   icon={CheckCircle2} tone="positive" />
          <TipColumn title={t('userGuide.tips.dontLabel')} items={donts} icon={XCircle}      tone="negative" />
        </div>
      </Section>

      {/* ── TALKING BACK ── */}
      <Section icon={MessageSquare} eyebrow={t('userGuide.talkingBack.eyebrow')} title={t('userGuide.talkingBack.title')}>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-5 mb-4">
          <p className="text-xs uppercase tracking-widest font-semibold text-navy/45 mb-3">
            {t('userGuide.talkingBack.whenJustDoes')}
          </p>
          <div className="space-y-2 font-mono text-sm text-navy/75">
            {confirms.map((line) => (<p key={line}>{line}</p>))}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-navy/[0.03] border-b border-navy/[0.07]">
            <p className="text-xs uppercase tracking-widest font-semibold text-navy/45">
              {t('userGuide.talkingBack.whenNeedsToAsk')}
            </p>
          </div>
          <ul className="divide-y divide-navy/[0.05]">
            {dialogues.map((d) => (
              <li key={d.situation} className="px-5 py-4 space-y-2">
                <p className="font-general font-semibold text-navy text-sm">{d.situation}</p>
                <div className="pl-4 border-l-2 border-navy/15">
                  <p className="text-navy/60 text-sm italic mb-1.5">
                    <span className="text-navy/45 not-italic font-semibold mr-1">
                      {t('userGuide.talkingBack.voicelinkLabel')}
                    </span>
                    {d.voicelink}
                  </p>
                  <p className="text-navy/60 text-sm italic">
                    <span className="text-navy/45 not-italic font-semibold mr-1">
                      {t('userGuide.talkingBack.youLabel')}
                    </span>
                    {d.you}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-navy/55 text-sm mt-4 leading-relaxed">
          {t('userGuide.talkingBack.fuzzyMatchNote')}
        </p>
      </Section>

      {/* ── MEMORY ── */}
      <Section icon={Brain} eyebrow={t('userGuide.memory.eyebrow')} title={t('userGuide.memory.title')}>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-6 space-y-3 text-sm leading-relaxed">
          <p className="text-navy/70">
            <strong className="text-navy">{t('userGuide.memory.withinBold')}</strong>
            {t('userGuide.memory.withinRest')}
          </p>
          <p className="text-navy/70">
            <strong className="text-navy">{t('userGuide.memory.silentBold')}</strong>
            {t('userGuide.memory.silentRest')}
          </p>
          <p className="text-navy/70">
            <strong className="text-navy">{t('userGuide.memory.acrossBold')}</strong>
            {t('userGuide.memory.acrossRest')}
          </p>
        </div>
      </Section>

      {/* ── PREVIEW ── */}
      <Section icon={Eye} eyebrow={t('userGuide.preview.eyebrow')} title={t('userGuide.preview.title')}>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-6 space-y-3 text-sm leading-relaxed">
          <p className="text-navy/70">{t('userGuide.preview.intro')}</p>
          <div className="bg-navy/[0.04] rounded-xl px-4 py-3 text-navy/75 italic">
            {t('userGuide.preview.quote')}
          </div>
          <p className="text-navy/70">{t('userGuide.preview.planNote')}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-xl px-4 py-3 text-emerald-800 italic text-sm">
              {t('userGuide.preview.yes')}
            </div>
            <div className="bg-amber-50 rounded-xl px-4 py-3 text-amber-800 italic text-sm">
              {t('userGuide.preview.cancel')}
            </div>
          </div>
        </div>
      </Section>

      {/* ── LIMITS ── */}
      <Section icon={AlertTriangle} eyebrow={t('userGuide.limits.eyebrow')} title={t('userGuide.limits.title')}>
        <ul className="grid sm:grid-cols-2 gap-3">
          {limits.map((l) => (
            <li
              key={l.title}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-4 flex items-start gap-3"
            >
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-general font-semibold text-navy text-sm mb-0.5">{l.title}</p>
                <p className="text-navy/60 text-sm leading-relaxed">{l.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── TROUBLESHOOTING ── */}
      <Section icon={Wrench} eyebrow={t('userGuide.troubleshooting.eyebrow')} title={t('userGuide.troubleshooting.title')}>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_1fr_1.3fr] gap-4 px-5 py-3 bg-navy/[0.03] border-b border-navy/[0.07]">
            <p className="text-xs uppercase tracking-widest font-semibold text-navy/45">{t('userGuide.troubleshooting.colProblem')}</p>
            <p className="text-xs uppercase tracking-widest font-semibold text-navy/45">{t('userGuide.troubleshooting.colCause')}</p>
            <p className="text-xs uppercase tracking-widest font-semibold text-navy/45">{t('userGuide.troubleshooting.colFix')}</p>
          </div>
          <ul className="divide-y divide-navy/[0.05]">
            {troubleRows.map((r) => (
              <li key={r.problem} className="md:grid md:grid-cols-[1fr_1fr_1.3fr] gap-4 px-5 py-3.5 space-y-1 md:space-y-0">
                <p className="font-general font-semibold text-navy text-sm">{r.problem}</p>
                <p className="text-navy/55 text-sm">{r.cause}</p>
                <p className="text-navy/70 text-sm">{r.fix}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ── QUICK REFERENCE ── */}
      <Section icon={Mic} eyebrow={t('userGuide.reference.eyebrow')} title={t('userGuide.reference.title')}>
        <div className="grid sm:grid-cols-3 gap-3">
          {refCards.map((c) => (
            <RefCard key={c.label} label={c.label} body={c.body} />
          ))}
        </div>
      </Section>

      {/* ── SUPPORT ── */}
      <section className="bg-navy text-white rounded-2xl p-6 mb-4">
        <h3 className="font-general font-semibold text-lg mb-1.5">{t('userGuide.support.title')}</h3>
        <p className="text-white/75 text-sm mb-4 leading-relaxed">
          {t('userGuide.support.body')}
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href="mailto:alex@finitsolutions.be"
            className="inline-flex items-center gap-2 bg-white text-navy px-4 py-2 rounded-full font-semibold text-sm hover:bg-white/90 transition-colors"
          >
            <Mail className="w-4 h-4" />
            alex@finitsolutions.be
          </a>
          <a
            href="https://wa.me/32495702314"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-white/15 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {t('userGuide.support.whatsappLabel')}
          </a>
        </div>
      </section>

      <p className="text-xs text-navy/40 text-center">
        {t('userGuide.support.teamleaderPrefix')}{' '}
        <a
          href="https://help.teamleader.eu"
          target="_blank"
          rel="noopener noreferrer"
          className="text-navy/60 hover:text-navy underline"
        >
          {t('userGuide.support.teamleaderLinkText')}
        </a>
      </p>
    </div>
  );
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

interface SectionProps {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}

function Section({ icon: Icon, eyebrow, title, children }: SectionProps) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2.5 text-navy/50 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-widest font-semibold">{eyebrow}</span>
      </div>
      <h2 className="font-general font-bold text-navy text-2xl tracking-tight mb-5">{title}</h2>
      {children}
    </section>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-5">
      <div className="absolute left-0 top-5 bottom-5 w-[3px] bg-navy rounded-r-full" />
      {children}
    </div>
  );
}

function TipColumn({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string;
  items: Tip[];
  icon: React.ComponentType<{ className?: string }>;
  tone: 'positive' | 'negative';
}) {
  const toneClass = tone === 'positive' ? 'text-emerald-600' : 'text-red-500';
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-5 h-5 ${toneClass}`} />
        <h3 className="font-general font-semibold text-navy text-lg">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.title}>
            <p className="font-general font-semibold text-navy text-sm mb-0.5">{it.title}</p>
            <p className="text-navy/60 text-sm leading-relaxed">{it.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RefCard({ label, body }: { label: string; body: string }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-5">
      <p className="text-xs uppercase tracking-widest font-semibold text-navy/45 mb-2">{label}</p>
      <p className="text-navy/80 text-sm leading-relaxed">{body}</p>
    </div>
  );
}
