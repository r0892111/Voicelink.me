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

const QUICK_START = [
  {
    n: 1,
    title: 'Open WhatsApp',
    body: 'Chat with the VoiceLink number your admin gave you.',
  },
  {
    n: 2,
    title: 'Record a voice note',
    body: "Speak naturally — like you're dictating to a colleague.",
  },
  {
    n: 3,
    title: 'Send',
    body: 'Within a minute you get a reply confirming what was logged.',
  },
];

const CHEAT_SHEET: Array<{ goal: string; example: string }> = [
  { goal: 'Create a company',   example: '"Add a new company called Finit Solutions, VAT number BE0123456789"' },
  { goal: 'Create a contact',   example: '"Add Sarah Leclercq at Delta NV, she\'s the procurement manager"' },
  { goal: 'Create a deal',      example: '"Create a deal for Alpha Solutions — Website Redesign, 3-month project"' },
  { goal: 'Update a record',    example: '"Update Delta NV\'s website to delta.com"' },
  { goal: 'Log a past call',    example: '"I just called Marc for 15 minutes about the contract renewal"' },
  { goal: 'Log a past meeting', example: '"I had a meeting with Jan. We discussed pricing. He wants a discount."' },
  { goal: 'Schedule a meeting', example: '"Schedule a meeting with Jan and Marc next Tuesday at 14:00"' },
  { goal: 'Create a task',      example: '"Remind me to send the proposal to Jan next Friday — urgent"' },
  { goal: 'Complete a task',    example: '"Mark the demo prep as done"' },
  { goal: 'Create a quotation', example: '"Create an offerte for Alpha Solutions with the standard package"' },
  { goal: 'Register a payment', example: '"Mark invoice INV-2024-001 as paid"' },
  { goal: 'Find something',     example: '"Show me all deals for Delta NV"' },
  { goal: 'Mark deal won/lost', example: '"The SEO contract is won"' },
];

const DOS = [
  { title: 'Use real names', body: '"Delta NV", "Jan de Vos", "Website Redesign" — specific beats vague.' },
  { title: 'Add one distinguishing detail', body: '"Marc at Delta" is better than just "Marc" when a name could be ambiguous.' },
  { title: 'Speak naturally about dates', body: '"Next Friday", "tomorrow at 3", "end of the month" — all work.' },
  { title: 'Combine several actions', body: 'List multiple things in one voice note — VoiceLink figures out the order.' },
  { title: 'Mark urgent work', body: 'Say "urgent" or "ASAP" for high-priority tasks. Defaults to normal otherwise.' },
  { title: 'Use your own language', body: 'Dutch, English, French, German — VoiceLink replies in the same language.' },
];

const DONTS = [
  { title: 'Worry about keywords', body: 'There aren\'t any — speak the way you think.' },
  { title: 'Monologue for 5 minutes', body: 'Voice notes of 15–60 seconds work best.' },
  { title: 'Rely on pronouns across gaps', body: 'After ~10 minutes of silence, VoiceLink starts a new context.' },
  { title: 'Attach files', body: 'VoiceLink only reads voice and text — no images, PDFs, or attachments.' },
];

const DIALOGUES: Array<{ situation: string; voicelink: string; you: string }> = [
  { situation: 'Two matches (e.g., two Jans)', voicelink: '"I found Jan Voortman at Delta and Jan Hendrickx at Finit. Which one?"', you: '"Jan at Delta" or "the first one"' },
  { situation: 'Missing info',                 voicelink: '"What\'s Sarah\'s last name?"',                                          you: '"Leclercq"' },
  { situation: 'Duplicate risk',               voicelink: '"A contact named Jane Smith already exists. Update her instead?"',       you: '"Yes, update her" or "No, create new"' },
  { situation: 'VAT lookup confirm',           voicelink: '"BE0123… is registered as \'Finit Solutions NV\'. Correct?"',           you: '"Yes" / "No"' },
];

const LIMITS = [
  { title: 'Send emails', body: 'Quotations and invoices are prepared in Teamleader; you send them from there.' },
  { title: 'Attach files', body: 'PDFs, images, and contracts via WhatsApp aren\'t supported yet.' },
  { title: 'Schedule for later', body: '"Send this at 3pm" won\'t work — VoiceLink acts immediately.' },
  { title: 'Bulk edits', body: '30+ records in one message is blocked by a safety limit.' },
  { title: 'Undo automatically', body: 'But you can say "delete the task I just created" as a follow-up.' },
];

const TROUBLESHOOTING: Array<{ problem: string; cause: string; fix: string }> = [
  { problem: 'No reply after 2 minutes',        cause: 'Network or API hiccup',        fix: 'Resend the voice note, or contact support.' },
  { problem: 'Picked the wrong person',         cause: 'Name too common',              fix: 'Add a detail: "Jan at Delta", "Marc Peeters".' },
  { problem: 'Language switched mid-reply',     cause: 'Very short ambiguous input',   fix: 'Reply in your language — it locks in again.' },
  { problem: 'Custom field didn\'t update',     cause: 'Field name not recognised',    fix: 'Use the exact Teamleader label, or ask your admin.' },
  { problem: '"Contact already exists"',        cause: 'Duplicate-protection guard',   fix: 'Reply "update her" or "create new".' },
];

export function DashboardGuide() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-10 pb-16 font-instrument">
      {/* ── HEADER ── */}
      <header className="mb-10">
        <div className="flex items-center gap-2.5 text-navy/50 mb-2">
          <BookOpen className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">Help</span>
        </div>
        <h1 className="font-general font-bold text-navy text-3xl sm:text-4xl tracking-tight mb-3">
          VoiceLink user guide
        </h1>
        <p className="text-navy/65 text-lg leading-relaxed max-w-2xl">
          Send a WhatsApp voice note. VoiceLink logs it into your CRM for you — no forms,
          no clicking, no logging in. Here's how to get the most out of it.
        </p>
      </header>

      {/* ── 1. QUICK START ── */}
      <Section icon={Zap} eyebrow="Quick start" title="In 30 seconds">
        <div className="grid sm:grid-cols-3 gap-3 mb-5">
          {QUICK_START.map((s) => (
            <div
              key={s.n}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-5"
            >
              <div className="w-8 h-8 rounded-full bg-navy text-white text-sm font-bold font-general flex items-center justify-center mb-3">
                {s.n}
              </div>
              <h3 className="font-general font-semibold text-navy text-base mb-1">{s.title}</h3>
              <p className="text-navy/60 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <Callout>
          <p className="text-navy/80 italic mb-2 text-[15px] leading-relaxed">
            "I just met Jan at Delta NV. They want a 15% discount on the premium package.
            Create a follow-up task for next Friday, and add Sarah Leclercq — she's their
            new procurement manager."
          </p>
          <p className="text-navy/55 text-sm">
            That one message creates <strong className="text-navy/80">one meeting report,
            one deal update, one task, and one new contact</strong> — all linked correctly
            in Teamleader.
          </p>
        </Callout>
      </Section>

      {/* ── 2. CHEAT SHEET ── */}
      <Section icon={ListChecks} eyebrow="Cheat sheet" title="What you can do">
        <p className="text-navy/60 text-sm mb-5 leading-relaxed">
          VoiceLink handles <strong className="text-navy/80">16 CRM entity types</strong>.
          You don't need to memorise them — speak naturally and combine several in one
          message if you want.
        </p>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[220px_1fr] gap-4 px-5 py-3 bg-navy/[0.03] border-b border-navy/[0.07]">
            <p className="text-xs uppercase tracking-widest font-semibold text-navy/45">Goal</p>
            <p className="text-xs uppercase tracking-widest font-semibold text-navy/45">Say something like…</p>
          </div>
          <ul className="divide-y divide-navy/[0.05]">
            {CHEAT_SHEET.map(({ goal, example }) => (
              <li key={goal} className="md:grid md:grid-cols-[220px_1fr] gap-4 px-5 py-3.5">
                <p className="font-general font-semibold text-navy text-sm mb-1 md:mb-0">{goal}</p>
                <p className="text-navy/65 text-sm italic leading-relaxed">{example}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ── 3. TIPS ── */}
      <Section icon={Lightbulb} eyebrow="Tips" title="What works, what doesn't">
        <div className="grid md:grid-cols-2 gap-4">
          <TipColumn title="Do" items={DOS} icon={CheckCircle2} tone="positive" />
          <TipColumn title="Don't" items={DONTS} icon={XCircle} tone="negative" />
        </div>
      </Section>

      {/* ── 4. DIALOGUES ── */}
      <Section icon={MessageSquare} eyebrow="Talking back" title="How VoiceLink replies">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-5 mb-4">
          <p className="text-xs uppercase tracking-widest font-semibold text-navy/45 mb-3">When it just does the job</p>
          <div className="space-y-2 font-mono text-sm text-navy/75">
            <p>✅ Contact Sarah Leclercq created, linked to Delta NV</p>
            <p>✅ Task "Follow up with Jan" created — due Friday</p>
            <p>✅ Deal updated: premium package, 15% discount noted</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-navy/[0.03] border-b border-navy/[0.07]">
            <p className="text-xs uppercase tracking-widest font-semibold text-navy/45">
              When it needs to ask
            </p>
          </div>
          <ul className="divide-y divide-navy/[0.05]">
            {DIALOGUES.map(({ situation, voicelink, you }) => (
              <li key={situation} className="px-5 py-4 space-y-2">
                <p className="font-general font-semibold text-navy text-sm">{situation}</p>
                <div className="pl-4 border-l-2 border-navy/15">
                  <p className="text-navy/60 text-sm italic mb-1.5">
                    <span className="text-navy/45 not-italic font-semibold mr-1">VoiceLink:</span>
                    {voicelink}
                  </p>
                  <p className="text-navy/60 text-sm italic">
                    <span className="text-navy/45 not-italic font-semibold mr-1">You:</span>
                    {you}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-navy/55 text-sm mt-4 leading-relaxed">
          Small typos or speech-to-text mistakes? VoiceLink matches on sound and spelling,
          so <em>"Marc Pieters"</em> still finds <em>"Marc Peeters"</em> without asking.
        </p>
      </Section>

      {/* ── 5. MEMORY ── */}
      <Section icon={Brain} eyebrow="Context" title="Memory & follow-ups">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-6 space-y-3 text-sm leading-relaxed">
          <p className="text-navy/70">
            <strong className="text-navy">Within a conversation</strong> (~10 min active):
            VoiceLink remembers the last 5 exchanges. You can say <em>"her"</em>, <em>"that
            company"</em>, <em>"yes do it"</em> and it knows what you mean.
          </p>
          <p className="text-navy/70">
            <strong className="text-navy">After 10 minutes silent</strong>: the context
            resets. Name your entities explicitly in your next message.
          </p>
          <p className="text-navy/70">
            <strong className="text-navy">Across conversations</strong>: VoiceLink doesn't
            remember past chats — but your Teamleader data is, of course, persistent.
          </p>
        </div>
      </Section>

      {/* ── 6. PREVIEW ── */}
      <Section icon={Eye} eyebrow="Safety net" title="Preview before you execute">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-6 space-y-3 text-sm leading-relaxed">
          <p className="text-navy/70">Not sure what VoiceLink will do? Ask for a plan:</p>
          <div className="bg-navy/[0.04] rounded-xl px-4 py-3 text-navy/75 italic">
            "Show me what you would do, but don't execute yet."
          </div>
          <p className="text-navy/70">You'll get a plan with 📌 markers. Then:</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-xl px-4 py-3 text-emerald-800 italic text-sm">
              "Yes, do it."
            </div>
            <div className="bg-amber-50 rounded-xl px-4 py-3 text-amber-800 italic text-sm">
              "Cancel." or "Change X to Y first."
            </div>
          </div>
        </div>
      </Section>

      {/* ── 7. LIMITS ── */}
      <Section icon={AlertTriangle} eyebrow="Limits" title="What VoiceLink can't do (yet)">
        <ul className="grid sm:grid-cols-2 gap-3">
          {LIMITS.map((l) => (
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

      {/* ── 8. TROUBLESHOOTING ── */}
      <Section icon={Wrench} eyebrow="If something's off" title="Troubleshooting">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_1fr_1.3fr] gap-4 px-5 py-3 bg-navy/[0.03] border-b border-navy/[0.07]">
            <p className="text-xs uppercase tracking-widest font-semibold text-navy/45">Problem</p>
            <p className="text-xs uppercase tracking-widest font-semibold text-navy/45">Likely cause</p>
            <p className="text-xs uppercase tracking-widest font-semibold text-navy/45">Fix</p>
          </div>
          <ul className="divide-y divide-navy/[0.05]">
            {TROUBLESHOOTING.map((t) => (
              <li key={t.problem} className="md:grid md:grid-cols-[1fr_1fr_1.3fr] gap-4 px-5 py-3.5 space-y-1 md:space-y-0">
                <p className="font-general font-semibold text-navy text-sm">{t.problem}</p>
                <p className="text-navy/55 text-sm">{t.cause}</p>
                <p className="text-navy/70 text-sm">{t.fix}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ── 9. QUICK REFERENCE ── */}
      <Section icon={Mic} eyebrow="Remember this" title="Quick reference">
        <div className="grid sm:grid-cols-3 gap-3">
          <RefCard
            label="The one rule"
            body="Speak to VoiceLink the way you'd speak to a helpful colleague who has full access to Teamleader."
          />
          <RefCard
            label="The one trick"
            body="When in doubt, name things explicitly — the exact company, the exact person."
          />
          <RefCard
            label="The one limit"
            body='Voice notes execute immediately. Preview with "show me first" for a safety net.'
          />
        </div>
      </Section>

      {/* ── SUPPORT ── */}
      <section className="bg-navy text-white rounded-2xl p-6 mb-4">
        <h3 className="font-general font-semibold text-lg mb-1.5">Need a hand?</h3>
        <p className="text-white/75 text-sm mb-4 leading-relaxed">
          Email works best for feature requests and bug reports. Include the approximate
          time of the voice note so we can trace it in logs.
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
            Chat on WhatsApp
          </a>
        </div>
      </section>

      <p className="text-xs text-navy/40 text-center">
        Teamleader questions (not VoiceLink)?{' '}
        <a
          href="https://help.teamleader.eu"
          target="_blank"
          rel="noopener noreferrer"
          className="text-navy/60 hover:text-navy underline"
        >
          help.teamleader.eu
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
  items: Array<{ title: string; body: string }>;
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
