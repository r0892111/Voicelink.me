# FINIT SOLUTIONS — Complete Visual Identity & Design System

> **Scope**: This guide documents the design system as used on the **current main homepage** (`ai-design-landing.tsx`) and **all landing pages** (`/herken-jij-dit`, `/hoe-het-werkt`, `/installateurs`, `/loodgieters`, `/elektriciens`, `/plan-gesprek`, `/roi-calculator`, etc.). It is the single source of truth for replicating the Finit Solutions visual identity.

---

## 1. COLOR SYSTEM

### 1.1 Core Palette (3 colors only)

The entire site uses an extremely restrained palette of just three colors plus functional accents:

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Porcelain White** | `#FDFBF7` | `253, 251, 247` | Page background everywhere. Warm off-white, NOT pure white. |
| **Oxford Navy** | `#1A2D63` | `26, 45, 99` | Primary brand color. All headings, buttons, icons, footer bg, nav CTA. |
| **Slate Blue** | `#475D8F` | `71, 93, 143` | Secondary text, body copy, subtitles, muted elements. |

### 1.2 Derived / Opacity Variants

These are NOT separate colors — they are the core palette at different opacities:

| Variant | Value | Usage |
|---------|-------|-------|
| Navy at 60% | `text-[#1A2D63]/60` or `rgba(26,45,99,0.6)` | Subtitle/secondary text on light backgrounds |
| Navy at 40% | `text-[#1A2D63]/40` | Muted labels, timestamps |
| Navy at 15% | `border-[#1A2D63]/[0.15]` | Card borders on hover |
| Navy at 10% | `border-[#1A2D63]/10` | Default card borders, nav border on scroll |
| Navy at 6% | `border-[#1A2D63]/[0.06]` | Subtle card borders (default state) |
| Navy at 4% | `bg-[#1A2D63]/[0.04]` | Very subtle card fill (comparison "before" cards) |
| Slate at 70% | `text-[#475D8F]/70` | Small print, integration labels |
| Hover Navy | `#2A4488` | Button hover state (slightly lighter navy) |

### 1.3 Accent Colors (Functional only)

| Color | Hex | Usage |
|-------|-----|-------|
| **Soft Blue Glow** | `#B8C5E6` | CTA section glow background (`blur-[120px] opacity-30`) |
| **Muted Blue** | `#7B8DB5` | Section divider accent line (lighter curve) |
| **Dark Slate** | `#2D3A5C` | Typewriter underline stroke (`strokeOpacity="0.22"`) |
| **Green** | `text-green-600` | Checkmark icons in benefit lists |
| **Emerald** | `text-emerald-400` | Pulsing dot in highlight pills (on navy bg) |
| **White** | `#FFFFFF` | Card backgrounds, button text on navy, inverted buttons |

### 1.4 Dark Mode (Navy Sections)

Several sections use navy (`#1A2D63`) as the background. On navy:
- Text: `text-white` (headings), `text-white/60` or `text-white/70` (body), `text-white/40` or `text-white/50` (muted)
- Borders: `border-white/10` (default), `border-white/[0.08]` (subtle)
- Card fills: `bg-white/[0.06]` (glass cards), `bg-white/5` (footer contact card)
- Hover states: `hover:bg-white/[0.09]` (glass cards), `hover:bg-white/5` (links)

### 1.5 Text Selection Color

```css
selection:bg-[#B8C5E6] selection:text-[#1A2D63]
```

---

## 2. TYPOGRAPHY

### 2.1 Font Stack

| Font | Family | Role | Weight(s) Used |
|------|--------|------|----------------|
| **Newsreader** | Serif | Headings, hero text, blockquotes, large display text | `font-extralight` (200), `font-semibold` (600), `font-bold` (700) + italic |
| **Instrument Sans** | Sans-serif | Body text, subtitles, buttons, navigation, UI elements | 400, 500, 600 |

**Loading**: Via Google Fonts `@import` in `globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Newsreader:ital,opsz,wght@0,6..72,200;0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400&display=swap');
```

**CSS classes**:
```css
.font-newsreader { font-family: 'Newsreader', serif; }
.font-instrument { font-family: 'Instrument Sans', sans-serif; }
```

### 2.2 Base Font Size

```css
html { font-size: 15px; }
```

This is a deliberate choice (not the standard 16px). All `rem` values are relative to 15px.

### 2.3 Heading Hierarchy

| Level | Font | Size (Desktop) | Size (Mobile) | Weight | Line-height | Color |
|-------|------|----------------|---------------|--------|-------------|-------|
| **H1 (Hero)** | Newsreader | `text-[4.75rem]` (76px) | `text-5xl` (48px) | `font-extralight` (200) | `leading-[1]` | `text-[#1A2D63]` |
| **H1 Typewriter** | Newsreader | (same as H1) | (same) | `font-bold italic` | `leading-[1]` | `text-[#1A2D63]` |
| **H2 (Section)** | Newsreader | `text-5xl` (48px) | `text-3xl` (30px) | Default (400) | `leading-[1.15]` | `text-[#1A2D63]` |
| **H3 (Card title)** | System (sans) | `text-[17px]` or `text-xl` | Same | `font-semibold` (600) | `leading-tight` | `text-[#1A2D63]` |
| **Body** | Instrument Sans | `text-[15px]` or `md:text-lg` | `text-base` | 400 | `leading-relaxed` | `text-[#475D8F]` |
| **Small/Label** | Instrument Sans | `text-sm` or `text-xs` | Same | `font-medium` | Default | `text-[#1A2D63]/60` |

### 2.4 Responsive H1 Scale

The hero H1 uses a 3-step responsive scale:
```
Mobile:  text-5xl           → ~48px
Desktop: text-6xl           → ~60px
Large:   lg:text-[4.25rem]  → 68px
XL:      xl:text-[4.75rem]  → 76px
```

### 2.5 Uppercase Labels

Small labels use a distinctive treatment:
```css
text-xs uppercase tracking-widest text-[#1A2D63]/40 font-medium
/* or */
text-[11px] sm:text-xs uppercase tracking-[0.2em] text-[#475D8F]/70
```

### 2.6 H2 Underline Decoration

Section headings often feature an SVG brush-stroke underline on a key word:

```jsx
<span className="relative inline-block">
  <span className="relative z-10">keyword</span>
  <svg
    className="absolute -bottom-1 left-0 w-full h-[0.35em] z-0"
    viewBox="0 0 200 20"
    preserveAspectRatio="none"
    fill="none"
  >
    <path
      d="M3 14 Q40 4 100 12 Q160 18 197 8"
      stroke="#1A2D63"
      strokeOpacity="0.15"
      strokeWidth="10"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
</span>
```

On navy backgrounds, the stroke changes to: `stroke="#7B8DB5" strokeOpacity="0.5"`

---

## 3. SPACING & LAYOUT

### 3.1 Page Container

```css
max-w-[1400px] mx-auto px-4 sm:px-6
/* Landing pages also use: */
max-w-[1200px], max-w-[1000px], max-w-[900px], max-w-[800px], max-w-[700px]
```

Container widths narrow for content-focused sections (FAQ, text, quotes) and widen for hero/footer.

### 3.2 Section Spacing

| Section Type | Padding |
|-------------|---------|
| Standard content section | `py-16 md:py-24 px-4 sm:px-6 md:px-12` |
| Quote/testimonial section | `py-14 md:py-20 px-4 sm:px-6 md:px-12` |
| Final CTA section | `pt-8 md:pt-12 pb-20 md:pb-32 px-6 md:px-12` |
| Section heading margin-bottom | `mb-12 md:mb-16` |
| Footer | `pt-12 md:pt-16 pb-10 md:pb-12 px-6` |

### 3.3 Grid Layouts

| Component | Grid |
|-----------|------|
| Pain point cards | `grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4` |
| Solution cards (3) | `grid-cols-1 md:grid-cols-3 gap-5 md:gap-6` |
| How-it-works steps (3) | `grid-cols-1 md:grid-cols-3 gap-8 md:gap-10` |
| Footer | `lg:grid-cols-[1.3fr_1fr] gap-10 lg:gap-12` |
| Before/After comparison | `flex flex-col sm:flex-row gap-4 md:gap-6` |

### 3.4 Responsive Breakpoints

Standard Tailwind breakpoints:
- `sm`: 640px
- `md`: 768px (primary mobile→desktop breakpoint)
- `lg`: 1024px
- `xl`: 1280px

Hero section uses `md:` as the split between mobile and desktop layouts (separate JSX trees).

---

## 4. COMPONENT STYLES

### 4.1 Primary CTA Button

The main call-to-action button used everywhere:

```jsx
<button className="group bg-[#1A2D63] text-white px-6 py-3 rounded-full text-[15px] font-medium flex items-center justify-center gap-2.5 hover:bg-[#2A4488] transition-colors shadow-lg shadow-[#1A2D63]/10">
  <Calendar className="w-4 h-4" />
  <span>Plan een gratis consult</span>
  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
</button>
```

**Key traits**:
- `rounded-full` (pill shape, always)
- Navy background `#1A2D63`, hover to `#2A4488`
- Shadow: `shadow-lg shadow-[#1A2D63]/10`
- Icon + text + arrow pattern (Calendar left, ArrowRight right)
- Arrow animates right on hover: `group-hover:translate-x-1`
- Size: `text-[15px]`, padding `px-6 py-3`

### 4.2 Large CTA Button (Final CTA sections)

```jsx
className="inline-flex items-center gap-2 md:gap-3 bg-[#1A2D63] text-white px-6 py-3.5 md:px-10 md:py-5 rounded-full text-base md:text-lg font-medium hover:scale-105 transition-transform shadow-2xl shadow-[#1A2D63]/20"
```

Larger padding, larger shadow, `hover:scale-105` instead of color change.

### 4.3 Nav CTA Button

Same as primary but with scroll-responsive padding via inline styles:
```jsx
style={{
  paddingLeft: `${20 + (1 - navScrollProgress) * 4}px`,
  paddingRight: `${20 + (1 - navScrollProgress) * 4}px`,
  paddingTop: `${10 + (1 - navScrollProgress) * 2}px`,
  paddingBottom: `${10 + (1 - navScrollProgress) * 2}px`,
}}
```

### 4.4 Inverted Button (Footer, on navy)

```jsx
className="bg-white text-[#1A2D63] px-6 py-3 rounded-full text-base font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2"
```

### 4.5 Ghost/Outline Button (Footer secondary)

```jsx
className="border border-white/20 px-6 py-3 rounded-full text-base font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
```

### 4.6 Sticky Mobile CTA

Fixed bottom bar, shown after 30% scroll:
```jsx
<div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
  <div className="bg-[#FDFBF7]/90 backdrop-blur-xl border-t border-[#1A2D63]/10 px-4 py-3">
    <button className="flex items-center justify-center gap-2.5 bg-[#1A2D63] text-white w-full py-3 rounded-full text-[15px] font-medium shadow-lg shadow-[#1A2D63]/20">
```

### 4.7 Content Cards (Solution cards)

```jsx
<div className="bg-white rounded-2xl p-7 border border-[#1A2D63]/[0.06] h-full group-hover:border-[#1A2D63]/[0.15] transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1">
  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1A2D63] to-[#2A4488] flex items-center justify-center mb-5 shadow-md shadow-[#1A2D63]/15">
    <Icon className="w-5 h-5 text-white" />
  </div>
  <h3 className="text-[17px] font-semibold text-[#1A2D63] mb-2 leading-tight">Title</h3>
  <p className="text-[#475D8F] text-[15px] leading-relaxed">Description</p>
</div>
```

**Key traits**:
- `rounded-2xl` (16px radius)
- White background
- Very subtle border: `border-[#1A2D63]/[0.06]` → hover to `border-[#1A2D63]/[0.15]`
- Shadow: `shadow-lg` → hover to `shadow-2xl`
- Hover lift: `hover:-translate-y-1`
- Icon box: gradient navy, rounded-xl, shadow

### 4.8 Pain Point Cards

```jsx
<div className="flex items-center gap-4 bg-white rounded-xl px-5 py-4 border-l-[3px] border-[#1A2D63]/20 hover:border-[#1A2D63] transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 cursor-default">
  <div className="w-10 h-10 rounded-lg bg-[#1A2D63]/[0.06] group-hover:bg-[#1A2D63]/[0.12] flex items-center justify-center">
    <Icon className="w-5 h-5 text-[#1A2D63]" />
  </div>
  <p className="text-[#1A2D63] font-medium text-base leading-snug">Text</p>
</div>
```

**Key traits**:
- Left border accent: `border-l-[3px] border-[#1A2D63]/20` → hover solid navy
- `rounded-xl` (12px radius)
- Smaller lift: `hover:-translate-y-0.5`

### 4.9 Glass Cards (On navy backgrounds)

```jsx
<div className="bg-white/[0.06] rounded-2xl border border-white/10 hover:bg-white/[0.09] hover:-translate-y-1 transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15">
```

### 4.10 FAQ Accordion Items

```jsx
<div className="bg-white rounded-xl border border-[#1A2D63]/[0.06] shadow-lg hover:shadow-xl transition-all overflow-hidden">
```

Accordion uses Radix UI primitives with custom trigger (chevron rotates 180deg on open):
```jsx
<ChevronDown className="w-5 h-5 text-[#475D8F] shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180" />
```

### 4.11 Comparison/Before-After Cards

**"Before" card (light)**:
```jsx
className="bg-[#1A2D63]/[0.04] rounded-2xl p-7 md:p-8 text-center border border-[#1A2D63]/[0.08] shadow-lg"
```

**"After" card (navy solid)**:
```jsx
className="bg-[#1A2D63] rounded-2xl p-7 md:p-8 text-center shadow-xl shadow-[#1A2D63]/15"
```

### 4.12 "Breadth Indicator" Card (Dashed border)

```jsx
<button className="group flex items-center gap-4 max-w-2xl mx-auto rounded-2xl border-2 border-dashed border-[#1A2D63]/15 hover:border-[#1A2D63]/30 px-6 py-5 transition-all hover:bg-white/60 cursor-pointer w-full text-left">
```

### 4.13 CTA Card (Final CTA section)

```jsx
<div className="relative">
  <div className="absolute inset-0 bg-[#B8C5E6] rounded-full blur-[120px] opacity-30" />
  <div className="relative bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-[#1A2D63]/10 text-center">
```

**Key traits**:
- `rounded-3xl` (24px) — the largest radius used
- Soft blue glow behind: `bg-[#B8C5E6] blur-[120px] opacity-30`
- `shadow-2xl` (heaviest shadow used)

### 4.14 Footer Contact Card

```jsx
<div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-7 shadow-lg shadow-black/10">
```

### 4.15 Highlight Pill (On navy)

```jsx
<div className="inline-flex items-center gap-3 bg-[#1A2D63] rounded-full px-6 py-3 shadow-lg shadow-[#1A2D63]/15">
  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
  <p className="text-sm text-white font-medium">Message</p>
</div>
```

### 4.16 Step Number Circle (How-it-works)

```jsx
<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border-2 border-[#1A2D63]/10 mb-5">
  <span className="text-2xl font-newsreader font-semibold text-[#1A2D63]">01</span>
</div>
```

---

## 5. NAVIGATION

### 5.1 Scroll-Responsive Navbar

The nav transforms from transparent to frosted glass as user scrolls. `navScrollProgress` goes from 0→1 over the first 100px of scroll.

```jsx
style={{
  background: navScrollProgress > 0
    ? `rgba(253, 251, 247, ${0.82 * navScrollProgress})`  // Porcelain at 82% max
    : 'transparent',
  backdropFilter: navScrollProgress > 0
    ? `blur(${14 * navScrollProgress}px)`    // max 14px blur
    : 'none',
  borderBottom: `1px solid rgba(26, 45, 99, ${0.1 * navScrollProgress})`,
}}
```

**Logo shrinks on scroll**:
- Desktop: `height: ${28 + (1 - navScrollProgress) * 12}px` → 40px→28px
- Mobile: `height: ${20 + (1 - navScrollProgress) * 6}px` → 26px→20px

**Nav padding shrinks on scroll**:
```
paddingTop: ${12 + (1 - navScrollProgress) * 12}px    → 24px→12px
paddingBottom: ${12 + (1 - navScrollProgress) * 12}px  → 24px→12px
```

### 5.2 Landing Page Nav

Landing pages have a minimal nav: **logo left, single CTA right**. No menu links (to minimize exit points).

Mobile CTA fades in on scroll: `opacity: navScrollProgress, pointerEvents: navScrollProgress > 0.5 ? 'auto' : 'none'`

### 5.3 Homepage Nav

Homepage has centered nav links + CTA + mobile hamburger:
```
Logo | [centered: Ons proces, Praktijkvoorbeelden, FAQ] | CTA button
```

Active section highlighting: `text-[#1A2D63]` vs `text-[#1A2D63]/60`

### 5.4 Mobile Menu Overlay

Full-screen overlay with frosted glass:
```jsx
<div className="bg-[#FDFBF7]/95 backdrop-blur-xl">
  {/* Large serif nav items */}
  <button className="text-3xl sm:text-4xl font-newsreader text-[#1A2D63] hover:text-[#475D8F]">
```

---

## 6. SECTION DIVIDERS (Critical Visual Element)

The curvy section dividers are a signature design element. They create organic wave transitions between sections.

### 6.1 Architecture

Each divider is an SVG with 3 layers:
1. **Fill path**: Covers the transition area with the `toColor`
2. **Navy stroke**: A thin decorative curve in `#1A2D63`
3. **Light stroke**: A parallel accent curve in `#7B8DB5`

```jsx
const SectionDivider = ({ fromColor, toColor, variant = 0 }) => {
  const data = sectionDividerData[variant % sectionDividerData.length];
  const fillPath = `${data.fill} L1920,160 L0,160 Z`;
  return (
    <div style={{ backgroundColor: fromColor, marginTop: -1, marginBottom: -1 }}>
      <svg viewBox="0 -40 1920 200" preserveAspectRatio="none"
           className="w-full block h-[50px] md:h-[75px] lg:h-[100px]">
        <path d={fillPath} fill={toColor} />
        <path d={data.navy} fill="#1A2D63" />
        <path d={data.light} fill="#7B8DB5" />
      </svg>
    </div>
  );
};
```

### 6.2 Variant Path Data (4 variants)

**Variant 0** — Gentle single wave:
```
fill: "M0,70 C480,130 960,-10 1920,50"
navy: "M0,62 C480,110 960,-18 1920,34 L1920,60 C960,4 480,146 0,78 Z"
light: "M0,78 C480,146 960,4 1920,60 L1920,74 C960,14 480,164 0,88 Z"
```

**Variant 1** — S-curve:
```
fill: "M0,30 C320,110 640,120 960,60 C1280,0 1600,-10 1920,80"
navy: "M0,22 C320,92 640,100 960,50 C1280,-10 1600,-16 1920,66 L1920,90 C1600,4 1280,10 960,70 C640,134 320,126 0,38 Z"
light: "M0,38 C320,126 640,134 960,70 C1280,10 1600,4 1920,90 L1920,102 C1600,18 1280,22 960,80 C640,146 320,142 0,48 Z"
```

**Variant 2** — Inverted single wave:
```
fill: "M0,85 C320,10 640,-5 960,55 C1280,115 1600,130 1920,35"
navy: "M0,77 C320,-8 640,-25 960,45 C1280,107 1600,114 1920,21 L1920,45 C1600,144 1280,125 960,65 C640,9 320,26 0,93 Z"
light: "M0,93 C320,26 640,9 960,65 C1280,125 1600,144 1920,45 L1920,57 C1600,158 1280,137 960,75 C640,21 320,40 0,103 Z"
```

**Variant 3** — Double wave (undulating):
```
fill: "M0,55 C240,110 480,110 720,60 C960,10 1200,10 1440,60 C1680,110 1800,110 1920,55"
navy: "M0,47 C240,92 480,90 720,50 C960,2 1200,4 1440,50 C1680,92 1800,90 1920,41 L1920,65 C1800,124 1680,126 1440,70 C1200,24 960,20 720,70 C480,126 240,124 0,63 Z"
light: "M0,63 C240,124 480,126 720,70 C960,20 1200,24 1440,70 C1680,126 1800,124 1920,65 L1920,77 C1800,136 1680,140 1440,80 C1200,38 960,32 720,80 C480,138 240,138 0,73 Z"
```

### 6.3 Responsive Heights

```css
h-[50px] md:h-[75px] lg:h-[100px]
```

### 6.4 Usage Pattern

Dividers are placed between every section. Common transitions:
- `fromColor="#FDFBF7" toColor="#FDFBF7"` — Same-color divider (decorative only)
- `fromColor="#FDFBF7" toColor="#1A2D63"` — Light to dark transition
- `fromColor="#1A2D63" toColor="#FDFBF7"` — Dark to light transition

### 6.5 Footer Wave

The footer has its own separate wave (different from section dividers):
```jsx
<div style={{ transform: 'translateY(-99%)' }}>
  <svg viewBox="0 0 2278 683" className="w-full h-16 md:h-20 lg:h-24">
    <path fill="#1A2D63" d="M0-0.3C0-0.3,464,120,1139,120S2278-0.3,2278-0.3V683H0V-0.3z" />
  </svg>
</div>
```

---

## 7. HERO SECTION & LOGO CAROUSEL (Critical)

### 7.1 Hero Layout

The hero is a full-viewport section (`min-h-screen`) with the Porcelain White background. It uses **two completely separate layouts** for mobile and desktop (different JSX trees, not just responsive classes).

**Desktop** (`hidden md:flex`): Centered text with logo carousel as absolute background element.

**Mobile** (`md:hidden`): Two-part layout:
- Heading centered in viewport with large bottom padding (`pb-[28rem]`) to make room for...
- Absolutely-positioned bottom section with subtitle, CTA button, "Integraties met je tools" label, and mobile logo carousel

### 7.2 Hero Typography

```jsx
<h1 className="font-newsreader text-6xl lg:text-[4.25rem] xl:text-[4.75rem] leading-[1] tracking-tight text-[#1A2D63]">
  <span className="block font-extralight">Automatiseer</span>
  <TypewriterText />  {/* bold italic, dynamically typed */}
</h1>
```

The H1 has two parts: a `font-extralight` (weight 200) static line and a `font-bold italic` typewriter-animated line.

### 7.3 TypewriterText Component

**Behavior**: Types a phrase character by character (80ms per char), pauses 2 seconds, deletes (40ms per char), then moves to next phrase.

**Visual**: The last word of the current phrase gets an SVG brush-stroke underline that draws in when the phrase completes:

```jsx
<path d="M2 16Q50 6 118 10"
  stroke="#2D3A5C" strokeOpacity="0.22" strokeWidth="12"
  strokeLinecap="round" strokeLinejoin="round" pathLength="1"
  style={{
    strokeDasharray: 1,
    strokeDashoffset: isDrawing ? 0 : 1,  // Draws from left to right
    transition: isDrawing ? 'stroke-dashoffset 400ms ease-out' : 'none',
  }}
/>
```

A blinking cursor follows: `<span className="inline-block w-[3px] h-[1em] bg-[#1A2D63] ml-1 animate-pulse" />`

**Phrases per page**:
- Homepage: "je workflow", "routinewerk", "data-invoer", "je bedrijf", "repetitieve taken", ...
- Awareness: "administratie", "handmatige opvolging", "offerte-chaos", ...
- Consideration: "virtuele medewerkers", "automatische offertes", ...
- Installateurs: "gemiste oproepen", "late offertes", "planningschaos", ...

### 7.4 Logo Carousel (GSAP MotionPath)

Integration logos (30 logos) float along an invisible SVG cubic Bezier curve.

**Technology**: GSAP `MotionPathPlugin` — each logo follows the same path with staggered start positions.

**SVG Path (default)**:
```
M -100,612 C 100,650 300,720 500,770 C 700,810 850,810 950,780 C 1100,730 1250,550 1400,350 C 1500,220 1600,120 1700,80
```

**ViewBox**: `0 0 1600 900` with aspect ratio `16/9`

**Logo tile styling**:
```jsx
<div className="w-full h-full rounded-xl bg-white shadow-lg border border-[#1A2D63]/5 p-2.5 flex items-center justify-center">
  <img src={logo.logo} alt={logo.name} className="w-full h-full object-contain" />
</div>
```

**Desktop**: 74px tiles, 80s duration, centered at 50% height
**Mobile**: Different curve path, 52px tiles, 60s duration, centered at 22% height, separate `MobileLogoCarousel` component

**Mobile path**:
```
M -900,612 C -420,690 0,820 420,880 C 860,940 1180,900 1580,780 C 2040,630 2460,430 2900,250 C 3300,140 3700,100 4100,80
```

**GSAP setup per logo**:
```js
gsap.fromTo(logo, {
  motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: true, start: startProgress, end: startProgress }
}, {
  motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: true, start: startProgress, end: startProgress + 1 },
  duration: 80, ease: "none", repeat: -1, immediateRender: true, force3D: true
});
```

---

## 8. ANIMATION & MOTION

### 8.1 Framer Motion Entrance Animations

All content sections use scroll-triggered fade-in-up animations:

**Standard pattern**:
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px" }}
  transition={{ duration: 0.5 }}
>
```

**Staggered cards**:
```jsx
transition={{ duration: 0.4, delay: index * 0.1 }}
```

**Pain point cards** (slide from left):
```jsx
initial={{ opacity: 0, x: -16 }}
whileInView={{ opacity: 1, x: 0 }}
transition={{ duration: 0.35, delay: index * 0.07 }}
```

**Hero elements** (on mount, not scroll):
```jsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6, delay: 0.1 }}  // 0.1, 0.3, 0.5 staggered
```

### 8.2 Hover Animations

| Component | Effect |
|-----------|--------|
| Cards | `hover:shadow-2xl hover:-translate-y-1` |
| Pain cards | `hover:shadow-xl hover:-translate-y-0.5` |
| Primary CTA | `hover:bg-[#2A4488] transition-colors` + arrow `group-hover:translate-x-1` |
| Large CTA | `hover:scale-105 transition-transform` |
| Nav CTA | `hover:scale-105 transition-all` |
| Links (footer) | `hover:text-white transition-colors` |

### 8.3 CSS Keyframe Animations

**Logo scroll** (mobile fallback):
```css
@keyframes scroll-logos {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-scroll-logos { animation: scroll-logos 40s linear infinite; }
```

**Company types carousel**:
```css
@keyframes companyScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

**Dot loader** (nav scroll transition):
```css
.loader { /* 3-dot bouncing loader in navy #1A2D63 */ }
```

**Carousel progress bar**:
```css
@keyframes carouselProgress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
```

### 8.4 Accordion Animations

```css
accordion-down: height 0 → var(--radix-accordion-content-height), 0.2s ease-out
accordion-up:   height var(--radix-accordion-content-height) → 0, 0.2s ease-out
```

---

## 9. VISUAL EFFECTS & TEXTURES

### 9.1 Noise Overlay

A fixed full-screen noise texture sits on top of everything at very low opacity:

```jsx
<div className="fixed inset-0 pointer-events-none z-50 opacity-[0.08] mix-blend-multiply"
  style={{
    backgroundImage: `url("data:image/svg+xml,...")`,  // SVG feTurbulence noise
  }}
/>
```

- `z-50` — on top of all content
- `opacity-[0.08]` — barely visible, adds texture
- `mix-blend-multiply` — darkens slightly, adds grain
- `pointer-events-none` — click-through

The noise uses `fractalNoise` with `baseFrequency='0.8'` and `numOctaves='3'`.

### 9.2 CTA Glow Effect

Behind the final CTA card, a soft blue glow creates depth:
```jsx
<div className="absolute inset-0 bg-[#B8C5E6] rounded-full blur-[120px] opacity-30" />
```

### 9.3 Shadow System

| Level | Class | Usage |
|-------|-------|-------|
| Subtle | `shadow-md` | Pain point cards default |
| Medium | `shadow-lg` | Content cards, glass cards, buttons |
| Heavy | `shadow-xl` | Card hover states, after-comparison cards |
| Heaviest | `shadow-2xl` | Final CTA card, large CTA buttons |
| Brand shadow | `shadow-lg shadow-[#1A2D63]/10` | Primary buttons |
| Dark shadow | `shadow-lg shadow-black/10` | Glass cards on navy |

### 9.4 Backdrop Blur (Frosted Glass)

Used on:
- Navigation bar: `blur(14px)` max
- Mobile menu overlay: `backdrop-blur-xl`
- Sticky mobile CTA: `backdrop-blur-xl`

---

## 10. RESPONSIVE BEHAVIOR

### 10.1 Mobile-First Patterns

The site is built mobile-first with key breakpoints at `md:` (768px):

| Feature | Mobile | Desktop |
|---------|--------|---------|
| Hero layout | Vertical with pinned bottom section | Centered single column |
| Logo carousel | Smaller tiles (52px), different curve | Larger tiles (74px), default curve |
| Nav | Logo + fade-in CTA (no menu on landing pages) | Logo + links + CTA |
| Section padding | `py-16 px-4` | `py-24 md:px-12` |
| Cards grid | `grid-cols-1` | `grid-cols-2` or `grid-cols-3` |
| CTA buttons | Full-width `w-full` | Auto-width |
| Footer grid | Single column | `lg:grid-cols-[1.3fr_1fr]` |
| Sticky CTA bar | Shows (fixed bottom) | Hidden (`md:hidden`) |

### 10.2 Mobile Hero Strategy

Mobile hero uses `100svh` (small viewport height) to account for mobile browser chrome:
```css
min-h-[calc(100svh-64px)]
```

The bottom section (subtitle + CTA + logo carousel) is absolutely positioned to always be visible without scrolling.

### 10.3 Container Width Scaling

```
Hero/Nav:  max-w-[1400px]
Footer:    max-w-[1400px]
Sections:  max-w-[1000px] (cards), max-w-[900px] (steps), max-w-[800px] (CTA/FAQ), max-w-[700px] (quotes)
```

---

## 11. FOOTER

### 11.1 Structure

The footer is `bg-[#1A2D63]` with an SVG wave on top. It's a 2-column layout on desktop.

**Left column**: CTA heading (Newsreader serif) + subtitle + button row (white pill + ghost outline)
**Right column**: Contact card (glass card with phone, email, LinkedIn)

**Bottom bar**: Logo + BTW number + legal links + copyright, separated by `border-t border-white/10`

### 11.2 Footer Wave

```jsx
<svg viewBox="0 0 2278 683" className="w-full h-16 md:h-20 lg:h-24">
  <path fill="#1A2D63" d="M0-0.3C0-0.3,464,120,1139,120S2278-0.3,2278-0.3V683H0V-0.3z" />
</svg>
```

This creates a symmetric arch that flows from the page background into the footer.

---

## 12. PAGE STRUCTURE & SECTION ORDER

### 12.1 Homepage (ai-design-landing.tsx)

1. Noise Overlay
2. Scroll-responsive Nav (with menu links)
3. Hero (TypewriterText + LogoCarousel)
4. HowItWorksSection
5. SectionDivider (variant 0)
6. UseCasesSection
7. SectionDivider (variant 1)
8. FAQSection
9. Secondary CTA (white card with blue glow)
10. Footer (with wave)

### 12.2 Landing Pages (awareness, consideration, installateurs, etc.)

1. Noise Overlay
2. Minimal Nav (logo + single CTA)
3. Hero (TypewriterText + LogoCarousel)
4. Pain points / "Herken je dit?" section
5. SectionDivider
6. Solutions / "Wat als..." section
7. SectionDivider
8. How-it-works OR comparison section (varies by page)
9. SectionDivider
10. Testimonial/quote OR FAQ section (varies)
11. SectionDivider
12. Final CTA (white card with blue glow)
13. Footer (with wave)
14. Sticky Mobile CTA (fixed bottom bar)

---

## 13. ICON SYSTEM

All icons come from **Lucide React**. Standard sizing:

| Context | Size |
|---------|------|
| Button icons | `w-4 h-4` |
| Large CTA icons | `w-5 h-5 md:w-6 md:h-6` |
| Card feature icons | `w-5 h-5` (inside icon box) |
| Contact list icons | `w-4 h-4` |
| Mobile nav icons | `w-3.5 h-3.5` |

Most-used icons: `Calendar`, `ArrowRight`, `Check`, `Mail`, `Phone`, `Linkedin`, `Clock`, `Users`, `FileText`, `Sparkles`

---

## 14. DESIGN PHILOSOPHY

### 14.1 Core Principles

1. **Extreme color restraint**: Only 3 colors (porcelain, navy, slate blue). No gradients on backgrounds, no rainbow accents. The warm off-white `#FDFBF7` is NOT pure white — this is critical for the premium feel.

2. **Organic section transitions**: The curved SVG dividers with dual-stroke (navy + light blue) create a flowing, non-blocky page feel. They are used between EVERY section.

3. **Typography contrast**: Light-weight serif (Newsreader extralight 200) for headings paired with clean sans-serif (Instrument Sans) for body creates an editorial, premium feel.

4. **Subtle depth**: Cards use very light borders (`/[0.06]`) with shadow progression on hover. Nothing has heavy borders or outlines.

5. **Conversion-optimized**: Every page ends with a CTA card (rounded-3xl, shadow-2xl, blue glow behind). Landing pages minimize exit points (no menu links, just CTA).

6. **Noise texture**: The subtle fractal noise overlay adds analog warmth, preventing the flat-digital feel. At 8% opacity with multiply blend mode, it's felt more than seen.

7. **Scroll-responsive nav**: The navigation elegantly transitions from spacious/transparent to compact/frosted, maintaining brand feel without jarring state changes.

### 14.2 Anti-Patterns (What NOT to Do)

- Do NOT use gold/yellow (#F7E69B) backgrounds or aurora gradients — these exist in globals.css but are from an older design iteration
- Do NOT use pure white (#FFFFFF) as page background — always use `#FDFBF7`
- Do NOT use sharp/rectangular section separators — always use curved SVG dividers
- Do NOT use heavy borders on cards — keep them at 6% opacity or less
- Do NOT use rounded-lg or rounded-md for cards — use `rounded-2xl` (16px) or `rounded-xl` (12px)
- Do NOT skip the noise overlay — it's part of the brand identity
- Do NOT use square buttons — all buttons are `rounded-full` (pill shape)

---

## 15. TECHNICAL REFERENCE

### 15.1 Tech Stack

- **Framework**: Next.js 14 (App Router, static export)
- **Styling**: Tailwind CSS v3.3.5 + `tailwindcss-animate`
- **Animations**: GSAP v3.14.2 (MotionPathPlugin) + Framer Motion v10.16
- **Icons**: Lucide React
- **UI Primitives**: Radix UI (Accordion)
- **Deployment**: Netlify (static)

### 15.2 Key File Paths

```
components/ai-design-landing.tsx    → Main homepage (2863 lines)
components/landing/awareness-landing.tsx
components/landing/consideration-landing.tsx
components/landing/installateurs-landing.tsx
components/landing/loodgieters-landing.tsx
components/landing/elektriciens-landing.tsx
components/landing/roi-calculator-landing.tsx
components/landing/direct-booking-landing.tsx
components/landing/case-studies-landing.tsx
components/landing/faq-landing.tsx
components/landing/ai-readiness-scan-landing.tsx
components/landing/thank-you-landing.tsx
components/footer.tsx               → Shared footer for (main) pages
app/globals.css                     → All CSS custom properties & animations
tailwind.config.ts                  → Tailwind theme configuration
```
