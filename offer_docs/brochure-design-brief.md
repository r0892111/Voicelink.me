# Brochure design brief — beurseditie 2026

> Brief voor de designer. Werk samen met `brochure.md` (bron-copy, finaal) en het Finit / VoiceLink design system.
> Status: handover-klaar. Te bespreken tijdens kick-off met designer.

---

## 1. Doel & gebruikscontext

| Aspect | Detail |
|---|---|
| Doel | Kennismakingsmateriaal op beurzen en als leave-behind na een eerste gesprek |
| Lezer | Zaakvoerders en management van KMO's, **niet-technisch** |
| Leestijd | Pakt 'm 30 sec van de tafel. Leest 'm later 5 min op kantoor. Bewaart 'm. |
| Beslissingsmoment | "Plan ik een gratis kennismakingsgesprek?" — ja/nee |
| Tone of voice | Editorial, rustig, zelfverzekerd. Penguin Classics × Bloomberg terminal. **Geen sales-energie.** |

---

## 2. Format & productie

| Spec | Waarde |
|---|---|
| Formaat | A5 (148 × 210 mm) saddle-stitched booklet |
| Aantal pagina's | 16 (incl. covers) — multiple of 4 verplicht voor saddle stitch |
| Papier | Matte coated, lichtjes warm-getint indien beschikbaar (PMS Cool Gray of equivalent op warm-cream subtraat) |
| Bleed | 3 mm, alle zijden |
| Print | CMYK, 300 dpi |
| Speciaal | Optioneel: spot UV op het AI-brein illustratie (p7) voor tactiele "wow" |

> **Pagina-allocatie:** Cover · Inside front · 1 (intro) · 2 (anders) · 3 (3 stappen) · 4–5 (Audit, spread) · 6 (Development) · 7 (Onderhoud) · 8 (VoiceLink) · 9 (Finit CRM) · 10–11 (klanten, spread) · 12 (CTA) · Inside back · Back cover.

---

## 3. Design system (always-on)

Alle keuzes komen uit het Finit / VoiceLink design system. Geen afwijkingen zonder overleg.

### Kleur

| Rol | Token | Waarde |
|---|---|---|
| Pagina-achtergrond | `--paper-cream` | `#FDFBF7` (nooit pure wit) |
| Verhoogde kaarten | `--paper-elevated` | `#FFFEFA` |
| Verzonken vlakken (callouts) | `--paper-recessed` | `#F5F3EC` |
| Body tekst | `--ink-900` | `#2A2620` (warm bijna-zwart, **nooit `#000`**) |
| Headlines | `--ink-850` | `#322D26` (een tand lichter dan body) |
| Captions, metadata | `--ink-600` | `#76706A` |
| Brand / CTA / koppen-accent | `--marine-900` | `#1A2D63` |
| Brand pressed | `--marine-950` | `#0F1D47` |
| Chip / fog | `--marine-500` | `#757F9E` |
| Soft tints, achtergronden | `--marine-100` | `#E4E8F2` |
| Borders / hairlines | `--bone-300` | `#E8E6DC` |

**Verboden:** `#FFFFFF` als pagina-achtergrond. `#000000`. Coral. Oranje. Paars. Multikleur-iconen. Gradient-vol.

### Typografie

| Niveau | Klasse | Gewicht | Gebruik |
|---|---|---|---|
| Display XL | `.t-display-xl` | 900 | Cover hoofdtitel |
| Display | `.t-display` | 900 | CTA-pagina, één-woord-statements |
| Display SM | `.t-display-sm` | 900 | Hero binnen sectie (bv. AI-brein, prijs-callout) |
| H1 | `.t-h1` | 800 | Sectiekop |
| H2 | `.t-h2` | 700 | Sub-sectiekop |
| H3 | `.t-h3` | 600 | Pull-quote, callout-kop |
| H4 | `.t-h4` | 600 | Tile-titel |
| Body | `.t-body` | 400 | Paragraaftekst |
| Eyebrow | `.t-eyebrow` | 500, uppercase, +0.1em tracking | Boven sectiekop |
| Caption | `.t-caption` | 400, klein | Bijschrift, metadata |
| Mono | `.t-mono` | 500 | Technische labels in illustraties |

- **Font:** Inter Variable (opsz axis 14–32, weight 100–900). Mono: JetBrains Mono.
- **Headlines** zitten op `--ink-850` (niet pure body-zwart) zodat ze rustig blijven op cream.
- **Display sizes** krijgen negatieve letter-spacing (`-0.025em` tot `-0.03em`).
- **Tabular nums + slashed zero** op alle cijfers in tabellen of prijzen.
- **Sentence case** voor alle koppen. Geen Title Case. Geen ALL CAPS behalve eyebrows.

### Iconen & illustraties

- **Icoonstijl:** lijn, monoweight (1.5px), `--marine-900`. Geen filled, geen multikleur.
- **Illustratiestijl:** minimaal, abstract, geometrisch. Marine-paletkleuren met `--bone-300` hairlines en `--marine-100` fills. Geen stockfoto's van mensen die naar schermen wijzen.
- **Foto's** (alleen op p2 founders-shot): warm, editorial, cream-marine duotoon. Geen corporate boardroom.

### Spacing & ritme

- Pagina-marges: 24mm boven, 22mm zijkanten (15mm aan de bind-kant), 24mm onder
- Sectie-padding binnen pagina's: 64–96 pt verticaal
- Card padding: 24 pt standaard
- Meer ruimte tússen blokken dan binnen blokken (5:3-verhouding als vuistregel)

### Vormgeving van blokken

- **Kaarten:** soft warm pillow-shadow (`--shadow-paper`), niet flat. Radius `--radius-xl` (14.4px). Padding 24pt.
- **Knoppen:** marine-900 fill + 1.5px inset wit highlight bovenaan (glass rim) + 1px inset donker onderaan + soft drop shadow. Radius `--radius-sm` (7.2px). Geldig zelfs voor "knop-look" in print.
- **Pull quotes:** italic, marine-700, met 2px `--marine-300` linker-rule. Geen aanhalingstekens-glyph.

### Copy hygiene (non-negotiable)

- **Geen em-dashes** in copy of micro-copy. Komma's, sentence breaks, of haakjes. Brongevelder.
- **Geen emoji** in koppen, lijsten, of waar dan ook.
- **Curly quotes** ("..."): OK voor Nederlands fluently, maar niet binnen technische termen of code.

---

## 4. Pagina-voor-pagina visueel plan

> Per pagina: het concept (waarom deze pagina visueel werkt), layout, typografie, illustratie/visueel element, en de psychologische rationale (waarom déze keuze).

---

### Cover (p1)

**Concept.** Stilte. Editorial titelpagina. De cover moet *niet* commercieel ogen. Hij moet ogen als de cover van een goed boek of een Bloomberg-rapport. Dat signaleert: "wij zijn anders, en we hebben het niet nodig om te schreeuwen."

**Layout.**
- Verticaal stack, royale boven-marge (1/3 pagina blanco)
- Logo top-left (`finit-logo-blue.svg`, ~36pt hoog)
- Eyebrow midden-linksgelijnd: "Beurseditie 2026"
- Hoofdtitel op drie regels, midden van de pagina
- Slogan onderaan, vrijgehouden van de rand

**Typografie.**
- Eyebrow: `.t-eyebrow`, `--ink-600`
- Hoofdtitel: `.t-display-xl`, weight 900, `--marine-900`. Drie regels, exact zoals slogan: *"Eerst inzicht. / Dan bouwen. / Dan groeien."*
- Optioneel: één regel quote onderaan in `.t-caption`, italic, `--ink-700`. Bv. *"Wij beginnen niet met bouwen. Wij beginnen met kijken."*

**Visueel.** Niets, of één heel subtiel element bottom-right: een geometrische marine-100 vorm (bv. zes hexagonen die samen een hersenhelft suggereren) op 30% opacity. **Niet groter dan 1/8 van de pagina.**

**Psychologie.** Mere exposure (logo lock-up vroeg). Lindy Effect (klassieke typografische rust = "wij blijven bestaan"). Authority bias (Penguin/Bloomberg-vibes = expertise zonder claim).

---

### Inside front cover (p2)

**Concept.** Adempauze. Of pull-quote.

**Optie A (aanbevolen).** Eén pull-quote van een klant, full-bleed, geen logo's eromheen.

> *"Wij wisten dat we iets met AI moesten doen. Finit was de eerste die niet meteen iets wilde verkopen, maar eerst kwam kijken."*
> — Naam, functie, bedrijfsnaam

**Optie B.** Subtle watermark van de slogan in `--marine-50`, anders blanco.

**Typografie.** Quote: `.t-h2`, `--marine-700`, italic. Attributie: `.t-caption`, `--ink-600`.

**Psychologie.** Reciprociteit (we geven eerst sociale validatie voor we iets vragen). Liking/similarity (klantenstem voor leveranciersstem).

---

### p3 — Sectie 1: "Iets wat je waarschijnlijk herkent"

**Concept.** De pijn. Pakt de lezer op het hart.

**Layout.**
- Single column, brede linker-marge (asymmetrisch — voelt menselijker dan gecentreerd)
- Sectienummer eyebrow boven heading: "01 — Probleem"
- Heading
- Drie korte regels "Je voelt..." als aparte regels (line break per zin)
- Twee paragraaf-blokken met witruimte tussen
- Onderaan: callout-kader met de "Daarom mislukken..." zin

**Typografie.**
- Eyebrow: `--marine-600`
- Heading: `.t-h1`
- Body: `.t-body` op 17–18 pt size, line-height 1.7 (royale rust)
- Callout: `.t-h3`, italic, `--marine-900`, met `--marine-300` 2px linker-rule

**Visueel.** Subtiel. Hooguit een dunne `--bone-300` hairline boven de callout. Géén iconen op deze pagina (we willen dat de pijn binnenkomt zonder afleiding).

**Psychologie.** Availability heuristic (vivid herkenning > abstracte claim). Confirmation bias (start waar de lezer al staat). Pratfall effect (de industrie geeft toe dat ze tekortschiet — daardoor geloofwaardiger).

---

### p4 — Sectie 2: "Wij doen het anders"

**Concept.** De pivot. De alternatieve weg. Dit is waar de lezer denkt: "OK, jullie zijn anders. Hoe?"

**Layout (asymmetrische split, 60/40).**
- Linker 60%: heading + intro paragraaf + "We komen langs" sequence
- Rechter 40%: foto van de drie founders (Karel, Alex, Jord) of, indien geen foto, een illustratieve marker (zie Visueel)
- Volle breedte onderaan: pull-quote "Soms is een AI-agent het antwoord..."

**Typografie.**
- Eyebrow: "02 — Aanpak"
- Heading: `.t-h1`. Bedrijfsnaam "Finit Solutions" in marine-900
- "We komen langs..." als kort paragraafje, niet als bulletlijst (voelt menselijker)
- Pull-quote: `.t-h3`, italic

**Visueel.**
- **Foto-optie (sterk aanbevolen):** Karel, Alex, Jord casual professional, in Leuven kantoor of op locatie. Warm licht. Cream-marine duotoon. Eye-contact met camera. Géén "armen-over-elkaar-corporate".
- **Illustratie-optie (als foto niet kan):** drie overlappende cirkels in marine-300/500/900 (de drie marine-fog-punten van het brand-systeem), centraal gestapeld.

**Psychologie.** Authority bias (drie ingenieurs uit Leuven = KU Leuven-aura). Liking/similarity (gezichten, niet logo's). Unity (peers van de zaakvoerder).

---

### p5 — Sectie 3: "Drie stappen, één plan"

**Concept.** De roadmap, in één blik. Hero van helderheid.

**Layout.**
- Heading boven
- 3-koloms tile-layout in midden-pagina
- Onderaan de eenregel-belofte: *"Je beslist zelf hoe ver je gaat. Je zit nooit vast."*

**Tile-anatomie (per kolom):**
1. Genummerde cirkel bovenaan: marine-900 fill, cream "1" / "2" / "3" in `.t-h3` weight 700
2. Kop: "Audit" / "Development" / "Opvolging" — `.t-h3` weight 700 marine-900
3. Subtitel: "We leren je bedrijf kennen" / "We bouwen wat werkt" / "We blijven naast je staan" — `.t-body` weight 500
4. Duur: "3 weken" / "4 tot 12 weken" / "Doorlopend" — `.t-caption` ink-600
5. Prijs: "€2.500" / "Vaste prijs per project" / "Vast bedrag per maand" — `.t-body` weight 600 marine-900
6. Klein lijn-icoon onderaan: kompas / hamer / handdruk

**Tile-visual.** Cream-elevated achtergrond, `--shadow-paper`, `--bone-300` 1px border, padding 24pt, radius `--radius-xl`. Gap 16pt tussen tiles.

**Extra detail.** Een dunne marine-300 hairline die door alle drie de cirkels heen loopt (suggereert reis/pad).

**Psychologie.** Hick's Law (3 opties, geen 5 of 7 = snellere beslissing). Goal-gradient (genummerde reis). Default effect (middelste tile mag iets prominenter staan — Development is de logische volgende stap na Audit, dus subtiele gewichtsbias daar).

---

### p6–7 — Sectie 4: "De Finit AI Audit" (DUBBELE SPREAD, het zwaartepunt van de brochure)

**Dit is dé pagina.** Het AI-brein is wat ons onderscheidt en het verdient ruimte. Behandel dit als een magazine-feature spread.

**Linker pagina (p6).**
- Eyebrow: "03 — Stap 1"
- Heading: "De Finit AI Audit"
- Lead-zin in `.t-h3`: "Drie weken. We brengen je hele bedrijf in kaart."
- 4-regelige observatie-block ("We praten / We krijgen / We meten / We tellen") — elke regel met een marine-900 dot prefix, witruimte ertussen

**Rechter pagina (p7) — de hero:**
- Heading-statement: "En dan doen we iets wat geen andere AI-consultant doet:" (`.t-body` weight 500)
- Direct daaronder: **"AI-brein van je bedrijf"** in `.t-display-sm` weight 900 marine-900
- Hero-illustratie (zie Visueel hieronder, ~50% van de rechterpagina)
- Onder de illustratie: drie chat-bubble mockups (zie Visueel)
- Onder de chat: "Wat je krijgt na drie weken" deliverables-lijst met marine-900 checkmark-bullets
- Bottom-right corner: prijs-callout *"Investering: €2.500"* in `.t-h2`

**De hero-illustratie (BRIEFING).**
> Concept: het AI-brein als ontvanger en synthesizer van bedrijfskennis.
>
> Stijl: line illustration, monoweight 1.5px, marine-700 met marine-100 fills en bone-300 hairlines.
>
> Compositie:
> - Linkerkant: vijf scattered icons die naar binnen "stromen": envelop (mails), folder (Drive), kaartje (Teamleader), persoon-silhouet (interview), telefoon (WhatsApp). Elk icoon klein, met een dun marine-300 connector-lijntje richting het centrum.
> - Centrum: een gestructureerd brein-vorm gebouwd uit kleine verbonden hexagonen (~30 cells). De hexagonen zijn niet random; ze hebben subtiele groepering die "hoofdstukken" suggereert. Subtiele marine-100 fill in elke cel.
> - Rechterkant: één chat-bubble die "uit" het brein komt met een vraag erin, en daaronder een antwoord-bubble met een citatie-link.
> - Annotatie-labels in `.t-mono` small caps, ink-700, met dunne marine-300 connector-lijntjes naar de bron-iconen.
>
> Doel: de lezer moet in 3 seconden begrijpen "alle bedrijfskennis stroomt erin, en ik kan het bevragen."

**De drie chat-bubble mockups.**
- Stijl: cream-elevated bubbles voor vragen (rechts uitgelijnd), marine-900 fill bubbles voor antwoorden (links uitgelijnd)
- Radius `--radius-md` (9.6px), met 1px `--bone-300` border op vraag-bubbles
- Tekst in `.t-body` body-grootte
- Vraag 1: *"Hoe loopt onze offerte-flow?"* → Antwoord (preview): *"Sara start vanuit Outlook-notities, configureert in Daikin Configurator..."* met `.t-caption` bron: "Bron: proc-003"
- Vraag 2: *"Welke klanten zijn vorige maand niet meer teruggekomen?"* → Antwoord: *"23 klanten, gemiddelde inactiviteit 47 dagen."* Bron: "Teamleader Q2"
- Vraag 3: *"Wat zegt Sara over de Excel-template uit 2024?"* → Antwoord: italic citaat *"De Excel is van 2024, prijzen zijn deels achterhaald..."* Bron: "Interview Sara, 2026-04-16"

**Psychologie.** Peak-end rule (deze spread *moet* het visuele en informatieve hoogtepunt zijn, want het bepaalt wat de lezer onthoudt). Endowment effect (je krijgt je eigen brein, niet zomaar een rapport). Specificity (concrete queries, namen, datums, bron-citaten = geloofwaardigheid). Curiosity gap (je wil deze brein-illustratie écht begrijpen).

---

### p8 — Sectie 5: "We bouwen wat werkt"

**Concept.** Wat bouwen we eigenlijk? Inventaris zonder overweldiging.

**Layout.**
- Heading + intro paragraaf bovenaan
- 2×2 grid met de vier soorten oplossingen
- Cream-recessed callout-kader met de brein-context-paragraaf (*"Omdat het AI-brein klaarligt, kennen onze agents je bedrijf al vanaf dag één..."*)
- Pull-quote onderaan (vaste prijs / mijlpalen / demo om de twee weken)

**2×2 grid-tile.**
- Lijn-icoon top-left, marine-900, ~24pt
- Titel: "Quick wins" / "Workflows" / "Agents" / "Volledige systemen" — `.t-h4` weight 600 marine-900
- 1-regel beschrijving: `.t-body` weight 400 ink-900
- Geen kader om elke tile, alleen `--bone-300` hairlines tussen kolommen en rijen (magazine-grid-gevoel)
- Subtiele extra weight op Workflows en Agents (lichtere ink-900 ipv default), want dat zijn de meest-verkochte tiers

**Iconen.**
- Quick wins: spark/lightning bolt (lijn)
- Workflows: drie verbonden stappen-pijlen
- Agents: persoon-silhouet met klein gear-element bij het hoofd
- Volledige systemen: drie kleine persoon-silhouetten verbonden door lijntjes naar één centrale punt

**Brein-callout-kader.**
- Achtergrond `--paper-recessed` (#F5F3EC), radius `--radius-md`, padding 20pt
- Klein brein-icoon top-left in marine-900
- Tekst in `.t-body` ink-900
- Géén border, alleen de recessed achtergrondkleur tilt 'm visueel terug

**Pull-quote.** Italic, marine-700, met `--marine-300` 2px linker-rule.

**Psychologie.** Paradox of choice (4 typen, geen 12). Default effect (Workflows + Agents iets prominenter). Loss aversion (callout: zonder brein = "AI weet niet wat hij niet weet"-fouten = pijn).

---

### p9 — Sectie 6: "We blijven naast je staan"

**Concept.** Onderhoud als verzekering. De pagina moet *gerust* voelen.

**Layout (asymmetrische split).**
- Linker 55%: heading, paragrafen over drift en brein-onderhoud
- Rechter 45%: pricing-callout + "Wat zit erin"-lijst
- Onderaan full-width: marine-900 panel met de geruststellings-zin

**Pricing-callout (rechter kolom top).**
- "1% — 2,5%" in `.t-display-sm` weight 900 marine-900 (em-dash niet gebruiken — gewoon koppelteken of "tot")
- Subtitel `.t-eyebrow`: "VAN WAT JE INVESTEERT, PER MAAND"
- Boven de callout een klein "schild + klok" combinatie-icoon in marine-900

**Wat zit erin lijst.**
- 6 items met marine-900 dot bullets
- `.t-body` ink-900
- Het item *"je AI-rekeningen, je integraties, één lijn op je factuur"* mag een lichte highlight krijgen (bv. cream-elevated tile-achtergrond rond alleen die regel) want dat is een unieke value prop

**Drift-paragraaf-iconen (linker kolom).**
Naast elk drift-element een mini lijn-icoon in marine-700, ~14pt:
- Modellen drijven: golfje
- Integraties veranderen: twee tandwielen niet-uitgelijnd
- Prompts verouderen: kalender-blad
- Business schuift op: pijl-omhoog

**Onderste reassurance panel.**
- Volle breedte, marine-900 fill
- Cream tekst: *"Geen lange contracten. Twee maanden opzeg. Je code blijft van jou. Wij doen het werk."*
- `.t-h3` weight 600
- Padding 32pt verticaal, 24pt horizontaal
- Radius `--radius-md`

**Psychologie.** Loss aversion (zonder onderhoud breekt het). Status-quo bias (eens je 'n contract hebt, blijf je). Regret aversion (2 maanden opzeg = "ik kan altijd terug"). Reciprocity (we incasseren upstream-rekeningen op één lijn — dat is een gunst, niet een verkooptechniek).

---

### p10 — Sectie 7: VoiceLink

**Concept.** Productlaag wakker schudden. Subtiel andere visuele "voice" — meer product-promo, minder strategy.

**Layout (split 50/50).**
- Links: VoiceLink-logo + headline + paragraaf + prijs
- Rechts: telefoon-mockup met WhatsApp → CRM flow

**Typografie links.**
- Logo: `voicelink-logo-blue.svg`, 32pt hoog
- Headline: *"Spreek je CRM gewoon in."* `.t-h1` marine-900
- Body paragraaf
- Prijs-callout: *"Vanaf €19/maand"* `.t-display-sm` marine-900
- CTA-quote in cream-elevated kader: *"Probeer 100 berichten gratis op voicelink.me"* met marine-900 onderlijnde link

**Telefoon-mockup (rechts).**
- Lijn-illustratie van phone-frame, niet foto-mockup
- Inhoud:
  1. WhatsApp voice-message bubble bovenaan (groene WA-tint mag, dat is toegestane referentie naar het bron-platform)
  2. Pijl naar beneden in marine-700
  3. CRM-card met "Klant aangemaakt: Pieter Vanderlinden — Deal €8.500 — Taak ingepland"
- Stijl consistent met Finit illustratie-systeem: marine outlines, marine-100 fills, bone hairlines

**Logos onder de phone (klein):** "Werkt vandaag met Teamleader. Pipedrive en Odoo komen eraan." — Teamleader logo full-color (toegestaan vanwege referentie), Pipedrive en Odoo in greyscale met "Coming soon"-label.

**Psychologie.** Activation energy (100 berichten gratis = trivial om te starten). Endowment effect (probeer eerst, betaal later). Foot-in-the-door (gratis trial → betalend abonnement). Specificity ("100 berichten" voelt anders dan "free trial").

---

### p11 — Sectie 8: Finit CRM

**Concept.** Coming-soon teaser. Anticipatie zonder hard sell (er is nog geen product om te demonstreren).

**Layout.** Single column, simpeler dan VoiceLink.
- Eyebrow: "Komt eraan in 2026" in `.t-eyebrow` marine-600
- Heading: *"Een CRM zonder de overbodige rommel."* `.t-h1`
- Twee body-paragrafen
- "Bijna gratis." als grote display-statement (`.t-display-sm` marine-900) met onderlijning
- Closing CTA-quote in italic kader

**Visueel — "before/after" sketch (centraal).**
- Linker helft: dichtbevolkt CRM-dashboard, ~12 kleine bone-300 boxjes random gepositioneerd, bleek/faded (40% opacity)
- Rechter helft: drie schone blokken naast elkaar — "Contacten" / "Agenda" / "Deals" — in marine-900 hairlines, scherp
- Tussen de twee: een dunne diagonale lijn die het overgaat van rommel naar rust
- **Doel:** de lezer voelt het visueel verschil voordat hij de tekst leest.

**Psychologie.** Contrast effect (voor/na overgang in beeld). Scarcity (vroege toegang). Zero-price effect ("bijna gratis" — zoals letterlijk in copy). Curiosity gap (kom eraan = wachtlijst-trigger).

---

### p12–13 — Sectie 9: "Voor wie wij dit doen" (DUBBELE SPREAD voor klant-logo's)

**Concept.** Sociale bewijskracht in volle glorie. Magazine-spread feel.

**Linker pagina (p12).**
- Eyebrow: "Voor wie wij dit doen"
- Heading: optioneel kleiner, het zwaartepunt ligt op de logo wall rechts
- Body lijst: 4 typen klanten als bullet-lijst
- Italic side-note onderaan: *"Per klant nooit meer dan 2 of 3 projecten parallel."*

**Rechter pagina (p13) — logo wall.**
- Heading boven: "Onder andere voor:" of zonder heading (logos spreken voor zich)
- 3 kolom × 3 rij grid van klantenlogo's, alle in `--ink-700` greyscale of `--marine-900` monochrome (geen rainbow)
- 9 logo's zichtbaar; "..en anderen" in `.t-eyebrow ink-500` rechtsonder
- Onder elk logo (optioneel): kort one-liner sectorlabel in `.t-caption` ink-600 (bv. "Vastgoed", "FMCG", "Recruitment")
- Subtle marine-100 vlak van 4pt kleiner dan logo achter elk logo (lift-effect zonder kader)

**Tip aan designer:** logos op gelijke optische grootte, niet pixel-grootte. Sommige logos zijn breder dan hoger — vergelijkbare *visuele* aanwezigheid is wat telt.

**Psychologie.** Social proof / bandwagon (logos = "anderen kozen ons"). Authority bias (Test-Aankoop is een nationale autoriteit — dat straalt af). Mimetic desire ("als zij Finit gebruiken..."). Lindy effect (meerdere klanten over jaren = wij blijven bestaan).

---

### p14 — Sectie 10: CTA

**Concept.** Knop-pagina. Eén ding doen. Geen ruis.

**Layout.** Verticaal gecentreerd. Bovenste 1/3 leeg.
- Heading: *"Klaar om te beginnen?"* `.t-display` weight 900 marine-900, gecentreerd
- Subheading: *"Plan een gratis kennismakingsgesprek."* `.t-h2`
- Sub-sub: *"30 minuten. Vrijblijvend."* `.t-body` ink-700
- Knop-blok: marine-900 fill, cream tekst, *"finitsolutions.be/contact"* — print equivalent van het Option B button-recipe (glass rim + flat fill + soft drop shadow)
- Onder knop: *"contact@finitsolutions.be · Leuven, België"* in `.t-caption` ink-700

**Visueel.**
- Achter de heading een subtiele "rising lines" abstract: drie oplopende `--bone-300` hairlines, suggereren groei. 30% opacity.
- QR-code optioneel rechtsonder, 24×24mm, marine-900 dots op cream. Linkt naar finitsolutions.be/contact met UTM `utm_source=brochure&utm_medium=print&utm_campaign=beurseditie2026`.

**Psychologie.** Activation energy minimal (gratis, 30 min). Regret aversion ("vrijblijvend"). Commitment & consistency (kleine eerste stap). Reciprocity (na 14 pagina's content, voelt het ask faire).

---

### Inside back cover (p15)

**Concept.** Stille brand-echo. Optioneel.

**Optie A.** Volledig blanco, `--paper-cream`. Soms is niets de juiste keuze.

**Optie B.** Een tweede klant-quote, klein, gecentreerd, ~30% van de pagina.

**Optie C.** Een mini infographic "wat de Audit oplevert" als visuele samenvatting (drie cijfers: 3 weken, 1 chatbot, 1 plan op tafel).

**Aanbeveling:** Optie A. De rust werkt.

---

### Back cover (p16)

**Concept.** Brand-aftekening.

**Layout.**
- Top 1/3: blanco
- Midden: kleine "F finit" mark in marine-900
- Onder de mark: drie kleine marine-900 dots (echo van de drie stappen)
- Onderste 1/4: slogan + adres
  - *"Eerst inzicht. Dan bouwen. Dan groeien."* `.t-h3` weight 600 marine-900, gecentreerd
  - *"Leuven · finitsolutions.be · contact@finitsolutions.be"* `.t-caption` ink-700, gecentreerd

**Niet doen.** Geen full-bleed kleur, geen QR-code groot, geen "Volg ons op LinkedIn"-strip. Quietness.

---

## 5. Productie-checklist (designer signoff)

- [ ] Alle pagina-achtergronden: `--paper-cream` `#FDFBF7` (niet wit)
- [ ] Headlines: `--ink-850` `#322D26` (niet pure zwart)
- [ ] Body: `--ink-900` `#2A2620`
- [ ] Brand kleur uitsluitend marine-ladder (geen coral, geen oranje)
- [ ] Inter Variable, weight 900 voor display sizes
- [ ] Sentence case op alle koppen
- [ ] Geen emoji
- [ ] Geen em-dashes in copy (al gefixt in `brochure.md`, double-check tijdens layout)
- [ ] Curly quotes correct ("..." niet "...") in Nederlandse tekst
- [ ] Tabular nums + slashed zero op cijfers in prijzen en tabellen
- [ ] `finit-logo-blue.svg` op cream surfaces, `-white` variant op marine surfaces
- [ ] Card radius `--radius-xl` (14.4px)
- [ ] Soft warm pillow shadow op kaarten (`--shadow-paper`), niet flat hairlines
- [ ] Iconen line, monoweight, marine-900, géén filled
- [ ] Illustraties in Finit-systeem (marine outline, marine-100 fills, bone hairlines)
- [ ] 3mm bleed, CMYK conversie van marine-900 (vraag designer om print-proof tegen brand-pantone)
- [ ] Spotcheck WCAG AA contrast op alle tekst (body 4.5:1, large 3:1)
- [ ] QR-code (p14) test scant naar correcte UTM-URL

---

## 6. Open punten voor designer-kick-off

| # | Vraag | Default-aanname als geen antwoord |
|---|---|---|
| 1 | Founders-foto beschikbaar voor p4? | Zo niet, illustratie-optie (drie cirkels) gebruiken |
| 2 | Klant-quote voor p2 inside front beschikbaar? | Zo niet, watermark-optie (Optie B) |
| 3 | Heeft Karel een voorkeur voor saddle stitch (A5 boekje) of trifold (DL)? | A5 saddle-stitched 16 pagina's |
| 4 | Print-budget per stuk? Beïnvloedt papierkeuze en spot UV-mogelijkheid | Matte coated 170gsm, geen spot UV |
| 5 | Oplage? | Minstens 500 voor één beursweekend |
| 6 | Tweetalig (NL/FR/EN)? | Single-language NL voor beurseditie 2026 |
| 7 | UTM-strategie afgestemd met marketing? | `utm_source=brochure&utm_medium=print&utm_campaign=beurseditie2026` als default |

---

## 7. Files & assets voor designer

- **Bron-copy:** `offer_docs/brochure.md` (single source of truth, designer kopieert tekst hier vanuit)
- **Design tokens:** Finit / VoiceLink design system (`/Users/alexotten/.claude/skills/finit-design-system/references/`)
- **Logos:** `assets/logos/finit-logo-{blue,white}.svg`, `voicelink-logo-{blue,white}.svg`
- **Font:** Inter Variable + JetBrains Mono (TTFs in design system assets)
- **Klant-logo's:** apart aanleveren (BeroepsBelg, Copackr, Caenen Vastgoed, Test-Aankoop, PaintedCreations, Solidor, Schevenels, Terrashield, iRecruiter)
- **Founders-foto (optioneel):** Karel/Alex/Jord groepsfoto, indien beschikbaar

---

*Document is een werkbrief. Iteratie is verwacht na eerste designer-mockup. Hou de bron-copy in `brochure.md` als waarheid; visuele beslissingen kunnen evolueren binnen het design system.*
