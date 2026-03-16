import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle, Play, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

import { useI18n } from '../hooks/useI18n';
import { trackCTAClick } from '../utils/analytics';
import { withUTM } from '../utils/utm';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { usePageTransition } from '../hooks/usePageTransition';
import { useIsCompactHero } from '../hooks/useBreakpoint';

const typewriterPhrases = [
  "to your CRM.",
  "We handle the data.",
  "Your CRM thinks.",
];

const TYPING_SPEED = 80;
const DELETING_SPEED = 40;
const PAUSE_DURATION = 2000;
const UNDERLINE_DURATION = 400;

const useTypewriter = (phrases: string[]) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [phase, setPhase] = useState<'typing' | 'drawing' | 'paused' | 'deleting'>('typing');
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];
    let timer: ReturnType<typeof setTimeout>;

    switch (phase) {
      case 'typing':
        if (displayedText.length < currentPhrase.length) {
          timer = setTimeout(() => {
            setDisplayedText(currentPhrase.slice(0, displayedText.length + 1));
          }, TYPING_SPEED);
        } else {
          // Fully typed — start drawing underline
          setIsDrawing(true);
          setPhase('drawing');
        }
        break;

      case 'drawing':
        timer = setTimeout(() => {
          setPhase('paused');
        }, UNDERLINE_DURATION);
        break;

      case 'paused':
        timer = setTimeout(() => {
          setIsDrawing(false);
          setPhase('deleting');
        }, PAUSE_DURATION);
        break;

      case 'deleting':
        if (displayedText.length > 0) {
          timer = setTimeout(() => {
            setDisplayedText((prev) => prev.slice(0, -1));
          }, DELETING_SPEED);
        } else {
          // Move to next phrase and start typing
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
          setPhase('typing');
        }
        break;
    }

    return () => clearTimeout(timer);
  }, [displayedText, phase, currentPhraseIndex, phrases]);

  return { displayedText, isDrawing, currentPhraseIndex };
};

/** Split text so the last word is wrapped for the underline SVG */
const TypewriterText: React.FC<{ text: string; isDrawing: boolean }> = ({ text, isDrawing }) => {
  // Find the last word boundary
  const trimmed = text.trimEnd();
  const lastSpaceIdx = trimmed.lastIndexOf(' ');
  const beforeLast = lastSpaceIdx >= 0 ? trimmed.slice(0, lastSpaceIdx + 1) : '';
  const lastWord = lastSpaceIdx >= 0 ? trimmed.slice(lastSpaceIdx + 1) : trimmed;

  return (
    <>
      {beforeLast}
      {lastWord && (
        <span className="relative inline-block">
          <span className="relative z-10">{lastWord}</span>
          <svg
            className="absolute -bottom-1 left-0 w-full h-[0.45em] z-0"
            viewBox="0 0 120 20"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 16Q50 6 118 10"
              stroke="#2D3A5C"
              strokeOpacity="0.22"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="1"
              style={{
                strokeDasharray: 1,
                strokeDashoffset: isDrawing ? 0 : 1,
                opacity: isDrawing ? 1 : 0,
                transition: isDrawing
                  ? 'stroke-dashoffset 400ms ease-out, opacity 0ms'
                  : 'opacity 0ms',
              }}
            />
          </svg>
        </span>
      )}
    </>
  );
};

/** Waveform bars + italic voice quote — shared across all cards */
/** Seeded pseudo-random for deterministic per-card waveforms */
const seededRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s & 0x7fffffff) / 0x7fffffff;
  };
};

const generateWaveform = (seed: number, barCount: number): number[] => {
  const rng = seededRandom(seed);
  const bars: number[] = [];
  // Create natural-looking envelope: ramp up, sustain, taper
  for (let i = 0; i < barCount; i++) {
    const pos = i / barCount;
    // Envelope: fade in first 15%, full middle, fade out last 20%
    const envelope =
      pos < 0.15 ? pos / 0.15 :
      pos > 0.8 ? (1 - pos) / 0.2 :
      1;
    const noise = 0.4 + rng() * 0.6; // 40-100% randomness
    bars.push(Math.max(10, Math.round(envelope * noise * 100)));
  }
  return bars;
};

// 8 unique waveforms — different seeds and bar counts for varied lengths
const cardWaveforms: { bars: number[] }[] = [
  { bars: generateWaveform(42, 58) },    // Card 1: ~190 chars — long
  { bars: generateWaveform(137, 30) },   // Card 2: ~95 chars — short
  { bars: generateWaveform(256, 42) },   // Card 3: ~130 chars — medium
  { bars: generateWaveform(891, 55) },   // Card 4: ~175 chars — medium-long
  { bars: generateWaveform(1024, 28) },  // Card 5: ~80 chars — short
  { bars: generateWaveform(777, 85) },   // Card 6: ~310 chars — very long (brain dump)
  { bars: generateWaveform(333, 50) },   // Card 7: ~160 chars — medium-long
  { bars: generateWaveform(999, 40) },   // Card 8: ~130 chars — medium
  { bars: generateWaveform(512, 42) },   // Card 9: ~130 chars — medium
];

/** Animated waveform bars (centered on horizontal axis) + italic voice quote */
const VoiceQuote: React.FC<{ text: string; compact?: boolean; waveformIndex?: number; hideArrow?: boolean }> = ({ text, compact, waveformIndex = 0, hideArrow }) => {
  const wf = cardWaveforms[waveformIndex % cardWaveforms.length];
  return (
    <div className={`${compact ? 'mb-4' : 'mb-5'}`}>
      <style>{`
        @keyframes wavePulse {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.5); }
        }
      `}</style>
      <div className="flex items-center gap-[1px] mb-2.5" style={{ height: 'clamp(12px, 1.2vw, 20px)' }}>
        {wf.bars.map((h, i) => (
          <div
            key={i}
            className="rounded-full bg-navy/35"
            style={{
              height: `${Math.max(h, 12)}%`,
              width: 'clamp(1.5px, 0.2vw, 3px)',
              flexShrink: 0,
              animation: `wavePulse ${1.2 + (i % 5) * 0.15}s ease-in-out ${(i * 0.07)}s infinite`,
            }}
          />
        ))}
      </div>
      <p
        className="italic text-slate-blue/70 leading-snug font-instrument"
        style={{ fontSize: 'clamp(11px, 1vw, 15px)' }}
      >
        "{text}"
      </p>
      {/* Voice → CRM arrow divider */}
      {!hideArrow && (
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 h-px bg-navy/[0.08]" />
          <svg
            style={{ width: 'clamp(14px, 1.1vw, 18px)', height: 'clamp(14px, 1.1vw, 18px)' }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            className="text-navy/25 flex-shrink-0"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
          <div className="flex-1 h-px bg-navy/[0.08]" />
        </div>
      )}
    </div>
  );
};

// Card text translations — only EN and NL; FR/DE fall back to EN
const cardStrings = {
  en: {
    // Card 1
    c1Title: 'New Contact & Info',
    c1Voice: "Just had coffee with Sarah Mitchell, she's the procurement manager at TechFlow Solutions. Her number is 0456 789 123, email sarah@techflow.be. Enterprise client, very promising.",
    c1JobTitle: 'Procurement Manager',
    c1Company: 'Company',
    c1Phone: 'Phone',
    c1Email: 'Email',
    c1TagHot: 'Hot Lead',
    c1TagEnterprise: 'Enterprise Client',
    c1Confirm: 'New contact and info added, linked to organization',
    // Card 2
    c2Title: 'Automatic Scheduling',
    c2Voice: 'Sarah Mitchell asked me to call her back Wednesday at 5pm to discuss the premium pricing package.',
    c2Header: 'Follow-up Scheduled',
    c2Days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as string[],
    c2Times: ['3 PM', '4 PM', '5 PM', '6 PM'] as string[],
    c2Event: '5:00 Call',
    c2EventSubject: 'Re: Premium pricing package',
    c2Confirm: 'Auto-added to calendar',
    c2NoTime: 'No time mentioned? VoiceLink checks your calendar for you.',
    // Card 3
    c3Title: 'Pipeline Updates',
    c3Voice: 'Great meeting with Jan de Vries at BuildPro. They want to go ahead with the 45K installation package. Moving to negotiation stage.',
    c3Header: 'Deal Pipeline',
    c3Columns: ['Lead', 'Proposal', 'Negotiation', 'Closed'] as string[],
    c3DealSummary: 'Installation package · €45K',
    c3Confirm: 'Deal stage updated automatically',
    // Card 4
    c4Title: 'Smart Action Extraction',
    c4Voice: 'Finished the site visit at Van Damme Construction. Everything looks good. Schedule the installation for March 15th, team of 4. And send them the final invoice by Friday.',
    c4Header: '3 Actions Extracted',
    c4Action1Title: 'Note added',
    c4Action1Desc: 'Site visit completed — approved',
    c4Action2Title: 'Task created',
    c4Action2Desc: 'Installation Mar 15 — 4 person team',
    c4Action3Title: 'Invoice task',
    c4Action3Desc: 'Send final invoice — Due Friday',
    c4Confirm: '3 actions created from 1 voice note',
    // Card 5
    c5Title: 'Quick Debrief',
    c5Voice: 'Pull up everything on Van Houten Industries, I have a meeting with them in an hour.',
    c5Brief1: "Here's your brief on ",
    c5Brief2: ':',
    c5BriefCompany: 'Van Houten Industries',
    c5Deal: '€62,000 — Proposal stage',
    c5DealLabel: 'Deal:',
    c5LastNoteLabel: 'Last note',
    c5LastNotePeriod: '(3 days ago):',
    c5LastNote: 'Site visit went well. Awaiting budget approval from their CFO. Decision expected this week.',
    c5TasksLabel: 'Open tasks:',
    c5Task1: '• Send revised proposal',
    c5Task2: '• Follow up on CFO approval',
    c5Goodbye: 'Good luck in there!',
    c5InputPlaceholder: 'Type a message',
    c5Timestamp: 'Just now',
    // Card 6
    c6Title: 'Smart Notes',
    c6Voice: "Okay so just left Janssen, they want to extend the pilot another two months, oh and they're worried about the API limits on the current plan. Also I bumped into Peter from CloudSync in the parking lot, apparently their CRM migration is completely stalled, might be worth reaching out, he seemed frustrated.",
    c6Note1Header: 'Janssen & Co',
    c6Note1Bullet1: 'Wants to extend pilot by 2 months',
    c6Note1Bullet2: 'Concerned about API limits on current plan',
    c6Note2Header: 'Peter · CloudSync',
    c6Note2Bullet1: 'CRM migration completely stalled',
    c6Note2Bullet2: 'Seemed frustrated — worth reaching out',
    c6Timestamp: 'just now',
    c6Confirm: 'Notes saved to the right contacts',
    // Card 7
    c7Title: 'Upsell Detection',
    c7Voice: "Sophie from MediTech loved the basic package. She asked about API access and whether we do custom integrations. Sounds like they're outgrowing their current setup.",
    c7Tag: 'Upsell detected',
    c7NoteHeader: 'Note',
    c7Bullet1: 'Loved the basic package',
    c7Bullet2: 'Asked about API access & custom integrations',
    c7Bullet3: 'Outgrowing current setup',
    c7CalToday: 'Today',
    c7CalTomorrow: 'Tomorrow',
    c7TaskTitle: 'Upsell follow-up',
    c7Confirm: 'Upsell opportunity logged to pipeline',
    // Card 8
    c8Title: 'Smart Handoff',
    c8Voice: "I'm handing off the DataFlow account to Emma. She'll take over the open deals and the meetings. Make sure she has everything.",
    c8Assignee: 'Assignee',
    c8From: 'You',
    c8Deals: '2 open deals reassigned',
    c8Meetings: '3 meetings moved',
    c8NoteHeader: 'Handoff Note',
    c8Bullet1: 'Onboarding in progress',
    c8Bullet2: 'API setup done, awaiting data migration',
    c8Confirm: 'Handoff completed',
    // Card 9
    c9Title: 'Quotes & Invoices',
    c9Soon: '',
    c9Voice: 'Lucas from GreenTech needs a quote for 50 solar panels, installation, and a 2-year maintenance contract. Deadline is end of month.',
    c9Status: 'Draft',
    c9To: 'To:',
    c9ColDesc: 'Description',
    c9ColQty: 'Qty',
    c9ColAmount: 'Amount',
    c9Item1: 'Solar Panel 400W',
    c9Item2: 'Installation Service',
    c9Item3: 'Maintenance (2yr)',
    c9Subtotal: 'Subtotal',
    c9Vat: 'VAT 21%',
    c9Total: 'Total',
    c9Due: 'Due: end of month',
    c9Send: 'Send',
  },
  nl: {
    // Card 1
    c1Title: 'Nieuw Contact & Info',
    c1Voice: 'Net koffie gedronken met Sarah Mitchell, ze is inkoopmanager bij TechFlow Solutions. Haar nummer is 0456 789 123, e-mail sarah@techflow.be. Enterprise klant, heel veelbelovend.',
    c1JobTitle: 'Inkoopmanager',
    c1Company: 'Bedrijf',
    c1Phone: 'Telefoon',
    c1Email: 'E-mail',
    c1TagHot: 'Hot Lead',
    c1TagEnterprise: 'Enterprise Klant',
    c1Confirm: 'Nieuw contact en info toegevoegd, gekoppeld aan organisatie',
    // Card 2
    c2Title: 'Automatische Planning',
    c2Voice: 'Sarah Mitchell vroeg me om haar woensdag om 17u terug te bellen om het premium pakket te bespreken.',
    c2Header: 'Opvolging Ingepland',
    c2Days: ['Ma', 'Di', 'Wo', 'Do', 'Vr'] as string[],
    c2Times: ['15:00', '16:00', '17:00', '18:00'] as string[],
    c2Event: '17:00 Bellen',
    c2EventSubject: 'Re: Premium pakket',
    c2Confirm: 'Automatisch toegevoegd aan agenda',
    c2NoTime: 'Geen tijd vermeld? VoiceLink checkt je agenda voor je.',
    // Card 3
    c3Title: 'Pipeline Updates',
    c3Voice: 'Goed gesprek met Jan de Vries bij BuildPro. Ze willen doorgaan met het installatiepakket van 45K. Verplaatsen naar onderhandelingsfase.',
    c3Header: 'Deal Pipeline',
    c3Columns: ['Lead', 'Voorstel', 'Onderhandeling', 'Gesloten'] as string[],
    c3DealSummary: 'Installatiepakket · €45K',
    c3Confirm: 'Deal-fase automatisch bijgewerkt',
    // Card 4
    c4Title: 'Slimme Actie-extractie',
    c4Voice: 'Plaatsbezoek bij Van Damme Construction afgerond. Alles ziet er goed uit. Plan de installatie in op 15 maart, team van 4. En stuur ze de eindfactuur voor vrijdag.',
    c4Header: '3 Acties Geëxtraheerd',
    c4Action1Title: 'Notitie toegevoegd',
    c4Action1Desc: 'Plaatsbezoek afgerond — goedgekeurd',
    c4Action2Title: 'Taak aangemaakt',
    c4Action2Desc: 'Installatie 15 mrt — team van 4',
    c4Action3Title: 'Factuurtaak',
    c4Action3Desc: 'Eindfactuur versturen — Deadline vrijdag',
    c4Confirm: '3 acties aangemaakt uit 1 spraakbericht',
    // Card 5
    c5Title: 'Snelle Briefing',
    c5Voice: 'Geef me alles over Van Houten Industries, ik heb over een uur een meeting met ze.',
    c5Brief1: 'Hier is je briefing over ',
    c5Brief2: ':',
    c5BriefCompany: 'Van Houten Industries',
    c5Deal: '€62.000 — Voorstel-fase',
    c5DealLabel: 'Deal:',
    c5LastNoteLabel: 'Laatste notitie',
    c5LastNotePeriod: '(3 dagen geleden):',
    c5LastNote: 'Plaatsbezoek ging goed. Wachten op budgetgoedkeuring van hun CFO. Beslissing verwacht deze week.',
    c5TasksLabel: 'Open taken:',
    c5Task1: '• Herzien voorstel versturen',
    c5Task2: '• Opvolgen CFO-goedkeuring',
    c5Goodbye: 'Succes!',
    c5InputPlaceholder: 'Typ een bericht',
    c5Timestamp: 'Zojuist',
    // Card 6
    c6Title: 'Dump je gedachten',
    c6Voice: 'Oké, net weg bij Janssen, ze willen de pilot nog twee maanden verlengen, oh en ze maken zich zorgen over de API-limieten van het huidige plan. Trouwens, ik kwam Peter van CloudSync tegen op de parking, blijkbaar is hun CRM-migratie helemaal vastgelopen, misschien de moeite om contact op te nemen, hij leek gefrustreerd.',
    c6Note1Header: 'Janssen & Co',
    c6Note1Bullet1: 'Wil pilot met 2 maanden verlengen',
    c6Note1Bullet2: 'Bezorgd over API-limieten op huidig plan',
    c6Note2Header: 'Peter · CloudSync',
    c6Note2Bullet1: 'CRM-migratie volledig vastgelopen',
    c6Note2Bullet2: 'Leek gefrustreerd — de moeite om contact op te nemen',
    c6Timestamp: 'zojuist',
    c6Confirm: 'Notities opgeslagen bij de juiste contacten',
    // Card 7
    c7Title: 'Upsell Detectie',
    c7Voice: 'Sophie van MediTech was enthousiast over het basispakket. Ze vroeg naar API-toegang en of we custom integraties doen. Klinkt alsof ze uit hun huidige setup aan het groeien zijn.',
    c7Tag: 'Upsell gedetecteerd',
    c7NoteHeader: 'Notitie',
    c7Bullet1: 'Enthousiast over het basispakket',
    c7Bullet2: 'Vroeg naar API-toegang & custom integraties',
    c7Bullet3: 'Groeit uit huidige setup',
    c7CalToday: 'Vandaag',
    c7CalTomorrow: 'Morgen',
    c7TaskTitle: 'Upsell opvolging',
    c7Confirm: 'Upsell-kans gelogd in pipeline',
    // Card 8
    c8Title: 'Slimme Overdracht',
    c8Voice: 'Ik draag het DataFlow-account over aan Emma. Zij neemt de openstaande deals en meetings over. Zorg dat ze alles heeft.',
    c8Assignee: 'Toegewezen aan',
    c8From: 'Jij',
    c8Deals: '2 openstaande deals overgedragen',
    c8Meetings: '3 meetings verplaatst',
    c8NoteHeader: 'Overdrachtsnotitie',
    c8Bullet1: 'Onboarding bezig',
    c8Bullet2: 'API-setup klaar, wacht op datamigratie',
    c8Confirm: 'Overdracht voltooid',
    // Card 9
    c9Title: 'Offertes & Facturen',
    c9Soon: '',
    c9Voice: 'Lucas van GreenTech heeft een offerte nodig voor 50 zonnepanelen, installatie en een onderhoudscontract van 2 jaar. Deadline is einde van de maand.',
    c9Status: 'Concept',
    c9To: 'Aan:',
    c9ColDesc: 'Omschrijving',
    c9ColQty: 'Aantal',
    c9ColAmount: 'Bedrag',
    c9Item1: 'Zonnepaneel 400W',
    c9Item2: 'Installatieservice',
    c9Item3: 'Onderhoud (2 jr)',
    c9Subtotal: 'Subtotaal',
    c9Vat: 'BTW 21%',
    c9Total: 'Totaal',
    c9Due: 'Deadline: einde maand',
    c9Send: 'Verzenden',
  },
} as const;

type CardLocale = 'en' | 'nl';

const getCardLocale = (lang: string): CardLocale => {
  if (lang === 'nl') return 'nl';
  return 'en'; // en, fr, de all fall back to English
};

const CardContent: React.FC<{ cardBase: string; locale?: CardLocale }> = ({ cardBase, locale = 'en' }) => {
  const s = cardStrings[locale];
  return (
  <>
    {/* Card 1: New Contact Created */}
    <div className={cardBase}>
      <div className="absolute left-[clamp(1rem,1.4vw,2rem)] top-0 -translate-y-1/2">
        <span className="font-general font-bold text-navy tracking-tight" style={{ fontSize: 'clamp(22px, 2vw, 30px)' }}>{s.c1Title}</span>
      </div>
      <VoiceQuote text={s.c1Voice} waveformIndex={0} />
      {/* CRM record header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="rounded-full bg-navy/10 flex items-center justify-center text-navy font-semibold flex-shrink-0"
            style={{
              width: 'clamp(1.75rem, 2.2vw, 2.5rem)',
              height: 'clamp(1.75rem, 2.2vw, 2.5rem)',
              fontSize: 'clamp(10px, 0.8vw, 13px)',
            }}
          >
            SM
          </div>
          <div>
            <h4 className="font-semibold text-navy leading-tight" style={{ fontSize: 'clamp(14px, 1.15vw, 18px)' }}>Sarah Mitchell</h4>
            <div className="text-slate-blue/70" style={{ fontSize: 'clamp(11px, 0.85vw, 14px)' }}>{s.c1JobTitle}</div>
          </div>
        </div>
      </div>
      {/* CRM fields with labels */}
      <div className="rounded-xl bg-navy/[0.03] border border-navy/[0.06] divide-y divide-navy/[0.06]">
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          {/* Storefront icon — clean, simple */}
          <svg style={{ width: 'clamp(16px, 1.3vw, 22px)', height: 'clamp(16px, 1.3vw, 22px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/40 flex-shrink-0">
            <path d="M3 9l1.5-5h15L21 9" /><path d="M3 9h18v12H3V9z" /><path d="M9 21V14h6v7" />
          </svg>
          <div className="min-w-0">
            <div className="text-slate-blue/50 uppercase tracking-wider" style={{ fontSize: 'clamp(10px, 0.65vw, 10px)' }}>{s.c1Company}</div>
            <div className="font-medium text-navy truncate" style={{ fontSize: 'clamp(12px, 1vw, 15px)' }}>TechFlow Solutions</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          {/* Phone icon */}
          <svg style={{ width: 'clamp(16px, 1.3vw, 22px)', height: 'clamp(16px, 1.3vw, 22px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/40 flex-shrink-0">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
          <div className="min-w-0">
            <div className="text-slate-blue/50 uppercase tracking-wider" style={{ fontSize: 'clamp(10px, 0.65vw, 10px)' }}>{s.c1Phone}</div>
            <div className="text-navy" style={{ fontSize: 'clamp(12px, 1vw, 15px)' }}>+32 456 789 123</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          {/* Envelope icon */}
          <svg style={{ width: 'clamp(16px, 1.3vw, 22px)', height: 'clamp(16px, 1.3vw, 22px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/40 flex-shrink-0">
            <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" />
          </svg>
          <div className="min-w-0">
            <div className="text-slate-blue/50 uppercase tracking-wider" style={{ fontSize: 'clamp(10px, 0.65vw, 10px)' }}>{s.c1Email}</div>
            <div className="text-navy/80 truncate" style={{ fontSize: 'clamp(12px, 1vw, 15px)' }}>sarah@techflow.be</div>
          </div>
        </div>
      </div>
      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <div
          className="px-2.5 py-0.5 rounded-full bg-navy text-white font-medium"
          style={{ fontSize: 'clamp(10px, 0.75vw, 11px)' }}
        >
          {s.c1TagHot}
        </div>
        <div
          className="px-2.5 py-0.5 rounded-full bg-glow-blue/20 text-navy/80 font-medium"
          style={{ fontSize: 'clamp(10px, 0.75vw, 11px)' }}
        >
          {s.c1TagEnterprise}
        </div>
      </div>
      {/* Confirmation */}
      <div
        className="mt-3 flex items-center gap-1.5 text-emerald-600"
        style={{ fontSize: 'clamp(11px, 0.85vw, 13px)' }}
      >
        <svg style={{ width: 'clamp(12px, 0.95vw, 16px)', height: 'clamp(12px, 0.95vw, 16px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {s.c1Confirm}
      </div>
    </div>

    {/* Card 2: Follow-up Scheduled */}
    <div className={cardBase}>
      <div className="absolute left-[clamp(1rem,1.4vw,2rem)] top-0 -translate-y-1/2">
        <span className="font-general font-bold text-navy tracking-tight" style={{ fontSize: 'clamp(22px, 2vw, 30px)' }}>{s.c2Title}</span>
      </div>
      <VoiceQuote text={s.c2Voice} compact waveformIndex={1} hideArrow />
      {/* Curly arrow + calendar wrapper */}
      <div className="relative">
        {/* CRM header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Calendar-check icon */}
            <svg style={{ width: 'clamp(16px, 1.2vw, 20px)', height: 'clamp(16px, 1.2vw, 20px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/60">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><polyline points="9 16 11 18 15 14" />
            </svg>
            <span className="font-semibold text-navy" style={{ fontSize: 'clamp(13px, 1.05vw, 16px)' }}>{s.c2Header}</span>
          </div>
        </div>

        {/* Mini Google Calendar-style week view */}
        <div className="rounded-xl bg-navy/[0.03] border border-navy/[0.06] overflow-hidden">
          {/* Day header row */}
          <div className="grid border-b border-navy/[0.06]" style={{ gridTemplateColumns: 'clamp(28px, 2.5vw, 40px) repeat(5, 1fr)' }}>
            <div /> {/* empty corner for time axis */}
            {s.c2Days.map((day, idx) => (
              <div
                key={day}
                className={`text-center py-1.5 border-l border-navy/[0.06] ${idx === 2 ? 'font-semibold text-navy' : 'text-slate-blue/50'}`}
                style={{ fontSize: 'clamp(10px, 0.75vw, 12px)' }}
              >
                {day}
              </div>
            ))}
          </div>
          {/* Time slots: 3pm - 6pm */}
          {s.c2Times.map((time, rowIdx) => (
            <div
              key={time}
              className={`grid ${rowIdx < 3 ? 'border-b border-navy/[0.06]' : ''}`}
              style={{
                gridTemplateColumns: 'clamp(28px, 2.5vw, 40px) repeat(5, 1fr)',
                height: 'clamp(24px, 2vw, 34px)',
              }}
            >
              {/* Time label */}
              <div
                className="flex items-start justify-end pr-1.5 pt-0.5 text-slate-blue/40 border-r border-navy/[0.06]"
                style={{ fontSize: 'clamp(7px, 0.6vw, 10px)' }}
              >
                {time}
              </div>
              {/* Day columns */}
              {[0, 1, 2, 3, 4].map((colIdx) => (
                <div
                  key={colIdx}
                  className={`relative ${colIdx < 4 ? 'border-r border-navy/[0.04]' : ''}`}
                >
                  {/* Event block on Wednesday (col 2), 5 PM (row 2) */}
                  {colIdx === 2 && rowIdx === 2 && (
                    <div
                      className="absolute inset-x-0.5 top-0 bottom-0 rounded bg-navy text-white flex items-center justify-center overflow-hidden"
                      style={{ fontSize: 'clamp(7px, 0.6vw, 10px)', zIndex: 1 }}
                    >
                      <span className="truncate px-0.5 font-medium">{s.c2Event}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Event detail below calendar */}
        <div className="mt-3 flex items-center gap-2.5 p-2.5 rounded-lg bg-glow-blue/15 border border-glow-blue/25">
          <div
            className="rounded-full bg-navy/10 flex items-center justify-center text-navy font-semibold flex-shrink-0"
            style={{
              width: 'clamp(1.5rem, 1.8vw, 2rem)',
              height: 'clamp(1.5rem, 1.8vw, 2rem)',
              fontSize: 'clamp(10px, 0.65vw, 11px)',
            }}
          >
            SM
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-navy truncate" style={{ fontSize: 'clamp(12px, 0.95vw, 15px)' }}>Sarah Mitchell</div>
            <div className="text-slate-blue/60" style={{ fontSize: 'clamp(10px, 0.8vw, 13px)' }}>{s.c2EventSubject}</div>
          </div>
          <svg
            className="flex-shrink-0 text-navy/30"
            style={{ width: 'clamp(14px, 1.1vw, 18px)', height: 'clamp(14px, 1.1vw, 18px)' }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        {/* Auto-added confirmation */}
        <div
          className="mt-2.5 flex items-center gap-1.5 text-emerald-600"
          style={{ fontSize: 'clamp(11px, 0.85vw, 13px)' }}
        >
          <svg style={{ width: 'clamp(12px, 0.95vw, 16px)', height: 'clamp(12px, 0.95vw, 16px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {s.c2Confirm}
        </div>
        <div
          className="mt-1.5 flex items-center gap-1.5 text-slate-blue/40 italic"
          style={{ fontSize: 'clamp(10px, 0.75vw, 12px)' }}
        >
          <svg style={{ width: 'clamp(10px, 0.8vw, 13px)', height: 'clamp(10px, 0.8vw, 13px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          {s.c2NoTime}
        </div>
      </div>
    </div>

    {/* Card 3: Deal Updated — Mini Kanban */}
    <div className={cardBase}>
      <div className="absolute left-[clamp(1rem,1.4vw,2rem)] top-0 -translate-y-1/2">
        <span className="font-general font-bold text-navy tracking-tight" style={{ fontSize: 'clamp(22px, 2vw, 30px)' }}>{s.c3Title}</span>
      </div>
      <style>{`
        @keyframes kanbanSlide {
          0% { opacity: 0; transform: translateX(-100%); }
          40% { opacity: 1; transform: translateX(8%); }
          55% { transform: translateX(-2%); }
          70% { transform: translateX(1%); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes ghostFadeIn {
          0%, 30% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
      <VoiceQuote text={s.c3Voice} compact waveformIndex={2} />

      {/* CRM header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Pipeline/kanban icon */}
          <svg style={{ width: 'clamp(16px, 1.2vw, 20px)', height: 'clamp(16px, 1.2vw, 20px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/60">
            <rect x="3" y="3" width="5" height="14" rx="1" /><rect x="10" y="3" width="5" height="10" rx="1" /><rect x="17" y="3" width="5" height="18" rx="1" />
          </svg>
          <span className="font-semibold text-navy" style={{ fontSize: 'clamp(13px, 1.05vw, 16px)' }}>{s.c3Header}</span>
        </div>
      </div>

      {/* Mini Kanban Board */}
      <div className="rounded-xl bg-navy/[0.03] border border-navy/[0.06] overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-4 border-b border-navy/[0.06]">
          {s.c3Columns.map((col, i) => (
            <div
              key={col}
              className={`text-center py-1.5 ${i < 3 ? 'border-r border-navy/[0.06]' : ''} ${
                i === 2 ? 'font-semibold text-navy bg-navy/[0.05]' : 'text-slate-blue/50'
              }`}
              style={{ fontSize: 'clamp(10px, 0.7vw, 11px)' }}
            >
              {col}
            </div>
          ))}
        </div>

        {/* Column bodies — the kanban lanes */}
        <div className="grid grid-cols-4 relative" style={{ minHeight: 'clamp(90px, 8vw, 140px)' }}>
          {/* Col 1: Lead — empty */}
          <div className="border-r border-navy/[0.06] p-1.5" />

          {/* Col 2: Proposal — ghost outline (where it was) */}
          <div className="border-r border-navy/[0.06] p-1.5 flex items-center">
            <div className="flex-1">
              <div
                className="rounded-lg border-2 border-dashed border-navy/[0.12] p-2 flex flex-col items-center justify-center"
                style={{ animation: 'ghostFadeIn 1s ease-out 0.5s both', minHeight: 'clamp(60px, 5.5vw, 95px)' }}
              >
                <div className="text-navy/20 font-medium truncate w-full text-center" style={{ fontSize: 'clamp(10px, 0.7vw, 11px)' }}>
                  BuildPro
                </div>
              </div>
            </div>
            {/* Simple arrow between columns */}
            <div className="flex-shrink-0 -mr-2.5 relative z-10" style={{ animation: 'ghostFadeIn 1s ease-out 0.7s both' }}>
              <svg
                style={{ width: 'clamp(14px, 1.2vw, 20px)', height: 'clamp(14px, 1.2vw, 20px)' }}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                className="text-navy/25"
              >
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>

          {/* Col 3: Negotiation — deal card lives here */}
          <div className="border-r border-navy/[0.06] p-1.5 bg-navy/[0.04]">
            <div
              className="rounded-lg bg-white border border-navy/[0.12] shadow-sm p-2 relative"
              style={{ animation: 'kanbanSlide 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both' }}
            >
              {/* Deal mini card */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <div
                  className="rounded bg-navy/10 flex items-center justify-center flex-shrink-0"
                  style={{ width: 'clamp(16px, 1.3vw, 22px)', height: 'clamp(16px, 1.3vw, 22px)' }}
                >
                  <svg style={{ width: 'clamp(10px, 0.8vw, 13px)', height: 'clamp(10px, 0.8vw, 13px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-navy">
                    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                  </svg>
                </div>
                <span className="font-semibold text-navy truncate" style={{ fontSize: 'clamp(10px, 0.8vw, 12px)' }}>BuildPro</span>
              </div>
              <div className="font-bold text-navy" style={{ fontSize: 'clamp(12px, 1.05vw, 16px)' }}>€45,000</div>
              <div className="flex items-center gap-1 mt-1">
                <div
                  className="rounded-full bg-navy/10 flex items-center justify-center text-navy flex-shrink-0"
                  style={{
                    width: 'clamp(14px, 1.1vw, 18px)',
                    height: 'clamp(14px, 1.1vw, 18px)',
                    fontSize: 'clamp(6px, 0.5vw, 8px)',
                    fontWeight: 600,
                  }}
                >
                  JV
                </div>
                <span className="text-slate-blue/70 truncate" style={{ fontSize: 'clamp(10px, 0.65vw, 10px)' }}>Jan de Vries</span>
              </div>
            </div>
          </div>

          {/* Col 4: Closed — empty */}
          <div className="p-1.5" />
        </div>
      </div>

      {/* Deal summary strip below kanban */}
      <div className="mt-3 flex items-center gap-2.5 p-2.5 rounded-lg bg-glow-blue/15 border border-glow-blue/25">
        <div
          className="rounded-full bg-navy/10 flex items-center justify-center text-navy font-semibold flex-shrink-0"
          style={{
            width: 'clamp(1.5rem, 1.8vw, 2rem)',
            height: 'clamp(1.5rem, 1.8vw, 2rem)',
            fontSize: 'clamp(10px, 0.65vw, 11px)',
          }}
        >
          JV
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-navy truncate" style={{ fontSize: 'clamp(12px, 0.95vw, 15px)' }}>Jan de Vries · BuildPro</div>
          <div className="text-slate-blue/60" style={{ fontSize: 'clamp(10px, 0.8vw, 13px)' }}>{s.c3DealSummary}</div>
        </div>
        {/* Trending up icon */}
        <svg
          className="flex-shrink-0 text-green-500"
          style={{ width: 'clamp(14px, 1.1vw, 18px)', height: 'clamp(14px, 1.1vw, 18px)' }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
        </svg>
      </div>

      {/* Auto-update confirmation */}
      <div
        className="mt-2.5 flex items-center gap-1.5 text-emerald-600"
        style={{ fontSize: 'clamp(11px, 0.85vw, 13px)' }}
      >
        <svg style={{ width: 'clamp(12px, 0.95vw, 16px)', height: 'clamp(12px, 0.95vw, 16px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {s.c3Confirm}
      </div>
    </div>

    {/* Card 4: Multiple Actions from One Message — Branching Tree */}
    <div className={cardBase}>
      <div className="absolute left-[clamp(1rem,1.4vw,2rem)] top-0 -translate-y-1/2">
        <span className="font-general font-bold text-navy tracking-tight" style={{ fontSize: 'clamp(22px, 2vw, 30px)' }}>{s.c4Title}</span>
      </div>
      <VoiceQuote text={s.c4Voice} waveformIndex={3} />

      {/* CRM header */}
      <div className="flex items-center gap-2 mb-3">
        <svg style={{ width: 'clamp(16px, 1.2vw, 20px)', height: 'clamp(16px, 1.2vw, 20px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/60">
          <path d="M6 3v12" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 01-9 9" />
        </svg>
        <span className="font-semibold text-navy" style={{ fontSize: 'clamp(13px, 1.05vw, 16px)' }}>{s.c4Header}</span>
      </div>

      {/* Branching tree layout */}
      <div className="relative">
        {/* Vertical trunk + branch lines */}
        <svg
          className="absolute pointer-events-none"
          style={{ left: 'clamp(11px, 0.95vw, 15px)', top: 0, width: 'clamp(20px, 1.6vw, 28px)', height: '100%', zIndex: 1, overflow: 'visible' }}
          preserveAspectRatio="none"
        >
          {/* Main trunk line */}
          <line x1="0" y1="0" x2="0" y2="100%" stroke="#1A2D63" strokeOpacity="0.12" strokeWidth="1.5" />
          {/* Branch arms — horizontal stubs at each action */}
          <line x1="0" y1="24" x2="100%" y2="24" stroke="#1A2D63" strokeOpacity="0.12" strokeWidth="1.5" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#1A2D63" strokeOpacity="0.12" strokeWidth="1.5" />
          <line x1="0" y1="calc(100% - 24px)" x2="100%" y2="calc(100% - 24px)" stroke="#1A2D63" strokeOpacity="0.12" strokeWidth="1.5" />
        </svg>

        <div className="space-y-2" style={{ paddingLeft: 'clamp(36px, 3vw, 50px)' }}>
          {/* Action 1: Note — navy */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-navy/[0.06] border-l-[3px] border-l-navy">
            <div
              className="rounded bg-navy/15 flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ width: 'clamp(22px, 1.8vw, 30px)', height: 'clamp(22px, 1.8vw, 30px)' }}
            >
              <svg style={{ width: 'clamp(13px, 1vw, 17px)', height: 'clamp(13px, 1vw, 17px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-navy" style={{ fontSize: 'clamp(12px, 1vw, 15px)' }}>{s.c4Action1Title}</div>
              <div className="text-slate-blue/70" style={{ fontSize: 'clamp(11px, 0.9vw, 14px)' }}>{s.c4Action1Desc}</div>
            </div>
            <svg className="flex-shrink-0 text-emerald-500 mt-1" style={{ width: 'clamp(14px, 1.1vw, 18px)', height: 'clamp(14px, 1.1vw, 18px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* Action 2: Task — slate-blue */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-blue/[0.06] border-l-[3px] border-l-slate-blue">
            <div
              className="rounded bg-slate-blue/15 flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ width: 'clamp(22px, 1.8vw, 30px)', height: 'clamp(22px, 1.8vw, 30px)' }}
            >
              <svg style={{ width: 'clamp(13px, 1vw, 17px)', height: 'clamp(13px, 1vw, 17px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-blue">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-navy" style={{ fontSize: 'clamp(12px, 1vw, 15px)' }}>{s.c4Action2Title}</div>
              <div className="text-slate-blue/70" style={{ fontSize: 'clamp(11px, 0.9vw, 14px)' }}>{s.c4Action2Desc}</div>
            </div>
            <svg className="flex-shrink-0 text-emerald-500 mt-1" style={{ width: 'clamp(14px, 1.1vw, 18px)', height: 'clamp(14px, 1.1vw, 18px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* Action 3: Invoice — glow-blue */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-glow-blue/[0.15] border-l-[3px] border-l-glow-blue">
            <div
              className="rounded bg-glow-blue/25 flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ width: 'clamp(22px, 1.8vw, 30px)', height: 'clamp(22px, 1.8vw, 30px)' }}
            >
              <svg style={{ width: 'clamp(13px, 1vw, 17px)', height: 'clamp(13px, 1vw, 17px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/60">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-navy" style={{ fontSize: 'clamp(12px, 1vw, 15px)' }}>{s.c4Action3Title}</div>
              <div className="text-slate-blue/70" style={{ fontSize: 'clamp(11px, 0.9vw, 14px)' }}>{s.c4Action3Desc}</div>
            </div>
            <svg className="flex-shrink-0 text-emerald-500 mt-1" style={{ width: 'clamp(14px, 1.1vw, 18px)', height: 'clamp(14px, 1.1vw, 18px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      </div>

      {/* Confirmation */}
      <div
        className="mt-3 flex items-center gap-1.5 text-emerald-600"
        style={{ fontSize: 'clamp(11px, 0.85vw, 13px)' }}
      >
        <svg style={{ width: 'clamp(12px, 0.95vw, 16px)', height: 'clamp(12px, 0.95vw, 16px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {s.c4Confirm}
      </div>
    </div>

    {/* Card 5: Meeting Prep Brief — Chat-style response */}
    <div className={cardBase}>
      <div className="absolute left-[clamp(1rem,1.4vw,2rem)] top-0 -translate-y-1/2">
        <span className="font-general font-bold text-navy tracking-tight" style={{ fontSize: 'clamp(22px, 2vw, 30px)' }}>{s.c5Title}</span>
      </div>
      <VoiceQuote text={s.c5Voice} compact waveformIndex={4} />

      {/* VoiceLink reply — WhatsApp-style chat message */}
      <div className="flex gap-2">
        {/* Avatar */}
        <div
          className="rounded-full bg-navy flex items-center justify-center flex-shrink-0 self-end mb-5 overflow-hidden"
          style={{
            width: 'clamp(1.5rem, 1.8vw, 2rem)',
            height: 'clamp(1.5rem, 1.8vw, 2rem)',
            padding: 'clamp(4px, 0.35vw, 6px)',
          }}
        >
          <img src="/Finit Icon White.svg" alt="VoiceLink" className="w-full h-full object-contain" draggable={false} />
        </div>

        {/* Message bubble with tail */}
        <div className="flex-1 min-w-0">
          <div className="relative" style={{ marginLeft: 0 }}>
            {/* WhatsApp-style tail — bottom left, right edge flush with bubble edge */}
            <svg
              className="absolute bottom-0"
              style={{
                right: '100%',
                width: 'clamp(10px, 0.8vw, 14px)',
                height: 'clamp(20px, 1.6vw, 28px)',
              }}
              viewBox="0 0 16 28"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M16 0 L16 28 L0 28 C6 28 12 24 14 18 C15.5 13 16 8 16 0 Z"
                fill="rgba(26,45,99,0.06)"
              />
            </svg>
            <div className="rounded-2xl rounded-bl-none bg-navy/[0.06] px-3 py-2.5 text-navy leading-relaxed" style={{ fontSize: 'clamp(11px, 0.9vw, 14px)' }}>
              <p className="mb-2">{s.c5Brief1}<span className="font-semibold">{s.c5BriefCompany}</span>{s.c5Brief2}</p>
              <p className="mb-2">
                <span className="font-semibold">{s.c5DealLabel}</span> {s.c5Deal}
              </p>
              <p className="mb-2">
                <span className="font-semibold">{s.c5LastNoteLabel}</span> {s.c5LastNotePeriod}<br />
                {s.c5LastNote}
              </p>
              <p className="mb-2">
                <span className="font-semibold">{s.c5TasksLabel}</span><br />
                {s.c5Task1}<br />
                {s.c5Task2}
              </p>
              <p>{s.c5Goodbye}</p>
            </div>
          </div>
          <div className="text-slate-blue/40 mt-1 ml-1" style={{ fontSize: 'clamp(10px, 0.65vw, 10px)' }}>{s.c5Timestamp}</div>
        </div>
      </div>

      {/* WhatsApp-style message input bar */}
      <div className="mt-3 flex items-center gap-2">
        <div
          className="flex-1 flex items-center gap-2 rounded-full bg-navy/[0.04] border border-navy/[0.08] px-3"
          style={{ height: 'clamp(30px, 2.5vw, 40px)' }}
        >
          {/* Emoji icon */}
          <svg style={{ width: 'clamp(14px, 1.1vw, 18px)', height: 'clamp(14px, 1.1vw, 18px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/25 flex-shrink-0">
            <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
          <span className="text-navy/25 flex-1" style={{ fontSize: 'clamp(10px, 0.85vw, 13px)' }}>{s.c5InputPlaceholder}</span>
          {/* Attachment icon */}
          <svg style={{ width: 'clamp(14px, 1.1vw, 18px)', height: 'clamp(14px, 1.1vw, 18px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/25 flex-shrink-0">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
        </div>
        {/* Mic button */}
        <div
          className="rounded-full bg-navy/[0.06] flex items-center justify-center flex-shrink-0"
          style={{
            width: 'clamp(30px, 2.5vw, 40px)',
            height: 'clamp(30px, 2.5vw, 40px)',
          }}
        >
          <svg style={{ width: 'clamp(14px, 1.1vw, 18px)', height: 'clamp(14px, 1.1vw, 18px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/30">
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </div>
      </div>
    </div>

    {/* Card 6: Smart Note Routing */}
    <div className={cardBase}>
      <div className="absolute left-[clamp(1rem,1.4vw,2rem)] top-0 -translate-y-1/2">
        <span className="font-general font-bold text-navy tracking-tight" style={{ fontSize: 'clamp(22px, 2vw, 30px)' }}>{s.c6Title}</span>
      </div>
      <VoiceQuote text={s.c6Voice} compact waveformIndex={5} />

      {/* Organized notes routed to contacts */}
      <div className="space-y-2.5">
        {/* Note 1: Janssen & Co */}
        <div
          className="rounded-lg border border-navy/[0.08] overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(240,244,250,0.6), rgba(255,255,255,0.6))',
          }}
        >
          {/* Note header with contact */}
          <div
            className="flex items-center gap-2 border-b border-navy/[0.06]"
            style={{ padding: 'clamp(6px, 0.5vw, 10px) clamp(10px, 0.7vw, 12px)' }}
          >
            <svg style={{ width: 'clamp(12px, 0.9vw, 15px)', height: 'clamp(12px, 0.9vw, 15px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/40 flex-shrink-0">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" />
            </svg>
            <span className="font-semibold text-navy" style={{ fontSize: 'clamp(10px, 0.85vw, 13px)' }}>{s.c6Note1Header}</span>
            <span className="text-slate-blue/40 ml-auto" style={{ fontSize: 'clamp(10px, 0.65vw, 11px)' }}>{s.c6Timestamp}</span>
          </div>
          {/* Note body — lined paper feel */}
          <div
            style={{ padding: 'clamp(6px, 0.55vw, 10px) clamp(10px, 0.7vw, 12px)' }}
          >
            <div className="space-y-1">
              <div className="flex items-start gap-1.5">
                <span className="text-navy/30 flex-shrink-0" style={{ fontSize: 'clamp(10px, 0.7vw, 11px)', lineHeight: '1.5' }}>•</span>
                <span className="text-slate-blue/80" style={{ fontSize: 'clamp(10px, 0.8vw, 13px)', lineHeight: '1.4' }}>{s.c6Note1Bullet1}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-navy/30 flex-shrink-0" style={{ fontSize: 'clamp(10px, 0.7vw, 11px)', lineHeight: '1.5' }}>•</span>
                <span className="text-slate-blue/80" style={{ fontSize: 'clamp(10px, 0.8vw, 13px)', lineHeight: '1.4' }}>{s.c6Note1Bullet2}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Note 2: Peter — CloudSync */}
        <div
          className="rounded-lg border border-navy/[0.08] overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(240,244,250,0.6), rgba(255,255,255,0.6))',
          }}
        >
          <div
            className="flex items-center gap-2 border-b border-navy/[0.06]"
            style={{ padding: 'clamp(6px, 0.5vw, 10px) clamp(10px, 0.7vw, 12px)' }}
          >
            <svg style={{ width: 'clamp(12px, 0.9vw, 15px)', height: 'clamp(12px, 0.9vw, 15px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/40 flex-shrink-0">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" />
            </svg>
            <span className="font-semibold text-navy" style={{ fontSize: 'clamp(10px, 0.85vw, 13px)' }}>{s.c6Note2Header}</span>
            <span className="text-slate-blue/40 ml-auto" style={{ fontSize: 'clamp(10px, 0.65vw, 11px)' }}>{s.c6Timestamp}</span>
          </div>
          <div
            style={{ padding: 'clamp(6px, 0.55vw, 10px) clamp(10px, 0.7vw, 12px)' }}
          >
            <div className="space-y-1">
              <div className="flex items-start gap-1.5">
                <span className="text-navy/30 flex-shrink-0" style={{ fontSize: 'clamp(10px, 0.7vw, 11px)', lineHeight: '1.5' }}>•</span>
                <span className="text-slate-blue/80" style={{ fontSize: 'clamp(10px, 0.8vw, 13px)', lineHeight: '1.4' }}>{s.c6Note2Bullet1}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-navy/30 flex-shrink-0" style={{ fontSize: 'clamp(10px, 0.7vw, 11px)', lineHeight: '1.5' }}>•</span>
                <span className="text-slate-blue/80" style={{ fontSize: 'clamp(10px, 0.8vw, 13px)', lineHeight: '1.4' }}>{s.c6Note2Bullet2}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation */}
      <div
        className="mt-3 flex items-center gap-1.5 text-emerald-600"
        style={{ fontSize: 'clamp(11px, 0.85vw, 13px)' }}
      >
        <svg style={{ width: 'clamp(12px, 0.95vw, 16px)', height: 'clamp(12px, 0.95vw, 16px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {s.c6Confirm}
      </div>
    </div>

    {/* Card 7: Upsell Detection */}
    <div className={cardBase}>
      <div className="absolute left-[clamp(1rem,1.4vw,2rem)] top-0 -translate-y-1/2">
        <span className="font-general font-bold text-navy tracking-tight" style={{ fontSize: 'clamp(22px, 2vw, 30px)' }}>{s.c7Title}</span>
      </div>
      <VoiceQuote text={s.c7Voice} compact waveformIndex={6} />

      {/* Contact card + Note card side by side */}
      <div className="flex gap-2">
        {/* Left: Contact card with upsell tag */}
        <div className="flex-shrink-0 rounded-lg bg-navy/[0.03] border border-navy/[0.06] flex flex-col items-center" style={{ padding: 'clamp(10px, 0.7vw, 12px)', width: '38%' }}>
          <div
            className="rounded-full bg-navy/10 flex items-center justify-center text-navy font-semibold"
            style={{
              width: 'clamp(1.75rem, 1.8vw, 2.25rem)',
              height: 'clamp(1.75rem, 1.8vw, 2.25rem)',
              fontSize: 'clamp(10px, 0.65vw, 11px)',
            }}
          >
            SM
          </div>
          <span className="font-semibold text-navy mt-1.5 text-center leading-tight" style={{ fontSize: 'clamp(10px, 0.85vw, 13px)' }}>Sophie</span>
          <span className="text-slate-blue/60 text-center leading-tight" style={{ fontSize: 'clamp(10px, 0.7vw, 11px)' }}>MediTech</span>
          {/* Upsell tag */}
          <div
            className="mt-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-navy/[0.06] border border-navy/[0.10]"
            style={{ fontSize: 'clamp(10px, 0.65vw, 11px)' }}
          >
            <svg style={{ width: 'clamp(10px, 0.7vw, 11px)', height: 'clamp(10px, 0.7vw, 11px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/60">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span className="font-semibold text-navy">{s.c7Tag}</span>
          </div>
        </div>

        {/* Right: Note card with insights */}
        <div className="flex-1 min-w-0 rounded-lg border border-navy/[0.08] overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(240,244,250,0.6), rgba(255,255,255,0.6))' }}>
          <div className="flex items-center gap-1.5 border-b border-navy/[0.06]" style={{ padding: 'clamp(5px, 0.4vw, 8px) clamp(10px, 0.7vw, 12px)' }}>
            <svg style={{ width: 'clamp(11px, 0.85vw, 14px)', height: 'clamp(11px, 0.85vw, 14px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/40">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" />
            </svg>
            <span className="font-semibold text-navy" style={{ fontSize: 'clamp(10px, 0.75vw, 12px)' }}>{s.c7NoteHeader}</span>
          </div>
          <div style={{ padding: 'clamp(6px, 0.5vw, 10px) clamp(10px, 0.7vw, 12px)' }}>
            <div className="space-y-1">
              <div className="flex items-start gap-1.5">
                <span className="text-navy/30 flex-shrink-0" style={{ fontSize: 'clamp(10px, 0.7vw, 11px)', lineHeight: '1.5' }}>•</span>
                <span className="text-slate-blue/80" style={{ fontSize: 'clamp(10px, 0.75vw, 12px)', lineHeight: '1.4' }}>{s.c7Bullet1}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-navy/30 flex-shrink-0" style={{ fontSize: 'clamp(10px, 0.7vw, 11px)', lineHeight: '1.5' }}>•</span>
                <span className="text-slate-blue/80" style={{ fontSize: 'clamp(10px, 0.75vw, 12px)', lineHeight: '1.4' }}>{s.c7Bullet2}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-navy/30 flex-shrink-0" style={{ fontSize: 'clamp(10px, 0.7vw, 11px)', lineHeight: '1.5' }}>•</span>
                <span className="text-slate-blue/80" style={{ fontSize: 'clamp(10px, 0.75vw, 12px)', lineHeight: '1.4' }}>{s.c7Bullet3}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini 2-day calendar with task scheduled */}
      <div className="mt-3 rounded-lg bg-navy/[0.03] border border-navy/[0.06] overflow-hidden">
        {/* Day headers */}
        <div className="flex border-b border-navy/[0.06]">
          <div className="flex-1 text-center border-r border-navy/[0.06]" style={{ padding: 'clamp(4px, 0.35vw, 6px)' }}>
            <span className="uppercase tracking-wider text-slate-blue/40 font-medium" style={{ fontSize: 'clamp(7px, 0.6vw, 10px)' }}>{s.c7CalToday}</span>
          </div>
          <div className="flex-1 text-center" style={{ padding: 'clamp(4px, 0.35vw, 6px)' }}>
            <span className="uppercase tracking-wider text-navy font-semibold" style={{ fontSize: 'clamp(7px, 0.6vw, 10px)' }}>{s.c7CalTomorrow}</span>
          </div>
        </div>
        {/* Time slots */}
        <div className="flex">
          {/* Today column — empty slots */}
          <div className="flex-1 border-r border-navy/[0.06]">
            {['8:00', '9:00', '10:00'].map((time) => (
              <div key={time} className="flex items-center border-b border-navy/[0.04] last:border-b-0" style={{ padding: 'clamp(5px, 0.45vw, 8px) clamp(6px, 0.5vw, 10px)', minHeight: 'clamp(24px, 2vw, 32px)' }}>
                <span className="text-slate-blue/25" style={{ fontSize: 'clamp(10px, 0.7vw, 11px)' }}>{time}</span>
              </div>
            ))}
          </div>
          {/* Tomorrow column — 9:00 has the task */}
          <div className="flex-1">
            {['8:00', '9:00', '10:00'].map((time) => (
              <div key={time} className="flex items-center border-b border-navy/[0.04] last:border-b-0" style={{ padding: 'clamp(5px, 0.45vw, 8px) clamp(6px, 0.5vw, 10px)', minHeight: 'clamp(24px, 2vw, 32px)' }}>
                {time === '9:00' ? (
                  <div className="flex items-center gap-1.5 w-full rounded bg-navy/[0.07] -my-0.5" style={{ padding: 'clamp(3px, 0.3vw, 5px) clamp(5px, 0.4vw, 8px)' }}>
                    <div className="rounded-sm bg-navy/80" style={{ width: 'clamp(2px, 0.2vw, 3px)', height: 'clamp(16px, 1.3vw, 22px)' }} />
                    <div className="min-w-0">
                      <div className="font-semibold text-navy truncate" style={{ fontSize: 'clamp(10px, 0.75vw, 12px)' }}>{s.c7TaskTitle}</div>
                      <div className="text-slate-blue/50 truncate" style={{ fontSize: 'clamp(10px, 0.65vw, 10px)' }}>Sophie · MediTech</div>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-blue/25" style={{ fontSize: 'clamp(10px, 0.7vw, 11px)' }}>{time}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation */}
      <div
        className="mt-3 flex items-center gap-1.5 text-emerald-600"
        style={{ fontSize: 'clamp(11px, 0.85vw, 13px)' }}
      >
        <svg style={{ width: 'clamp(12px, 0.95vw, 16px)', height: 'clamp(12px, 0.95vw, 16px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {s.c7Confirm}
      </div>
    </div>

    {/* Card 8: Smart Handoff */}
    <div className={cardBase}>
      <div className="absolute left-[clamp(1rem,1.4vw,2rem)] top-0 -translate-y-1/2">
        <span className="font-general font-bold text-navy tracking-tight" style={{ fontSize: 'clamp(22px, 2vw, 30px)' }}>{s.c8Title}</span>
      </div>
      <VoiceQuote text={s.c8Voice} compact waveformIndex={7} />

      {/* CRM record — DataFlow account with assignee change */}
      <div className="rounded-xl bg-navy/[0.03] border border-navy/[0.06] overflow-hidden">
        {/* Account header */}
        <div className="flex items-center gap-2 border-b border-navy/[0.06]" style={{ padding: 'clamp(10px, 0.65vw, 12px) clamp(10px, 0.8vw, 14px)' }}>
          <svg style={{ width: 'clamp(14px, 1.1vw, 18px)', height: 'clamp(14px, 1.1vw, 18px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/40 flex-shrink-0">
            <path d="M3 9l1.5-5h15L21 9" /><path d="M3 9h18v12H3V9z" /><path d="M9 21V14h6v7" />
          </svg>
          <span className="font-semibold text-navy" style={{ fontSize: 'clamp(11px, 0.9vw, 14px)' }}>DataFlow</span>
        </div>

        {/* Assignee field — the core change */}
        <div className="border-b border-navy/[0.06]" style={{ padding: 'clamp(10px, 0.65vw, 12px) clamp(10px, 0.8vw, 14px)' }}>
          <span className="uppercase tracking-wider text-slate-blue/50 block" style={{ fontSize: 'clamp(10px, 0.65vw, 10px)', marginBottom: 'clamp(5px, 0.4vw, 8px)' }}>{s.c8Assignee}</span>
          <div className="flex items-center gap-3">
            {/* From */}
            <div className="flex items-center gap-1.5">
              <div
                className="rounded-full bg-navy/[0.07] flex items-center justify-center text-navy/40 font-semibold flex-shrink-0"
                style={{
                  width: 'clamp(2rem, 2.2vw, 2.75rem)',
                  height: 'clamp(2rem, 2.2vw, 2.75rem)',
                  fontSize: 'clamp(10px, 0.75vw, 12px)',
                }}
              >
                JD
              </div>
              <span className="text-slate-blue/40 line-through" style={{ fontSize: 'clamp(10px, 0.8vw, 13px)' }}>{s.c8From}</span>
            </div>
            {/* Arrow */}
            <svg style={{ width: 'clamp(22px, 1.8vw, 30px)', height: 'clamp(12px, 1vw, 16px)' }} viewBox="0 0 30 16" fill="none" className="text-navy/20 flex-shrink-0">
              <line x1="0" y1="8" x2="25" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <polyline points="21 4 25 8 21 12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {/* To */}
            <div className="flex items-center gap-1.5">
              <div
                className="rounded-full bg-navy/10 flex items-center justify-center text-navy font-semibold flex-shrink-0"
                style={{
                  width: 'clamp(2rem, 2.2vw, 2.75rem)',
                  height: 'clamp(2rem, 2.2vw, 2.75rem)',
                  fontSize: 'clamp(10px, 0.75vw, 12px)',
                }}
              >
                EM
              </div>
              <span className="text-navy font-medium" style={{ fontSize: 'clamp(10px, 0.8vw, 13px)' }}>Emma</span>
            </div>
          </div>
        </div>

        {/* What transferred along */}
        <div className="divide-y divide-navy/[0.06]">
          <div className="flex items-center gap-2.5" style={{ padding: 'clamp(6px, 0.5vw, 9px) clamp(10px, 0.8vw, 14px)' }}>
            <svg style={{ width: 'clamp(12px, 0.95vw, 15px)', height: 'clamp(12px, 0.95vw, 15px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/30 flex-shrink-0">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            </svg>
            <span className="text-navy/70" style={{ fontSize: 'clamp(10px, 0.8vw, 13px)' }}>{s.c8Deals}</span>
            <svg className="flex-shrink-0 text-emerald-500 ml-auto" style={{ width: 'clamp(12px, 0.95vw, 15px)', height: 'clamp(12px, 0.95vw, 15px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="flex items-center gap-2.5" style={{ padding: 'clamp(6px, 0.5vw, 9px) clamp(10px, 0.8vw, 14px)' }}>
            <svg style={{ width: 'clamp(12px, 0.95vw, 15px)', height: 'clamp(12px, 0.95vw, 15px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/30 flex-shrink-0">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            <span className="text-navy/70" style={{ fontSize: 'clamp(10px, 0.8vw, 13px)' }}>{s.c8Meetings}</span>
            <svg className="flex-shrink-0 text-emerald-500 ml-auto" style={{ width: 'clamp(12px, 0.95vw, 15px)', height: 'clamp(12px, 0.95vw, 15px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      </div>

      {/* Handoff note */}
      <div className="mt-2.5 rounded-lg border border-navy/[0.08] overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(240,244,250,0.6), rgba(255,255,255,0.6))' }}>
        <div className="flex items-center gap-1.5 border-b border-navy/[0.06]" style={{ padding: 'clamp(5px, 0.4vw, 8px) clamp(10px, 0.7vw, 12px)' }}>
          <svg style={{ width: 'clamp(11px, 0.85vw, 14px)', height: 'clamp(11px, 0.85vw, 14px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/40">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" />
          </svg>
          <span className="font-semibold text-navy" style={{ fontSize: 'clamp(10px, 0.75vw, 12px)' }}>{s.c8NoteHeader}</span>
        </div>
        <div style={{ padding: 'clamp(6px, 0.5vw, 10px) clamp(10px, 0.7vw, 12px)' }}>
          <div className="space-y-1">
            <div className="flex items-start gap-1.5">
              <span className="text-navy/30 flex-shrink-0" style={{ fontSize: 'clamp(10px, 0.7vw, 11px)', lineHeight: '1.5' }}>•</span>
              <span className="text-slate-blue/80" style={{ fontSize: 'clamp(10px, 0.75vw, 12px)', lineHeight: '1.4' }}>{s.c8Bullet1}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-navy/30 flex-shrink-0" style={{ fontSize: 'clamp(10px, 0.7vw, 11px)', lineHeight: '1.5' }}>•</span>
              <span className="text-slate-blue/80" style={{ fontSize: 'clamp(10px, 0.75vw, 12px)', lineHeight: '1.4' }}>{s.c8Bullet2}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation */}
      <div
        className="mt-3 flex items-center gap-1.5 text-emerald-600"
        style={{ fontSize: 'clamp(11px, 0.85vw, 13px)' }}
      >
        <svg style={{ width: 'clamp(12px, 0.95vw, 16px)', height: 'clamp(12px, 0.95vw, 16px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {s.c8Confirm}
      </div>
    </div>

    {/* Card 9: Custom Offer Creation */}
    <div className={cardBase}>
      <div className="absolute left-[clamp(1rem,1.4vw,2rem)] top-0 -translate-y-1/2">
        <span className="font-general font-bold text-navy tracking-tight" style={{ fontSize: 'clamp(22px, 2vw, 30px)' }}>{s.c9Title}</span>
      </div>
      <VoiceQuote text={s.c9Voice} compact waveformIndex={8} />

      {/* Quote document */}
      <div className="rounded-xl border border-navy/[0.08] overflow-hidden bg-white">
        {/* Quote header bar */}
        <div className="border-b border-navy/[0.06]" style={{ padding: 'clamp(7px, 0.6vw, 10px) clamp(10px, 0.85vw, 14px)' }}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-navy" style={{ fontSize: 'clamp(11px, 0.9vw, 15px)' }}>Quote #1247</span>
            <span className="text-slate-blue/40" style={{ fontSize: 'clamp(10px, 0.65vw, 11px)' }}>{s.c9Status}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="uppercase tracking-wider text-slate-blue/40" style={{ fontSize: 'clamp(7px, 0.55vw, 9px)' }}>{s.c9To}</span>
            <span className="text-navy/70 font-medium" style={{ fontSize: 'clamp(10px, 0.7vw, 11px)' }}>Lucas Peeters</span>
            <span className="text-navy/20">|</span>
            <span className="text-navy/50" style={{ fontSize: 'clamp(10px, 0.7vw, 11px)' }}>GreenTech Solutions</span>
          </div>
        </div>

        {/* Line items table */}
        <div>
          {/* Column headers */}
          <div className="flex items-center border-b border-navy/[0.06]" style={{ padding: 'clamp(3px, 0.25vw, 5px) clamp(10px, 0.85vw, 14px)' }}>
            <span className="flex-1 uppercase tracking-wider text-slate-blue/40 font-medium" style={{ fontSize: 'clamp(7px, 0.55vw, 9px)' }}>{s.c9ColDesc}</span>
            <span className="uppercase tracking-wider text-slate-blue/40 font-medium text-right" style={{ fontSize: 'clamp(7px, 0.55vw, 9px)', width: 'clamp(28px, 2.5vw, 40px)' }}>{s.c9ColQty}</span>
            <span className="uppercase tracking-wider text-slate-blue/40 font-medium text-right" style={{ fontSize: 'clamp(7px, 0.55vw, 9px)', width: 'clamp(55px, 5vw, 75px)' }}>{s.c9ColAmount}</span>
          </div>
          {/* Row 1 */}
          <div className="flex items-center border-b border-navy/[0.04]" style={{ padding: 'clamp(4px, 0.35vw, 6px) clamp(10px, 0.85vw, 14px)' }}>
            <span className="flex-1 text-navy/80" style={{ fontSize: 'clamp(10px, 0.75vw, 12px)' }}>{s.c9Item1}</span>
            <span className="text-slate-blue/50 text-right" style={{ fontSize: 'clamp(10px, 0.75vw, 12px)', width: 'clamp(28px, 2.5vw, 40px)' }}>50</span>
            <span className="text-navy text-right" style={{ fontSize: 'clamp(10px, 0.75vw, 12px)', width: 'clamp(55px, 5vw, 75px)' }}>€18,750.00</span>
          </div>
          {/* Row 2 */}
          <div className="flex items-center border-b border-navy/[0.04]" style={{ padding: 'clamp(4px, 0.35vw, 6px) clamp(10px, 0.85vw, 14px)' }}>
            <span className="flex-1 text-navy/80" style={{ fontSize: 'clamp(10px, 0.75vw, 12px)' }}>{s.c9Item2}</span>
            <span className="text-slate-blue/50 text-right" style={{ fontSize: 'clamp(10px, 0.75vw, 12px)', width: 'clamp(28px, 2.5vw, 40px)' }}>1</span>
            <span className="text-navy text-right" style={{ fontSize: 'clamp(10px, 0.75vw, 12px)', width: 'clamp(55px, 5vw, 75px)' }}>€4,200.00</span>
          </div>
          {/* Row 3 */}
          <div className="flex items-center border-b border-navy/[0.06]" style={{ padding: 'clamp(4px, 0.35vw, 6px) clamp(10px, 0.85vw, 14px)' }}>
            <span className="flex-1 text-navy/80" style={{ fontSize: 'clamp(10px, 0.75vw, 12px)' }}>{s.c9Item3}</span>
            <span className="text-slate-blue/50 text-right" style={{ fontSize: 'clamp(10px, 0.75vw, 12px)', width: 'clamp(28px, 2.5vw, 40px)' }}>1</span>
            <span className="text-navy text-right" style={{ fontSize: 'clamp(10px, 0.75vw, 12px)', width: 'clamp(55px, 5vw, 75px)' }}>€2,400.00</span>
          </div>
          {/* Subtotal + VAT + Total */}
          <div style={{ padding: 'clamp(5px, 0.4vw, 7px) clamp(10px, 0.85vw, 14px)' }}>
            <div className="flex items-center justify-end gap-3">
              <span className="text-slate-blue/50" style={{ fontSize: 'clamp(10px, 0.7vw, 11px)' }}>{s.c9Subtotal}</span>
              <span className="text-navy/70" style={{ fontSize: 'clamp(10px, 0.7vw, 11px)', width: 'clamp(55px, 5vw, 75px)', textAlign: 'right' }}>€25,350.00</span>
            </div>
            <div className="flex items-center justify-end gap-3 mb-1">
              <span className="text-slate-blue/50" style={{ fontSize: 'clamp(10px, 0.7vw, 11px)' }}>{s.c9Vat}</span>
              <span className="text-navy/70" style={{ fontSize: 'clamp(10px, 0.7vw, 11px)', width: 'clamp(55px, 5vw, 75px)', textAlign: 'right' }}>€5,323.50</span>
            </div>
            <div className="flex items-center justify-end gap-3 pt-1 border-t border-navy/[0.08]">
              <span className="font-semibold text-navy" style={{ fontSize: 'clamp(10px, 0.85vw, 13px)' }}>{s.c9Total}</span>
              <span className="font-bold text-navy" style={{ fontSize: 'clamp(11px, 0.9vw, 15px)', width: 'clamp(55px, 5vw, 75px)', textAlign: 'right' }}>€30,673.50</span>
            </div>
          </div>
        </div>

        {/* Footer with deadline + send button */}
        <div className="flex items-center justify-between border-t border-navy/[0.06]" style={{ padding: 'clamp(6px, 0.5vw, 9px) clamp(10px, 0.85vw, 14px)' }}>
          <div className="flex items-center gap-1.5">
            <svg style={{ width: 'clamp(11px, 0.85vw, 14px)', height: 'clamp(11px, 0.85vw, 14px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-blue/30 flex-shrink-0">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-slate-blue/50" style={{ fontSize: 'clamp(10px, 0.7vw, 11px)' }}>{s.c9Due}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-navy text-white rounded-md cursor-pointer" style={{ padding: 'clamp(4px, 0.35vw, 6px) clamp(10px, 0.85vw, 14px)', fontSize: 'clamp(10px, 0.75vw, 12px)' }}>
            <svg style={{ width: 'clamp(10px, 0.8vw, 13px)', height: 'clamp(10px, 0.8vw, 13px)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <span className="font-medium">{s.c9Send}</span>
          </div>
        </div>
      </div>

    </div>
  </>
  );
};

export const CrmPreviewCards: React.FC = () => {
  const { t, currentLanguage } = useI18n();
  const cardLocale = getCardLocale(currentLanguage);
  const mobileScrollRef = React.useRef<HTMLDivElement>(null);
  const desktopScrollRef = React.useRef<HTMLDivElement>(null);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const TOTAL_CARDS = 9;
  const currentCardIdxRef = React.useRef(0);
  const isArrowNavRef = React.useRef(false);
  const arrowNavTimeout = React.useRef<ReturnType<typeof setTimeout>>();

  // Proportional zoom for screens wider than 1440px (14" reference), capped at 1.25×
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const update = () => {
      const z = window.innerWidth > 1440 ? Math.min(window.innerWidth / 1440, 1.25) : 1;
      setZoom(z);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Mobile scroll → update progress bar
  useEffect(() => {
    const el = mobileScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (isArrowNavRef.current) return;
      const cardW = (el.firstElementChild as HTMLElement)?.offsetWidth || el.clientWidth;
      const idx = Math.round(el.scrollLeft / (cardW + 16));
      const clamped = Math.max(0, Math.min(TOTAL_CARDS - 1, idx));
      if (clamped !== currentCardIdxRef.current) {
        currentCardIdxRef.current = clamped;
        setCurrentCardIdx(clamped);
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [TOTAL_CARDS]);

  // Desktop scroll → update progress bar
  useEffect(() => {
    const el = desktopScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (isArrowNavRef.current) return;
      const cardW = (el.firstElementChild as HTMLElement)?.offsetWidth || 420;
      const gap = parseFloat(getComputedStyle(el).gap) || 20;
      const idx = Math.round(el.scrollLeft / (cardW + gap));
      const clamped = Math.max(0, Math.min(TOTAL_CARDS - 1, idx));
      if (clamped !== currentCardIdxRef.current) {
        currentCardIdxRef.current = clamped;
        setCurrentCardIdx(clamped);
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [TOTAL_CARDS]);

  // Arrow navigation — same logic for desktop and mobile
  const navigate = useCallback((dir: 1 | -1) => {
    const newIdx = Math.max(0, Math.min(TOTAL_CARDS - 1, currentCardIdxRef.current + dir));
    currentCardIdxRef.current = newIdx;
    setCurrentCardIdx(newIdx);

    isArrowNavRef.current = true;
    clearTimeout(arrowNavTimeout.current);
    arrowNavTimeout.current = setTimeout(() => { isArrowNavRef.current = false; }, 600);

    // Desktop
    const desktopEl = desktopScrollRef.current;
    if (desktopEl) {
      const cardW = (desktopEl.firstElementChild as HTMLElement)?.offsetWidth || 420;
      const gap = parseFloat(getComputedStyle(desktopEl).gap) || 20;
      desktopEl.scrollTo({ left: newIdx * (cardW + gap), behavior: 'smooth' });
    }
    // Mobile
    const el = mobileScrollRef.current;
    if (el) {
      const cardW = (el.firstElementChild as HTMLElement)?.offsetWidth || el.clientWidth;
      el.scrollTo({ left: newIdx * (cardW + 16), behavior: 'smooth' });
    }
  }, [TOTAL_CARDS]);

  const cardBase = "relative flex-shrink-0 bg-white rounded-2xl shadow-lg shadow-black/8 border border-navy/[0.06]" +
    " w-[420px]" +
    " p-[clamp(1.5rem,1.8vw,2.75rem)]" +
    " pt-[clamp(1.75rem,2vw,2.75rem)]" +
    " pb-[clamp(1rem,1.1vw,1.75rem)]" +
    " rounded-[clamp(16px,1.2vw,20px)]";

  const mobileCardBase = "relative flex-shrink-0 snap-center bg-white rounded-2xl shadow-lg shadow-black/8 border border-navy/[0.06]" +
    " w-[calc(100svw-2.5rem)]" +
    " p-5 pt-6 pb-5 rounded-[16px]";

  return (
    <div style={{ zoom }}>
    <div className="relative pb-4 md:pb-6" style={{ marginTop: '0' }}>
      <h2
        className="font-general font-bold text-navy text-center mb-6 md:mb-8 mt-6 md:mt-0 max-w-[260px] mx-auto md:max-w-none"
        style={{ fontSize: 'clamp(1.75rem, calc(1.2rem + 2vw), 3.25rem)', letterSpacing: '-0.02em' }}
      >
        {t('hero.carouselTitle')}
      </h2>

      {/* Navigation controls — arrows + progress bar */}
      <div className="flex items-center gap-4 mb-5 px-5 md:px-2 md:max-w-sm md:mx-auto">
        <button
          onClick={() => navigate(-1)}
          aria-label="Previous card"
          className="flex-shrink-0 w-9 h-9 rounded-full border border-navy/20 bg-white flex items-center justify-center text-navy/60 hover:text-navy hover:border-navy/40 hover:bg-navy/5 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 h-[3px] bg-navy/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-navy rounded-full"
            style={{ width: `${((currentCardIdx + 1) / TOTAL_CARDS) * 100}%`, transition: 'width 0.4s ease-out', willChange: 'width' }}
          />
        </div>
        <button
          onClick={() => navigate(1)}
          aria-label="Next card"
          className="flex-shrink-0 w-9 h-9 rounded-full border border-navy/20 bg-white flex items-center justify-center text-navy/60 hover:text-navy hover:border-navy/40 hover:bg-navy/5 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Mobile: native snap scroll, one card at a time */}
      <div
        ref={mobileScrollRef}
        className="md:hidden overflow-x-auto snap-x snap-mandatory flex gap-4 px-5 pt-5 pb-6"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        <CardContent cardBase={mobileCardBase} locale={cardLocale} />
      </div>

      {/* Desktop: native snap scroll, same logic as mobile */}
      <div
        ref={desktopScrollRef}
        className="hidden md:flex gap-5 overflow-x-scroll snap-x snap-mandatory pt-5 pb-8"
        style={{
          scrollbarWidth: 'none',
          paddingLeft: '5%',
          paddingRight: '5%',
          scrollPaddingLeft: '5%',
        } as React.CSSProperties}
      >
        <CardContent cardBase={`${cardBase} snap-start`} locale={cardLocale} />
      </div>
    </div>
    </div>
  );
};

export const HeroDemo: React.FC = () => {
  const { navigateWithTransition } = usePageTransition();
  const { t } = useI18n();
  const { displayedText, isDrawing, currentPhraseIndex } = useTypewriter(typewriterPhrases);
  const showTalkDot = currentPhraseIndex !== 0; // hide "." after "Talk" when "to your CRM." is active
  const isCompact = useIsCompactHero();
  const mobilePhoneRef = useRef<HTMLDivElement>(null);

  // Mobile-only: scroll-driven upward parallax on the phone mock
  useEffect(() => {
    if (!isCompact || !mobilePhoneRef.current) return;
    const tween = gsap.to(mobilePhoneRef.current, {
      y: window.innerWidth >= 417 ? '-200vh' : '-120vh',
      ease: 'none',
      force3D: true,
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: '30% top',
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    });
    return () => {
      (tween as any).scrollTrigger?.kill();
      tween.kill();
    };
  }, [isCompact]);

  return (
    <div className="w-full">
      {/* Hero Content — Fixed layout with absolute positioning */}
      <section className="relative" style={{ height: '100svh', overflowX: 'clip', overflowY: 'visible' }}>
        {/* Mobile: Blue logo next to hamburger */}
        <div className="md:hidden absolute top-3 right-[72px] z-20 pointer-events-none flex items-center" style={{ height: '44px' }}>
          <img src="/Finit Voicelink Blue.svg" alt="VoiceLink" className="h-9 w-auto" />
        </div>

        {/* Decorative corner waves — desktop (landscape) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none hidden md:block hero-animate-waves"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* ── Top-left corner ── */}
          <path
            d="M-30,-30 L220,-30 C170,60 230,140 130,200 C30,260 60,310 -30,360 Z"
            fill="#1A2D63"
          />
          <path
            d="M205,-25 C160,55 220,135 125,195 C30,255 60,300 -25,350
               L-10,370 C55,325 25,265 135,205 C235,150 175,65 218,-10 L205,-25 Z"
            fill="#7B8DB5"
          />
          {/* ── Bottom-right corner ── vertical tangent at y=930, matched curvature with section below */}
          <path
            d="M1470,930 L1240,930 C1240,750 1200,690 1320,645 C1450,598 1400,540 1470,460 Z"
            fill="#1A2D63"
          />
          <path
            d="M1248,930 C1248,755 1205,693 1325,648 C1455,601 1405,543 1475,465
               L1470,452 C1398,535 1448,595 1318,642 C1195,688 1232,750 1232,930 L1248,930 Z"
            fill="#7B8DB5"
          />
        </svg>

        {/* Top-left corner — same desktop paths, cropped viewBox */}
        <svg
          className="absolute left-0 pointer-events-none block md:hidden hero-animate-waves"
          style={{ top: '-8px' }}
          width="128" height="240"
          viewBox="-30 -30 255 480"
          overflow="visible"
          aria-hidden="true"
        >
          <path
            d="M-30,-30 L220,-30 C170,60 230,140 130,200 C30,260 60,310 -30,360 L-30,430 Z"
            fill="#1A2D63"
          />
          <path
            d="M222,-55 C177,25 220,135 125,195 C30,255 30,318 -55,368
               L-34,397 C31,352 30,272 140,212 C240,157 197,42 236,-25 L222,-55 Z"
            fill="#7B8DB5"
          />
        </svg>
        {/* Bottom-right corner — same desktop paths, cropped viewBox */}
        <svg
          className="absolute bottom-0 right-0 pointer-events-none block md:hidden"
          style={{ bottom: '-6px' }}
          width="143" height="250"
          viewBox="1183 440 285 500"
          aria-hidden="true"
        >
          <path
            d="M1470,940 L1240,940 C1240,750 1200,690 1320,645 C1450,598 1400,540 1470,460 Z"
            fill="#1A2D63"
          />
          <path
            d="M1248,940 C1248,755 1205,693 1325,648 C1455,601 1405,543 1475,465
               L1470,452 C1398,535 1448,595 1318,642 C1195,688 1232,750 1232,940 L1248,940 Z"
            fill="#7B8DB5"
          />
        </svg>

        {/* ── COMPACT (mobile/tablet): text column + phone anchored at bottom ── */}
        {isCompact && (
          <>
            <div className="absolute z-10 left-[4%] right-[4%] flex flex-col items-center text-center" style={{ top: '20svh', bottom: '45svh' }}>
              <div className="overflow-visible hero-animate-heading">
                <h1 className="font-general leading-[1] tracking-tight text-navy text-center" style={{ fontSize: 'clamp(1.7rem, calc(0.7rem + 3vw + 1.5vh), 3.2rem)' }}>
                  <span className="font-bold" style={{ letterSpacing: '-0.025em', WebkitFontSmoothing: 'antialiased' }}>
                    Just... Talk{showTalkDot ? '.' : ''}
                  </span>
                  <br />
                  <span className="font-black italic">
                    <TypewriterText text={displayedText} isDrawing={isDrawing} />
                  </span>
                  <span className="inline-block w-[3px] h-[1em] bg-[#1A2D63] ml-1 animate-pulse align-baseline" />
                </h1>
              </div>
              <div className="w-full max-w-lg">
                <div className="hero-animate-subtitle">
                  <p className="font-instrument text-slate-blue leading-relaxed max-w-lg mx-auto text-center" style={{ fontSize: 'clamp(1rem, calc(0.7rem + 0.3vw + 0.35vh), 1.375rem)' }}>
                    {t('hero.subtitle1_pre')}{' '}
                    <img src="/Logo_Teamleader_Default_CMYK.png" alt="Teamleader" className="inline-block h-[3.2em] w-auto align-[-1em] -mx-2" style={{ clipPath: 'inset(0 6% 0 6%)' }} draggable={false} />{' '}
                    {t('hero.subtitle1_mid')}{' '}
                    <span className="inline-flex items-center gap-[0.25em] mx-1 align-[-0.3em]"><img src="/whatsapp-green.svg" alt="WhatsApp" className="h-[1.35em] w-auto" draggable={false} /><span className="font-bold text-black text-[0.9em]">WhatsApp</span></span>
                    <span className="block" style={{ marginTop: '-0.7em', lineHeight: '1.5' }}>{t('hero.subtitle1_post')}</span>
                  </p>
                </div>
                <div className="hero-animate-ctas" style={{ marginTop: 'clamp(0.75rem, calc(0.5rem + 1vh), 2rem)' }}>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <button onClick={() => { trackCTAClick('Get Started Free - Hero', '/'); /* TEMPORARY: scroll to early access */ document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="group bg-navy text-white font-medium rounded-full flex items-center justify-center gap-2 hover:bg-navy-hover transition-colors shadow-lg shadow-black/10 text-[13px] px-5 py-2.5">
                      <span>{t('hero.getStartedFree')}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="group border-2 border-navy text-navy font-medium rounded-full flex items-center justify-center gap-2 transition-colors hover:bg-navy/5 text-[13px] px-5 py-2.5" onClick={() => { trackCTAClick('Watch Demo - Hero', '/'); const el = document.getElementById('how-it-works'); if (el) window.scrollTo({ top: el.offsetTop - 10, behavior: 'smooth' }); }}>
                      <Play className="w-4 h-4" />
                      <span>{t('hero.watchDemo')}</span>
                    </button>
                  </div>
                </div>
                <div className="hero-animate-checks" style={{ marginTop: 'clamp(0.5rem, calc(0.35rem + 0.6vh), 1.25rem)' }}>
                  <div className="flex sm:flex-row flex-col items-start justify-start gap-x-6 gap-y-1.5 text-sm text-muted-blue w-fit mx-auto">
                    <div className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-navy flex-shrink-0" /><span>{t('hero.oneClickSetup')}</span></div>
                    <span className="hidden sm:inline">·</span>
                    <div className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-navy flex-shrink-0" /><span>{t('hero.whatsappSetup')}</span></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Outer div handles centering; inner div has the animation so transforms don't conflict */}
            <div ref={mobilePhoneRef} className="absolute" style={{ left: '50%', transform: 'translateX(-50%)', top: '66svh', width: 'min(460px, 86vw)', zIndex: 60, pointerEvents: 'none' }}>
              <div className="flex items-start justify-center hero-animate-phone-bottom">
                <img src="/whatsapp phone mock.png" alt="VoiceLink WhatsApp conversation showing CRM updates from voice notes" style={{ width: 'min(460px, 97vw)', height: 'auto', transform: 'rotate(5deg)', filter: 'drop-shadow(0 12px 20px rgba(0, 0, 0, 0.22)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))' }} draggable={false} />
              </div>
            </div>
          </>
        )}

        {/* ── DESKTOP: centered flex row, text left + phone right ── */}
        {!isCompact && (
          <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ padding: '6vh 6vw 0', gap: 'clamp(0.25rem, 0.5vw, 1rem)' }}>
            {/* Text column */}
            <div className="flex flex-col items-start text-left flex-1 min-w-0 max-w-[540px] xl:max-w-[660px] 2xl:max-w-[800px]">
              <div className="overflow-visible hero-animate-heading w-full">
                <h1 className="font-general leading-[1] tracking-tight text-navy text-left" style={{ fontSize: 'clamp(2.5rem, calc(1.8rem + 1.2vw + 1.5vh), 6rem)' }}>
                  <span className="font-bold" style={{ letterSpacing: '-0.025em', WebkitFontSmoothing: 'antialiased' }}>
                    Just... Talk{showTalkDot ? '.' : ''}
                  </span>
                  <br />
                  <span className="font-black italic">
                    <TypewriterText text={displayedText} isDrawing={isDrawing} />
                  </span>
                  <span className="inline-block w-[3px] h-[1em] bg-[#1A2D63] ml-1 animate-pulse align-baseline" />
                </h1>
              </div>
              <div className="hero-animate-subtitle w-full" style={{ marginTop: 'clamp(0.75rem, calc(0.5rem + 1vh), 1.5rem)' }}>
                <p className="font-instrument text-slate-blue leading-relaxed text-left max-w-[520px]" style={{ fontSize: 'clamp(1rem, calc(0.7rem + 0.3vw + 0.35vh), 1.375rem)' }}>
                  {t('hero.subtitle1_pre')}{' '}
                  <img src="/Logo_Teamleader_Default_CMYK.png" alt="Teamleader" className="inline-block h-[3.2em] w-auto align-[-1em] -mx-2" style={{ clipPath: 'inset(0 6% 0 6%)' }} draggable={false} />{' '}
                  {t('hero.subtitle1_mid')}{' '}
                  <span className="inline-flex items-center gap-[0.25em] mx-1 align-[-0.3em]"><img src="/whatsapp-green.svg" alt="WhatsApp" className="h-[1.35em] w-auto" draggable={false} /><span className="font-bold text-black text-[0.9em]">WhatsApp</span></span>{' '}
                  {t('hero.subtitle1_post')}
                </p>
              </div>
              <div className="hero-animate-ctas w-full" style={{ marginTop: 'clamp(0.75rem, calc(0.5rem + 1vh), 2rem)' }}>
                <div className="flex flex-row gap-4 justify-start">
                  <button onClick={() => { trackCTAClick('Get Started Free - Hero', '/'); /* TEMPORARY: scroll to early access */ document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="group bg-navy text-white font-medium rounded-full flex items-center justify-center gap-2 hover:bg-navy-hover transition-colors shadow-lg shadow-black/10 text-[15px] px-6 py-3">
                    <span>{t('hero.getStartedFree')}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="group border-2 border-navy text-navy font-medium rounded-full flex items-center justify-center gap-2 transition-colors hover:bg-navy/5 text-[15px] px-6 py-3" onClick={() => { trackCTAClick('Watch Demo - Hero', '/'); const el = document.getElementById('how-it-works'); if (el) window.scrollTo({ top: el.offsetTop - 10, behavior: 'smooth' }); }}>
                    <Play className="w-5 h-5" />
                    <span>{t('hero.watchDemo')}</span>
                  </button>
                </div>
              </div>
              <div className="hero-animate-checks w-full" style={{ marginTop: 'clamp(0.5rem, calc(0.35rem + 0.6vh), 1.25rem)' }}>
                <div className="flex flex-wrap items-center justify-start gap-x-6 gap-y-2 text-sm text-muted-blue">
                  <div className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-navy" /><span>{t('hero.oneClickSetup')}</span></div>
                  <span className="hidden sm:inline">·</span>
                  <div className="flex items-start space-x-2 max-w-[180px]"><CheckCircle className="w-4 h-4 text-navy mt-0.5 flex-shrink-0" /><span className="leading-snug whitespace-pre-line">{t('hero.whatsappSetup')}</span></div>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="flex-shrink-0">
              <img
                src="/whatsapp phone mock.png"
                alt="VoiceLink WhatsApp conversation showing CRM updates from voice notes"
                style={{
                  width: 'auto',
                  height: 'clamp(540px, 92svh, 1020px)',
                  transform: 'rotate(7deg)',
                  filter: 'drop-shadow(0 12px 20px rgba(0, 0, 0, 0.22)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))',
                }}
                draggable={false}
              />
            </div>
          </div>
        )}

      </section>

    </div>
  );
};
