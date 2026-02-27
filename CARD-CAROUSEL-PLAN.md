# Card Carousel Redesign Plan

## Context
- **File to edit**: `src/components/HeroDemo.tsx` — the `CardContent` component (lines ~122-316) and `CrmPreviewCards` (lines ~318-392)
- **What this is**: A horizontally scrolling card carousel that sits just below the hero section on the homepage. It auto-scrolls infinitely (3 copies of the card set for seamless loop).
- **Current state**: 6 cards using lucide-react icons, hardcoded pixel sizes that don't scale on larger screens. Cards are: Contact, Calendar, Action Items, Sales Pipeline, Today's Activity, Client Summary.
- **Design system**: Navy (#1A2D63), slate-blue (#475D8F), glow-blue (#B8C5E6), porcelain (#FDFBF7). Fonts: Satoshi (UI), Instrument Sans (body). Tailwind CSS 3.
- **Status**: Plan needs user approval per card before implementation begins.

## Core Concept
Each card demonstrates a real scenario where someone speaks naturally into WhatsApp and VoiceLink automatically structures that into CRM data. Cards should feel varied in layout and visual treatment — not cookie-cutter.

## Design Decisions (Confirmed)
- **Voice input style**: Waveform bars + transcribed text
- **Output style**: Mix of single-action and multi-action cards
- **Content tone**: Realistic business scenarios (specific names, companies, amounts)
- **Card count**: 6+ (can go to 8+)
- **Scaling**: Everything scales proportionally (text, icons, padding, card width) with viewport
- **Icons**: Custom SVG paths instead of lucide-react — larger, clean line-art style

---

## Card 1: "New Contact Created"

**Voice input (top):**
> "Just had coffee with Sarah Mitchell, she's the procurement manager at TechFlow Solutions. Her number is 0456 789 123, email sarah@techflow.be. Enterprise client, very promising."

**Visual approach:**
- Small waveform bar (5-6 bars, animated subtle pulse) + the quote in italic text
- Below: a clean contact card layout — avatar circle with initials "SM", name, title, company, phone, email stacked
- Custom SVG icons: a **person silhouette** for the card header, a **phone handset**, an **envelope**, a **building** for company
- Tag pill "Enterprise Client" at bottom
- Layout: voice quote on top ~30%, contact details below ~70%

---

## Card 2: "Follow-up Scheduled"

**Voice input (top):**
> "Sarah Mitchell asked me to call her back Wednesday at 5pm to discuss the premium pricing package."

**Visual approach:**
- Mini calendar visual — a small stylized week strip (Mon–Sun) with Wednesday highlighted/circled
- Below the calendar strip: an event card showing "Follow-up Call — Sarah Mitchell, Wed 5:00 PM"
- A subtle clock SVG icon for the time, a phone icon for the call type
- Maybe a small "auto-added to calendar" badge/indicator
- Layout: voice quote compact on top, calendar strip in middle, event detail at bottom — **3 distinct zones**

---

## Card 3: "Deal Updated"

**Voice input (top):**
> "Great meeting with Jan de Vries at BuildPro. They want to go ahead with the 45K installation package. Moving to negotiation stage."

**Visual approach:**
- A horizontal pipeline/progress bar with stages (Lead → Proposal → **Negotiation** → Closed) with Negotiation highlighted
- Below: deal card with company name, amount (€45,000), contact name
- Custom SVG icons: a **trending-up arrow** or **handshake** for deals, **euro sign** for amount
- The pipeline progress bar is the visual hero of this card — makes it visually distinct
- Layout: voice quote on top, pipeline bar in middle, deal details below

---

## Card 4: "Multiple Actions from One Message"

**Voice input (top):**
> "Finished the site visit at Van Damme Construction. Everything looks good. Schedule the installation for March 15th, team of 4. And send them the final invoice by Friday."

**Visual approach:**
- This card shows **3 CRM entries** that were extracted from a single voice note
- Each entry is a compact row with a different icon + label:
  - ✓ Note added: "Site visit completed — approved"
  - 📅 Task created: "Installation Mar 15 — 4 person team"
  - 📄 Task created: "Send invoice — Due Friday"
- Each row has a subtle checkmark or "added" indicator
- Custom SVG icons: **clipboard/note**, **calendar**, **document/invoice**
- Layout: voice quote on top, then a vertical list of 3 extracted actions — emphasizes the "multiple extractions" power

---

## Card 5: "New Lead from Event"

**Voice input (top):**
> "Met Thomas Bakker at the trade fair, runs a plumbing company in Antwerp, about 15 employees. Wants a demo next week."

**Visual approach:**
- Two-part output: a **lead card** (name, company, location, size) + a **scheduled demo** indicator
- The lead card could have a small location pin SVG for "Antwerp" and a people/team icon for "15 employees"
- Below the lead info: a compact "Demo Requested" banner with a play/presentation icon
- Custom SVG icons: **map pin**, **people group**, **presentation screen**
- Layout: voice quote, then lead details in a structured mini-card, then demo request as a highlighted footer strip

---

## Card 6: "Client Intelligence"

**Voice input (top):**
> "Maria Santos called. They're expanding to a second location in Ghent. Budget increased to 80K. Very positive about the pilot results."

**Visual approach:**
- This card is about **updates to an existing contact** — showing what changed
- Visual: a mini "diff" or "update log" style — each update as a row with a before→after feel:
  - 📍 Locations: 1 → 2 (+ Ghent)
  - 💰 Budget: €40K → €80K (with a green upward arrow)
  - 😊 Sentiment: Positive
- Use subtle background color differences or a left border accent on each update row
- Custom SVG icons: **map pin**, **euro/money**, **sentiment face or thumbs up**
- Layout: voice quote on top, then the update rows — visually unique "changelog" style

---

## Card 7: "Quote Request"

**Voice input (top):**
> "Lucas Peeters from GreenTech Solutions needs a quote for 50 solar panels plus installation. Deadline end of month."

**Visual approach:**
- A structured quote/order summary card
- Line items style: "50x Solar Panels", "Installation service"
- Deadline indicator with a small countdown or calendar date badge
- Contact + company at the bottom
- Custom SVG icons: **document with lines** (quote), **sun/solar panel**, **clock/deadline**
- Layout: voice quote, then a clean itemized list (like a mini invoice), then deadline + contact footer

---

## Card 8: "Sales Pipeline Overview"

**Voice input (top):**
> "Update on the TechFlow deal — moved to final negotiation. StartupXYZ sent their signed proposal, that's 12K confirmed. GrowthCorp is still in discovery."

**Visual approach:**
- Three mini deal rows, each with a colored status indicator:
  - TechFlow: €45K — Negotiation (highlighted, priority badge)
  - StartupXYZ: €12K — Won/Confirmed (green accent)
  - GrowthCorp: €28K — Discovery (muted)
- Each row has a subtle progress dot or stage indicator
- Custom SVG icons: **briefcase** or **chart bars** for header, colored dots for stage
- Layout: voice quote, then 3 stacked deal rows with visual hierarchy (top deal most prominent)

---

## Responsive Scaling Strategy

Everything scales proportionally with viewport width using `clamp()` values:

| Element | Small (≤768px) | Medium (1024-1440px) | Large (1920px+) | Ultra (2560px+) |
|---|---|---|---|---|
| **Card width** | 280px | ~320-380px | ~420-480px | ~530px |
| **Card padding** | 20px | 24-28px | 32px | 38px |
| **Header text** | 14px | 15-16px | 17px | 19px |
| **Body text** | 12px | 13-14px | 15px | 16px |
| **Meta text** | 10px | 11px | 12px | 13px |
| **Header icons** | 28×28 | 36×36 | 44×44 | 52×52 |
| **Inline icons** | 14×14 | 16×16 | 20×20 | 22×22 |
| **Gap between cards** | 16px | 20px | 24px | 28px |
| **Border radius** | 16px | 16px | 20px | 20px |

**Implementation approach:**
- Use CSS custom properties scoped to the carousel container, driven by a single `clamp()` scale factor
- All sizes reference this scale factor so everything grows in lockstep
- Card width: `clamp(280px, 22vw, 530px)` (raised max from 420→530)
- Padding: `clamp(1.25rem, 1.5vw, 2.375rem)`
- Font sizes: `clamp(Xpx, Yvw, Zpx)` per tier
- Icon containers: `clamp(1.75rem, 2.2vw, 3.25rem)` for headers
- SVG stroke widths stay constant (they scale with the viewBox naturally)
- Gap: `clamp(1rem, 1.25vw, 1.75rem)`

The carousel measurement logic already uses `resize` event listener to re-measure on window resize, so the scroll animation will recalculate automatically.

---

## Styling Notes (Apply to All Cards)

- **Icons**: Replace all lucide-react icons with custom SVG paths. Clean, representative line-art style. Consistent 1.5-2px stroke weight, rounded caps/joins. Size scales with viewport (see table above).
- **Voice input section**: Each card starts with a waveform + transcribed text, but the visual weight/size varies per card to avoid sameness. Some cards have the voice input as a compact top strip, others give it more room.
- **Waveform**: 5-7 vertical bars of varying heights, subtle animation (optional), in navy/slate-blue color. Bar dimensions scale with card size.
- **Card dimensions**: Width scales with `clamp(280px, 22vw, 530px)`, height is natural (content-driven).
- **Color palette**: Stay within the existing navy / slate-blue / glow-blue / porcelain system.
- **Typography**: Satoshi for UI text. All font sizes use `clamp()` for smooth scaling (see table).
- **Card container**: `bg-white rounded-2xl shadow-lg border border-navy/[0.06]` with scaled padding and border-radius.

---

## Questions for Review

Please review each card (1-8) and let me know:
1. Which cards to keep, modify, or cut
2. Any scenarios you'd rather see instead
3. Feedback on the visual approach described for each
4. Whether 8 cards is the right number or if you want more/fewer
