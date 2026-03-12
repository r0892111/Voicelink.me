import React, { useRef, useEffect, useState, useCallback } from 'react';

// ─── Design canvas: 1400 × 630 px (represents 400 × 180 cm) ───────────────────
const W = 1400;
const H = 630;

const QRPlaceholder: React.FC = () => (
  <svg width={116} height={116} viewBox="0 0 58 58" fill="none">
    {/* Top-left finder */}
    <rect x="1" y="1" width="20" height="20" rx="2" fill="#1A2D63" />
    <rect x="4" y="4" width="14" height="14" rx="1" fill="white" />
    <rect x="7" y="7" width="8" height="8" fill="#1A2D63" />
    {/* Top-right finder */}
    <rect x="37" y="1" width="20" height="20" rx="2" fill="#1A2D63" />
    <rect x="40" y="4" width="14" height="14" rx="1" fill="white" />
    <rect x="43" y="7" width="8" height="8" fill="#1A2D63" />
    {/* Bottom-left finder */}
    <rect x="1" y="37" width="20" height="20" rx="2" fill="#1A2D63" />
    <rect x="4" y="40" width="14" height="14" rx="1" fill="white" />
    <rect x="7" y="43" width="8" height="8" fill="#1A2D63" />
    {/* Data modules */}
    <rect x="24" y="1" width="5" height="5" rx="1" fill="#1A2D63" />
    <rect x="31" y="1" width="4" height="4" rx="1" fill="#1A2D63" />
    <rect x="24" y="8" width="4" height="4" rx="1" fill="#1A2D63" />
    <rect x="24" y="14" width="5" height="5" rx="1" fill="#1A2D63" />
    <rect x="1" y="24" width="5" height="5" rx="1" fill="#1A2D63" />
    <rect x="8" y="24" width="4" height="4" rx="1" fill="#1A2D63" />
    <rect x="15" y="24" width="5" height="5" rx="1" fill="#1A2D63" />
    <rect x="24" y="24" width="7" height="7" rx="1" fill="#1A2D63" />
    <rect x="33" y="24" width="5" height="5" rx="1" fill="#1A2D63" />
    <rect x="40" y="24" width="5" height="5" rx="1" fill="#1A2D63" />
    <rect x="47" y="24" width="10" height="7" rx="1" fill="#1A2D63" />
    <rect x="24" y="33" width="4" height="4" rx="1" fill="#1A2D63" />
    <rect x="30" y="33" width="6" height="5" rx="1" fill="#1A2D63" />
    <rect x="38" y="33" width="5" height="4" rx="1" fill="#1A2D63" />
    <rect x="24" y="40" width="7" height="7" rx="1" fill="#1A2D63" />
    <rect x="33" y="40" width="4" height="4" rx="1" fill="#1A2D63" />
    <rect x="39" y="47" width="8" height="10" rx="1" fill="#1A2D63" />
    <rect x="49" y="40" width="8" height="7" rx="1" fill="#1A2D63" />
    <rect x="24" y="50" width="13" height="7" rx="1" fill="#1A2D63" />
  </svg>
);

const Arrow: React.FC = () => (
  <svg width="52" height="18" viewBox="0 0 52 18" fill="none" style={{ flexShrink: 0 }}>
    <path d="M2 9h44M36 3l11 6-11 6" stroke="#1A2D63" strokeOpacity="0.2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ConferenceBanner: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const updateScale = useCallback(() => {
    if (!pageRef.current) return;
    const available = pageRef.current.clientWidth - 80; // 40px padding each side
    setScale(Math.min(available / W, 1));
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  return (
    <div
      ref={pageRef}
      style={{
        minHeight: '100vh',
        background: '#d6d2cc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 20,
        fontFamily: "'Satoshi', 'Instrument Sans', system-ui, sans-serif",
      }}
    >
      <span style={{ color: 'rgba(26,45,99,0.45)', fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 600 }}>
        Conferentie backdrop — 400 × 180 cm
      </span>

      {/* Outer box reserves the scaled visual space */}
      <div style={{ width: W * scale, height: H * scale, position: 'relative', flexShrink: 0 }}>
        {/* Inner box is the actual 1400×630 design, scaled to fit */}
        <div
          style={{
            width: W,
            height: H,
            position: 'absolute',
            top: 0,
            left: 0,
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
            background: '#FDFBF7',
            borderRadius: 10,
            overflow: 'hidden',
            boxShadow: '0 16px 80px rgba(0,0,0,0.22)',
            display: 'flex',
          }}
        >
          {/* ── LEFT PANEL: Navy ────────────────────────────────────────────── */}
          <div
            style={{
              width: 290,
              background: '#1A2D63',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '52px 40px 48px',
              position: 'relative',
            }}
          >
            {/* Subtle inner glow top */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 160, background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)', pointerEvents: 'none' }} />

            {/* Logo */}
            <div>
              <img
                src="/Finit Voicelink Blue.svg"
                alt="VoiceLink"
                style={{ width: 160, height: 'auto', display: 'block', filter: 'brightness(0) invert(1)' }}
              />
              <div style={{ width: 36, height: 2, background: 'rgba(255,255,255,0.18)', borderRadius: 2, marginTop: 28, marginBottom: 22 }} />
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, margin: 0, lineHeight: 1.6 }}>
                WhatsApp spraakbericht<br />→ CRM update in seconden
              </p>
            </div>

            {/* QR + URL */}
            <div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: '0 0 12px', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                Probeer gratis
              </p>
              <div
                style={{
                  width: 136,
                  height: 136,
                  background: 'white',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 18,
                }}
              >
                <QRPlaceholder />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 5px' }}>Scan of bezoek</p>
              <p style={{ color: 'white', fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>voicelink.me</p>
            </div>

            {/* Finit */}
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, margin: 0, fontWeight: 500 }}>
              By Finit Solutions
            </p>
          </div>

          {/* ── RIGHT PANEL: Porcelain ────────────────────────────────────────── */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '52px 72px 48px 64px',
              position: 'relative',
            }}
          >
            {/* Subtle corner decoration (mirrors homepage) */}
            <svg
              style={{ position: 'absolute', top: 0, right: 0, width: 200, pointerEvents: 'none' }}
              viewBox="0 0 200 140"
              aria-hidden="true"
            >
              <path d="M200,-5 L165,-5 C165,45 155,65 178,78 C198,89 197,100 201,112 Z" fill="#1A2D63" opacity="0.05" />
              <path d="M168,-5 C168,43 157,62 179,76 C200,88 199,99 202,110 L200,115 C196,103 198,91 176,80 C152,66 162,45 162,-5 Z" fill="#7B8DB5" opacity="0.06" />
            </svg>

            {/* ── TOP: Eyebrow + Headline + Sub ── */}
            <div>
              {/* Eyebrow */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(26,45,99,0.06)',
                  border: '1px solid rgba(26,45,99,0.1)',
                  borderRadius: 100,
                  padding: '6px 16px',
                  marginBottom: 32,
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1A2D63', opacity: 0.4 }} />
                <span style={{ color: '#475D8F', fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                  AI-powered CRM automatisering
                </span>
              </div>

              {/* Headline */}
              <div style={{ marginBottom: 28 }}>
                <div
                  style={{
                    color: '#1A2D63',
                    fontSize: 72,
                    fontWeight: 300,
                    lineHeight: 1,
                    letterSpacing: '-2px',
                    fontStyle: 'italic',
                    opacity: 0.55,
                    marginBottom: 6,
                  }}
                >
                  Just...
                </div>
                {/* "Talk to your [Teamleader logo]." — inline flex */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, lineHeight: 1 }}>
                  <span
                    style={{
                      color: '#1A2D63',
                      fontSize: 94,
                      fontWeight: 800,
                      letterSpacing: '-3px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span
                      style={{
                        textDecoration: 'underline',
                        textDecorationColor: 'rgba(26,45,99,0.25)',
                        textDecorationThickness: 5,
                        textUnderlineOffset: 6,
                      }}
                    >
                      Talk
                    </span>
                    {' '}to your
                  </span>
                  <img
                    src="/Logo_Teamleader_Default_CMYK.png"
                    alt="Teamleader"
                    style={{ height: 200, width: 'auto', display: 'block', flexShrink: 0, clipPath: 'inset(0 6% 0 6%)' }}
                  />
                  <span style={{ color: '#1A2D63', fontSize: 94, fontWeight: 800, letterSpacing: '-3px' }}>.</span>
                </div>
              </div>

              {/* Sub-copy */}
              <p
                style={{
                  color: '#7B8DB5',
                  fontSize: 22,
                  lineHeight: 1.55,
                  margin: 0,
                  maxWidth: 680,
                  fontWeight: 400,
                }}
              >
                Stuur een WhatsApp-spraakbericht en Teamleader wordt automatisch bijgewerkt — zonder ook maar één toets aan te raken.
              </p>
            </div>

            {/* ── BOTTOM: Step flow + Partners ── */}
            <div>
              <div style={{ width: '100%', height: 1, background: 'rgba(26,45,99,0.08)', marginBottom: 32 }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>

                {/* Step: WhatsApp */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: '50%',
                      background: '#25D366',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 16px rgba(37,211,102,0.3)',
                    }}
                  >
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                      <rect x="9" y="2" width="6" height="11" rx="3" fill="white" />
                      <path d="M5 10a7 7 0 0014 0" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="12" y1="19" x2="12" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      <line x1="8" y1="22" x2="16" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span style={{ color: '#1A2D63', fontSize: 14, fontWeight: 600, opacity: 0.55, whiteSpace: 'nowrap' }}>WhatsApp</span>
                </div>

                <Arrow />

                {/* Step: VoiceLink AI */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: '50%',
                      background: '#1A2D63',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 30,
                      boxShadow: '0 4px 20px rgba(26,45,99,0.3)',
                    }}
                  >
                    ✦
                  </div>
                  <span style={{ color: '#1A2D63', fontSize: 14, fontWeight: 600, opacity: 0.55, whiteSpace: 'nowrap' }}>VoiceLink AI</span>
                </div>

                <Arrow />

                {/* Step: CRM */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 16,
                      background: 'white',
                      border: '1px solid rgba(26,45,99,0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      gap: 5,
                      padding: '0 14px',
                      boxShadow: '0 2px 12px rgba(26,45,99,0.08)',
                    }}
                  >
                    {[
                      { dot: '#22c55e', label: 'Notitie' },
                      { dot: '#3b82f6', label: 'Taak' },
                      { dot: '#f59e0b', label: 'Deal' },
                    ].map(({ dot, label }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                        <span style={{ color: '#1A2D63', fontSize: 11, opacity: 0.65, fontWeight: 500 }}>{label}</span>
                      </div>
                    ))}
                  </div>
                  <span style={{ color: '#1A2D63', fontSize: 14, fontWeight: 600, opacity: 0.55, whiteSpace: 'nowrap' }}>Teamleader</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <span style={{ color: 'rgba(26,45,99,0.25)', fontSize: 11, letterSpacing: 1 }}>
        /banner — niet gelinkt op de website
      </span>
    </div>
  );
};
