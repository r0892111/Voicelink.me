# Interactive Demo: "How It Works" Section Redesign

## Overview
Replace the current 3-card static "How WhatsApp Voice Notes Work" section with an animated WhatsApp-style chat UI that plays through the VoiceLink flow in real time, synced with step indicators on the right.

**Layout:** Chat mock (left, ~60%) | Vertical step timeline (right, ~40%) on desktop. Stacked on mobile (chat on top, steps below).

**Background:** Cream (porcelain), consistent with surrounding sections.

---

## File to modify
`src/components/Homepage.tsx` — replace section 4 ("HOW IT WORKS", ~lines 78-167)

New component: `src/components/HowItWorksDemo.tsx` (extracted for complexity)

---

## Design

### Left side: WhatsApp-style chat UI
A contained card styled like a WhatsApp chat window:
- **Chat header:** Green WhatsApp-style top bar with "VoiceLink" name + online indicator
- **Chat background:** Light beige/cream with subtle WhatsApp-style pattern (or clean white)
- **Messages are right-aligned (user) and left-aligned (VoiceLink bot)**

#### Animation sequence (triggered on scroll-into-view):

**Phase 1 — Voice Input (~3s)**
- A green chat bubble appears (right-aligned, user message)
- Inside: a voice note waveform bar (SVG/CSS bars) with a play button and duration label (e.g. "0:12")
- After ~0.8s, a transcript fades in below the waveform in smaller italic text, typewriter-animated:
  > "Just had a call with Sarah Mitchell from TechFlow Solutions. She's the procurement manager. Her number is 0456 789 123, email sarah@techflow.be. Enterprise client, very promising."
- Step 1 on the right activates (highlighted)

**Phase 2 — AI Processing (~2s)**
- A left-aligned bubble appears with VoiceLink avatar/icon
- Shows animated "thinking" indicator: three pulsing dots (like WhatsApp typing indicator), with subtle text "Processing..." that fades in
- The dots pulse for ~1.5-2 seconds
- Step 2 on the right activates

**Phase 3 — CRM Update Confirmation (~2.5s)**
- The thinking bubble transforms into the actual reply message (left-aligned, VoiceLink):
  > ✅ **Contact created:** Sarah Mitchell
  > 🏢 TechFlow Solutions — Procurement Manager
  > 📞 0456 789 123
  > 📧 sarah@techflow.be
  > 🏷️ Hot Lead · Enterprise Client
- Each line appears with a short stagger (typewriter per line, not per character — snappier)
- Step 3 on the right activates

**Phase 4 — Pause & replay**
- 5 seconds after phase 3 completes, reset all state and replay from phase 1
- Smooth fade-out before restart

### Right side: Vertical step timeline
Three steps stacked vertically, connected by a line:
- Each step: circle indicator (number) + title + short description
- **Inactive state:** muted colors (navy/20 text, grey circle)
- **Active state:** navy circle filled, navy text, subtle glow/scale — transitions smoothly
- Steps activate in sync with the chat phases (1→2→3)

Steps use existing i18n keys:
1. `howItWorks.step1.title` / `howItWorks.step1.description` (Voice Input)
2. `howItWorks.step2.title` / `howItWorks.step2.description` (AI Processing)
3. `howItWorks.step3.title` / `howItWorks.step3.description` (CRM Integration)

---

## Implementation plan

### 1. Create `src/components/HowItWorksDemo.tsx`

**State management:**
- `phase` ref or state: `'idle' | 'voice' | 'transcript' | 'thinking' | 'reply' | 'done'`
- `activeStep`: 0 | 1 | 2 | 3 (0 = none active yet)
- `isVisible` via IntersectionObserver (threshold 0.3)
- `transcriptProgress`: number of characters shown (for typewriter)
- `replyLinesShown`: number of reply lines visible (for staggered reveal)

**Timing (driven by `setTimeout` chain, started on `isVisible`):**
```
0.0s — phase='voice', activeStep=1, voice bubble slides in
0.8s — phase='transcript', typewriter starts
3.0s — phase='thinking', activeStep=2, thinking bubble appears
5.0s — phase='reply', activeStep=3, reply lines stagger in
7.5s — phase='done'
12.5s — reset all, replay
```

**No external animation library needed** — CSS transitions + JS timeouts + requestAnimationFrame for typewriter.

### 2. Chat UI component structure

```
<div className="...chat-container"> {/* rounded card with shadow */}
  {/* Chat header */}
  <div> VoiceLink icon + name + "online" </div>

  {/* Chat body */}
  <div className="...scroll area">
    {/* User voice message — green bubble, right-aligned */}
    {phase >= 'voice' && (
      <div className="...user-bubble">
        <VoiceWaveform />  {/* SVG bars + play button + duration */}
        {phase >= 'transcript' && (
          <p className="...transcript italic">
            {transcript.slice(0, transcriptProgress)}
          </p>
        )}
      </div>
    )}

    {/* VoiceLink thinking/reply — left-aligned */}
    {phase >= 'thinking' && (
      <div className="...bot-bubble">
        {phase === 'thinking' ? <ThinkingDots /> : <ReplyContent />}
      </div>
    )}
  </div>
</div>
```

### 3. Voice waveform component
- CSS-only: 20-25 thin bars of varying height inside a flex container
- Heights are random-seeded (static, not animated — it's a "recorded" note)
- Small play button (green circle with white triangle) on the left
- Duration label "0:12" on the right
- Styled like a real WhatsApp voice note

### 4. Thinking dots animation
- Three dots in a row, each with a CSS `animation: pulse` with staggered `animation-delay`
- Subtle "Processing..." text next to or below the dots
- CSS keyframes: scale 1 → 1.4 → 1, opacity 0.4 → 1 → 0.4

### 5. Reply content
- Each line is a `<div>` that transitions from `opacity: 0, translateY(8px)` to `opacity: 1, translateY(0)`
- Lines appear one by one with ~300ms stagger
- Uses emoji + bold formatting for structure

### 6. Step timeline (right side)
```
<div className="...vertical timeline">
  {steps.map((step, i) => (
    <div className={`...step ${activeStep >= i+1 ? 'active' : 'inactive'}`}>
      <div className="...circle">{i+1}</div>
      <div>
        <h4>{step.title}</h4>
        <p>{step.description}</p>
      </div>
    </div>
  ))}
</div>
```
- Connected by a vertical line (pseudo-element or border)
- Active step: filled navy circle, full opacity text, subtle scale
- Transition: `transition-all duration-500`

### 7. Update Homepage.tsx
- Import `HowItWorksDemo`
- Replace section 4 content with `<HowItWorksDemo />`
- Keep the section wrapper, title, and subtitle

### 8. Mobile layout
- Chat UI full width, steps below as horizontal or compact vertical
- Chat UI slightly smaller padding
- Same animation sequence

---

## Hardcoded text (no i18n needed for demo content)
- Voice transcript: "Just had a call with Sarah Mitchell from TechFlow Solutions. She's the procurement manager. Her number is 0456 789 123, email sarah@techflow.be. Enterprise client, very promising."
- Reply lines are structured data (emoji + text), hardcoded in the component

## i18n keys reused
- `howItWorks.title`, `howItWorks.subtitle`
- `howItWorks.step1.title`, `howItWorks.step1.description`
- `howItWorks.step2.title`, `howItWorks.step2.description`
- `howItWorks.step3.title`, `howItWorks.step3.description`
