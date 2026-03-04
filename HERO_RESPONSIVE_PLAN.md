# Hero Responsive Redesign Plan
## Breakpoint: 1100px — Desktop ↔ Compact Layout

---

## 1. Current State (Analysis)

### Layout Strategy
- Section is `position: relative; height: 100svh; overflowX: clip; overflowY: visible`
- Text container is **absolutely positioned**, spanning `top: 0; bottom: 0` via a 4-row CSS grid:
  - Row 1 (47%): heading, anchored bottom so it overflows upward
  - Row 2 (3%): spacer — prevents subtitle from shifting as typewriter runs
  - Row 3 (auto): subtitle + CTAs + checkmarks (the fixed content block)
  - Row 4 (1fr): remaining vertical space
- Phone mock is **absolutely positioned**: `right: 10vw; top: 15svh; bottom: -35svh; width: 570px`
  - The `bottom: -35svh` intentionally lets the phone extend below the viewport (cropped by a downstream CSS rule)
  - Image is `520px` wide, fixed, with `rotate(5deg)` tilt

### GSAP Scroll Animation
- Fires after `hero-animate-phone` CSS animation ends (`animationend` event)
- Transfers control from CSS to GSAP, sets `el.style.animation = 'none'`
- Uses `gsap.matchMedia()` gated to `min-width: 640px`
- Animates `y: '-42vh'` over `600px` of scroll — phone rises up into the CRM cards section
- `scrub: true` — directly tied to scrollbar, no easing
- `scrollTrigger: { start: 'top top', end: '+=600' }`

### CSS Entrance Animations (in `src/index.css`)
- `.hero-animate-phone` → `hero-phone-in`: slides in from right (`translateX(50px) scale(0.94)`)
- `.hero-animate-heading` → `hero-slide-in`: slides from left
- `.hero-animate-subtitle/ctas/checks` → `hero-subtitle-in` / `hero-fade-up`: fade up with blur
- All use `cubic-bezier(0.22,1,0.36,1)` spring curve
- Stagger cascade: waves(0s) → heading(0.1s) → phone(0.2s) → subtitle(0.25s) → CTAs(0.4s) → checks(0.55s)

### Current Problem
At ~1100px viewport width, `right: 10vw` = 110px. Phone left edge = `1100 - 110 - 570 = 420px`. Text right edge = `1100 × 0.56 = 616px`. **Phone left edge (420px) is well inside the text zone (616px) — severe overlap.**

---

## 2. Target Behavior

### Desktop mode (> 1100px) — NO CHANGE
Identical to current. Side-by-side layout. Phone right-anchored.

### Compact mode (≤ 1100px)
- **Text block** moves up, stays centered horizontally, occupies top ~55% of the viewport
- **Phone mock** sits at the bottom, centered horizontally, partially cropped at bottom by `overflowX: clip`
- Phone keeps its `rotate(5deg)` tilt and drop shadow — same visual identity
- Phone entrance animation changes from "slide in from right" to "rise from bottom"
- On scroll, phone **still rises upward** into the CRM cards section (same GSAP `y: -42vh` but adapted)
- Decorative waves stay visible (they're `hidden md:block`, so appear from 768px up — keep as-is)
- No text overlap at any viewport ≥ 640px (phone is `hidden` below 640px)

---

## 3. Technical Approach

### A. Breakpoint Detection — JS Hook (Required for GSAP)

Add a lightweight hook:

```ts
// src/hooks/useBreakpoint.ts
import { useState, useEffect } from 'react';

export function useIsCompactHero() {
  const [compact, setCompact] = useState(() => window.innerWidth <= 1100);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1100px)');
    const handler = (e: MediaQueryListEvent) => setCompact(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return compact;
}
```

Use `window.matchMedia` — no resize listener polling, fires only on threshold crossing.

### B. Two Rendering Branches in JSX

In `HeroDemo.tsx`, derive `isCompact` from the hook and use it to:
1. Conditionally apply different `style` props to the text container and phone container
2. Keep the same JSX structure (avoid duplicate markup) — just swap `style` and `className` values

### C. GSAP matchMedia — Two Conditions

Replace the single `mm.add('(min-width: 640px)', ...)` with two conditions:

```ts
const mm = gsap.matchMedia();

// Desktop: phone rises from right-side position
mm.add('(min-width: 1101px)', () => {
  gsap.to(el, {
    y: '-42vh',
    ease: 'none',
    scrollTrigger: { start: 'top top', end: '+=600', scrub: true, invalidateOnRefresh: true },
  });
});

// Compact: phone rises from bottom-center position
mm.add('(min-width: 640px) and (max-width: 1100px)', () => {
  gsap.to(el, {
    y: '-38vh',   // slightly less travel since phone starts lower
    ease: 'none',
    scrollTrigger: { start: 'top top', end: '+=600', scrub: true, invalidateOnRefresh: true },
  });
});
```

### D. CSS Entrance Animation — New Keyframe for Compact

Add to `src/index.css`:

```css
@keyframes hero-phone-in-bottom {
  from { opacity: 0; transform: translateY(60px) scale(0.94); filter: blur(3px); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0); }
}
```

Apply it conditionally: when `isCompact === true`, swap the class on the phone container div from `hero-animate-phone` to `hero-animate-phone-bottom`.

Add to `src/index.css`:
```css
.hero-animate-phone-bottom {
  animation: hero-phone-in-bottom 0.8s cubic-bezier(0.22,1,0.36,1) 0.3s both;
}
```

(Slightly longer delay than desktop so text renders first.)

---

## 4. Specific Changes by File

### `src/hooks/useBreakpoint.ts` — NEW FILE
Create the `useIsCompactHero` hook (see Section 3A).

### `src/components/HeroDemo.tsx`

#### 4.1 Import the hook
```ts
import { useIsCompactHero } from '../hooks/useBreakpoint';
```

#### 4.2 Use it in the component
```ts
const isCompact = useIsCompactHero();
```

#### 4.3 Text container — conditional style

**Desktop (current):**
```jsx
<div
  className="absolute left-6 sm:left-10 lg:left-[14vw] 2xl:left-[16vw] right-4 sm:right-[46%] lg:right-[44%] z-10 grid"
  style={{ top: 0, bottom: 0, gridTemplateRows: '47% 3% auto 1fr' }}
>
```

**Change to:**
```jsx
<div
  className={`absolute z-10 ${
    isCompact
      ? 'left-[8%] right-[8%] flex flex-col items-center text-center'
      : 'left-6 sm:left-10 lg:left-[14vw] 2xl:left-[16vw] right-4 sm:right-[46%] lg:right-[44%] grid'
  }`}
  style={
    isCompact
      ? { top: '8svh', bottom: '45svh' }
      : { top: 0, bottom: 0, gridTemplateRows: '47% 3% auto 1fr' }
  }
>
```

- `bottom: '45svh'` reserves the lower 45% for the phone mock
- `flex flex-col items-center text-center` replaces the grid in compact mode
- Text alignment in the `h1` and CTA group should also switch: `text-center` (already is on mobile, just confirm `lg:text-left` doesn't override in compact range)
- Heading font size: the `clamp(2.5rem, calc(1.8rem + 1.2vw + 1.5vh), 6rem)` handles this well already — no change needed
- CTA flex direction: already `flex-col sm:flex-row` — fine at ≤1100px

#### 4.4 Phone container — conditional style

**Current:**
```jsx
<div
  ref={phoneMockRef}
  className="absolute hero-animate-phone hidden sm:flex items-end justify-center"
  style={{ right: '10vw', top: '15svh', bottom: '-35svh', width: '570px', zIndex: 60, pointerEvents: 'none' }}
>
```

**Change to:**
```jsx
<div
  ref={phoneMockRef}
  className={`absolute hidden sm:flex items-end justify-center ${
    isCompact ? 'hero-animate-phone-bottom' : 'hero-animate-phone'
  }`}
  style={
    isCompact
      ? { left: '50%', transform: 'translateX(-50%)', top: 'auto', bottom: '-20svh', width: '570px', zIndex: 60, pointerEvents: 'none' }
      : { right: '10vw', top: '15svh', bottom: '-35svh', width: '570px', zIndex: 60, pointerEvents: 'none' }
  }
>
```

- `left: 50%; transform: translateX(-50%)` centers the phone
- `bottom: '-20svh'` lets the bottom ~20% of the phone extend below the viewport — matches the current desktop overflow aesthetic
- `top: 'auto'` removes top constraint so phone sits at the bottom

**Important:** The GSAP animation sets `el.style.animation = 'none'` and `el.style.opacity = '1'` then applies `y` transform. The `transform: translateX(-50%)` on the container will conflict with GSAP's `y` transform unless handled carefully.

**Solution:** Separate the centering transform from the GSAP target. Nest the phone image inside an extra wrapper:

```jsx
{/* Positioning shell — centering only, NOT touched by GSAP */}
<div
  className="absolute hidden sm:flex items-end justify-center"
  style={
    isCompact
      ? { left: '50%', transform: 'translateX(-50%)', bottom: '-20svh', width: '570px', zIndex: 60, pointerEvents: 'none' }
      : { right: '10vw', top: '15svh', bottom: '-35svh', width: '570px', zIndex: 60, pointerEvents: 'none' }
  }
>
  {/* GSAP target — entrance animation + scroll y transform applied here */}
  <div
    ref={phoneMockRef}
    className={isCompact ? 'hero-animate-phone-bottom' : 'hero-animate-phone'}
    style={{ display: 'contents' }}  {/* or just an empty wrapper */}
  >
    <img
      src="/whatsapp phone mock.png"
      alt="..."
      className="h-auto"
      style={{ width: '520px', transform: 'rotate(5deg)', filter: '...' }}
    />
  </div>
</div>
```

Wait — `display: contents` loses block context needed for GSAP `y` transforms. Better to use a standard `div` with `width: 100%; display: flex; align-items: flex-end; justify-content: center; height: 100%` so GSAP can translate it vertically. Adjust as needed.

**Simpler alternative:** Keep `phoneMockRef` on the outer positioning shell, but in compact mode the outer shell uses `left: 50%; transform: translateX(-50%)`. GSAP will then override the transform with its own. To prevent conflict, set the initial `translateX(-50%)` as a GSAP `x: '-50%'` set in the matchMedia callback so GSAP owns the full transform:

```ts
mm.add('(min-width: 640px) and (max-width: 1100px)', () => {
  // Ensure GSAP owns the transform (don't fight with CSS translateX)
  gsap.set(el, { x: '-50%' });  // replaces the CSS transform
  gsap.to(el, {
    y: '-38vh',
    ease: 'none',
    scrollTrigger: { start: 'top top', end: '+=600', scrub: true, invalidateOnRefresh: true },
  });
});
```

And remove `transform: translateX(-50%)` from the inline CSS when `isCompact === true`. Use `left: '50%'` only, let GSAP set the x offset.

#### 4.5 GSAP useEffect update
Replace the single `mm.add('(min-width: 640px)', ...)` with the two conditions from Section 3C. The `animationend` listener wrapping stays the same — it listens on the phoneMockRef element and fires regardless of which animation class is used.

### `src/index.css`

Add the new keyframe and class (Section 3D). Place alongside the existing `hero-animate-*` declarations.

---

## 5. Visual Design Notes for Compact Mode

### Phone position
- The phone is centered and partially visible at the bottom — the bottom 20% extends below viewport. This mirrors the desktop's phone overflow behavior and gives the "phone emerging from below" aesthetic.
- On scroll, the phone rises upward naturally, which feels organic and matches the desktop experience.

### Text spacing
- At 1100px, the viewport is still fairly wide. The text block shouldn't feel cramped. `left: 8%; right: 8%` gives 84% width. The heading `clamp(2.5rem, ..., 6rem)` will be around 3.5–4rem — readable.
- CTA buttons should remain in a row (`sm:flex-row` applies from 640px).

### Transition between modes
- When dragging a window exactly across the 1100px threshold, the layout will snap. This is acceptable — all CSS breakpoints snap by nature.
- If desired, a smooth crossfade could be added: wrap the `isCompact`-dependent sections in opacity/transition, but this is optional polish.

---

## 6. Implementation Order

1. **Create `src/hooks/useBreakpoint.ts`** with `useIsCompactHero`
2. **Add CSS keyframe** `hero-phone-in-bottom` and `.hero-animate-phone-bottom` to `src/index.css`
3. **Import and wire up `isCompact`** in `HeroDemo.tsx`
4. **Update text container** JSX (class + style logic)
5. **Update phone container** JSX (class + style logic, centering approach)
6. **Update GSAP `useEffect`** with the two `mm.add` conditions including `gsap.set(el, { x: '-50%' })` for compact
7. **Test at multiple widths:** 1400px, 1200px, 1100px, 1099px, 900px, 768px, 640px
8. **Verify scroll animation** in both modes — check that phone rises smoothly into CRM cards section

---

## 7. Edge Cases to Watch

| Scenario | Concern | Fix |
|---|---|---|
| Resize from desktop → compact mid-session | GSAP ScrollTrigger is active, matchMedia revert fires | `mm.revert()` in cleanup handles this — GSAP matchMedia is designed for resize |
| Phone CSS animation not firing in compact mode | `animationend` event must fire for GSAP to take over | Verify `hero-animate-phone-bottom` has correct duration so `animationend` fires |
| `transform: translateX(-50%)` fighting GSAP | GSAP overwrites CSS transform property entirely | Use `gsap.set(el, { x: '-50%' })` in matchMedia callback so GSAP owns the full transform |
| Text overflow in compact at ~640–768px | Heading at minimum clamp size (2.5rem) with centered layout | Test at 640px — may need to reduce font slightly or hide checkmarks with `hidden sm:flex` guard |
| CRM cards section visual alignment | Phone scrolls up into cards — starting position changes in compact mode | The `y: '-38vh'` value may need fine-tuning based on phone's actual starting Y in compact |
