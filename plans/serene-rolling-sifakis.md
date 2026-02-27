# Plan: HowItWorksDemo — Add "Bevestiging" Step + CRM Interface Animation

## Context
The current HowItWorksDemo has 3 steps (Voice Input → AI Processing → CRM Integration) with a WhatsApp UI animation. The user wants to:
1. Insert a "Bevestiging" (Confirmation) step at position 3, shifting "CRM Integratie" to position 4
2. Add a 4th animation phase where the WhatsApp UI crossfades into a CRM interface showing contact card + note
3. Keep the waveform animation playing throughout the WhatsApp phases (currently stops at `thinking`)
4. Darken the macOS title bar for more contrast

## Files to Modify

- **`src/components/HowItWorksDemo.tsx`** — Main changes (animation, CRM view, waveform fix, title bar)
- **`src/i18n/locales/nl.json`** — Add step4 translations, update subtitle
- **`src/i18n/locales/en.json`** — Add step4 translations, update subtitle
- **`src/i18n/locales/fr.json`** — Add step4 translations, update subtitle
- **`src/i18n/locales/de.json`** — Add step4 translations, update subtitle

## Implementation

### 1. Update Phase Type & Timeline

**Current:** `'idle' | 'voice' | 'transcript' | 'thinking' | 'reply' | 'done'`
**New:** `'idle' | 'voice' | 'transcript' | 'thinking' | 'reply' | 'crm' | 'done'`

New sequence timing:
- `0ms` → idle
- `200ms` → voice (step 1 active)
- `1000ms` → transcript starts (step 2 active)
- After typewriter done + 600ms → thinking (step 2 current, dots)
- After 2000ms → reply (step 3 "Bevestiging" active, confirmation lines appear)
- After reply lines done + 1500ms → crm (step 4 "CRM Integratie" active, crossfade to CRM view)
- After 3500ms → done
- After 3000ms idle → loop restart (~18s total cycle)

### 2. Update Step Indicators (3 → 4 Steps)

```
Step 1: Spraak Invoer (Voice Input) — Microphone icon
Step 2: AI Verwerking (AI Processing) — Sparkle icon
Step 3: Bevestiging (Confirmation) — Checkmark/shield icon ✓
Step 4: CRM Integratie (CRM Integration) — Database icon
```

Add `howItWorks.step3` as "Bevestiging" with appropriate description, shift current step3 to `step4`.

Update `activeStep` mapping:
- Step 1 → voice phase
- Step 2 → transcript/thinking phase
- Step 3 → reply phase (confirmation)
- Step 4 → crm phase

Progress bar durations: step1=4s, step2=2s, step3=2s, step4=3.5s

### 3. CRM Interface View (New Phase)

Build a CRM interface that crossfades over the WhatsApp UI (same container, absolute positioned). Reference styling from Card 7 (Upsell Detection) in HeroDemo.tsx.

**Layout:** Two-panel side-by-side in the chat body area:

**Left panel — Contact Card (~40% width):**
- Rounded card with `bg-navy/[0.03] border border-navy/[0.06]`
- Avatar circle with "SM" initials (navy/10 bg)
- Name: "Sarah Mitchell" (bold, navy)
- Role: "Procurement Manager" (slate-blue/60)
- Company: "TechFlow Solutions" with building icon
- Phone: "0456 789 123" with phone icon
- Email: "sarah@techflow.be" with email icon
- Tag pill: "Hot Lead · Enterprise" with tag icon (navy bg, white text)

**Right panel — Note Card (~60% width):**
- Rounded card with gradient bg like Card 7's note
- Header bar: note icon + "Sarah Mitchell" + timestamp "12:42"
- Bulleted list with brief info from the voice note:
  - "Procurement Manager at TechFlow Solutions"
  - "Enterprise client — very promising"
  - "Phone: 0456 789 123"
  - "Email: sarah@techflow.be"

**CRM header bar** (replaces WhatsApp header during crm phase):
- Same height/position as WhatsApp header
- Navy/dark background with CRM-style title ("CRM" or generic CRM name)
- Subtle transition from green WhatsApp header

**Animation:** Elements stagger in with opacity + translateY, similar to reply lines.

### 4. Crossfade Implementation

Use a wrapper div with `position: relative` containing both WhatsApp and CRM views. During the `crm` phase:
- WhatsApp content: `opacity: 0, transform: scale(0.98)` with 0.6s transition
- CRM content: `opacity: 1, transform: scale(1)` with 0.6s transition (starts from `opacity: 0, scale(1.02)`)
- Both use `position: absolute` during transition, then CRM becomes `position: relative`

### 5. Fix Waveform Animation

**Current:** `const isAnimating = phaseGte('voice') && !phaseGte('thinking');`
**New:** `const isAnimating = phaseGte('voice') && !phaseGte('crm');`

This keeps the waveform pulsing through voice → transcript → thinking → reply phases, only stopping when the CRM view takes over.

### 6. Darken macOS Title Bar

**Current:** `bg-[#e8e8e8]`
**New:** `bg-[#d6d6d6]` or `bg-[#d0d0d0]` — slightly darker for better contrast against the WhatsApp header and the traffic light dots.

### 7. i18n Updates

All 4 locale files need:
- Rename current `step3` → `step4`
- Add new `step3`: title = "Bevestiging" / "Confirmation" / "Bestätigung" / "Confirmation"
- Update subtitle to reference "four steps" instead of "three"

## Verification
1. `npm run dev` — visually verify the animation loop
2. Check all 4 steps light up sequentially in the timeline
3. Verify waveform keeps animating through thinking/reply phases
4. Verify smooth crossfade from WhatsApp to CRM interface
5. Verify CRM interface shows contact card + note with correct data
6. Check responsive behavior on mobile
7. `npm run build` — ensure no TypeScript errors
