import { BookOpen, Mic, Send, RefreshCw, MessageCircle, Mail } from 'lucide-react';

const STEPS = [
  {
    icon: Mic,
    title: 'Record a voice note',
    body: 'Open WhatsApp and send a voice note to your VoiceLink number. Speak naturally — VoiceLink handles the rest.',
  },
  {
    icon: Send,
    title: 'Tag the contact (optional)',
    body: 'Mention the contact or deal name in your message. VoiceLink matches it to the right CRM record automatically.',
  },
  {
    icon: RefreshCw,
    title: 'See it in your CRM',
    body: 'Within seconds, the transcription, summary, and any next steps appear on the matching contact, deal, or task.',
  },
];

export function DashboardGuide() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-10 pb-16">
      <header className="mb-8">
        <div className="flex items-center gap-2.5 text-navy/50 mb-2">
          <BookOpen className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">Help</span>
        </div>
        <h1 className="font-general font-bold text-navy text-3xl tracking-tight">User guide</h1>
        <p className="text-navy/60 mt-1.5">
          Three steps to turn a WhatsApp voice note into a CRM update.
        </p>
      </header>

      <section className="space-y-3 mb-8">
        {STEPS.map(({ icon: Icon, title, body }, i) => (
          <div
            key={title}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] shadow-sm p-5 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-navy/[0.06] flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-navy/70" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-navy/40">STEP {i + 1}</span>
              </div>
              <h2 className="font-general font-semibold text-navy text-lg mb-1">{title}</h2>
              <p className="text-navy/65 text-sm leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-navy text-white rounded-2xl p-6">
        <h3 className="font-general font-semibold text-lg mb-1.5">Need a hand?</h3>
        <p className="text-white/75 text-sm mb-4">
          We're here to help you get the most out of VoiceLink.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href="mailto:support@voicelink.me"
            className="inline-flex items-center gap-2 bg-white text-navy px-4 py-2 rounded-full font-semibold text-sm hover:bg-white/90 transition-colors"
          >
            <Mail className="w-4 h-4" />
            support@voicelink.me
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

      <section className="mt-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-dashed border-navy/15 p-6">
        <p className="text-xs uppercase tracking-widest font-semibold text-navy/40 mb-2">Coming soon</p>
        <h3 className="font-general font-semibold text-navy text-lg mb-1">Video walkthroughs</h3>
        <p className="text-navy/60 text-sm">
          Short demo clips for each CRM integration are on the way.
        </p>
      </section>
    </div>
  );
}
