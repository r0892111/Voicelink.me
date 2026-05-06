# Nano Banana / Gemini 2.5 Flash Image prompts — brochure pages

Visual generation prompts per page. Used to produce reference mockups the designer iterates on (not final print artwork — image-gen models struggle with exact text rendering and font weights).

**Caveats up front:**
- Treat output as a **concept mockup**, not a print-ready file. Designer overlays real text in Figma/InDesign on top.
- Image-gen models often render Inter as "a geometric sans-serif" and may miss weight-900 specifically. The visual character (negative letter-spacing, decisive geometric forms) usually lands.
- Strict marine-only palette: regenerate immediately if any coral, orange, red, or purple leaks in.
- Run 4-6 variations per page and pick the closest. Iterate by editing one zone at a time.

---

## Page 7 — AI-brein hero (right page of the Audit spread)

**Aspect ratio:** 3:4 portrait (A5 page proportions)

**Approach:** This prompt gives Gemini context (audience, brand, what the page must communicate, brand-system constraints) and then asks it to design the page itself. The constraints are absolute. Composition, illustration metaphor, and layout are Gemini's creative call.

**Prompt:**

```
You are designing a single page of a premium B2B print brochure for
Finit Solutions, an AI consultancy in Leuven, Belgium.

WHO IS GOING TO READ THIS PAGE
The reader is a non-technical small business owner. Service business,
manufacturer, builder, retailer. Smart but not technical. Has heard
about AI for years and doesn't know where to start. Distrusts hype.
Picked the brochure off a trade-fair table, will read it five minutes
later at his desk, and might keep it on a shelf for a month.

BRAND VOICE
Quiet editorial confidence. Penguin Classics meets Bloomberg terminal.
We don't sell, we observe and explain. Restrained, intellectual,
print-grade. Never corporate slick, never startup-y, never loud.

WHAT THIS SPECIFIC PAGE MUST COMMUNICATE
This is the peak moment of the brochure. It's the right side of a
two-page spread about Finit's three-week Audit. The previous page
explains that we go in, talk to the team, get access to systems, and
measure where time is lost. This page reveals what makes us different
from every other AI consultant.

The unique idea: we don't just deliver a report. We build a structured
"AI-brain" of the customer's business. A living knowledge base where
all their scattered company knowledge (emails, files, CRM data, team
interviews, WhatsApp conversations) gets pulled into one organized
place they can ask questions of, via a chatbot, from day one of the
final presentation. Ask "how does our quote process actually run?"
and the brain answers with sources cited. Ask what an employee said
about their outdated Excel template and the brain quotes the
interview back. The brain is worth the audit fee on its own. It also
means our automation proposals don't come from a brainstorm, they
cite the page in the brain that proves them.

The page should land:
- A brief lead-in line setting up "we do something no other
  AI consultant does"
- The hero phrase "AI-brein van je bedrijf" prominently
- Some way to show the chatbot in action: three example questions
  with answers and citations. Example questions:
    "Hoe loopt onze offerte-flow?"
    "Welke klanten zijn vorige maand niet meer teruggekomen?"
    "Wat zegt Sara over de Excel-template uit 2024?"
- A short list of what the customer takes home after three weeks
  (a working chatbot, a report, quick wins, a 12-month AI roadmap,
  cost-and-return per proposal, concrete quotes for next steps)
- A price callout somewhere on the page: "€2.500" with a small
  "Investering" label

BRAND DESIGN SYSTEM (NON-NEGOTIABLE)

Color palette, marine-only against warm neutrals:
- Page background: warm cream paper hex #FDFBF7. Never pure white.
- Body text: warm near-black hex #2A2620. Never pure black.
- Headlines: slightly lighter warm dark hex #322D26
- Brand color, used for headlines and accents: deep marine navy
  hex #1A2D63
- Mid-tone marine for linework and supporting elements: hex #4D5A82
- Pale marine for soft fills and tints: hex #E4E8F2
- Hairline borders: warm bone hex #E8E6DC

ABSOLUTELY FORBIDDEN: coral, orange, red, purple, pink, yellow,
green, teal, or any bright accent color. The brand is single-hue
marine. NO pure white #FFFFFF anywhere. NO pure black #000000.

Typography:
- All text in geometric sans-serif (Inter Variable or equivalent).
  Headlines weight 900 with slightly negative letter-spacing.
  Body weight 400, line-height around 1.6.
- Technical labels in monospace (JetBrains Mono or equivalent),
  small caps, wide letter-spacing.
- Sentence case headlines. NO Title Case. NO ALL CAPS except
  short eyebrow labels and mono labels.
- No emojis. No em-dashes (use commas or sentence breaks).

Visual style:
- Editorial restraint. Generous breathing room around every element.
- When cards or chat bubbles appear, give them a soft warm pillow
  shadow underneath. Gentle blur, low opacity, slight downward
  offset. Never a flat hard digital drop-shadow.
- Hairline borders should be barely visible.
- The page should feel like a quality printed artifact you hold in
  your hand, not a glowing UI screen.
- If you draw an illustration, work in flat 2D vector style like a
  Bloomberg or McKinsey editorial diagram. Monoweight strokes in
  marine. Pale marine fills. NOT 3D, NOT photorealistic,
  NOT cartoonish, NOT painterly, NOT whimsical.

YOUR TASK
Design this single A5 portrait page. The constraints above (palette,
typography character, mood, what the page must communicate, the
forbidden list) are absolute. Every other choice is yours.

How to compose the page, what visual metaphor to use for the brain,
how to lay out the questions and answers, how to balance type and
illustration, how to handle the price callout and the deliverables
list, all of that is your creative call. Make this page memorable
enough that a small business owner pulls it out of his bag a week
later and stares at it.

Render at print-quality fidelity, 300 DPI, A5 portrait
(148mm x 210mm), 3:4 aspect ratio.
```

---

## Page 2 supplementary — "Chaos to Network" transformation illustration

**Purpose:** Hero illustration for the second brochure-style page ("Hoe maken wij zo'n brein?"). Wide horizontal banner showing scattered raw documents → organized wiki pages → interconnected node network. The visual centerpiece of the page; tells the whole story in 5 seconds.

**Aspect ratio:** 21:9 ultra-wide (or fall back to 16:9 if the model doesn't support 21:9).

**Approach:** Concept brief plus brand-system constraints, creative latitude on composition and exact iconography.

**Prompt:**

```
You are designing a wide horizontal hero illustration for a B2B
brochure page about Finit Solutions, an AI consultancy in Leuven,
Belgium.

WHO IS GOING TO LOOK AT THIS
Non-technical small business owners. Service businesses,
manufacturers, builders, retailers. Smart but not technical.
They will scan this illustration in five seconds and need to
intuitively understand the story it tells. If they don't get it
in five seconds, the illustration has failed.

BRAND VOICE
Quiet editorial confidence. Penguin Classics meets Bloomberg
terminal. Restrained, intellectual, print-grade. Hand-drawn warmth
on top of a precise editorial structure. Never corporate slick,
never startup-y, never loud, never cute, never childish.

WHAT THIS ILLUSTRATION MUST COMMUNICATE

The illustration tells the story of how Finit transforms a small
business's scattered knowledge into a structured "AI-brain" that
an AI agent can navigate. It reads left to right as three frames,
showing transformation:

FRAME 1, LEFT: "Alles wat in jouw bedrijf rondzweeft"
A chaotic but contained pile of small business document icons.
Things like envelopes (mails), paper documents, voice-message
bubbles, spreadsheets, contact cards, calendar entries, photos,
folders. Tilted at different angles, overlapping, dense. Think:
an inbox without structure, but all in one place. Contained
inside a soft brain-shaped or oval outline (suggesting "this is
a brain full of raw stuff"). The feeling is "lots, but unsorted".

FRAME 2, MIDDLE: "Per onderwerp één pagina"
Three or four overlapping fanned-out paper "cards" or "pages",
each representing a wiki page. Each card has a clear title at
the top in larger weight, a few lines of body text underneath
as a summary, and one or two small tag pills at the bottom. The
cards look like real paper fiches stacked together. The feeling
is "organized, readable, structured".

FRAME 3, RIGHT: "Gelinkt brein dat zichzelf navigeert"
A constellation of small labeled nodes connected by thin lines
(backlinks). About 12 to 15 nodes spread out with breathing room.
One node in the center is slightly larger and visually
highlighted (filled with pale marine), with its outgoing lines
drawn slightly thicker, suggesting it has just been queried and
is "active". Labels next to nodes might read in Dutch: Sara,
Offerte-flow, Daikin, Pieter, Excel-2024, Teamleader, Klanten,
Bezoek, Warmtepompen, Werf, Planning. The feeling is
"interconnected, navigable, intelligent".

BETWEEN THE FRAMES
Two thin hand-drawn arrows pointing right, with small captions
in monospace small caps:
- Between frame 1 and frame 2: label reading "Pass 1 + Pass 2"
- Between frame 2 and frame 3: label reading "Backlinks"

CAPTIONS UNDER EACH FRAME
Each frame has a short descriptive caption underneath in body
sans-serif:
- Frame 1: "Alles wat in jouw bedrijf rondzweeft"
- Frame 2: "Per onderwerp één pagina"
- Frame 3: "Elk onderwerp linkt naar wat ermee te maken heeft"

BRAND DESIGN SYSTEM (NON-NEGOTIABLE)

Color palette, marine-only against warm neutrals:
- Background: warm cream paper hex #FDFBF7. Never pure white.
- Primary line strokes: deep marine navy hex #1A2D63
- Secondary line strokes (lighter elements, backlinks): mid
  marine hex #4D5A82
- Soft fills and tints: pale marine hex #E4E8F2
- Hairline accents: warm bone hex #E8E6DC
- Captions and labels: warm near-black hex #2A2620 for primary
  text, warm grey hex #57514A for secondary

ABSOLUTELY FORBIDDEN: coral, orange, red, purple, pink, yellow,
green, teal, or any bright accent color. Single-hue marine only.
NO pure white #FFFFFF anywhere. NO pure black #000000.

VISUAL STYLE
- Hand-drawn editorial line art. Every stroke should feel drawn
  by a thoughtful human, not algorithmically generated. Slight
  imperfections in line weight or curvature are welcomed and
  desired.
- Monoweight or near-monoweight strokes (around 1 to 1.5px
  equivalent at print scale).
- Flat 2D vector style. NOT 3D, NOT photorealistic, NOT
  cartoonish, NOT whimsical, NOT painterly.
- Generous breathing room around each frame and between frames.
- Captions in geometric sans-serif (Inter Variable or
  equivalent), medium weight, sentence case.
- Mono labels for the small "Pass 1 + Pass 2" and "Backlinks"
  arrow captions, in JetBrains Mono or equivalent, small caps,
  wide letter-spacing.
- The whole illustration should feel like a thoughtful editorial
  diagram from a Bloomberg, McKinsey, or Penguin publication.

YOUR TASK
Render the three-frame transformation as a single wide horizontal
illustration. Aspect ratio 21:9 (fall back to 16:9 if necessary).
Print fidelity, 300 DPI.

The constraints above (palette, hand-drawn editorial style, marine
only, what each frame must communicate, the forbidden list) are
absolute. How you compose each frame, what specific icons you
choose, how you draw the brain shape and the network, how the
cards fan out, how you handle the arrows and labels, all of that
is your creative call.

Make this illustration intuitive enough that a non-technical
small business owner gets the story in five seconds: scattered
stuff becomes organized pages, organized pages become a navigable
network.
```

---

## How to use this prompt

1. **Paste into Gemini 2.5 Flash Image (nano banana)** as a single block. Don't truncate.
2. **Generate 6-10 variations** in one batch. Because composition is open, you'll see a wider spread than with a prescriptive prompt. Pick the 2-3 strongest concepts.
3. **Refine the winner.** Once a concept is chosen, iterate by editing the same image:
   - "Keep this layout. Make the brain illustration tighter and more geometric."
   - "Same composition. Move the price callout to a less prominent spot. Make the question/answer rows breathe more."
   - "Same page. Replace the brain illustration with a different visual metaphor for organized knowledge."
4. **Treat text as approximate.** Designer will replace all text in Figma with real Inter Variable at exact weights. The image-gen output is for **concept exploration** and **layout reference**, not for final headline rendering.
5. **Reject any output with non-marine accent colors.** Even a faint coral edge means the model drifted, regenerate with a stricter color reminder up front.
6. **If the model goes too "creative" (whimsical, 3D, illustrative-cute):** add to the prompt: "Treat this like a serious editorial business publication, not a tech-startup landing page. Restraint over expressiveness."

---

## Iteration prompt snippets (re-use across pages)

**For tighter palette adherence:**
> "Regenerate. Strict palette: warm cream #FDFBF7 background, warm dark #2A2620 body text, deep marine navy #1A2D63 brand color only. NO orange, NO coral, NO red, NO purple, NO bright accents. Marine-only against warm neutrals."

**For better illustration style:**
> "Regenerate just the illustration. Style: flat 2D vector line art, monoweight 1.5px strokes in marine #1A2D63, soft fills in pale marine #E4E8F2, on warm cream background #FDFBF7. Bloomberg-style editorial diagram. Not 3D, not painterly, not photorealistic, not cartoonish."

**For typography character (when text shows but font is off):**
> "Headlines must read as Inter Variable weight 900 with slightly negative letter-spacing — confident, geometric sans-serif, decisive forms, sentence case. NOT serif, NOT decorative, NOT condensed."

**For card and shadow style:**
> "All cards and bubbles use ~12px corner radius. Each card has a soft warm pillow shadow underneath: gentle blur, low opacity, subtle downward offset. Never a hard flat shadow. Never a digital UI drop-shadow. Think the gentle shadow under a printed card resting on cream paper."

---

## Page-prompt status

| Page | Prompt written | Notes |
|---|---|---|
| Cover (p1) | TODO | Quiet typographic cover, minimal visuals |
| Inside front (p2) | TODO | Pull-quote treatment |
| p3 — Sectie 1 (probleem) | TODO | Single column, no illustration |
| p4 — Sectie 2 (anders) | TODO | Founders photo or 3-circle abstract |
| p5 — Sectie 3 (3 stappen) | TODO | 3 numbered tiles, line through |
| **p6-7 — Sectie 4 (Audit)** | **DONE (this file)** | The hero spread |
| **Page 2 supplementary — "Chaos to Network"** | **DONE (this file)** | Wide hero illustration for "Hoe maken wij zo'n brein?" page (21:9) |
| p8 — Sectie 5 (Development) | TODO | 2x2 grid + brain callout |
| p9 — Sectie 6 (Onderhoud) | TODO | Pricing callout + reassurance panel |
| p10 — Sectie 7 (VoiceLink) | TODO | Phone mockup |
| p11 — Sectie 8 (Finit CRM) | TODO | Before/after sketch |
| p12-13 — Sectie 9 (klanten) | TODO | Logo wall spread |
| p14 — Sectie 10 (CTA) | TODO | Centered button page |
| p16 — Back cover | TODO | Quiet brand sign-off |

> Use this file as a working doc. Add prompts for other pages as you iterate. Keep the iteration snippets above current — they apply across all pages.
