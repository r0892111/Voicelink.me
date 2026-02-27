import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useI18n } from '../hooks/useI18n';

type Phase = 'idle' | 'voice' | 'transcript' | 'thinking' | 'reply' | 'crm' | 'done';

const TRANSCRIPT_TEXT = "Just had a call with Sarah Mitchell from TechFlow Solutions. She's the procurement manager. Her number is 0456 789 123, email sarah@techflow.be. Enterprise client, very promising. She mentioned they're migrating from Salesforce next quarter.";

const REPLY_LINES = [
  { emoji: '\u2705', text: 'Contact created: Sarah Mitchell' },
  { emoji: '\uD83C\uDFE2', text: 'TechFlow Solutions \u2014 Procurement Manager' },
  { emoji: '\uD83D\uDCDE', text: '0456 789 123' },
  { emoji: '\uD83D\uDCE7', text: 'sarah@techflow.be' },
  { emoji: '\uD83C\uDFF7\uFE0F', text: 'Hot Lead \u00B7 Enterprise Client' },
  { emoji: '\uD83D\uDD04', text: 'Migrating from Salesforce next Q' },
];

// Generate natural-looking waveform with envelope
const generateWaveform = (seed: number, barCount: number): number[] => {
  let s = seed;
  const rng = () => { s = (s * 16807 + 0) % 2147483647; return (s & 0x7fffffff) / 0x7fffffff; };
  const bars: number[] = [];
  for (let i = 0; i < barCount; i++) {
    const pos = i / barCount;
    const envelope = pos < 0.15 ? pos / 0.15 : pos > 0.8 ? (1 - pos) / 0.2 : 1;
    const noise = 0.4 + rng() * 0.6;
    bars.push(Math.max(12, Math.round(envelope * noise * 100)));
  }
  return bars;
};

const WAVEFORM_BARS = generateWaveform(42, 48);

// CRM contact fields — Teamleader-style label/value rows
const CRM_CONTACT_ROWS = [
  { label: 'Bedrijf', value: 'TechFlow Solutions' },
  { label: 'Functie', value: 'Procurement Manager' },
  { label: 'E-mail', value: 'sarah@techflow.be', isLink: true },
  { label: 'Telefoonnummer', value: '0456 789 123', isLink: true },
];

const CRM_TAGS = ['Hot Lead', 'Enterprise'];

const CRM_NOTE_BULLETS = [
  'Procurement Manager at TechFlow Solutions',
  'Enterprise client — very promising',
  'Migrating from Salesforce next quarter',
];

// Sidebar items matching Teamleader nav
const CRM_SIDEBAR_ITEMS = [
  { label: 'Contacten', active: true },
  { label: 'Bedrijven', active: false },
  { label: 'Deals', active: false },
  { label: 'Agenda', active: false },
];

export const HowItWorksDemo: React.FC = () => {
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>('idle');
  const [activeStep, setActiveStep] = useState(0);
  const [transcriptProgress, setTranscriptProgress] = useState(0);
  const [replyLinesShown, setReplyLinesShown] = useState(0);
  const [crmFieldsShown, setCrmFieldsShown] = useState(0);
  const [bubbleShifted, setBubbleShifted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loopFading, setLoopFading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRefs = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const hasStarted = useRef(false);
  const transcriptDoneRef = useRef(false);

  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(id => clearTimeout(id));
    timeoutRefs.current = [];
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const addTimeout = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay);
    timeoutRefs.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const startTypewriter = useCallback((onDone: () => void) => {
    let charIndex = 0;
    transcriptDoneRef.current = false;
    const type = () => {
      if (charIndex < TRANSCRIPT_TEXT.length) {
        charIndex++;
        setTranscriptProgress(charIndex);
        rafRef.current = requestAnimationFrame(() => {
          addTimeout(type, 4);
        });
      } else {
        transcriptDoneRef.current = true;
        addTimeout(onDone, 600);
      }
    };
    type();
  }, [addTimeout]);

  const startSequence = useCallback(() => {
    clearAllTimeouts();
    setLoopFading(false);
    setPhase('idle');
    setActiveStep(0);
    setTranscriptProgress(0);
    setReplyLinesShown(0);
    setCrmFieldsShown(0);
    setBubbleShifted(false);
    transcriptDoneRef.current = false;

    addTimeout(() => {
      setPhase('voice');
      setActiveStep(1);
    }, 200);

    addTimeout(() => {
      setPhase('transcript');
      startTypewriter(() => {
        setPhase('thinking');
        setActiveStep(2);
        addTimeout(() => {
          setBubbleShifted(true);
          setPhase('reply');
          setActiveStep(3);
          REPLY_LINES.forEach((_, i) => {
            addTimeout(() => setReplyLinesShown(prev => prev + 1), i * 280);
          });
          // After reply lines are done, transition to CRM view
          const replyDuration = REPLY_LINES.length * 280 + 2500;
          addTimeout(() => {
            setPhase('crm');
            setActiveStep(4);
            // Stagger CRM elements in
            const totalCrmElements = 2 + CRM_CONTACT_ROWS.length + CRM_NOTE_BULLETS.length;
            for (let i = 0; i < totalCrmElements; i++) {
              addTimeout(() => setCrmFieldsShown(prev => prev + 1), i * 180);
            }
            addTimeout(() => setPhase('done'), totalCrmElements * 180 + 500);
          }, replyDuration);
        }, 2000);
      });
    }, 1000);

    // Schedule loop restart with smooth fade
    addTimeout(() => {
      setLoopFading(true);
    }, 19400);
    addTimeout(() => startSequence(), 20000);
  }, [clearAllTimeouts, addTimeout, startTypewriter]);

  useEffect(() => {
    if (isVisible && !hasStarted.current) {
      hasStarted.current = true;
      startSequence();
    }
  }, [isVisible, startSequence]);

  useEffect(() => () => clearAllTimeouts(), [clearAllTimeouts]);

  const steps = [
    { title: t('howItWorks.step1.title'), description: t('howItWorks.step1.description') },
    { title: t('howItWorks.step2.title'), description: t('howItWorks.step2.description') },
    { title: t('howItWorks.step3.title'), description: t('howItWorks.step3.description') },
    { title: t('howItWorks.step4.title'), description: t('howItWorks.step4.description') },
  ];

  const phaseGte = (p: Phase) => {
    const order: Phase[] = ['idle', 'voice', 'transcript', 'thinking', 'reply', 'crm', 'done'];
    return order.indexOf(phase) >= order.indexOf(p);
  };

  const showCrm = phaseGte('crm');

  return (
    <div ref={containerRef} className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-start" style={{ minHeight: '500px' }}>

      {/* ─── macOS Window + Chat ─── */}
      <div className="w-full lg:w-[60%] flex-shrink-0">
        <div className="relative">
          {/* Backdrop shadow — elevated "floating" effect */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: '-24px -20px -36px -20px',
              borderRadius: '38px',
              background: 'radial-gradient(ellipse at 50% 45%, rgba(26,45,99,0.18) 0%, rgba(26,45,99,0.06) 55%, transparent 80%)',
              filter: 'blur(24px)',
            }}
          />
          <div
            className="relative rounded-[22px] overflow-hidden"
            style={{
              boxShadow: '0 35px 80px -8px rgba(0,0,0,0.24), 0 20px 44px -6px rgba(0,0,0,0.16), 0 8px 20px rgba(0,0,0,0.08)',
              opacity: loopFading ? 0 : 1,
              transition: 'opacity 0.6s ease',
            }}
          >

            {/* ── macOS title bar (slightly darker for contrast) ── */}
            <div className="flex items-center px-3.5 py-[9px] bg-[#d4d4d4] border-b border-black/[0.10]">
              {/* Traffic lights */}
              <div className="flex items-center gap-[7px] flex-shrink-0">
                <div className="w-[11px] h-[11px] rounded-full bg-[#ff5f57] border border-[#e0443e]/40" />
                <div className="w-[11px] h-[11px] rounded-full bg-[#febc2e] border border-[#d4a123]/40" />
                <div className="w-[11px] h-[11px] rounded-full bg-[#28c840] border border-[#1aab29]/40" />
              </div>
              <div className="flex-1" />
            </div>

            {/* ── Content area (fixed total height, both views overlap) ── */}
            <div
              className="relative overflow-hidden"
              style={{ height: '436px' }}
            >
              {/* ── WhatsApp full view (header + chat + input) ── */}
              <div
                className="absolute inset-0 flex flex-col"
                style={{
                  opacity: showCrm ? 0 : 1,
                  transform: showCrm ? 'scale(0.98)' : 'scale(1)',
                  transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                  pointerEvents: showCrm ? 'none' : 'auto',
                }}
              >
              {/* WhatsApp header */}
              <div className="flex items-center gap-2.5 px-4 py-[9px] bg-[#008069] flex-shrink-0">
                <div className="w-[38px] h-[38px] rounded-full overflow-hidden flex-shrink-0 bg-white/20 flex items-center justify-center">
                  <img src="/Finit Icon White.svg" alt="VoiceLink" className="w-[22px] h-[22px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-instrument font-semibold text-[15px] text-white leading-tight">VoiceLink</div>
                  <div className="text-[12px] text-white/70 font-instrument leading-tight">online</div>
                </div>
                <div className="flex items-center gap-5">
                  <svg className="w-[20px] h-[20px] text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <svg className="w-[20px] h-[20px] text-white/80" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5.5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="18.5" r="1.6"/></svg>
                </div>
              </div>

              {/* WhatsApp chat body */}
              <div
                className="flex-1 relative overflow-hidden"
                style={{
                  backgroundColor: '#efeae2',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cdefs%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='3' stitchTiles='stitch' type='fractalNoise'/%3E%3CfeColorMatrix values='0 0 0 0 0.87 0 0 0 0 0.85 0 0 0 0 0.80 0 0 0 0.15 0'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }}
              >
                {/* ── User voice bubble (sent — light green) — absolutely positioned ── */}
                <div
                  className="absolute right-[40px] md:right-[52px] left-[40px] md:left-[52px]"
                  style={{
                    bottom: '240px',
                    opacity: phase === 'idle' ? 0 : 1,
                    transform: phase === 'idle'
                      ? 'translateY(230px)'
                      : bubbleShifted
                        ? 'translateY(0)'
                        : phaseGte('thinking')
                          ? 'translateY(190px)'
                          : 'translateY(230px)',
                    transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  <div className="flex justify-end">
                  <div className="w-[82%] md:w-[72%]">
                  <div className="relative">
                    {/* Realistic WhatsApp tail — sent bubble */}
                    <div
                      className="absolute -right-[8px] top-0 w-[8px] h-[13px] overflow-hidden"
                    >
                      <div
                        style={{
                          width: 0,
                          height: 0,
                          borderLeft: '8px solid #d9fdd3',
                          borderBottom: '8px solid transparent',
                          borderTop: '5px solid #d9fdd3',
                        }}
                      />
                    </div>
                    <div className="bg-[#d9fdd3] rounded-[8px] rounded-tr-none px-[10px] py-[6px] shadow-[0_1px_1px_rgba(0,0,0,0.06)]">
                      {/* Voice note row */}
                      <div className="flex items-center gap-2">
                        <button className="w-[26px] h-[26px] flex items-center justify-center flex-shrink-0">
                          <svg className="w-[24px] h-[24px] text-[#54656f]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </button>
                        {/* Animated waveform — keeps playing through reply phase */}
                        <style>{`
                          @keyframes wavePulseHIW {
                            0%, 100% { transform: scaleY(1); }
                            50% { transform: scaleY(0.4); }
                          }
                        `}</style>
                        <div className="flex items-center flex-1 h-[28px]" style={{ gap: '1.2px' }}>
                          {WAVEFORM_BARS.map((h, i) => {
                            const isAnimating = phaseGte('voice') && !phaseGte('crm');
                            return (
                              <div
                                key={i}
                                className="rounded-full"
                                style={{
                                  width: '1.2px',
                                  flexShrink: 0,
                                  flexGrow: 1,
                                  maxWidth: '5px',
                                  backgroundColor: '#5fb583',
                                  height: `${Math.max(h, 12)}%`,
                                  animation: isAnimating
                                    ? `wavePulseHIW ${1.2 + (i % 5) * 0.15}s ease-in-out ${i * 0.07}s infinite`
                                    : 'none',
                                }}
                              />
                            );
                          })}
                        </div>
                        {/* Avatar */}
                        <div className="w-[30px] h-[30px] rounded-full bg-[#dfe5e7] flex items-center justify-center flex-shrink-0 ml-1">
                          <svg className="w-[18px] h-[18px] text-[#8696a0]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        </div>
                      </div>
                      {/* Duration + meta */}
                      <div className="flex items-center justify-between mt-[1px] pl-[34px] pr-0">
                        <span className="text-[11px] text-[#667781] font-instrument">0:12</span>
                        <div className="flex items-center gap-[3px]">
                          <span className="text-[11px] text-[#667781] font-instrument">12:42</span>
                          <svg className="w-[16px] h-[11px] text-[#53bdeb]" viewBox="0 0 16 11" fill="none">
                            <path d="M11.07 0.73L4.93 6.87L2.93 4.87L1.51 6.29L4.93 9.71L12.49 2.15L11.07 0.73Z" fill="currentColor"/>
                            <path d="M14.07 0.73L7.93 6.87L6.93 5.87L5.51 7.29L7.93 9.71L15.49 2.15L14.07 0.73Z" fill="currentColor"/>
                          </svg>
                        </div>
                      </div>

                      {/* Transcript */}
                      {phaseGte('transcript') && (
                        <div
                          className="mt-[5px] pt-[5px] border-t border-black/[0.06]"
                          style={{
                            opacity: phaseGte('transcript') ? 1 : 0,
                            transition: 'opacity 0.3s ease',
                          }}
                        >
                          <p className="text-[12px] leading-[1.6] text-[#111b21]/70 font-instrument">
                            <span className="text-[9.5px] uppercase tracking-[0.08em] text-[#667781]/70 font-semibold block mb-[2px]">Transcript</span>
                            {TRANSCRIPT_TEXT.slice(0, transcriptProgress)}
                            {transcriptProgress < TRANSCRIPT_TEXT.length && (
                              <span className="inline-block w-[1.5px] h-[11px] bg-[#111b21]/40 ml-[1px] align-text-bottom animate-blink" />
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  </div>
                  </div>
                </div>

                {/* ── Typing indicator bubble (received — white) ── */}
                <div
                  className="absolute left-[40px] md:left-[52px] right-[40px] md:right-[52px]"
                  style={{
                    bottom: '10px',
                    opacity: phase === 'thinking' ? 1 : 0,
                    transform: phase === 'thinking'
                      ? 'translateY(0)'
                      : 'translateY(230px)',
                    transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  <div className="w-[82%] md:w-[72%]">
                    <div className="relative">
                      <div className="absolute -left-[8px] top-0 w-[8px] h-[13px] overflow-hidden">
                        <div style={{ width: 0, height: 0, borderRight: '8px solid white', borderBottom: '8px solid transparent', borderTop: '5px solid white' }} />
                      </div>
                      <div className="bg-white rounded-[8px] rounded-tl-none px-[10px] py-[7px] shadow-[0_1px_1px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center gap-[6px] py-[5px] px-1">
                          <span className="w-[7px] h-[7px] rounded-full bg-[#667781]/50 animate-thinking-dot-1" />
                          <span className="w-[7px] h-[7px] rounded-full bg-[#667781]/50 animate-thinking-dot-2" />
                          <span className="w-[7px] h-[7px] rounded-full bg-[#667781]/50 animate-thinking-dot-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Bot reply bubble (received — white) — slides up like the green bubble ── */}
                <div
                  className="absolute left-[40px] md:left-[52px] right-[40px] md:right-[52px]"
                  style={{
                    bottom: '10px',
                    opacity: phase === 'idle' || phase === 'voice' || phase === 'transcript' ? 0 : 1,
                    transform: phaseGte('reply')
                      ? 'translateY(0)'
                      : 'translateY(230px)',
                    transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  <div className="w-[82%] md:w-[72%]">
                  <div className="relative">
                    {/* Realistic WhatsApp tail — received bubble */}
                    <div
                      className="absolute -left-[8px] top-0 w-[8px] h-[13px] overflow-hidden"
                    >
                      <div
                        style={{
                          width: 0,
                          height: 0,
                          borderRight: '8px solid white',
                          borderBottom: '8px solid transparent',
                          borderTop: '5px solid white',
                        }}
                      />
                    </div>
                    <div className="bg-white rounded-[8px] rounded-tl-none px-[10px] py-[7px] shadow-[0_1px_1px_rgba(0,0,0,0.06)]">
                      <div>
                        <div className="text-[12px] font-instrument font-semibold text-[#008069] mb-[4px]">
                          CRM Updated
                        </div>
                        <div className="space-y-[3px]">
                          {REPLY_LINES.map((line, i) => (
                            <div
                              key={i}
                              style={{
                                opacity: i < replyLinesShown ? 1 : 0,
                                transform: i < replyLinesShown ? 'translateY(0)' : 'translateY(5px)',
                                transition: `all 0.3s cubic-bezier(0.22, 1, 0.36, 1) ${i * 30}ms`,
                              }}
                            >
                              <span className="text-[13px] font-instrument text-[#111b21] leading-[1.45]">
                                {line.emoji} {line.text}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end mt-[3px]">
                          <span className="text-[11px] text-[#667781] font-instrument">12:42</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp input bar */}
              <div className="flex items-center gap-[8px] px-[14px] py-[6px] bg-[#f0f2f5] flex-shrink-0">
                <div className="flex-1 flex items-center gap-2 bg-white rounded-[8px] px-3 py-[8px]">
                  <svg className="w-[22px] h-[22px] text-[#54656f] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                  <span className="text-[14px] text-[#667781] font-instrument flex-1">Type a message</span>
                  <svg className="w-[22px] h-[22px] text-[#54656f] flex-shrink-0 rotate-[135deg]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                  </svg>
                </div>
                <div className="w-[40px] h-[40px] rounded-full bg-[#008069] flex items-center justify-center flex-shrink-0">
                  <svg className="w-[20px] h-[20px] text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </div>
              </div>
              </div>{/* end WhatsApp full view */}

              {/* ── CRM Interface View (Teamleader-style) ── */}
              <div
                className="absolute inset-0 flex"
                style={{
                  opacity: showCrm ? 1 : 0,
                  transform: showCrm ? 'scale(1)' : 'scale(1.02)',
                  transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                  pointerEvents: showCrm ? 'auto' : 'none',
                }}
              >
                {/* ── Teamleader sidebar ── */}
                <div
                  className="flex-shrink-0 flex flex-col items-center py-3 gap-1"
                  style={{
                    width: '52px',
                    backgroundColor: '#1b2540',
                  }}
                >
                  {/* TL logo */}
                  <div className="w-[28px] h-[28px] flex items-center justify-center mb-2">
                    <img src="/Teamleader_Icon.svg" alt="" className="w-[20px] h-[20px]" />
                  </div>
                  {/* Nav items */}
                  {CRM_SIDEBAR_ITEMS.map((item, i) => (
                    <div
                      key={item.label}
                      className="flex flex-col items-center justify-center w-full relative"
                      style={{
                        padding: '6px 0',
                        opacity: crmFieldsShown > 0 ? 1 : 0.3,
                        transition: `opacity 0.3s ease ${i * 50}ms`,
                      }}
                    >
                      {item.active && (
                        <div
                          className="absolute left-0 top-1 bottom-1 rounded-r"
                          style={{ width: '3px', backgroundColor: '#50B0B1' }}
                        />
                      )}
                      <div
                        className="w-[20px] h-[20px] flex items-center justify-center"
                        style={{ color: item.active ? '#50B0B1' : 'rgba(255,255,255,0.35)' }}
                      >
                        {/* Contacten */}
                        {i === 0 && (
                          <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                        )}
                        {/* Bedrijven */}
                        {i === 1 && (
                          <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>
                          </svg>
                        )}
                        {/* Deals */}
                        {i === 2 && (
                          <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 100 4h4a2 2 0 110 4H8"/><path d="M12 18V6"/>
                          </svg>
                        )}
                        {/* Agenda */}
                        {i === 3 && (
                          <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                        )}
                      </div>
                      <span
                        className="font-instrument text-center leading-none mt-0.5"
                        style={{
                          fontSize: '7px',
                          color: item.active ? '#50B0B1' : 'rgba(255,255,255,0.3)',
                          fontWeight: item.active ? 600 : 400,
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ── Main content area ── */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#f7f8fa]">
                  {/* Top bar with tabs + breadcrumb */}
                  <div
                    className="flex items-center justify-between px-3 border-b bg-white flex-shrink-0"
                    style={{ height: '32px', borderColor: '#e8eaed' }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-instrument font-semibold text-[10px] uppercase tracking-wider" style={{ color: '#50B0B1', borderBottom: '2px solid #50B0B1', paddingBottom: '6px', marginBottom: '-1px' }}>Overzicht</span>
                      <span className="font-instrument text-[10px] uppercase tracking-wider" style={{ color: '#9ca3af' }}>Mailen</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-[12px] h-[12px]" style={{ color: '#9ca3af' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      <div className="w-[14px] h-[14px] rounded-full" style={{ backgroundColor: '#50B0B1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg className="w-[8px] h-[8px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* Breadcrumb */}
                  <div className="px-3 pt-2 pb-1 flex-shrink-0">
                    <span className="font-instrument text-[9px]" style={{ color: '#50B0B1' }}>&larr; Overzicht contacten</span>
                  </div>

                  {/* Content: two cards side by side */}
                  <div className="flex-1 px-3 pb-3 flex gap-2.5 overflow-hidden min-h-0">

                    {/* Left: Contactinformatie card */}
                    <div
                      className="flex-1 min-w-0 rounded-lg border bg-white overflow-hidden flex flex-col"
                      style={{
                        borderColor: '#e8eaed',
                        opacity: crmFieldsShown > 0 ? 1 : 0,
                        transform: crmFieldsShown > 0 ? 'translateY(0)' : 'translateY(6px)',
                        transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                      }}
                    >
                      {/* Card title bar */}
                      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: '#f0f1f3' }}>
                        <span className="font-instrument font-semibold text-[11px]" style={{ color: '#1f2937' }}>Contactinformatie</span>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-[11px] h-[11px]" style={{ color: '#9ca3af' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          <svg className="w-[11px] h-[11px]" style={{ color: '#9ca3af' }} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                        </div>
                      </div>

                      {/* Avatar + name row */}
                      <div
                        className="flex items-center gap-2.5 px-3 py-2.5"
                        style={{
                          opacity: crmFieldsShown > 0 ? 1 : 0,
                          transition: 'opacity 0.3s ease',
                        }}
                      >
                        <div
                          className="rounded-full flex items-center justify-center font-semibold flex-shrink-0"
                          style={{
                            width: '32px',
                            height: '32px',
                            fontSize: '11px',
                            backgroundColor: '#50B0B1',
                            color: 'white',
                          }}
                        >
                          SM
                        </div>
                        <span className="font-instrument font-medium text-[13px]" style={{ color: '#1f2937' }}>Sarah Mitchell</span>
                      </div>

                      {/* Tags row */}
                      <div
                        className="flex items-center gap-1.5 px-3 pb-2"
                        style={{
                          opacity: crmFieldsShown > 1 ? 1 : 0,
                          transform: crmFieldsShown > 1 ? 'translateY(0)' : 'translateY(3px)',
                          transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                      >
                        {CRM_TAGS.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-[2px] rounded-full font-instrument text-[9px] font-medium"
                            style={{
                              border: '1px solid #e0e2e5',
                              color: '#4b5563',
                              backgroundColor: 'white',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Field-value rows (Teamleader style: label left, value right) */}
                      <div className="flex-1 overflow-hidden">
                        {CRM_CONTACT_ROWS.map((row, i) => (
                          <div
                            key={row.label}
                            className="flex items-baseline gap-2 px-3 py-[5px]"
                            style={{
                              opacity: crmFieldsShown > i + 2 ? 1 : 0,
                              transform: crmFieldsShown > i + 2 ? 'translateX(0)' : 'translateX(-4px)',
                              transition: `all 0.3s cubic-bezier(0.22, 1, 0.36, 1) ${i * 50}ms`,
                            }}
                          >
                            <span
                              className="font-instrument text-[10px] font-semibold flex-shrink-0"
                              style={{ color: '#374151', width: '42%' }}
                            >
                              {row.label}
                            </span>
                            <span
                              className="font-instrument text-[10px] truncate"
                              style={{ color: row.isLink ? '#50B0B1' : '#4b5563' }}
                            >
                              {row.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Achtergrondinformatie card (note) */}
                    <div
                      className="rounded-lg border bg-white overflow-hidden flex flex-col"
                      style={{
                        borderColor: '#e8eaed',
                        width: '42%',
                        flexShrink: 0,
                        opacity: crmFieldsShown > 0 ? 1 : 0,
                        transform: crmFieldsShown > 0 ? 'translateY(0)' : 'translateY(6px)',
                        transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1) 80ms',
                      }}
                    >
                      {/* Card title bar */}
                      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: '#f0f1f3' }}>
                        <span className="font-instrument font-semibold text-[11px]" style={{ color: '#1f2937' }}>Achtergrondinformatie</span>
                        <svg className="w-[11px] h-[11px]" style={{ color: '#9ca3af' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </div>

                      {/* Note body */}
                      <div className="flex-1 px-3 py-2.5">
                        <div className="space-y-1.5">
                          {CRM_NOTE_BULLETS.map((bullet, i) => {
                            const bulletIndex = CRM_CONTACT_ROWS.length + 2 + i + 1;
                            return (
                              <div
                                key={i}
                                className="flex items-start gap-1.5"
                                style={{
                                  opacity: crmFieldsShown >= bulletIndex ? 1 : 0,
                                  transform: crmFieldsShown >= bulletIndex ? 'translateY(0)' : 'translateY(4px)',
                                  transition: `all 0.3s cubic-bezier(0.22, 1, 0.36, 1) ${i * 40}ms`,
                                }}
                              >
                                <span className="flex-shrink-0" style={{ color: '#9ca3af', fontSize: '10px', lineHeight: '1.5' }}>•</span>
                                <span className="font-instrument text-[10px] leading-[1.5]" style={{ color: '#4b5563' }}>
                                  {bullet}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible sections at bottom (just hints, like the screenshot) */}
                  <div className="px-3 pb-2 flex-shrink-0 space-y-[3px]">
                    {['Deals (0)', 'Afspraken (0)'].map((section, i) => (
                      <div
                        key={section}
                        className="flex items-center justify-between px-2.5 py-[5px] rounded bg-white border"
                        style={{
                          borderColor: '#e8eaed',
                          opacity: crmFieldsShown > CRM_CONTACT_ROWS.length + CRM_NOTE_BULLETS.length + 1 ? 0.7 : 0,
                          transition: `opacity 0.3s ease ${i * 60 + 100}ms`,
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <svg className="w-[8px] h-[8px]" style={{ color: '#9ca3af' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                          <span className="font-instrument text-[9px] font-medium" style={{ color: '#6b7280' }}>{section}</span>
                        </div>
                        <svg className="w-[10px] h-[10px]" style={{ color: '#9ca3af' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ─── Step Timeline (vertically centered) ─── */}
      <div
        className="w-full lg:w-[40%] flex items-center justify-center lg:-mt-2"
        style={{
          opacity: loopFading ? 0 : 1,
          transition: 'opacity 0.6s ease',
        }}
      >
        <div className="flex flex-col">
          {steps.map((step, i) => {
            const stepNum = i + 1;
            const isActive = activeStep >= stepNum;
            const isCurrent = activeStep === stepNum;

            return (
              <div key={i} className="flex gap-5 lg:gap-6 items-stretch relative">
                {/* Circle + line */}
                <div className="flex flex-col items-center flex-shrink-0 relative">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center relative z-10 flex-shrink-0"
                    style={{
                      background: isActive ? '#1A2D63' : 'transparent',
                      border: isActive ? 'none' : '2px solid rgba(26, 45, 99, 0.12)',
                      boxShadow: isActive ? '0 4px 14px rgba(26, 45, 99, 0.22)' : 'none',
                      transform: isCurrent ? 'scale(1.12)' : 'scale(1)',
                      transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  >
                    {/* Step 1: Microphone */}
                    {i === 0 && (
                      <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke={isActive ? 'white' : 'rgba(26,45,99,0.25)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.5s' }}>
                        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                        <path d="M19 10v2a7 7 0 01-14 0v-2"/>
                        <line x1="12" y1="19" x2="12" y2="23"/>
                        <line x1="8" y1="23" x2="16" y2="23"/>
                      </svg>
                    )}
                    {/* Step 2: AI Sparkle */}
                    {i === 1 && (
                      <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke={isActive ? 'white' : 'rgba(26,45,99,0.25)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.5s' }}>
                        <path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>
                        <path d="M12 3c0 4.97 4.03 9 9 9-4.97 0-9 4.03-9 9 0-4.97-4.03-9-9-9 4.97 0 9-4.03 9-9z"/>
                        <path d="M19 3c0 1.1.9 2 2 2-1.1 0-2 .9-2 2 0-1.1-.9-2-2-2 1.1 0 2-.9 2-2z" strokeWidth="1.4"/>
                      </svg>
                    )}
                    {/* Step 3: Confirmation checkmark */}
                    {i === 2 && (
                      <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke={isActive ? 'white' : 'rgba(26,45,99,0.25)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.5s' }}>
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    )}
                    {/* Step 4: Database */}
                    {i === 3 && (
                      <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke={isActive ? 'white' : 'rgba(26,45,99,0.25)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.5s' }}>
                        <ellipse cx="12" cy="5" rx="9" ry="3"/>
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                      </svg>
                    )}
                  </div>
                  {/* Connecting line */}
                  {i < steps.length - 1 && (
                    <div className="relative w-[2px] flex-1">
                      <div className="absolute inset-0 rounded-full" style={{ backgroundColor: 'rgba(26, 45, 99, 0.07)' }} />
                      <div
                        className="absolute top-0 left-0 w-full rounded-full"
                        style={{
                          height: activeStep > stepNum ? '100%' : '0%',
                          backgroundColor: '#1A2D63',
                          transition: 'height 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Text */}
                <div
                  className="pt-[10px] pb-8"
                  style={{
                    opacity: isActive ? 1 : 0.28,
                    transform: isActive ? 'translateX(0)' : 'translateX(3px)',
                    transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  <h4
                    className="font-general font-bold text-[17px] lg:text-[18px] leading-tight mb-1.5"
                    style={{
                      color: isActive ? '#1A2D63' : 'rgba(26, 45, 99, 0.35)',
                      transition: 'color 0.5s',
                    }}
                  >
                    {step.title}
                  </h4>
                  <p
                    className="font-instrument text-[14px] lg:text-[15px] leading-relaxed max-w-[440px]"
                    style={{
                      color: isActive ? 'rgba(26, 45, 99, 0.52)' : 'rgba(26, 45, 99, 0.2)',
                      transition: 'color 0.5s',
                    }}
                  >
                    {step.description}
                  </p>
                  <div
                    className="mt-3 h-[2.5px] rounded-full overflow-hidden w-28"
                    style={{
                      backgroundColor: isCurrent ? 'rgba(26, 45, 99, 0.1)' : 'transparent',
                      transition: 'background-color 0.3s ease',
                    }}
                  >
                    {isCurrent && (
                      <div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: '#1A2D63',
                          animation: `progress-bar ${stepNum === 1 ? '4s' : stepNum === 2 ? '2s' : stepNum === 3 ? '2s' : '3.5s'} ease-out forwards`,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
