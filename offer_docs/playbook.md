# Finit Solutions — Interne Playbook v3

> Operationele gids voor het Audit → Development → Opvolging traject.
> Status: werkversie. Te reviewen door Karel.
> Laatste update: 2026-05-04

---

## Inhoud

1. [Overzicht & filosofie](#1-overzicht-filosofie)
2. [Audit-fase](#2-audit-fase)
3. [Brug Audit → Development](#3-brug-audit-→-development)
4. [Development-fase](#4-development-fase)
5. [Hypercare](#5-hypercare)
6. [Opvolging / Onderhoudscontract](#6-opvolging-onderhoudscontract)
7. [Contracten & juridisch](#7-contracten-juridisch)
8. [Hosting & infrastructuur](#8-hosting-infrastructuur)
9. [Eigendom, IP & exit](#9-eigendom-ip-exit)
10. [Pricing-overzicht](#10-pricing-overzicht)
11. [Capaciteit & rol-verdeling](#11-capaciteit-rol-verdeling)
12. [Klant-fit & red flags](#12-klant-fit-red-flags)
13. [Open punten](#13-open-punten)

---

## 1. Overzicht & filosofie

Finit werkt in drie opeenvolgende fases. Elke fase staat op zichzelf en is apart geprijsd. Geen lock-in tussen fases — maar wie alle drie doorloopt, krijgt het volle resultaat.

| Fase | Doel | Duur | Investering |
|---|---|---|---|
| Audit | Bedrijf in kaart, plan op tafel | 3 weken | €2.500 vast |
| Development | Bouwen wat de Audit aanwees | 4-12 weken | Vaste prijs of dagtarief |
| Opvolging | Onderhouden, optimaliseren, uitbreiden | doorlopend | 1%-2,5%/maand van build |

### Kernprincipes

- **Audit eerst.** We bouwen niet zonder audit (behalve in uitzonderlijke gevallen). Reden: zonder data is elke offerte een gok, en de klant moet zekerheid hebben in wat hij investeert.
- **Knowledge base als fundament.** Voor elke audit-klant bouwen we een gestructureerde, AI-leesbare kennisbasis ("AI-brain") als tastbaar tussenartefact. Die levert direct een werkende chatbot over het bedrijf op, voedt onze automatiseringsvoorstellen tien keer beter, en vormt de fundering voor toekomstige agents. Methodologie zie [§2 Fase 2](#fase-2--mapping-week-1-2).
- **Eigendom blijft bij klant.** Geen vendor lock-in. Code is van klant. Onderhoudscontract is **niet verplicht** maar zeer interessant en is **default opt-in**.
- **Vaste prijs als default.** Dagtarief alleen voor heel complexe trajecten waar scope vooraf niet vastlegbaar is.
- **Mijlpalen, geen sprints.** Geen klant-tickets. Geen micromanagement. *"Als je niets van ons hoort, zijn we goed bezig."*
- **Beperkt aantal klanten parallel.** Capaciteitsregels zie [§11](#11-capaciteit-rol-verdeling).

---

## 2. Audit-fase

### Tijdsoverzicht

| Fase | Duur (kalender) | Tijdsinzet Finit | Eigenaar |
|---|---|---|---|
| 0. Voorbereiding | 1-2 weken vooraf | ~3u | Alex |
| 1. Kick-off | 1 dag, fysiek | ~4u (excl. reis) | Karel (lead) + Jord (IT-onboarding) + Alex |
| 2a. Mapping — Pass 1 (ruwe brein) | week 1 | ~10-12u | Jord (data-extractie), Alex (Claude-orchestratie) |
| 2b. Mapping — Pass 2 (schone brein) | week 2 | ~12-14u | Karel (strategische interviews), Alex (operationele interviews + lint-vragenlijst), Jord (technische interviews) |
| 3. IT-architectuur | week 2 | ~3-5u | Jord (lead) — grotendeels emergent uit pass 1 |
| 4. Optimalisatie-brainstorm | week 3, intern | ~3-4u | Alex (lead) + Karel + Jord — kansen vallen er uit synthesis-paginas |
| 5. Rapport + chatbot-opzet | week 3 | ~10-12u | Karel (executive secties), Jord (technische secties + chatbot deploy), Alex (proces-secties + brein-curatie) |
| 6. Eindpresentatie | 1 dag, fysiek | ~2u (excl. reis) | Karel (lead) + Jord (tech Q&A + chatbot demo) + Alex |
| **Totaal** | **3 weken** | **~47-56u** | |

> **Audit economics.** Audit @ €2.500 = strategische verliespost. Bij €81,25/u interne kost = ~€3.800-€4.550 productiekost. De brein-methodologie verhoogt de productiekost licht, maar brengt twee dingen terug: (1) een tastbare quick win (chatbot) die de €2.500 op zichzelf al rechtvaardigt en (2) substantieel betere automatiseringsvoorstellen, wat de Audit→Development conversie ver boven de 40%-target moet duwen. Doel blijft 40% conversie naar Development van €10k gemiddelde deal-waarde.

### Fase 0 — Voorbereiding (week 0)

**Klant ontvangt op deal-close:**
1. Bevestigingsmail met onboarding-overzicht (één pagina)
2. Factuur (eenmalig)
3. NDA (Monard-template)
4. Intake-vragenlijst (zie hieronder)
5. Voorgestelde kick-off datum (binnen 2 weken na deal-close)

**Intake-vragenlijst secties:**

- **A — Strategisch:** kernactiviteit, grootste operationele frustratie, waarde van een gewerkt uur, eerdere AI-experimenten
- **B — Organisatie:** organogram, afdelingshoofden, zwaarst belaste medewerkers
- **C — Systemen:** **volledige lijst** van alle IT-systemen (CRM, ERP, mail, file storage, communicatie, project management, HR-systeem, sector-specifieke tools, "andere"). Dit is de input voor pass 1 van de brein-bouw — wat ontbreekt nu, wordt later read-access dat we ter plaatse moeten regelen.
- **D — Praktisch:** budget-range, pieken/verlof, voorkeur rond hosting/onderhoud (zie [§8](#8-hosting-infrastructuur))

**Wat Finit doet (~3u):**
- Website + LinkedIn van management lezen
- Vragenlijst-antwoorden verwerken in vooraf-ingevulde procesmap (Excalidraw)
- Hypothesevorming: 3-5 verwachte hotspots
- Kick-off-agenda customisen

### Fase 1 — Kick-off (~4u + reis)

> **Trigger:** kick-off mag ingepland worden vóór factuurbetaling. De kick-off zelf gaat enkel door als de factuur betaald is.

**Aanwezigen:**
- Finit: Karel (lead) + Jord (IT-onboarding) + Alex (procescoördinatie)
- Klant: zaakvoerder verplicht. Klant nodigt extra teamleden uit (aangemoedigd).

**Agenda (90 min meeting + 60-90 min werksessie):**
- Deel 1 (15 min) — Karel: wij stellen ons voor + traject in grote lijnen
- Deel 2 (45 min) — Karel + Alex: werksessie organisatiestructuur op whiteboard, plus de twee fundamentele brein-vragen aan de zaakvoerder:
  1. *"Lijst alle IT-systemen die jullie gebruiken. Allemaal."* — valideert sectie C van de intake en haalt vergeten tools naar boven
  2. *"Welke processen lopen buiten de computer? Wat gebeurt er fysiek, op de baan, in de werkplaats?"* — niet-IT processen worden ter plaatse zo gedetailleerd mogelijk genoteerd. Vaak is dit waar de zaakvoerder het scherpst over kan praten, want het is de core van wat hij verkoopt.
- Deel 3 (30 min) — Jord: IT-onboarding, read-access ter plaatse activeren op de volledige systeemlijst (cruciaal voor pass 1 van de brein-bouw)
- Deel 4 (10 min) — Alex: komende 2 weken inplannen, live document delen

### Fase 2 — Mapping (week 1-2)

**Doel:** een volledige, gestructureerde, AI-leesbare kennisbasis ("AI-brain") van de organisatie. Niet "wat kwam ter sprake", maar een levend brein waar alle bedrijfskennis, processen en systeemdata in zitten — bevraagbaar door zowel de klant als onze toekomstige agents.

#### Filosofie: waarom een brein, geen Notion-lijst

Elk bedrijf wil over 10 jaar AI. Bij YC zegt men het ook expliciet: bedrijven werken vandaag enkel zonder AI omdat mensen vaag bepaalde dingen weten. Kennis zit verspreid, één persoon weet X, een ander Y, en daartussen zitten delays. Een AI-systeem kan dat oplossen, maar enkel als er een single source of truth is die voor AI navigeerbaar is. Die bestaat in geen enkel bedrijf vandaag — niet omdat de tools ontbreken, maar omdat niemand het gestructureerde proces kent om er bedrijfskennis correct in te krijgen. Wij wel.

**Wat we bouwen is fundamenteel iets anders dan een RAG-systeem** (NotebookLM, ChatGPT-uploads, vector store). Bij RAG haalt de LLM elke vraag opnieuw fragmenten op uit ruwe documenten en herontdekt hij elke keer de kennis. Niets wordt opgebouwd. Bij ons pattern bouwt de LLM een blijvend tussenartefact — een wiki die met elke nieuwe bron en elke nieuwe vraag rijker wordt. Cross-references staan er al, contradicties zijn al gemarkeerd, synthese reflecteert al alles wat is ingelezen. **Compounding artifact, niet eenmalige retrieval.** Dit verschil is wat het brein 10 jaar lang waardevol houdt voor de klant in plaats van een statisch rapport.

> **Validatie van buitenaf.** Andrej Karpathy (ex-OpenAI, ex-Tesla AI) publiceerde begin april 2026 een gist met exact deze pattern, die in een paar weken viraal ging. Honderden teams bouwen er nu varianten op. Het is geen experiment, het is een snel-stollende industriestandaard. Wij hebben het voordeel dat we het toepassen op een specifiek probleem (KMO-audits) waar nog niemand dit doet. Bron: [Karpathy gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

#### Aanpak: dubbele pass

**Pass 1 (week 1) — het ruwe brein**

Driestappen-flow waarbij Claude de eerste versie van het brein bouwt op basis van systeemdata, niet op basis van interviews. Resultaat: een chaotische maar al heel gestructureerde eerste versie waarin Claude zelf de ambiguïteiten en lacunes kan markeren.

| Stap | Actie | Eigenaar |
|---|---|---|
| 1.1 | Twee kick-off-vragen aan zaakvoerder (zie Fase 1): volledige IT-systeemlijst + niet-IT processen ter plaatse | Karel + Alex |
| 1.2 | Read-access op alle gelijste systemen, scripts schrijven die per systeem alle data via API of MCP-server uittrekken naar `raw/` folders | Jord |
| 1.3 | Claude leest data per systeem uit, categoriseert, plaatst in wiki-folderstructuur, legt connecties tussen systemen | Alex (orkestreert Claude-sessies) |

**Pass 2 (week 2) — het schone brein**

| Stap | Actie | Eigenaar |
|---|---|---|
| 2.1 | Claude doorloopt het ruwe brein node per node (lint-operatie) en formuleert per ambiguïteit een vraag. Resultaat: 100-200 vragen, gestructureerd per stakeholder | Alex |
| 2.2 | Lange interviews per stakeholder (1-2u). Alle vragen aflopen. Recorder/Whisper Flow aan, transcripten bewaard in `raw/interviews/` | Karel (zaakvoerder/dept-hoofden), Alex (teamleads/eindgebruikers), Jord (IT-zwaar) |
| 2.3 | Claude bouwt op blanco canvas een nieuwe wiki met enkel de geverifieerde, niet-ambigue informatie | Alex (orkestreert) |

#### Folderstructuur (per klant)

```
klant-x-brain/
├── CLAUDE.md                  # Schema: hoe is deze wiki opgebouwd
├── raw/                       # Onveranderbaar bronmateriaal (immutable)
│   ├── teamleader/            # API-extracten per systeem
│   ├── gmail/
│   ├── drive/
│   ├── interviews/            # Transcripten van pass 2
│   └── assets/                # Bijlagen, screenshots
└── wiki/
    ├── index.md               # Catalogus van alle paginas (LLM updatet dit)
    ├── log.md                 # Chronologisch logboek van alle ingests/queries
    ├── entities/              # Mensen, klanten, leveranciers, systemen
    ├── concepts/              # Processen, beleidsregels, terminologie
    ├── sources/               # Eén samenvatting per ingelezen bron
    └── synthesis/             # Cross-cutting analyses (input voor automatiseringskansen)
```

Drie elementen om te bewaken:

- **`raw/` is heilig.** Niemand bewerkt die files, ook de LLM niet. Het is onze source of truth. De wiki erboven mag fout zijn, `raw/` ligt vast.
- **`index.md` en `log.md` zijn de motor.** `index.md` is de inhoudsopgave die Claude eerst leest bij elke vraag (schaalt verrassend goed tot honderden paginas zonder vector-search). `log.md` is het append-only logboek dat Claude vertelt wat recent gebeurde.
- **`CLAUDE.md` is onze blijvende IP.** Dit is het schema-bestand dat Claude vertelt hoe de wiki gestructureerd moet zijn, welke conventies gelden, welke workflows hij volgt bij ingest, query en lint. Per sector (HVAC, retail, productie, dienstverlening) bouwen we onze eigen schema-templates op. Dat is wat ons na 5 klanten onverslaanbaar maakt: niemand anders heeft sector-specifieke schemas die werkelijk werken. Niet de wiki zelf, maar de schema-templates die de wiki produceren, zijn onze moat.

Dezelfde drie-lagen architectuur (raw / wiki / schema) als in Karpathy's gist en Alex' eigen Obsidian-brein. Werkt. Schaalt. Bewust low-tech (markdown + folders) zodat we niet vastzitten aan één leverancier.

#### Procespagina als kern-eenheid

Elk geïdentificeerd proces krijgt één pagina in `wiki/concepts/processen/` met vaste frontmatter en sectie-indeling. Voorbeeld voor een HVAC-installateur, `proc-003-offerte-opmaak.md`:

```
---
id: proc-003
eigenaar: [[sara-dispatcher]]
frequentie: 8-12/week
tijd_per_instance: 45 min
manueel_ratio: 95%
pijn_score: 4
last_validated: 2026-04-17
---

# Offerte opmaken (warmtepomp + airco)

Trigger: na [[proc-002-bezoek-aan-huis]] door Pieter of Jens.

## Stappen
1. Sara opent technische notities uit het bezoek (Outlook of WhatsApp)
2. Configuratie in [[daikin-configurator]] of [[mitsubishi-melcloud]]
3. Prijsberekening in Excel-template (versie 2024-Q3, niet gedeeld)
4. Offerte-document opmaken in Word, manueel klantgegevens uit [[teamleader-crm]] kopiëren
5. Teamleader-deal aanmaken, status "offerte verstuurd"
6. PDF mailen vanuit Outlook

## Pijnpunten (uit interview Sara, 2026-04-16)
> "Ik doe dit meestal 's avonds want overdag is er geen tijd tussen telefoons door.
> De Excel is van 2024, prijzen zijn deels achterhaald, ik check ze altijd terug
> bij Pieter. Soms duurt dat 2 dagen voor hij antwoordt." [[interview-sara-2026-04-16]]

## Cross-references
- Upstream: [[proc-002-bezoek-aan-huis]]
- Downstream: [[proc-004-planning-installatie]]
- Systemen: [[teamleader-crm]], [[outlook]], [[daikin-configurator]]
- Mensen: [[pieter-vanderlinden]], [[sara-dispatcher]]

## Bronvermeldingen
Geverifieerd via interview Sara (2026-04-16), interview Pieter (2026-04-15),
analyse van 47 offertes uit Teamleader Q1 2026.
```

De oude fiche-velden zijn niet weg — ze zitten nu als frontmatter en bullets in elke procespagina. Wat erbij komt: directe links (`[[wikilinks]]`) tussen processen, mensen, systemen, bronnen. Dat is wat de cross-cutting analyse in `synthesis/` mogelijk maakt zonder ad-hoc brainstorm.

#### Top-down volgorde van interviews (pass 2)

1. Zaakvoerder + medeoprichters (1u-1.5u, fysiek)
2. Departementshoofden (45-60min elk)
3. Teamleads (30-45min)
4. Eindgebruikers (30min)

**Vuistregel:** ~10 gesprekken per audit voor een organisatie van ~30 mensen.

Elke stakeholder krijgt vooraf zijn deel van de Claude-gegenereerde vragenlijst (typisch 15-30 vragen per persoon, afgeleid uit lint-findings op zijn proces-paginas). Geen interview zonder doel. Bij elke uitvoerder vraag je daarnaast expliciet: *"Welke processen die niet in mijn lijst staan doe jij ook?"* — valideert de inventaris en haalt blinde vlekken naar boven.

#### Interview-vragenbank per rol

De Claude-gegenereerde lint-vragenlijst is de hoofdmoot. Daarnaast houden we deze open vragen achter de hand om uit ambiguïteit te breken:

*Zaakvoerder:*
- Vertel het verhaal van het bedrijf in 5 minuten
- Welk proces zou je nooit aan AI durven geven?
- Stel je krijgt morgen 5 extra mensen gratis — wie of wat zouden ze doen?
- Welk getal volg je dagelijks/wekelijks? Welk getal *zou* je willen volgen maar kan je niet?
- **Wat is de waarde van één gewerkt uur in jullie organisatie?** *(cruciaal voor ROI)*

*Departementshoofd:*
- Beschrijf je werkdag van gisteren in chronologische volgorde
- Welke 3 e-mails kreeg je deze week meermaals dezelfde versie van?
- Welk systeem typ je hetzelfde gegeven meermaals in op dezelfde dag?
- Waar moet jij persoonlijk *naar zoeken* meermaals per dag?

*Teamlead:*
- Hoe vaak word je onderbroken voor een vraag waarvan je denkt "dat had ergens moeten staan"?
- Welke taken blijven systematisch liggen op vrijdagavond?
- Wat is het meest frustrerende aan jullie CRM/ERP?

*Eindgebruiker:*
- **Wat zit er in je browser-tabs op een willekeurig moment?** *(gouden vraag)*
- Welke handeling doe je elke dag minstens 5 keer?
- Stel ik bouwde één robotje voor jou, wat zou hij doen?

**Killer first questions:**
- *"Wat heb je gisteravond als laatste gedaan voor je sloot?"*
- *"Toon me één tabblad waar je vandaag al meer dan 3 keer bent geweest."*
- *"Als ik dit team morgen overneem, wat moet ik in de eerste week absoluut weten?"*

#### Praktisch

- Strategische gesprekken (zaakvoerder, dept-hoofden) door Karel, liefst met twee
- Operationele/proces-gesprekken door Alex, kan solo
- Technisch-zware gesprekken (IT-verantwoordelijke, systeembeheerders) door Jord
- Elk gesprek opgenomen + auto-transcript via Whisper Flow, transcripten in `raw/interviews/`
- Brein wordt na elk gesprek geüpdatet (niet pas op het einde van de week)
- Time-tracking ter plaatse: *"hoeveel tijd kost dit?"*. Getallen in de procespagina-frontmatter.
- On-site default voor zaakvoerder + dept-hoofden, remote OK voor teamleads/eindgebruikers

#### Output van fase 2

Aan het einde van week 2 leveren we op:
- **Schoon AI-brein** (~150-200 wiki-paginas afhankelijk van bedrijfsgrootte) — bevraagbaar door klant via chatbot vanaf eindpresentatie
- **`synthesis/` paginas:** systeemkaart, frictie-hotspots, cluster-kaart, automatiseringskansen-shortlist — niet meer als losse Excalidraw-deliverables maar als markdown-paginas die linken naar de onderbouwende procespaginas
- **Lijst overgebleven open vragen** waar week 3 nog data voor nodig is

Dit is de input voor fase 4. **Zonder schoon brein geen brainstorm** — anders zitten we te gokken in plaats van te kiezen.

### Fase 3 — IT-architectuur (week 2)

Grotendeels emergent uit pass 1 van de brein-bouw — de systeem-extracten zitten al in `raw/`, de relaties tussen systemen al in `wiki/entities/systemen/`. Wat Jord nog actief produceert:

- **Architectuurdiagram** (Excalidraw) — de visuele samenvatting van wat het brein toont
- **Standaardmetrics** uit de systeemdata:
  - Aantal mails per gebruiker per week
  - Gemiddelde response tijd op klantvragen
  - Aantal leads per maand → conversie naar offerte → conversie naar deal
  - Tijd besteed aan documenten zoeken
  - Totale SaaS-spend per jaar
  - Aantal "single-source-of-truth"-overtredingen
- **Cybersecurity- en GDPR-baseline** — wat staat goed, wat moet recht (input voor rapport-sectie 8)
- **Software-kostenoverzicht** — alle SaaS-licenties + €/jaar + overlap

### Fase 4 — Optimalisatiefase (week 2-3, INTERN)

Doordat het brein klaar is, valt de brainstorm grotendeels weg. We sparren met dezelfde Claude-sessie die toegang heeft tot het brein, en de kansen rollen uit `synthesis/automatiseringskansen-shortlist.md`. Geen brainstorm op intuïtie meer, maar gevoede analyse op basis van wat er feitelijk in het bedrijf gebeurt.

**Alex leidt**, Jord brengt technische diepte, Karel commerciële inkadering. Halve dag in plaats van een dag.

Per kans uit de shortlist:
- **Onderbouwing** — directe links naar procespagina's, interviews, citaten en cijfers in het brein
- **Classificatie** — Quick Win / Workflow / Agent / Systeem-integratie
- **Prijsschatting + ROI** — uren bespaard × waarde van een gewerkt uur (uit zaakvoerder-interview)
- **Matrix-positie** — implementatiekost (X) vs. impact (Y)

Voorbeeld van wat eruit komt (HVAC-installateur):

> **Quick win 3.1: Offerte-generator agent.** Trigger op nieuwe Teamleader-deal in stage "offerte gevraagd". Agent leest bezoek-notities (Outlook + WhatsApp), trekt configuratie uit Daikin Configurator API, gebruikt geactualiseerde Excel-template, genereert offerte-PDF en verstuurt ter validatie naar Pieter.
>
> Impact: Sara wint 6-8u/week. Doorlooptijd offerte van 2-3 dagen naar 4u.
> Bronnen: `[[proc-003-offerte-opmaak]]`, `[[interview-sara]]`, `[[interview-pieter]]`.
> Geschatte build: workflow + agent, 15-20 dagen, ~€8.000.
> ROI bij €60/u kost en 7u/week: ~€21.840/jaar.

Elke kans verwijst direct naar de brein-paginanummer die hem onderbouwt. Dat maakt fase 5 (rapport) een kwestie van compileren in plaats van schrijven, en geeft de klant tijdens fase 6 (eindpresentatie) de mogelijkheid om elke aanbeveling tot op de bron te traceren.

### Fase 5 — Rapport + chatbot-opzet (week 3, ~10-12u)

Twee deliverables in plaats van één:

**A. Rapport — vaste structuur (answer-first, McKinsey-style):**

1. **Executive summary (1 pagina) met top 3 strategische aanbevelingen** — Karel
2. Inventaris organisatie (gegenereerd uit `wiki/entities/` en `wiki/concepts/`) — Alex
3. IT-architectuur huidige staat — Jord
4. Bevindingen & opportuniteiten (rechtstreeks uit `synthesis/`-paginas, met links) — Jord + Alex
5. Aanbevolen automations — overview met matrix (Jord + Karel)
6. Detailpagina per voorstel (1-2 pagina's per item, elk met directe verwijzing naar brein-paginanummer) — Jord technisch, Karel commercieel
7. AI-roadmap 12 maanden — Karel
8. Cybersecurity, GDPR, hosting — Jord
9. Onderhoud & ownership (incl. brein-onderhoud — zie [§6](#6-opvolging-onderhoudscontract)) — Karel
10. Bijlagen — concrete offertes, fiches, onderbouwing — Karel

> De executive summary bevat de top 3 aanbevelingen. Wie alleen pagina 1 leest, weet wat hij moet doen. De rest is onderbouwing — en elk voorstel verwijst naar de brein-pagina die het ondersteunt.

**B. Chatbot over het brein** — Jord zet een eenvoudige chat-interface op tegen de wiki van de klant. Bevraagbaar over alle bedrijfskennis: documenten ophalen, processen uitleggen, kennis bevragen. Op zich al een quick win die de €2.500 Audit-prijs rechtvaardigt. Tijdens fase 6 wordt die chatbot live gedemo'd.

### Fase 6 — Eindpresentatie

**~75 minuten — Karel leidt, Jord springt in op tech-vragen + chatbot demo, Alex op operationele vragen:**
- Throwback (15 min — Karel)
- Brein + chatbot demo (10 min — Jord laat zien dat de klant nu live zijn eigen bedrijf kan bevragen)
- Aanbevelingen doorlopen (35 min — Karel verkoopt, Jord legt techniek uit, elk voorstel verwijst naar brein-bron)
- Offertes (10 min — Karel)
- Wat nu (5 min — Karel)

Klant leest rapport NIET op voorhand (behalve fase-1 deel dat in live document stond). Phase-2 aanbevelingen + chatbot-demo zijn de big reveal.

---

## 3. Brug Audit → Development

1. Audit-eindpresentatie eindigt met overhandiging rapport + offertes
2. Klant beslist (1 week typisch)
3. Bij ja: tekenen Scope of Work
4. Bij eerste samenwerking: ook Service Agreement + DPA tekenen (eenmalig)
5. Eerste factuur betaald → Finit plant kick-off in (1 week na betaling)
6. Kick-off (fysiek of online afhankelijk van project)

> Bottleneck zit typisch bij klant. Finit kan binnen een week starten.

---

## 4. Development-fase

### Aanpak

- **Eén raamovereenkomst, daarna Scope of Work per project**
- **Vaste prijs per project** op basis van scope
- **Dagtarief €650** alleen voor projecten waar scope vooraf onduidelijk is (regie)
- **Mijlpalen vooraf gedefinieerd**, geen sprints
- **Tweewekelijkse demo** bij mijlpaal-bereiking
- **Wekelijkse 15-min check-in** (optioneel voor klant)
- **Communicatie:** mail, WhatsApp, telefoon — klant kiest
- **Geen klant-toegang tot ticketsysteem**
- **Klantendemo-omgeving wordt standaard opgezet** (sandbox/mock data)

### Wat Finit garandeert

- Vaste prijs houdt stand zolang scope niet wijzigt
- Wijziging in scope → Change Request via Finit-template
- Tijdslijn-verdeling 70% bouwen / 30% hypercare (typische verhouding op de projectkalender)
- Uptime na go-live: zie [§6](#6-opvolging-onderhoudscontract), afhankelijk van gekozen onderhoudstier (Essential = monitoring zonder gegarandeerde uptime, Standard/Growth = gegarandeerd via SLA)

### Bug-definitie

Een bug = afwijking van wat in de Scope of Work staat afgesproken. Een wens = niet in scope = Change Request.

Drie niveaus:

| Niveau | Wat | Reactie |
|---|---|---|
| **P1 / Kritiek** | Systeem werkt niet, kernproces is gestopt | Onmiddellijke actie, ongeacht tijd |
| **P2 / Functioneel** | Functie werkt niet zoals afgesproken in scope, systeem draait | Binnen reactietijd van tier |
| **P3 / Cosmetisch** | Typfouten, kleine UI-glitches, niet-blokkerende issues | Volgende doorontwikkeling-cyclus |

> Dit onderscheid voorkomt dat "onbeperkte bugfixes" wordt uitgehold door wens-tickets vermomd als bugs.

### Quality Assurance

- Jord bouwt en doet code-review op zichzelf en op externe execution support
- Alex test functioneel vanuit gebruikersperspectief vóór klantdemo
- Bij externe execution support: Jord-review verplicht vóór klantdemo
- **Geen build gaat naar hypercare zonder dat Alex en Jord beide hebben afgetekend**

### Klant-SPOC

- **Finit-zijde:** Alex (operations) — dagelijks aanspreekpunt, projectcoördinatie
- **Karel** = commerciële relatie, escalatie, executive-gesprekken
- **Jord** = technische escalatie, architecturale beslissingen
- **Klant-zijde:** persoon met snelle interne bereikbaarheid en informatie-toegang. Geen zaakvoerder voor dagelijkse coördinatie (te druk).

### Soorten oplossingen (intern, niet op brochure)

| Type | Indicatieve prijs | Doorlooptijd |
|---|---|---|
| Quick win | €1.500-€3.000 | 1-2 weken |
| Workflow | €3.000-€7.500 | 2-4 weken |
| Agent | €7.500-€15.000 | 4-8 weken |
| Systeem-integratie | €15.000-€40.000 | 8-16 weken |
| Enterprise / regie | dagtarief €650 | 16+ weken |

### Betalingsstructuur

| Project-grootte | Schema |
|---|---|
| < €5.000 | 50% start / 50% einde dev |
| €5.000-€15.000 | 30% start / 40% einde dev / 30% einde hypercare |
| > €15.000 of regie | Tweewekelijkse facturatie op gepresteerde uren |

### Definitie van "klaar"
- Alle mijlpalen afgerond (= einde development, klant tekent over naar hypercare)
- Dan: 7 opeenvolgende dagen geen nieuwe bugmeldingen tijdens hypercare
- Dan: opleverdocument + handleiding ondertekend → "definitief opgeleverd"

---

## 5. Hypercare

| Aspect | Definitie |
|---|---|
| Duur | ~30% van dev-doorlooptijd (typisch 1-3 weken) |
| Locatie | Default remote, on-site enkel op klant-vraag |
| Reactietijd kantoor | 4 uur |
| Reactietijd buiten kantoor | 12 uur |
| Inbegrepen | Bugfixes (zie bug-definitie [§4](#4-development-fase)) + minimale aanpassingen binnen scope |
| Niet inbegrepen | UX-wijzigingen, nieuwe features, scope-uitbreidingen → Change Request |
| Stoppingscriterium | 7 opeenvolgende dagen geen nieuwe bugmeldingen |
| Afsluiting | Opleverdocument (template 5A) + gebruikershandleiding (5B), klant tekent "definitief opgeleverd" |

### Overgang naar Opvolging

Bij aftekening van het opleverdocument loopt hypercare af. Daarna gebeurt één van deze drie dingen, op basis van de tier-keuze die de klant tijdens de opleverpresentatie heeft gemaakt:

1. **Onderhoudscontract gekozen (Essential / Standard / Growth):** contract activeert vanaf de eerste van de volgende maand. Eén handtekening op een korte tier-bevestiging, Service Agreement was al getekend bij dev-start.
2. **Tier-keuze nog open:** klant heeft tot 14 dagen na aftekening tijd om te beslissen. In die periode geldt Essential-niveau support als overbruggingsperiode (à rato gefactureerd).
3. **Geen onderhoud gekozen:** klant tekent een korte verklaring met de voorwaarden zoals beschreven in [§6](#6-opvolging-onderhoudscontract).

**Reactietijd-overgang** (expliciet zodat klanten weten wat ze ruilen):

| Situatie | Reactietijd kantoor |
|---|---|
| Hypercare | 4u |
| Essential | 24u |
| Standard | 4u |
| Growth | 2u |

Service Agreement en DPA blijven geldig in alle scenario's. Klant betaalt nooit dubbel: hypercare loopt door tot aftekening, onderhoud start daarna.

---

## 6. Opvolging / Onderhoudscontract

### Filosofie

Een AI-systeem zonder onderhoud verschuift binnen zes maanden van werkend naar wankel. Modellen drijven, integraties veranderen, prompts verouderen, business-context schuift op. Daarom raden we ten sterkste aan om bij elke build een onderhoudscontract af te sluiten, en is het bij elke offerte de standaardkeuze.

**Het is geen verplichting.** Wie zelf wil hosten en beheren, kan dat. Maar bij elke offerte staat onderhoud default mee aangevinkt, en in 9 op 10 gevallen is het de logische keuze, gewoon omdat de optelsom voor de klant gunstig uitvalt.

> *"We bouwen liever lang werkende systemen dan veel nieuwe systemen. Onderhoud is het verschil."*

**Het brein heeft óók onderhoud nodig.** De wiki uit fase 2 wordt rijker bij elke nieuwe ingest (mailtje, contract, proces) en bij elke vraag die iemand stelt. Maar zonder lint-passes drijft hij — contradicties stapelen zich op, weespaginas verschijnen, nieuwe bronnen worden niet doorgelinkt. Karpathy's inzicht: het saaie deel van een knowledge base onderhouden is niet het lezen of denken, het is het bookkeeping (cross-references updaten, samenvattingen actueel houden, contradicties markeren). Mensen geven dat op, omdat de onderhoudslast sneller groeit dan de waarde. LLM's geven het niet op. Daarom blijft het brein levend — *als* het onderhoud krijgt. Dit is een concreet, tastbaar argument voor waarom een onderhoudscontract de logische keuze is. Bij Standard- of Growth-tier worden de inbegrepen doorontwikkelingsuren zichtbaar besteed aan iets dat de klant zelf gebruikt (zijn chatbot, zijn agents).

### Drie tiers, opgebouwd zodat upgrade vanzelf logisch wordt

#### Essential — ~1% van build, min €75/mnd

*Het systeem blijft draaien.*

| Inhoud | Concreet |
|---|---|
| 24/7 uptime monitoring | alert binnen 5 min bij downtime |
| Kritieke bugfixes (P1) | alles wat het systeem doet stoppen |
| Hosting + AI-credits | alle upstream rekeningen op één factuur, 0% markup |
| Security patches | maandelijks, automatisch |
| Reactietijd | 24u tijdens kantooruren |

Geen feature-aanpassingen. Geen consultancy. Als het werkt zoals opgeleverd, blijft het zo. Geen contractueel SLA op uptime.

#### Standard — ~1,75% van build, min €125/mnd *(aanbevolen)*

*Het systeem blijft draaien én verbetert mee.*

Alles van Essential, plus:

| Inhoud | Concreet | Losse waarde |
|---|---|---|
| Niet-kritieke bugfixes (P2 + P3) | alle gemelde bugs binnen scope | – |
| 2u doorontwikkeling per maand | nieuwe prompts, kleine features, agent-tuning, brein-ingest van nieuwe bronnen, lint-pass op de wiki | €163 (à €81,25/u) |
| Maandrapport | wat het systeem deed, wat het bespaarde, openstaande punten | – |
| Quarterly review | 1u call per kwartaal: wat werkt, wat niet, wat volgende stap | – |
| Reactietijd | 4u kantooruren, 12u buiten | – |
| Uptime-doel | 99,9%, niet contractueel afdwingbaar | – |

Voorbeeld bij €15.000 build = €263/mnd. Losse waarde van enkel monitoring, patches en 2u dev = ~€260. Plus rapport, review, snellere respons. Daar zit het voordeel.

#### Growth — ~2,5% van build, min €250/mnd

*Het systeem groeit mee met je bedrijf.*

Alles van Standard, plus:

| Inhoud | Concreet | Losse waarde |
|---|---|---|
| 6u doorontwikkeling per maand | échte feature-uitbreidingen, niet enkel tuning | €488 (à €81,25/u) |
| Dedicated SPOC | Alex of Karel, vaste contactpersoon | – |
| Contractueel SLA | 99,9% uptime met financiële boete bij overschrijding | – |
| Quarterly review | 1u call per kwartaal | – |
| Halfjaarlijkse strategiesessie | 2u on-site: waar gaat jullie business heen, wat moet het systeem volgen | €325 (à €162,50/u) |
| Reactietijd | 2u kantooruren, 6u buiten, 24/7 noodlijn | – |

Voor klanten waar het systeem business-kritisch is.

### Pricing-tarief intern

Doorontwikkelingsuren worden gewaardeerd aan **€81,25/u**. Dit is afgeleid van het dagtarief van €650 (8u). Hetzelfde tarief geldt voor extra uren buiten het inbegrepen pakket en voor de strategiesessie van Growth.

### Voorbeeldberekening per build

| Build | Essential (~1%) | Standard (~1,75%) | Growth (~2,5%) |
|---|---|---|---|
| €5.000 | €75/mnd | €125/mnd | €250/mnd |
| €10.000 | €100/mnd | €175/mnd | €250/mnd |
| €15.000 | €150/mnd | €263/mnd | €375/mnd |
| €25.000 | €250/mnd | €438/mnd | €625/mnd |
| €50.000 | €500/mnd | €875/mnd | €1.250/mnd |
| €100.000 | €1.000/mnd | €1.750/mnd | €2.500/mnd |

> Geen plafond op grotere builds. Een groter systeem heeft meer integraties, meer prompts, meer afhankelijkheden, dus meer onderhoud. Het percentage blijft proportioneel.

### Voorwaarden over alle tiers

- **Doorontwikkelingsuren verlopen strikt aan einde maand.** Niet gebruikt = vervallen. We raden actief aan om ze te benutten, en sturen halverwege de maand een reminder als er nog uren openstaan.
- **Opzegtermijn: 2 maanden.** Geen jaarlijkse vastlegging.
- 3rd-party prijsverhogingen worden doorgerekend (Finit absorbeert niet).
- **Tier-wijziging kan op elk moment.** Upgrade meteen actief, downgrade pas vanaf volgende maand.
- Bij stop-onderhoud: alle support vervalt na opzeg, exit-protocol activeert.

### Wat als de klant geen onderhoud wil

Het kan. Maar dan ziet de deal er anders uit:

- **30 dagen bugfix-window** in plaats van standaard hypercare-flow
- **Geen pass-through hosting tarief** — klant host zelf of betaalt marktconform doorgerekend (zie [§8](#8-hosting-infrastructuur) voor de vooraf-melden vs. pro rata logica)
- **Reactivatie-fee:**
  - Onder 6 maanden zonder onderhoud: **€750 vast** (audit van wat ondertussen gedrift is)
  - Boven 6 maanden: **offerte op basis van audit-tijd aan dagtarief €650**
- **Disclaimer in opleverdocument:** systeem werd opgeleverd in werkende staat, na zes maanden zonder onderhoud kunnen we de werking niet garanderen

> Geen straf. Eerlijke prijszetting van wat onderhoud uit handen geven écht betekent.

**Interne discipline:** alle support-vragen van niet-onderhoud klanten gaan eerst door Alex, die expliciet beoordeelt of het binnen het bugfix-window valt of buiten scope is. Geen ad-hoc gunsten, anders holt het model uit.

### Verkooplogica

**Tier-keuze gebeurt na de opleverpresentatie, niet ervoor.** Eerst toont de klant blije gezichten over een werkend systeem, dan komt de onderhoudsbeslissing. €263/mnd voelt fundamenteel anders pratend over iets wat draait dan pratend over een offerte.

Op de offerte zelf staat altijd:

> Standard — €263/mnd
> Losse waarde van inbegrepen onderdelen: ~€420/mnd

De klant ziet zwart op wit dat hij wint. Dat is geen verkooptechniek, het is gewoon eerlijke optelsom.

> *"We rekenen minder dan de losse waarde van wat erin zit. Dat is bewust. We willen dat je na een jaar zegt: dat onderhoud was geld waard. Niet: dat had ik beter zelf gedaan."*

---

## 7. Contracten & juridisch

### Contract-flow

```
Audit-fase:
  └─ NDA + Audit-overeenkomst (factuur)

Eerste Development project:
  └─ Service Agreement (raamovereenkomst, eenmalig)
  └─ DPA (algemene appendix dekt alle gescopete processen)
  └─ Scope of Work #1 (project-specifiek)
  └─ Onderhoudscontract bijlage (indien gekozen) of geen-onderhoud-verklaring

Volgende Development projecten:
  └─ Scope of Work #N (één handtekening, raamovereenkomst dekt rest)
```

### DPA-timing
- NDA volstaat tijdens Audit (Finit is observer, niet processor)
- DPA wordt getekend bij Development-start, gebundeld met Service Agreement
- DPA-appendix wordt geschreven op basis van gescopete processen tijdens audit
- Eén algemene DPA — geen sub-DPA's per project
- **Data-incidenten en incident-response zijn volledig gedekt in de DPA.** Geen apart playbook-protocol nodig.

### Change Requests
- Bij elke scope-wijziging: Finit-template wordt aangeboden aan klant
- Klant vult in, Finit prijst, klant tekent
- Onder ~2u absorbeert Finit. Boven 2u: altijd via CR.

### In-scope / out-of-scope clausule
Nog te ontwikkelen als template. Voorlopig: per Scope of Work expliciet opnemen wat *wel* en *niet* in scope is. Out-of-scope lijst is verplicht.

---

## 8. Hosting & infrastructuur

Hosting volgt onderhoud. Default Finit-managed omdat onderhoud default opt-in is.

| Aspect | Beleid |
|---|---|
| Default hosting | Finit-managed (alles op onze infra) bij onderhoudscontract |
| Hybride | Bestaande klant-cloud accounts blijven waar ze zijn |
| Upstream-rekeningen | Wij betalen, factureren door met minimale markup (mag €0 marge) |
| Uptime SLA | Tier-afhankelijk: zie [§6](#6-opvolging-onderhoudscontract). SLA enkel contractueel bij Growth. |
| Wat is "infra-beheer" | Monitoring + alerts + backups + security patches + version upgrades |
| 3rd-party prijswijziging | Doorgerekend, retainer kan stijgen |

### Bij geen onderhoud

Hosting volgt de keuze. Twee scenario's:

1. **Vooraf gemeld** (tijdens intake of audit): Finit ontwikkelt rekening houdend met klant-hosting. Dat kan invloed hebben op de manier van werken — andere keuzes voor tooling, integraties en architectuur. Geen meerkost, mits het tijdig wordt aangegeven.
2. **Achteraf besloten** (na development of tijdens hypercare): klant betaalt **pro rata overzettingsfee op basis van werkelijke overzet-uren aan dagtarief €650**. Wat overgezet moet worden: hosting-configuratie, integraties, credentials, monitoring-setup, backup-flows.

> **Open punt:** Jord moet nog standaard tooling-stack, backup-frequentie en security baselines vastleggen. Zie [§13](#13-open-punten) punt 1.

---

## 9. Eigendom, IP & exit

### Standaard
- **Klant = papieren IP-eigenaar** van de specifieke build (custom code, configuratie, prompts) en van het brein-corpus (wiki-paginas, raw data, transcripten)
- **Finit = eigenaar van generieke building blocks** (n8n templates, master-orchestrator-architectuur, document generator) **én van de schema-templates per sector** (`CLAUDE.md`-bestanden die de wiki-structuur per sector definiëren — HVAC, retail, productie, dienstverlening). De toepassing op een specifieke klant is van de klant; het sector-schema is van Finit en is onze blijvende moat.
- **Operationele toegang ligt bij Finit zolang het onderhoudscontract loopt.** Klant heeft geen onmiddellijke code-toegang tijdens actief onderhoud — dat is een feature, niet een beperking. Voorkomt dat onbedoelde wijzigingen het systeem breken zonder dat Finit erbij betrokken is.
- **Bij stopzetting onderhoud activeert het exit-protocol** (zie hieronder). Op dat moment wordt operationele toegang volledig overgedragen aan de klant — inclusief het volledige klant-brein.
- Specifiek prompting dat klant-exclusief is, gebruikt Finit niet voor concurrenten in dezelfde sector

### Exit-protocol
Bij klant-vertrek (na opzeg onderhoudscontract):
1. Code-export naar klant-Git repo
2. Data-export uit alle Finit-managed databases
3. Knowledge transfer-sessie van 1 dag inbegrepen
4. Bij meer dan 1 dag KT nodig: **dagtarief €650**
5. Hosting-migratie (indien klant naar eigen infra wil): aparte offerte op uurbasis

---

## 10. Pricing-overzicht

### Audit
- **€2.500** vast tarief
- 3 weken doorlooptijd
- Verrekenbaar bij Development
- Inclusief: schoon AI-brein over het bedrijf + werkende chatbot vanaf de eindpresentatie

### Development
- **Vaste prijs per project** op basis van scope (default)
- **Dagtarief €650** voor regie / heel complexe trajecten
- Indicatieve ranges (intern gebruik enkel):
  - Quick win: €1.500-€3.000
  - Workflow: €3.000-€7.500
  - Agent: €7.500-€15.000
  - Systeem-integratie: €15.000-€40.000
  - Enterprise/regie: dagtarief €650

### Onderhoud
- **1%-2,5% van projectkost per maand**, tier-afhankelijk (Essential / Standard / Growth)
- Minimum €75/maand (Essential)
- Doorontwikkelingsuren aan **€81,25/u** (afgeleid van dagtarief €650)
- 2 maanden opzeg

### Betaalstructuren Development
- < €5.000 → 50/50
- €5.000-€15.000 → 30/40/30
- > €15.000 of regie → Tweewekelijks op uren

### Communicatie naar klant
- Brochure: enkel Audit-prijs (€2.500) + onderhoud-percentage (~1%-2,5%)
- Pitchdeck: bovenstaande + dagtarief + betalingsstructuur
- Geen indicatieve prijsranges per Development-tier publiceren — die hangen af van scope

---

## 11. Capaciteit & rol-verdeling

### Rollen
- **Karel Van Ransbeeck** — sales & executive. Eerste klantcontact, kennismakingsgesprekken, eindpresentaties, commerciële relatie, executive rapport-secties, contractonderhandelingen.
- **Alex Otten** — operations. Projectcoördinatie, klant-SPOC tijdens uitvoering, intake-verwerking, proces-mapping, dagelijkse aansturing, brainstorm-leiding.
- **Jord Goossens** — CTO. Alle IT-architectuur, technische uitvoering, hosting, security, build-kwaliteit, technische rapport-secties.

### Sales-backup

Single-point-of-failure-risico op Karel als enige verkoper. Bij afwezigheid (ziekte, verlof, capaciteit) of als de klik met een specifieke klant ontbreekt: **Alex springt in als sales-backup**. Alex is operationeel up-to-date en kent klant-context, wat de overgang werkbaar maakt.

### Capaciteitsregel Jord (CTO-bottleneck)

**Jord reserveert 1 vaste dag per week voor audits**, ongeacht zijn dev-load. Audits worden gepland binnen die capaciteit. Dit voorkomt dat audit-werk doorgeschoven wordt door dev-druk.

Als de audit-pijplijn meer vraagt dan die ene dag: externe execution support inzetten op **dev-zijde**, niet op audit-zijde. Audit-kwaliteit is verkoopkritiek, dus mag niet uitgehold worden door capaciteitsdruk.

### Capaciteitsmodel

| Bezetting | Audits/maand | Dev-conversie | Verwachte omzet/maand |
|---|---|---|---|
| Trio (Karel + Alex + Jord) | 2-3 | 40% × €10k | €5-7,5k Audit + €8-12k Dev |
| + externe execution support | 3-4 | 40% × €10k+ | €7,5-10k Audit + €12-16k Dev |

> Conversie-aanname: 40% van audits converteert naar Development. Gemiddelde dev-deal bij opstart: €10k. Beide getallen actief tracken — als ze afwijken, herzien we het capaciteitsmodel.

### Bottlenecks (in volgorde)
1. **Jord — technische uitvoering**. Solo CTO is structurele bottleneck zodra meer dan 2-3 builds parallel lopen. Externe execution support eerste in te zetten, op dev-zijde (zie capaciteitsregel hierboven).
2. **Karel — sales agenda**. Aantal audits/maand wordt begrensd door aantal kennismakingsgesprekken Karel kan voeren.
3. **Optimalisatiefase brainstorm** (~6-8u, vereist alle drie aanwezig).

### Parallelle projecten
- **Per klant:** maximum 2-3 parallel
- **Audits totaal parallel:** 2-3 max
- **Development totaal parallel:** 4-6 max afhankelijk van complexiteit

---

## 12. Klant-fit & red flags

Niet elke prospect is een goede klant. Sales-discipline begint met weten wanneer "nee" zeggen.

### Goede fit
- Bedrijven met veel handmatig werk in administratie, mail, CRM-invoer
- Servicebedrijven, productie, logistiek, bouw
- Organisaties met verspreide tools die niet samenwerken
- Zaakvoerders die eerst willen weten waar ze in moeten investeren
- Buy-in vanuit het management-niveau aanwezig

### Red flags — afwijzen of expliciet kaderen
- **Klant wil bouwen zonder audit.** Behalve in uitzonderlijke gevallen: niet doen. Reden: zonder data is elke offerte een gok.
- **Urgentie als breekijzer.** *"We hebben dit volgende week nodig."* Onze flow is incompatibel met sub-week timelines. Of klant past zich aan, of we passen.
- **Geen zaakvoerder-buy-in.** Audit zonder zaakvoerder-betrokkenheid leidt tot rapporten die niemand uitvoert. Audit in dat geval afwijzen.
- **Onderhandelen op de Audit-prijs.** €2.500 is bewust strak gerekend. Wie hier al aan tornt, gaat ook bij Development moeilijk doen. Niet zakken.
- ***"Maak ons gewoon een offerte zonder de mappingfase."*** Geen offerte zonder data. Het is geen administratie, het is risico-reductie voor beide kanten.
- **Pure IT-bedrijven** — zij hebben dit niet nodig.
- **Eenmanszaken zonder schaalbare processen** — ROI-rekensom werkt niet.

---

## 13. Open punten

| # | Onderwerp | Status |
|---|---|---|
| 1 | Hosting/infra finale specificaties | Jord moet beslissen: standaard tooling-stack, backup-frequentie, security baselines |
| 2 | In-scope/out-of-scope template | Nog te schrijven |
| 3 | Scope of Work template | Caenen Service Agreement gebruiken als startpunt |
| 4 | Audit-overeenkomst tekst (apart van factuur/AV) | Te beslissen of dit nodig is |
| 5 | One-liner Development | Voorstellen: *"We bouwen wat de Audit aanwees. Niet meer, niet minder."* / *"Vaste prijs. Eigen IP. Klaar als het écht werkt."* |
| 6 | One-liner Opvolging | Voorstellen: *"Uw systeem groeit mee. U bent niet vastgeketend."* / *"Onderhoud, optimalisatie, evolutie — vast bedrag, eigendom van u."* |
| 7 | KPI-blokje Development brochure | Voorstel: *"Vaste prijs · 4-12 weken gemiddeld · Mijlpaal-gebaseerd · Eigen IP"* |
| 8 | KPI-blokje Opvolging brochure | Voorstel: *"Tier-afhankelijk SLA · 2-24u response · Bugfixes inbegrepen · 2 maanden opzeg"* |
| 9 | Finit CRM verdere uitwerking | Productdefinitie te scherpen voor 2026 lancering |
| 10 | Wanbetaling / stopzetting systeem | Boetes en stopzettingsprotocol bij niet-betaalde onderhoudsfacturen — later verduidelijken |
| 11 | Health metrics tracking | Audit-conversie (target 40%), gemiddelde dev-deal (target €10k), % onderhoudscontracten getekend, gemiddelde tier-keuze. Nodig om capaciteitsmodel te valideren. |
| 12 | Schema-templates per sector | Eerste sector-`CLAUDE.md` bouwen na 2-3 audits in dezelfde sector (HVAC eerste kandidaat). Owner: Alex + Jord. Doel: na 5 klanten in een sector een audit 30% sneller laten verlopen dankzij hergebruik van schema. |
| 13 | Brein-toolchain standaardiseren | Welke MCP-servers/scripts gebruiken we standaard per IT-systeem (Teamleader, Pipedrive, Odoo, Gmail, Drive, Exact)? Owner: Jord. Tot dat vast ligt schrijven we per audit ad-hoc extractors, wat tijd kost in pass 1. |
| 14 | Chatbot-frontend voor klant | Eenvoudige UI over het wiki-corpus (auth, retentie, basic UX). Owner: Jord. Nodig voor fase 6 demo en voor onderhouds-Standard/Growth tiers. |

---

*Document bij te werken zodra Karel review afrondt. Brochure en pitch deck volgen in aparte pass om consistentie met deze versie te garanderen. Definitieve versie naar The Forge zodra alles vast.*
