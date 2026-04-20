# VoiceLink Style Guide

Single reference for the VoiceLink design system. If you're adding a new component or page, copy from here rather than eyeballing existing files.

Source of truth for tokens: [tailwind.config.js](./tailwind.config.js) and [src/index.css](./src/index.css). This doc describes how to use them.

---

## Colors

Defined in `tailwind.config.js` under `theme.extend.colors`.

| Token              | Hex       | Usage                                       |
| ------------------ | --------- | ------------------------------------------- |
| `porcelain`        | `#FDFBF7` | Default page background (warm off-white)    |
| `navy`             | `#1A2D63` | Primary brand, headings, CTAs               |
| `navy-hover`       | `#2A4488` | Hover state on navy buttons / links         |
| `slate-blue`       | `#475D8F` | Secondary text, icons on dark               |
| `glow-blue`        | `#B8C5E6` | Soft accent — glows, highlights             |
| `muted-blue`       | `#7B8DB5` | Tertiary text, disabled states              |

**Opacity conventions** for navy on light backgrounds:

- `text-navy` — primary text
- `text-navy/65` — secondary text
- `text-navy/55` — subtitle text
- `text-navy/50` — meta / caption
- `text-navy/40` — muted / inactive
- `text-navy/28` — footer / disclaimer
- `border-navy/[0.07]` — card borders
- `bg-navy/[0.05]` — subtle surfaces

**Semantic colors** (Tailwind defaults, use directly):

- Success: `emerald-400` / `emerald-500` / `emerald-600`, with `bg-emerald-50` for soft backgrounds
- Error: `red-500` (hover color on destructive actions)

---

## Typography

Three font families, all loaded via `@font-face` (Satoshi is self-hosted from `/public/fonts/`).

| Class             | Family             | Use                                 |
| ----------------- | ------------------ | ----------------------------------- |
| `font-general`    | Satoshi            | Headings, labels, buttons           |
| `font-instrument` | Instrument Sans    | Body copy — default on most pages   |
| `font-newsreader` | Newsreader (serif) | Editorial / landing accents only    |

**Base html size is `15px`** (set in `index.css`) — all `rem` values scale from that.

**Heading recipe** (used on hero sections):

```tsx
<h1
  className="font-general font-bold text-navy leading-[1.08]"
  style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)' }}
>
  Headline
</h1>
```

**Body copy:** Instrument Sans via the page wrapper (`font-instrument` on the outer `<div>`). Inside, pair sizes with muted navy:

```tsx
<p className="text-lg md:text-xl text-navy/55 font-medium leading-relaxed">…</p>
<p className="text-sm text-navy/60 leading-relaxed">…</p>
<p className="text-xs text-navy/50">…</p>
```

---

## Layout

- **Page wrapper:** `min-h-screen bg-porcelain font-instrument relative`
- **Top padding for routes with the global nav:** `App.tsx` wraps non-homepage routes in `<div className="pt-20">`. The nav is hidden on `/landing`, `/signup`, `/invite`.
- **Max content width:** `max-w-4xl mx-auto` on sections; `max-w-xl` on hero subtitles.
- **Section padding:** `px-6 py-10` (or `py-16` for generous hero).

Add [`<NoiseOverlay />`](./src/components/ui/NoiseOverlay.tsx) as the first child of the page wrapper for the signature grain texture. Don't re-implement it.

---

## Component Recipes

### Card (standard)

```tsx
<div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy/[0.07] p-5 shadow-sm">
  …
</div>
```

- Use `rounded-3xl` + `p-7` for larger feature cards
- Use `bg-navy` + white text for the inverted "support" card variant

### Primary CTA

```tsx
<button className="inline-flex items-center justify-center gap-2 bg-navy hover:bg-navy-hover disabled:bg-navy/40 text-white font-semibold text-sm py-2.5 px-5 rounded-full transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed">
  Connect <ArrowRight className="w-4 h-4" />
</button>
```

### Secondary CTA (on dark)

```tsx
<a className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm py-2.5 px-5 rounded-full transition-colors border border-white/[0.12]">
  …
</a>
```

### Status pill

```tsx
<div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-navy/[0.08] rounded-full px-4 py-1.5 shadow-sm">
  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
  <span className="text-sm font-medium text-navy/65">Connected</span>
</div>
```

### Icon tile (inside a card)

```tsx
<div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
  <MessageCircle className="w-5 h-5 text-emerald-500" />
</div>
```

Bigger variant: `w-10 h-10 rounded-2xl`. Dark variant: `bg-navy/[0.06]` with `text-navy/60` icon.

### Ambient background glow

Drop inside a `relative overflow-hidden` section for subtle radial halos:

```tsx
<div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
  <div
    className="absolute -top-40 -right-32 w-[560px] h-[560px] rounded-full"
    style={{ background: 'radial-gradient(circle, rgba(26,45,99,0.07) 0%, transparent 70%)' }}
  />
</div>
```

---

## Animations

Hero / auth entrance animations live in `index.css` as keyframes. Two ways to apply them:

**Utility class** (preferred when timing is fixed):

```tsx
<h1 className="hero-animate-heading">Hi</h1>
```

Available: `hero-animate-waves`, `hero-animate-heading`, `hero-animate-subtitle`, `hero-animate-ctas`, `hero-animate-checks`, `hero-animate-phone`, `hero-animate-phone-bottom`, plus the `auth-animate-*` family.

**Inline `style`** (when you need custom delay):

```tsx
<div style={{ animation: 'hero-fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.4s both' }}>…</div>
```

Keyframes: `hero-slide-in`, `hero-fade-up`, `hero-subtitle-in`, `hero-phone-in`, `hero-wave-in`, `auth-slide-down`, `auth-fade-up`, `auth-phone-in`, `auth-wave-in`, `auth-btn-cascade`.

Standard easing: `cubic-bezier(0.22, 1, 0.36, 1)`. Use `both` as the fill mode so elements start hidden.

---

## Icons

- Always from [`lucide-react`](https://lucide.dev/) — no other icon sets
- Size via Tailwind: `w-4 h-4` (inline with text), `w-5 h-5` (inside tiles), `w-12 h-12` (status illustrations)
- Color via `text-*` classes, not the `color` prop

---

## Don'ts

- No CSS modules, no styled-components, no inline `<style>` tags except for animations / gradients
- No hardcoded user-facing strings — everything goes through `useI18n` with keys in all four locales (`en`, `nl`, `fr`, `de`)
- No new color tokens without adding them to `tailwind.config.js` — opacity suffixes on existing tokens are almost always enough
- No emoji in code unless the design explicitly uses it (e.g. the tips list on the dashboard)
