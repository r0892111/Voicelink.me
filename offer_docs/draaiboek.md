# Finit Draaiboek

> Beknopte operationele versie. Audit → Development → Opvolging.
> Geen toelichting, geen filosofie. Enkel wat moet gebeuren, door wie, wanneer.

---

## Fases & prijs

| Fase | Duur | Prijs |
|---|---|---|
| Audit | 3 weken | €2.500 vast |
| Development | 4-12 weken | Vaste prijs (default) of €650/dag |
| Opvolging | doorlopend | 1%-2,5%/maand van build |

---

## Rollen

- **Karel** — sales, executive, eindpresentaties, commerciële relatie
- **Alex** — operations, klant-SPOC, projectcoördinatie, brein-orkestratie
- **Jord** — CTO, IT-architectuur, technische uitvoering, hosting

---

## 1. Audit

### Week 0 — Voorbereiding (~3u, Alex)

Klant ontvangt op deal-close:
1. Bevestigingsmail + onboarding-overzicht
2. Factuur
3. NDA (Monard-template)
4. Intake-vragenlijst (Strategisch / Organisatie / Systemen / Praktisch)
5. Voorgestelde kick-off datum (binnen 2 weken)

Alex doet: website + LinkedIn lezen, vragenlijst verwerken in Excalidraw-procesmap, 3-5 hotspots hypothetiseren, agenda customisen.

> **Trigger:** kick-off gaat enkel door als factuur betaald is.

### Week 1 — Kick-off + Pass 1 (ruwe brein)

**Kick-off (~4u, fysiek):** Karel + Jord + Alex on-site. Zaakvoerder verplicht.

| Tijd | Wat | Wie |
|---|---|---|
| 15 min | Voorstellen + traject | Karel |
| 45 min | Whiteboard org-structuur + 2 vragen: (1) volledige IT-lijst, (2) niet-IT processen | Karel + Alex |
| 30 min | Read-access activeren op alle systemen | Jord |
| 10 min | 2 weken inplannen | Alex |

**Pass 1 (~10-12u, week 1):**

| Stap | Actie | Eigenaar |
|---|---|---|
| 1.1 | Read-access valideren | Jord |
| 1.2 | Extractie-scripts schrijven per systeem → `raw/` | Jord |
| 1.3 | Claude bouwt eerste wiki uit raw data | Alex |

### Week 2 — Pass 2 (schone brein) + IT-architectuur

**Pass 2 (~12-14u):**

| Stap | Actie | Eigenaar |
|---|---|---|
| 2.1 | Claude lint het ruwe brein → 100-200 vragen per stakeholder | Alex |
| 2.2 | Interviews (Whisper Flow aan, transcripten in `raw/interviews/`) | Karel (strategisch), Alex (operationeel), Jord (technisch) |
| 2.3 | Claude bouwt schoon brein op blanco canvas | Alex |

Interview-volgorde: zaakvoerder (1-1.5u) → dept-hoofden (45-60min) → teamleads (30-45min) → eindgebruikers (30min). **Vuistregel: ~10 gesprekken voor ~30 mensen.**

**IT-architectuur (~3-5u, Jord):** architectuurdiagram, standaard-metrics, security/GDPR-baseline, SaaS-kostenoverzicht.

### Week 3 — Optimalisatie + rapport + presentatie

**Optimalisatie-brainstorm (~3-4u, intern):** Alex leidt, Jord tech, Karel commercieel. Kansen komen uit `synthesis/automatiseringskansen-shortlist.md`. Per kans: onderbouwing + classificatie (Quick win / Workflow / Agent / Integratie) + prijs + ROI + matrix-positie.

**Rapport (~10-12u):**

1. Executive summary + top 3 aanbevelingen (Karel)
2. Inventaris organisatie (Alex)
3. IT-architectuur huidige staat (Jord)
4. Bevindingen & opportuniteiten (Jord + Alex)
5. Aanbevolen automations met matrix (Jord + Karel)
6. Detailpagina per voorstel (Jord + Karel)
7. AI-roadmap 12 maanden (Karel)
8. Cybersecurity, GDPR, hosting (Jord)
9. Onderhoud & ownership (Karel)
10. Bijlagen + offertes (Karel)

**Chatbot opzetten (Jord):** chat-UI over de wiki. Live demo tijdens eindpresentatie.

**Eindpresentatie (~75 min, fysiek):**

| Tijd | Wat | Wie |
|---|---|---|
| 15 min | Throwback | Karel |
| 10 min | Brein + chatbot demo | Jord |
| 35 min | Aanbevelingen | Karel + Jord |
| 10 min | Offertes | Karel |
| 5 min | Wat nu | Karel |

> Klant leest rapport NIET vooraf. Big reveal = aanbevelingen + chatbot.

### Brein-folderstructuur

```
klant-x-brain/
├── CLAUDE.md                  # Schema (Finit IP per sector)
├── raw/                       # Immutable — niemand bewerkt
│   ├── teamleader/  gmail/  drive/
│   ├── interviews/            # Transcripten
│   └── assets/
└── wiki/
    ├── index.md  log.md       # Inhoudsopgave + chronologisch log
    ├── entities/              # Mensen, klanten, leveranciers, systemen
    ├── concepts/              # Processen, beleidsregels
    ├── sources/               # 1 samenvatting per bron
    └── synthesis/             # Cross-cutting analyses
```

---

## 2. Brug Audit → Development

1. Eindpresentatie eindigt met rapport + offertes
2. Klant beslist (~1 week)
3. Bij ja: Scope of Work tekenen
4. Eerste samenwerking: ook Service Agreement + DPA (eenmalig)
5. Eerste factuur betaald → kick-off ingepland (1 week erna)

---

## 3. Development

### Vaste afspraken

- Vaste prijs per project (default) — dagtarief €650 enkel voor regie
- Mijlpalen, geen sprints
- Tweewekelijkse demo bij mijlpaal-bereiking
- Wekelijkse 15-min check-in (optioneel)
- Klant kiest kanaal: mail / WhatsApp / telefoon
- Geen klant-toegang tot ticketsysteem
- Demo-omgeving (sandbox) standaard opgezet
- Wijziging in scope → Change Request via template
- Onder ~2u absorbeert Finit, daarboven CR

### Klant-SPOC

- Dagelijks: Alex
- Commerciële escalatie: Karel
- Technische escalatie: Jord

### QA-regel

**Geen build naar hypercare zonder dat Alex én Jord beide hebben afgetekend.**

- Jord: code-review op zichzelf en externe support
- Alex: functioneel testen vanuit gebruikersperspectief

### Bug-niveaus

| Niveau | Wat | Reactie |
|---|---|---|
| P1 | Systeem stopt | Onmiddellijk |
| P2 | Functie werkt niet volgens scope | Binnen tier-reactietijd |
| P3 | Cosmetisch | Volgende cyclus |

> Bug = afwijking van Scope of Work. Wens = CR.

### Indicatieve prijzen (intern)

| Type | Prijs | Doorlooptijd |
|---|---|---|
| Quick win | €1.500-€3.000 | 1-2 weken |
| Workflow | €3.000-€7.500 | 2-4 weken |
| Agent | €7.500-€15.000 | 4-8 weken |
| Integratie | €15.000-€40.000 | 8-16 weken |
| Regie | €650/dag | 16+ weken |

### Betaalstructuur

| Grootte | Schema |
|---|---|
| < €5k | 50/50 |
| €5k-€15k | 30/40/30 |
| > €15k of regie | Tweewekelijks op uren |

### "Klaar"

1. Alle mijlpalen afgerond → over naar hypercare
2. 7 dagen geen nieuwe bugmeldingen
3. Opleverdocument + handleiding getekend → "definitief opgeleverd"

---

## 4. Hypercare

| | |
|---|---|
| Duur | ~30% van dev-doorlooptijd (typisch 1-3 weken) |
| Locatie | Remote default |
| Reactietijd kantoor | 4u |
| Reactietijd buiten | 12u |
| Inbegrepen | Bugfixes + minimale scope-aanpassingen |
| Niet | UX-wijzigingen, nieuwe features → CR |
| Stop | 7 dagen geen nieuwe bugmeldingen |

### Overgang naar onderhoud

Bij aftekening opleverdocument, één van drie:

1. **Tier gekozen** → activeert vanaf 1e van volgende maand
2. **Tier-keuze open** → tot 14 dagen na aftekening, Essential-niveau als overbrugging (pro rata)
3. **Geen onderhoud** → klant tekent verklaring met voorwaarden

---

## 5. Opvolging — drie tiers

Default opt-in. Tier-keuze gebeurt **na** opleverpresentatie.

### Essential — ~1%, min €75/mnd
*Systeem blijft draaien.*

- 24/7 uptime monitoring (alert binnen 5 min)
- P1 bugfixes
- Hosting + AI-credits (0% markup)
- Security patches (maandelijks)
- Reactietijd: 24u kantooruren
- Geen feature-aanpassingen, geen SLA

### Standard — ~1,75%, min €125/mnd *(aanbevolen)*
*Systeem blijft draaien én verbetert mee.*

Alles van Essential, plus:
- P2 + P3 bugfixes
- **2u doorontwikkeling/maand** (incl. brein-lint en nieuwe ingests)
- Maandrapport
- Quarterly review (1u call)
- Reactietijd: 4u kantoor, 12u buiten
- Uptime-doel 99,9% (niet contractueel)

### Growth — ~2,5%, min €250/mnd
*Systeem groeit mee met je bedrijf.*

Alles van Standard, plus:
- **6u doorontwikkeling/maand**
- Dedicated SPOC (Alex of Karel)
- Contractueel SLA 99,9% met boete
- Halfjaarlijkse strategiesessie (2u on-site)
- Reactietijd: 2u kantoor, 6u buiten, 24/7 noodlijn

### Voorbeeldprijzen

| Build | Essential | Standard | Growth |
|---|---|---|---|
| €5k | €75 | €125 | €250 |
| €10k | €100 | €175 | €250 |
| €15k | €150 | €263 | €375 |
| €25k | €250 | €438 | €625 |
| €50k | €500 | €875 | €1.250 |
| €100k | €1.000 | €1.750 | €2.500 |

### Voorwaarden over alle tiers

- Doorontwikkelingsuren vervallen einde maand (reminder halverwege)
- Opzeg: 2 maanden
- 3rd-party prijsverhogingen worden doorgerekend
- Tier-upgrade meteen, downgrade volgende maand
- Doorontwikkelingsuren = €81,25/u

### Geen onderhoud

- 30 dagen bugfix-window
- Geen pass-through hosting
- Reactivatie-fee: <6 mnd = €750 vast; >6 mnd = offerte aan €650/dag
- Disclaimer in opleverdocument
- Alle support-vragen lopen eerst door Alex

---

## 6. Contracten

```
Audit:           NDA + Audit-overeenkomst (factuur)
Eerste dev:      Service Agreement + DPA + SoW #1 + onderhoudsbijlage (of verklaring)
Volgende dev:    SoW #N (één handtekening)
```

- NDA volstaat tijdens Audit (Finit = observer)
- DPA bij dev-start, gebundeld met Service Agreement
- Eén algemene DPA — geen sub-DPA's per project
- Data-incidenten: volledig gedekt in DPA

---

## 7. Hosting

| | |
|---|---|
| Default | Finit-managed bij onderhoudscontract |
| Hybride | Bestaande klant-cloud accounts blijven |
| Upstream-facturen | Wij betalen, factureren door (0% markup default) |
| SLA | Tier-afhankelijk, contractueel enkel bij Growth |

### Geen onderhoud + eigen hosting

1. **Vooraf gemeld:** Finit ontwikkelt erop, geen meerkost
2. **Achteraf:** klant betaalt pro rata overzettingsfee aan €650/dag

---

## 8. Eigendom & exit

- Klant = IP-eigenaar build + brein-corpus
- Finit = generieke building blocks + **sector-schema's** (`CLAUDE.md` per sector)
- Operationele toegang bij Finit tijdens actief onderhoud
- Specifieke prompts = klant-exclusief, niet voor concurrenten in dezelfde sector

### Exit-protocol

1. Code-export naar klant-Git
2. Data-export uit Finit-managed databases
3. 1 dag knowledge transfer inbegrepen
4. Extra KT: €650/dag
5. Hosting-migratie: aparte offerte op uurbasis

---

## 9. Capaciteit

| Bezetting | Audits/mnd | Omzet/mnd |
|---|---|---|
| Trio (Karel+Alex+Jord) | 2-3 | €5-7,5k Audit + €8-12k Dev |
| + externe execution | 3-4 | €7,5-10k Audit + €12-16k Dev |

> Aanname: 40% audit→dev conversie, gemiddelde dev-deal €10k. Beide actief tracken.

### Regels

- **Jord reserveert 1 vaste dag/week voor audits** (CTO-bottleneck)
- Externe support enkel op dev-zijde, nooit op audit
- **Alex = sales-backup** bij Karel-afwezigheid
- Per klant: max 2-3 projecten parallel
- Audits totaal parallel: max 2-3
- Development totaal parallel: max 4-6

---

## 10. Klant-fit

### Goed
Servicebedrijven, productie, logistiek, bouw. Veel handmatig werk. Verspreide tools. Zaakvoerder-buy-in aanwezig.

### Afwijzen / kaderen
- Bouwen zonder audit
- Sub-week timelines
- Geen zaakvoerder-buy-in
- Onderhandelen op Audit-prijs (€2.500 ligt vast)
- "Maak gewoon een offerte zonder mapping"
- Pure IT-bedrijven
- Eenmanszaken zonder schaalbare processen

---

## 11. Open punten

1. Hosting/infra standaard tooling-stack (Jord)
2. In-scope/out-of-scope template
3. SoW template (basis: Caenen Service Agreement)
4. Apart auditovereenkomst-document
5. One-liners Development + Opvolging brochure
6. KPI-blokjes brochure
7. Finit CRM productdefinitie
8. Wanbetalings-protocol
9. Health metrics tracking (conversie, deal-grootte, % onderhoud, tier-mix)
10. Sector-schema templates (eerste = HVAC, na 2-3 audits)
11. Brein-toolchain standaardiseren per IT-systeem (Jord)
12. Chatbot-frontend voor klant (Jord)
