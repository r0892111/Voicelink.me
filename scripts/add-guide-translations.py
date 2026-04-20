"""Translate the full user guide (dashboard) and the homepage preview into
en/nl/fr/de. Replaces any existing `userGuide` and adds `guidePreview`.

Arrays are used for repeated rows (cheat-sheet entries, tips, dialogs) so the
components can map over them via `t(key, { returnObjects: true })`.
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
LOCALES = ROOT / 'src' / 'i18n' / 'locales'


def build_guide(en: dict, nl: dict, fr: dict, de: dict) -> dict:
    return {'en': en, 'nl': nl, 'fr': fr, 'de': de}


# ─── GUIDE (dashboard, full) ────────────────────────────────────────────────
GUIDE = {}

GUIDE['en'] = {
    'eyebrow': 'Help',
    'title': 'VoiceLink user guide',
    'intro': "Send a WhatsApp voice note. VoiceLink logs it into your CRM for you — no forms, no clicking, no logging in. Here's how to get the most out of it.",
    'quickStart': {
        'eyebrow': 'Quick start',
        'title': 'In 30 seconds',
        'steps': [
            {'title': 'Open WhatsApp', 'body': 'Chat with the VoiceLink number your admin gave you.'},
            {'title': 'Record a voice note', 'body': "Speak naturally — like you're dictating to a colleague."},
            {'title': 'Send', 'body': 'Within a minute you get a reply confirming what was logged.'},
        ],
        'calloutQuote': '"I just met Jan at Delta NV. They want a 15% discount on the premium package. Create a follow-up task for next Friday, and add Sarah Leclercq — she\'s their new procurement manager."',
        'calloutSummaryPrefix': 'That one message creates',
        'calloutSummaryBold': 'one meeting report, one deal update, one task, and one new contact',
        'calloutSummarySuffix': '— all linked correctly in Teamleader.',
    },
    'cheatSheet': {
        'eyebrow': 'Cheat sheet',
        'title': 'What you can do',
        'introPrefix': 'VoiceLink handles',
        'introBold': '16 CRM entity types',
        'introSuffix': ". You don't need to memorise them — speak naturally and combine several in one message if you want.",
        'colGoal': 'Goal',
        'colSay': 'Say something like…',
        'rows': [
            {'goal': 'Create a company',   'example': '"Add a new company called Finit Solutions, VAT number BE0123456789"'},
            {'goal': 'Create a contact',   'example': '"Add Sarah Leclercq at Delta NV, she\'s the procurement manager"'},
            {'goal': 'Create a deal',      'example': '"Create a deal for Alpha Solutions — Website Redesign, 3-month project"'},
            {'goal': 'Update a record',    'example': '"Update Delta NV\'s website to delta.com"'},
            {'goal': 'Log a past call',    'example': '"I just called Marc for 15 minutes about the contract renewal"'},
            {'goal': 'Log a past meeting', 'example': '"I had a meeting with Jan. We discussed pricing. He wants a discount."'},
            {'goal': 'Schedule a meeting', 'example': '"Schedule a meeting with Jan and Marc next Tuesday at 14:00"'},
            {'goal': 'Create a task',      'example': '"Remind me to send the proposal to Jan next Friday — urgent"'},
            {'goal': 'Complete a task',    'example': '"Mark the demo prep as done"'},
            {'goal': 'Create a quotation', 'example': '"Create an offerte for Alpha Solutions with the standard package"'},
            {'goal': 'Register a payment', 'example': '"Mark invoice INV-2024-001 as paid"'},
            {'goal': 'Find something',     'example': '"Show me all deals for Delta NV"'},
            {'goal': 'Mark deal won/lost', 'example': '"The SEO contract is won"'},
        ],
    },
    'tips': {
        'eyebrow': 'Tips',
        'title': "What works, what doesn't",
        'doLabel': 'Do',
        'dontLabel': "Don't",
        'dos': [
            {'title': 'Use real names', 'body': '"Delta NV", "Jan de Vos", "Website Redesign" — specific beats vague.'},
            {'title': 'Add one distinguishing detail', 'body': '"Marc at Delta" is better than just "Marc" when a name could be ambiguous.'},
            {'title': 'Speak naturally about dates', 'body': '"Next Friday", "tomorrow at 3", "end of the month" — all work.'},
            {'title': 'Combine several actions', 'body': 'List multiple things in one voice note — VoiceLink figures out the order.'},
            {'title': 'Mark urgent work', 'body': 'Say "urgent" or "ASAP" for high-priority tasks. Defaults to normal otherwise.'},
            {'title': 'Use your own language', 'body': 'Dutch, English, French, German — VoiceLink replies in the same language.'},
        ],
        'donts': [
            {'title': 'Worry about keywords', 'body': "There aren't any — speak the way you think."},
            {'title': 'Monologue for 5 minutes', 'body': 'Voice notes of 15–60 seconds work best.'},
            {'title': 'Rely on pronouns across gaps', 'body': 'After ~10 minutes of silence, VoiceLink starts a new context.'},
            {'title': 'Attach files', 'body': 'VoiceLink only reads voice and text — no images, PDFs, or attachments.'},
        ],
    },
    'talkingBack': {
        'eyebrow': 'Talking back',
        'title': 'How VoiceLink replies',
        'whenJustDoes': 'When it just does the job',
        'whenNeedsToAsk': 'When it needs to ask',
        'confirmations': [
            '✅ Contact Sarah Leclercq created, linked to Delta NV',
            '✅ Task "Follow up with Jan" created — due Friday',
            '✅ Deal updated: premium package, 15% discount noted',
        ],
        'voicelinkLabel': 'VoiceLink:',
        'youLabel': 'You:',
        'dialogues': [
            {'situation': 'Two matches (e.g., two Jans)',    'voicelink': '"I found Jan Voortman at Delta and Jan Hendrickx at Finit. Which one?"',    'you': '"Jan at Delta" or "the first one"'},
            {'situation': 'Missing info',                    'voicelink': '"What\'s Sarah\'s last name?"',                                              'you': '"Leclercq"'},
            {'situation': 'Duplicate risk',                  'voicelink': '"A contact named Jane Smith already exists. Update her instead?"',          'you': '"Yes, update her" or "No, create new"'},
            {'situation': 'VAT lookup confirm',              'voicelink': '"BE0123… is registered as \'Finit Solutions NV\'. Correct?"',              'you': '"Yes" / "No"'},
        ],
        'fuzzyMatchNote': 'Small typos or speech-to-text mistakes? VoiceLink matches on sound and spelling, so "Marc Pieters" still finds "Marc Peeters" without asking.',
    },
    'memory': {
        'eyebrow': 'Context',
        'title': 'Memory & follow-ups',
        'withinBold': 'Within a conversation',
        'withinRest': ' (~10 min active): VoiceLink remembers the last 5 exchanges. You can say "her", "that company", "yes do it" and it knows what you mean.',
        'silentBold': 'After 10 minutes silent',
        'silentRest': ': the context resets. Name your entities explicitly in your next message.',
        'acrossBold': 'Across conversations',
        'acrossRest': ": VoiceLink doesn't remember past chats — but your Teamleader data is, of course, persistent.",
    },
    'preview': {
        'eyebrow': 'Safety net',
        'title': 'Preview before you execute',
        'intro': 'Not sure what VoiceLink will do? Ask for a plan:',
        'quote': '"Show me what you would do, but don\'t execute yet."',
        'planNote': "You'll get a plan with 📌 markers. Then:",
        'yes': '"Yes, do it."',
        'cancel': '"Cancel." or "Change X to Y first."',
    },
    'limits': {
        'eyebrow': 'Limits',
        'title': "What VoiceLink can't do (yet)",
        'items': [
            {'title': 'Send emails', 'body': 'Quotations and invoices are prepared in Teamleader; you send them from there.'},
            {'title': 'Attach files', 'body': "PDFs, images, and contracts via WhatsApp aren't supported yet."},
            {'title': 'Schedule for later', 'body': '"Send this at 3pm" won\'t work — VoiceLink acts immediately.'},
            {'title': 'Bulk edits', 'body': '30+ records in one message is blocked by a safety limit.'},
            {'title': 'Undo automatically', 'body': 'But you can say "delete the task I just created" as a follow-up.'},
        ],
    },
    'troubleshooting': {
        'eyebrow': "If something's off",
        'title': 'Troubleshooting',
        'colProblem': 'Problem',
        'colCause': 'Likely cause',
        'colFix': 'Fix',
        'rows': [
            {'problem': 'No reply after 2 minutes',  'cause': 'Network or API hiccup',      'fix': 'Resend the voice note, or contact support.'},
            {'problem': 'Picked the wrong person',   'cause': 'Name too common',            'fix': 'Add a detail: "Jan at Delta", "Marc Peeters".'},
            {'problem': 'Language switched mid-reply','cause': 'Very short ambiguous input', 'fix': 'Reply in your language — it locks in again.'},
            {'problem': "Custom field didn't update",'cause': 'Field name not recognised',  'fix': 'Use the exact Teamleader label, or ask your admin.'},
            {'problem': '"Contact already exists"',  'cause': 'Duplicate-protection guard', 'fix': 'Reply "update her" or "create new".'},
        ],
    },
    'reference': {
        'eyebrow': 'Remember this',
        'title': 'Quick reference',
        'cards': [
            {'label': 'The one rule',  'body': "Speak to VoiceLink the way you'd speak to a helpful colleague who has full access to Teamleader."},
            {'label': 'The one trick', 'body': 'When in doubt, name things explicitly — the exact company, the exact person.'},
            {'label': 'The one limit', 'body': 'Voice notes execute immediately. Preview with "show me first" for a safety net.'},
        ],
    },
    'support': {
        'title': 'Need a hand?',
        'body': 'Email works best for feature requests and bug reports. Include the approximate time of the voice note so we can trace it in logs.',
        'whatsappLabel': 'Chat on WhatsApp',
        'teamleaderPrefix': 'Teamleader questions (not VoiceLink)?',
        'teamleaderLinkText': 'help.teamleader.eu',
    },
}

GUIDE['nl'] = {
    'eyebrow': 'Hulp',
    'title': 'VoiceLink gebruikershandleiding',
    'intro': 'Stuur een WhatsApp-spraakbericht. VoiceLink registreert het voor jou in je CRM — geen formulieren, geen klikken, geen inloggen. Zo haal je er het meeste uit.',
    'quickStart': {
        'eyebrow': 'Snelstart',
        'title': 'In 30 seconden',
        'steps': [
            {'title': 'Open WhatsApp', 'body': 'Chat met het VoiceLink-nummer dat je admin je heeft gegeven.'},
            {'title': 'Neem een spraakbericht op', 'body': 'Praat natuurlijk — alsof je dicteert aan een collega.'},
            {'title': 'Verstuur', 'body': 'Binnen een minuut krijg je een antwoord dat bevestigt wat er is geregistreerd.'},
        ],
        'calloutQuote': '"Ik heb net Jan van Delta NV ontmoet. Ze willen 15% korting op het premium pakket. Maak een opvolgtaak voor volgende vrijdag en voeg Sarah Leclercq toe — ze is hun nieuwe inkoopmanager."',
        'calloutSummaryPrefix': 'Dat ene bericht maakt',
        'calloutSummaryBold': 'één meetingrapport, één deal-update, één taak en één nieuw contact',
        'calloutSummarySuffix': '— allemaal correct gekoppeld in Teamleader.',
    },
    'cheatSheet': {
        'eyebrow': 'Spiekbriefje',
        'title': 'Wat je kan doen',
        'introPrefix': 'VoiceLink ondersteunt',
        'introBold': '16 CRM-entiteiten',
        'introSuffix': '. Je hoeft ze niet te onthouden — praat natuurlijk en combineer er meerdere in één bericht als je wilt.',
        'colGoal': 'Doel',
        'colSay': 'Zeg iets als…',
        'rows': [
            {'goal': 'Bedrijf aanmaken',        'example': '"Voeg een nieuw bedrijf toe, Finit Solutions, BTW-nummer BE0123456789"'},
            {'goal': 'Contact aanmaken',        'example': '"Voeg Sarah Leclercq toe bij Delta NV, ze is de inkoopmanager"'},
            {'goal': 'Deal aanmaken',           'example': '"Maak een deal voor Alpha Solutions — Website Redesign, 3 maanden"'},
            {'goal': 'Record bijwerken',        'example': '"Update de website van Delta NV naar delta.com"'},
            {'goal': 'Telefoontje loggen',      'example': '"Ik heb net 15 minuten met Marc gebeld over de contractverlenging"'},
            {'goal': 'Meeting achteraf loggen', 'example': '"Ik had een meeting met Jan. We bespraken prijzen. Hij wil korting."'},
            {'goal': 'Meeting plannen',         'example': '"Plan een meeting met Jan en Marc volgende dinsdag om 14:00"'},
            {'goal': 'Taak aanmaken',           'example': '"Herinner me om de offerte naar Jan te sturen volgende vrijdag — dringend"'},
            {'goal': 'Taak afwerken',           'example': '"Markeer de demo-voorbereiding als klaar"'},
            {'goal': 'Offerte aanmaken',        'example': '"Maak een offerte voor Alpha Solutions met het standaardpakket"'},
            {'goal': 'Betaling registreren',    'example': '"Markeer factuur INV-2024-001 als betaald"'},
            {'goal': 'Iets opzoeken',           'example': '"Toon me alle deals voor Delta NV"'},
            {'goal': 'Deal gewonnen/verloren',  'example': '"Het SEO-contract is gewonnen"'},
        ],
    },
    'tips': {
        'eyebrow': 'Tips',
        'title': 'Wat werkt en wat niet',
        'doLabel': 'Wel doen',
        'dontLabel': 'Niet doen',
        'dos': [
            {'title': 'Gebruik echte namen', 'body': '"Delta NV", "Jan de Vos", "Website Redesign" — specifiek is beter dan vaag.'},
            {'title': 'Voeg een onderscheidend detail toe', 'body': '"Marc bij Delta" is beter dan alleen "Marc" als een naam dubbelzinnig kan zijn.'},
            {'title': 'Praat natuurlijk over data', 'body': '"Volgende vrijdag", "morgen om 15u", "eind van de maand" — alles werkt.'},
            {'title': 'Combineer meerdere acties', 'body': 'Noem meerdere dingen in één spraakbericht — VoiceLink zoekt de juiste volgorde uit.'},
            {'title': 'Markeer dringend werk', 'body': 'Zeg "dringend" of "ASAP" voor taken met hoge prioriteit. Anders is de standaard normaal.'},
            {'title': 'Gebruik je eigen taal', 'body': 'Nederlands, Engels, Frans, Duits — VoiceLink antwoordt in dezelfde taal.'},
        ],
        'donts': [
            {'title': 'Piekeren over trefwoorden', 'body': 'Er zijn er geen — praat zoals je denkt.'},
            {'title': '5 minuten lang monologen', 'body': 'Spraakberichten van 15–60 seconden werken het best.'},
            {'title': 'Vertrouwen op verwijzingen na een pauze', 'body': 'Na ~10 minuten stilte begint VoiceLink opnieuw.'},
            {'title': 'Bestanden meesturen', 'body': 'VoiceLink leest alleen spraak en tekst — geen afbeeldingen, pdf\'s of bijlagen.'},
        ],
    },
    'talkingBack': {
        'eyebrow': 'Terugpraten',
        'title': 'Hoe VoiceLink antwoordt',
        'whenJustDoes': 'Wanneer het gewoon werkt',
        'whenNeedsToAsk': 'Wanneer het moet vragen',
        'confirmations': [
            '✅ Contact Sarah Leclercq aangemaakt, gekoppeld aan Delta NV',
            '✅ Taak "Jan opvolgen" aangemaakt — vervalt vrijdag',
            '✅ Deal bijgewerkt: premium pakket, 15% korting genoteerd',
        ],
        'voicelinkLabel': 'VoiceLink:',
        'youLabel': 'Jij:',
        'dialogues': [
            {'situation': 'Twee matches (bv. twee Jannen)',  'voicelink': '"Ik vond Jan Voortman bij Delta en Jan Hendrickx bij Finit. Welke?"',     'you': '"Jan bij Delta" of "de eerste"'},
            {'situation': 'Ontbrekende info',                'voicelink': '"Wat is de achternaam van Sarah?"',                                     'you': '"Leclercq"'},
            {'situation': 'Dubbel risico',                   'voicelink': '"Een contact Jane Smith bestaat al. Haar bijwerken?"',                   'you': '"Ja, werk haar bij" of "Nee, nieuw aanmaken"'},
            {'situation': 'BTW-controle bevestigen',         'voicelink': '"BE0123… staat geregistreerd als \'Finit Solutions NV\'. Klopt dat?"',  'you': '"Ja" / "Nee"'},
        ],
        'fuzzyMatchNote': 'Kleine typo\'s of spraak-naar-tekst fouten? VoiceLink matcht op klank en spelling, dus "Marc Pieters" vindt nog steeds "Marc Peeters" zonder vragen.',
    },
    'memory': {
        'eyebrow': 'Context',
        'title': 'Geheugen & opvolging',
        'withinBold': 'Binnen een gesprek',
        'withinRest': ' (~10 min actief): VoiceLink onthoudt de laatste 5 uitwisselingen. Je kan zeggen "haar", "dat bedrijf", "ja doe maar" en het weet wat je bedoelt.',
        'silentBold': 'Na 10 minuten stilte',
        'silentRest': ': de context reset. Benoem je entiteiten expliciet in je volgende bericht.',
        'acrossBold': 'Tussen gesprekken',
        'acrossRest': ': VoiceLink onthoudt geen eerdere chats — maar je Teamleader-data blijft natuurlijk permanent.',
    },
    'preview': {
        'eyebrow': 'Vangnet',
        'title': 'Bekijk eerst, voer daarna uit',
        'intro': 'Niet zeker wat VoiceLink zal doen? Vraag een overzicht:',
        'quote': '"Toon me wat je zou doen, maar voer het nog niet uit."',
        'planNote': 'Je krijgt een plan met 📌 markeringen. Daarna:',
        'yes': '"Ja, doe maar."',
        'cancel': '"Annuleer." of "Wijzig eerst X naar Y."',
    },
    'limits': {
        'eyebrow': 'Beperkingen',
        'title': 'Wat VoiceLink (nog) niet kan',
        'items': [
            {'title': 'E-mails versturen', 'body': 'Offertes en facturen worden klaargemaakt in Teamleader; van daaruit verstuur je ze.'},
            {'title': 'Bestanden koppelen', 'body': 'Pdf\'s, afbeeldingen en contracten via WhatsApp zijn nog niet ondersteund.'},
            {'title': 'Plannen voor later', 'body': '"Verstuur dit om 15u" werkt niet — VoiceLink handelt meteen.'},
            {'title': 'Bulk-aanpassingen', 'body': 'Meer dan 30 records in één bericht wordt geblokkeerd door een veiligheidslimiet.'},
            {'title': 'Automatisch ongedaan maken', 'body': 'Maar je kan zeggen "verwijder de taak die ik net aanmaakte" als opvolging.'},
        ],
    },
    'troubleshooting': {
        'eyebrow': 'Als er iets mis gaat',
        'title': 'Problemen oplossen',
        'colProblem': 'Probleem',
        'colCause': 'Waarschijnlijke oorzaak',
        'colFix': 'Oplossing',
        'rows': [
            {'problem': 'Geen antwoord na 2 minuten',     'cause': 'Netwerk- of API-storing',        'fix': 'Verstuur het spraakbericht opnieuw, of contacteer support.'},
            {'problem': 'Verkeerde persoon gekozen',      'cause': 'Naam te algemeen',               'fix': 'Voeg een detail toe: "Jan bij Delta", "Marc Peeters".'},
            {'problem': 'Taal wisselde halverwege',       'cause': 'Zeer kort dubbelzinnig bericht', 'fix': 'Antwoord in je taal — die zet zich dan weer vast.'},
            {'problem': 'Aangepast veld werd niet bijgewerkt', 'cause': 'Veldnaam niet herkend',     'fix': 'Gebruik het exacte Teamleader-label, of vraag je admin.'},
            {'problem': '"Contact bestaat al"',           'cause': 'Beveiliging tegen duplicaten',   'fix': 'Antwoord "werk haar bij" of "maak nieuw".'},
        ],
    },
    'reference': {
        'eyebrow': 'Onthoud dit',
        'title': 'Snelle referentie',
        'cards': [
            {'label': 'De ene regel',   'body': 'Praat met VoiceLink zoals je zou praten met een behulpzame collega die volledige toegang heeft tot Teamleader.'},
            {'label': 'De ene truc',    'body': 'Bij twijfel, benoem dingen expliciet — het exacte bedrijf, de exacte persoon.'},
            {'label': 'De ene limiet',  'body': 'Spraakberichten worden meteen uitgevoerd. Vraag "toon me eerst" voor een vangnet.'},
        ],
    },
    'support': {
        'title': 'Hulp nodig?',
        'body': 'E-mail werkt het best voor feature requests en bugmeldingen. Vermeld ongeveer de tijd van het spraakbericht zodat we het in de logs kunnen terugvinden.',
        'whatsappLabel': 'Chat via WhatsApp',
        'teamleaderPrefix': 'Vragen over Teamleader (niet VoiceLink)?',
        'teamleaderLinkText': 'help.teamleader.eu',
    },
}

GUIDE['fr'] = {
    'eyebrow': 'Aide',
    'title': "Guide d'utilisation VoiceLink",
    'intro': "Envoyez une note vocale WhatsApp. VoiceLink l'enregistre dans votre CRM pour vous — aucun formulaire, aucun clic, aucune connexion. Voici comment en tirer le meilleur parti.",
    'quickStart': {
        'eyebrow': 'Démarrage rapide',
        'title': 'En 30 secondes',
        'steps': [
            {'title': 'Ouvrez WhatsApp', 'body': "Discutez avec le numéro VoiceLink que votre admin vous a donné."},
            {'title': 'Enregistrez une note vocale', 'body': 'Parlez naturellement — comme si vous dictiez à un collègue.'},
            {'title': 'Envoyez', 'body': "En moins d'une minute vous recevez une réponse confirmant ce qui a été enregistré."},
        ],
        'calloutQuote': "\"Je viens de rencontrer Jan chez Delta NV. Ils veulent 15% de remise sur le pack premium. Crée une tâche de suivi pour vendredi prochain, et ajoute Sarah Leclercq — c'est leur nouvelle responsable achats.\"",
        'calloutSummaryPrefix': 'Ce seul message crée',
        'calloutSummaryBold': 'un compte-rendu de réunion, une mise à jour de deal, une tâche et un nouveau contact',
        'calloutSummarySuffix': '— le tout correctement lié dans Teamleader.',
    },
    'cheatSheet': {
        'eyebrow': 'Antisèche',
        'title': 'Ce que vous pouvez faire',
        'introPrefix': 'VoiceLink gère',
        'introBold': '16 types d\'entités CRM',
        'introSuffix': ". Vous n'avez pas à les mémoriser — parlez naturellement et combinez-en plusieurs dans un message si vous le souhaitez.",
        'colGoal': 'Objectif',
        'colSay': 'Dites quelque chose comme…',
        'rows': [
            {'goal': 'Créer une entreprise',  'example': '"Ajoute une nouvelle entreprise, Finit Solutions, numéro de TVA BE0123456789"'},
            {'goal': 'Créer un contact',      'example': '"Ajoute Sarah Leclercq chez Delta NV, c\'est la responsable achats"'},
            {'goal': 'Créer un deal',         'example': '"Crée un deal pour Alpha Solutions — Refonte de site, projet 3 mois"'},
            {'goal': 'Mettre à jour un enregistrement', 'example': '"Mets à jour le site web de Delta NV vers delta.com"'},
            {'goal': 'Enregistrer un appel',  'example': '"Je viens d\'appeler Marc 15 minutes à propos du renouvellement"'},
            {'goal': 'Enregistrer une réunion passée', 'example': '"J\'ai eu une réunion avec Jan. On a parlé prix. Il veut une remise."'},
            {'goal': 'Planifier une réunion', 'example': '"Planifie une réunion avec Jan et Marc mardi prochain à 14h"'},
            {'goal': 'Créer une tâche',       'example': '"Rappelle-moi d\'envoyer la proposition à Jan vendredi prochain — urgent"'},
            {'goal': 'Clôturer une tâche',    'example': '"Marque la préparation de la démo comme terminée"'},
            {'goal': 'Créer un devis',        'example': '"Crée un devis pour Alpha Solutions avec le pack standard"'},
            {'goal': 'Enregistrer un paiement','example': '"Marque la facture INV-2024-001 comme payée"'},
            {'goal': 'Chercher quelque chose','example': '"Montre-moi tous les deals pour Delta NV"'},
            {'goal': 'Marquer deal gagné/perdu','example': '"Le contrat SEO est gagné"'},
        ],
    },
    'tips': {
        'eyebrow': 'Conseils',
        'title': 'Ce qui marche, ce qui ne marche pas',
        'doLabel': 'À faire',
        'dontLabel': 'À éviter',
        'dos': [
            {'title': 'Utilisez de vrais noms', 'body': '"Delta NV", "Jan de Vos", "Refonte de site" — précis vaut mieux que vague.'},
            {'title': 'Ajoutez un détail distinctif', 'body': '"Marc chez Delta" vaut mieux que juste "Marc" quand un nom peut être ambigu.'},
            {'title': 'Parlez naturellement des dates', 'body': '"Vendredi prochain", "demain à 15h", "fin du mois" — tout fonctionne.'},
            {'title': 'Combinez plusieurs actions', 'body': 'Listez plusieurs choses dans une note vocale — VoiceLink trouve le bon ordre.'},
            {'title': 'Signalez les tâches urgentes', 'body': 'Dites "urgent" ou "ASAP" pour les priorités hautes. Par défaut, c\'est normal.'},
            {'title': 'Utilisez votre langue', 'body': 'Néerlandais, anglais, français, allemand — VoiceLink répond dans la même langue.'},
        ],
        'donts': [
            {'title': 'Vous soucier des mots-clés', 'body': "Il n'y en a pas — parlez comme vous pensez."},
            {'title': 'Monologuer 5 minutes', 'body': 'Des notes vocales de 15–60 secondes marchent le mieux.'},
            {'title': 'Compter sur les pronoms après une pause', 'body': "Après ~10 minutes de silence, VoiceLink repart de zéro."},
            {'title': 'Joindre des fichiers', 'body': "VoiceLink ne lit que la voix et le texte — pas d'images, de PDF ni de pièces jointes."},
        ],
    },
    'talkingBack': {
        'eyebrow': 'Réponses',
        'title': 'Comment VoiceLink répond',
        'whenJustDoes': "Quand ça marche tout seul",
        'whenNeedsToAsk': "Quand il a besoin de vérifier",
        'confirmations': [
            '✅ Contact Sarah Leclercq créé, lié à Delta NV',
            '✅ Tâche "Suivi de Jan" créée — échéance vendredi',
            '✅ Deal mis à jour : pack premium, 15% de remise notée',
        ],
        'voicelinkLabel': 'VoiceLink :',
        'youLabel': 'Vous :',
        'dialogues': [
            {'situation': 'Deux correspondances (p.ex. deux Jans)', 'voicelink': "\"J'ai trouvé Jan Voortman chez Delta et Jan Hendrickx chez Finit. Lequel ?\"",   'you': '"Jan chez Delta" ou "le premier"'},
            {'situation': 'Info manquante',                         'voicelink': "\"Quel est le nom de famille de Sarah ?\"",                                      'you': '"Leclercq"'},
            {'situation': 'Risque de doublon',                      'voicelink': "\"Un contact Jane Smith existe déjà. La mettre à jour ?\"",                       'you': '"Oui, mets-la à jour" ou "Non, crée-en un nouveau"'},
            {'situation': 'Confirmation TVA',                       'voicelink': "\"BE0123… est enregistré comme 'Finit Solutions NV'. Correct ?\"",              'you': '"Oui" / "Non"'},
        ],
        'fuzzyMatchNote': 'Petites fautes ou erreurs de transcription ? VoiceLink associe sur le son et l\'orthographe, donc "Marc Pieters" trouve toujours "Marc Peeters" sans demander.',
    },
    'memory': {
        'eyebrow': 'Contexte',
        'title': 'Mémoire & suivi',
        'withinBold': 'Dans une conversation',
        'withinRest': ' (~10 min actif) : VoiceLink mémorise les 5 derniers échanges. Vous pouvez dire "elle", "cette société", "oui vas-y" et il comprend.',
        'silentBold': 'Après 10 minutes de silence',
        'silentRest': ' : le contexte se réinitialise. Nommez vos entités explicitement dans le message suivant.',
        'acrossBold': 'Entre conversations',
        'acrossRest': ' : VoiceLink ne retient pas les discussions passées — mais vos données Teamleader sont, bien sûr, persistantes.',
    },
    'preview': {
        'eyebrow': 'Filet de sécurité',
        'title': 'Prévisualisez avant d\'exécuter',
        'intro': 'Pas sûr de ce que VoiceLink va faire ? Demandez un plan :',
        'quote': "\"Montre-moi ce que tu ferais, mais n'exécute pas encore.\"",
        'planNote': 'Vous recevrez un plan avec des repères 📌. Ensuite :',
        'yes': '"Oui, vas-y."',
        'cancel': '"Annule." ou "Change X en Y d\'abord."',
    },
    'limits': {
        'eyebrow': 'Limites',
        'title': "Ce que VoiceLink ne peut pas (encore) faire",
        'items': [
            {'title': 'Envoyer des e-mails', 'body': 'Les devis et factures sont préparés dans Teamleader ; vous les envoyez de là.'},
            {'title': 'Joindre des fichiers', 'body': "PDF, images et contrats via WhatsApp ne sont pas encore supportés."},
            {'title': 'Planifier pour plus tard', 'body': "\"Envoie ça à 15h\" ne marche pas — VoiceLink agit immédiatement."},
            {'title': 'Modifications en masse', 'body': 'Plus de 30 enregistrements en un message est bloqué par une limite de sécurité.'},
            {'title': 'Annuler automatiquement', 'body': "Mais vous pouvez dire \"supprime la tâche que je viens de créer\" en suivi."},
        ],
    },
    'troubleshooting': {
        'eyebrow': 'Si quelque chose cloche',
        'title': 'Dépannage',
        'colProblem': 'Problème',
        'colCause': 'Cause probable',
        'colFix': 'Solution',
        'rows': [
            {'problem': 'Pas de réponse après 2 min',  'cause': 'Problème réseau ou API',       'fix': 'Renvoyez la note vocale, ou contactez le support.'},
            {'problem': 'Mauvaise personne choisie',    'cause': 'Nom trop commun',              'fix': 'Ajoutez un détail : "Jan chez Delta", "Marc Peeters".'},
            {'problem': 'Langue changée en cours',      'cause': 'Message très court ambigu',    'fix': 'Répondez dans votre langue — elle se verrouille à nouveau.'},
            {'problem': "Champ perso pas mis à jour",  'cause': 'Nom du champ non reconnu',     'fix': 'Utilisez le libellé Teamleader exact, ou demandez à votre admin.'},
            {'problem': '"Le contact existe déjà"',    'cause': 'Protection anti-doublon',      'fix': 'Répondez "mets-la à jour" ou "crée un nouveau".'},
        ],
    },
    'reference': {
        'eyebrow': 'À retenir',
        'title': 'Référence rapide',
        'cards': [
            {'label': 'La règle',  'body': "Parlez à VoiceLink comme à un collègue serviable qui a un accès complet à Teamleader."},
            {'label': 'L\'astuce', 'body': "Dans le doute, nommez les choses explicitement — l'entreprise exacte, la personne exacte."},
            {'label': 'La limite', 'body': "Les notes vocales s'exécutent immédiatement. Prévisualisez avec \"montre-moi d'abord\" pour un filet de sécurité."},
        ],
    },
    'support': {
        'title': 'Besoin d\'aide ?',
        'body': "L'e-mail marche mieux pour les demandes de fonctionnalités et les bugs. Indiquez l'heure approximative de la note vocale pour qu'on la retrouve dans les logs.",
        'whatsappLabel': 'Chat WhatsApp',
        'teamleaderPrefix': 'Questions Teamleader (pas VoiceLink) ?',
        'teamleaderLinkText': 'help.teamleader.eu',
    },
}

GUIDE['de'] = {
    'eyebrow': 'Hilfe',
    'title': 'VoiceLink Benutzerhandbuch',
    'intro': 'Sende eine WhatsApp-Sprachnachricht. VoiceLink trägt sie für dich in dein CRM ein — keine Formulare, kein Klicken, kein Einloggen. So holst du am meisten heraus.',
    'quickStart': {
        'eyebrow': 'Schnellstart',
        'title': 'In 30 Sekunden',
        'steps': [
            {'title': 'Öffne WhatsApp', 'body': 'Schreibe die VoiceLink-Nummer an, die dein Admin dir gegeben hat.'},
            {'title': 'Sprachnachricht aufnehmen', 'body': 'Sprich natürlich — als würdest du einem Kollegen diktieren.'},
            {'title': 'Senden', 'body': 'Innerhalb einer Minute kommt eine Bestätigung, was registriert wurde.'},
        ],
        'calloutQuote': '"Ich habe gerade Jan bei Delta NV getroffen. Sie wollen 15% Rabatt auf das Premium-Paket. Erstelle eine Follow-up-Aufgabe für nächsten Freitag und füge Sarah Leclercq hinzu — sie ist ihre neue Einkaufsleiterin."',
        'calloutSummaryPrefix': 'Diese eine Nachricht erstellt',
        'calloutSummaryBold': 'einen Meeting-Report, ein Deal-Update, eine Aufgabe und einen neuen Kontakt',
        'calloutSummarySuffix': '— alles korrekt in Teamleader verknüpft.',
    },
    'cheatSheet': {
        'eyebrow': 'Spickzettel',
        'title': 'Was du machen kannst',
        'introPrefix': 'VoiceLink unterstützt',
        'introBold': '16 CRM-Entitätstypen',
        'introSuffix': '. Du musst sie nicht auswendig lernen — sprich natürlich und kombiniere mehrere in einer Nachricht, wenn du willst.',
        'colGoal': 'Ziel',
        'colSay': 'Sag etwas wie…',
        'rows': [
            {'goal': 'Firma anlegen',          'example': '"Füge eine neue Firma Finit Solutions hinzu, USt-IdNr. BE0123456789"'},
            {'goal': 'Kontakt anlegen',        'example': '"Füge Sarah Leclercq bei Delta NV hinzu, sie ist die Einkaufsleiterin"'},
            {'goal': 'Deal anlegen',           'example': '"Erstelle einen Deal für Alpha Solutions — Website-Relaunch, 3 Monate"'},
            {'goal': 'Datensatz aktualisieren','example': '"Aktualisiere die Website von Delta NV auf delta.com"'},
            {'goal': 'Anruf loggen',           'example': '"Ich habe gerade 15 Minuten mit Marc über die Vertragsverlängerung gesprochen"'},
            {'goal': 'Meeting nachträglich loggen', 'example': '"Ich hatte ein Meeting mit Jan. Wir haben Preise besprochen. Er will Rabatt."'},
            {'goal': 'Meeting planen',         'example': '"Plane ein Meeting mit Jan und Marc nächsten Dienstag um 14:00"'},
            {'goal': 'Aufgabe anlegen',        'example': '"Erinnere mich, Jan nächsten Freitag das Angebot zu schicken — dringend"'},
            {'goal': 'Aufgabe abschließen',    'example': '"Markiere die Demo-Vorbereitung als erledigt"'},
            {'goal': 'Angebot anlegen',        'example': '"Erstelle ein Angebot für Alpha Solutions mit dem Standardpaket"'},
            {'goal': 'Zahlung erfassen',       'example': '"Markiere Rechnung INV-2024-001 als bezahlt"'},
            {'goal': 'Etwas finden',           'example': '"Zeig mir alle Deals für Delta NV"'},
            {'goal': 'Deal gewonnen/verloren', 'example': '"Der SEO-Vertrag ist gewonnen"'},
        ],
    },
    'tips': {
        'eyebrow': 'Tipps',
        'title': 'Was funktioniert, was nicht',
        'doLabel': 'Tun',
        'dontLabel': 'Lassen',
        'dos': [
            {'title': 'Echte Namen verwenden', 'body': '"Delta NV", "Jan de Vos", "Website-Relaunch" — konkret schlägt vage.'},
            {'title': 'Ein unterscheidendes Detail', 'body': '"Marc bei Delta" ist besser als nur "Marc", wenn ein Name mehrdeutig sein kann.'},
            {'title': 'Natürlich über Daten sprechen', 'body': '"Nächsten Freitag", "morgen um 15 Uhr", "Ende des Monats" — alles funktioniert.'},
            {'title': 'Aktionen kombinieren', 'body': 'Nenne mehrere Dinge in einer Sprachnachricht — VoiceLink findet die richtige Reihenfolge.'},
            {'title': 'Dringend markieren', 'body': 'Sag "dringend" oder "ASAP" für hohe Priorität. Standard ist normal.'},
            {'title': 'Deine eigene Sprache', 'body': 'Niederländisch, Englisch, Französisch, Deutsch — VoiceLink antwortet in derselben Sprache.'},
        ],
        'donts': [
            {'title': 'Um Keywords sorgen', 'body': 'Es gibt keine — sprich, wie du denkst.'},
            {'title': '5 Minuten monologisieren', 'body': 'Sprachnachrichten von 15–60 Sekunden funktionieren am besten.'},
            {'title': 'Nach Pausen auf Pronomen zählen', 'body': 'Nach ~10 Minuten Stille startet VoiceLink einen neuen Kontext.'},
            {'title': 'Dateien anhängen', 'body': 'VoiceLink liest nur Sprache und Text — keine Bilder, PDFs oder Anhänge.'},
        ],
    },
    'talkingBack': {
        'eyebrow': 'Rückmeldung',
        'title': 'Wie VoiceLink antwortet',
        'whenJustDoes': 'Wenn es einfach klappt',
        'whenNeedsToAsk': 'Wenn nachgefragt werden muss',
        'confirmations': [
            '✅ Kontakt Sarah Leclercq angelegt, mit Delta NV verknüpft',
            '✅ Aufgabe "Jan nachfassen" angelegt — fällig Freitag',
            '✅ Deal aktualisiert: Premium-Paket, 15% Rabatt notiert',
        ],
        'voicelinkLabel': 'VoiceLink:',
        'youLabel': 'Du:',
        'dialogues': [
            {'situation': 'Zwei Treffer (z.B. zwei Jans)',   'voicelink': '"Ich habe Jan Voortman bei Delta und Jan Hendrickx bei Finit gefunden. Welchen?"', 'you': '"Jan bei Delta" oder "den ersten"'},
            {'situation': 'Fehlende Info',                   'voicelink': '"Wie lautet Sarahs Nachname?"',                                                 'you': '"Leclercq"'},
            {'situation': 'Duplikat-Risiko',                 'voicelink': '"Ein Kontakt Jane Smith existiert bereits. Stattdessen aktualisieren?"',          'you': '"Ja, aktualisieren" oder "Nein, neu anlegen"'},
            {'situation': 'USt-IdNr. bestätigen',            'voicelink': '"BE0123… ist als \'Finit Solutions NV\' registriert. Korrekt?"',               'you': '"Ja" / "Nein"'},
        ],
        'fuzzyMatchNote': 'Kleine Tippfehler oder Transkriptionsfehler? VoiceLink matcht auf Klang und Schreibweise, "Marc Pieters" findet also trotzdem "Marc Peeters" ohne Nachfrage.',
    },
    'memory': {
        'eyebrow': 'Kontext',
        'title': 'Gedächtnis & Follow-ups',
        'withinBold': 'Innerhalb eines Gesprächs',
        'withinRest': ' (~10 Min aktiv): VoiceLink merkt sich die letzten 5 Wechsel. Du kannst "sie", "diese Firma", "ja mach" sagen und es weiß, was du meinst.',
        'silentBold': 'Nach 10 Minuten Stille',
        'silentRest': ': Der Kontext wird zurückgesetzt. Benenne deine Entitäten in der nächsten Nachricht explizit.',
        'acrossBold': 'Zwischen Gesprächen',
        'acrossRest': ': VoiceLink merkt sich keine früheren Chats — aber deine Teamleader-Daten bleiben natürlich erhalten.',
    },
    'preview': {
        'eyebrow': 'Sicherheitsnetz',
        'title': 'Vorschau vor der Ausführung',
        'intro': 'Nicht sicher, was VoiceLink tun wird? Bitte um einen Plan:',
        'quote': '"Zeig mir, was du tun würdest, aber führ es noch nicht aus."',
        'planNote': 'Du bekommst einen Plan mit 📌-Markern. Dann:',
        'yes': '"Ja, mach."',
        'cancel': '"Abbrechen." oder "Erst X auf Y ändern."',
    },
    'limits': {
        'eyebrow': 'Grenzen',
        'title': 'Was VoiceLink (noch) nicht kann',
        'items': [
            {'title': 'E-Mails senden', 'body': 'Angebote und Rechnungen werden in Teamleader vorbereitet; von dort verschickst du sie.'},
            {'title': 'Dateien anhängen', 'body': 'PDFs, Bilder und Verträge über WhatsApp werden noch nicht unterstützt.'},
            {'title': 'Für später planen', 'body': '"Sende das um 15 Uhr" funktioniert nicht — VoiceLink handelt sofort.'},
            {'title': 'Massenbearbeitungen', 'body': 'Mehr als 30 Datensätze in einer Nachricht wird durch ein Sicherheitslimit blockiert.'},
            {'title': 'Automatisches Rückgängigmachen', 'body': 'Aber du kannst als Follow-up sagen: "Lösche die Aufgabe, die ich gerade erstellt habe."'},
        ],
    },
    'troubleshooting': {
        'eyebrow': 'Falls etwas nicht stimmt',
        'title': 'Fehlerbehebung',
        'colProblem': 'Problem',
        'colCause': 'Wahrscheinliche Ursache',
        'colFix': 'Lösung',
        'rows': [
            {'problem': 'Keine Antwort nach 2 Min',       'cause': 'Netzwerk- oder API-Aussetzer',   'fix': 'Sprachnachricht erneut senden, oder Support kontaktieren.'},
            {'problem': 'Falsche Person gewählt',         'cause': 'Name zu gebräuchlich',           'fix': 'Detail hinzufügen: "Jan bei Delta", "Marc Peeters".'},
            {'problem': 'Sprache mitten in der Antwort gewechselt', 'cause': 'Sehr kurzer mehrdeutiger Input', 'fix': 'Antworte in deiner Sprache — sie fixiert sich wieder.'},
            {'problem': 'Benutzerdefiniertes Feld nicht aktualisiert', 'cause': 'Feldname nicht erkannt', 'fix': 'Nutze das exakte Teamleader-Label, oder frag deinen Admin.'},
            {'problem': '"Kontakt existiert bereits"',    'cause': 'Duplikatschutz',                 'fix': 'Antworte "aktualisieren" oder "neu anlegen".'},
        ],
    },
    'reference': {
        'eyebrow': 'Merken',
        'title': 'Schnellreferenz',
        'cards': [
            {'label': 'Die eine Regel',  'body': 'Sprich mit VoiceLink wie mit einem hilfsbereiten Kollegen, der vollen Teamleader-Zugriff hat.'},
            {'label': 'Der eine Trick', 'body': 'Im Zweifel Dinge explizit benennen — die exakte Firma, die exakte Person.'},
            {'label': 'Die eine Grenze','body': 'Sprachnachrichten werden sofort ausgeführt. Vorschau mit "zeig mir erst" als Sicherheitsnetz.'},
        ],
    },
    'support': {
        'title': 'Brauchst du Hilfe?',
        'body': 'E-Mail funktioniert am besten für Feature-Wünsche und Bug-Reports. Nenne die ungefähre Uhrzeit der Sprachnachricht, damit wir sie in den Logs finden.',
        'whatsappLabel': 'Per WhatsApp chatten',
        'teamleaderPrefix': 'Fragen zu Teamleader (nicht VoiceLink)?',
        'teamleaderLinkText': 'help.teamleader.eu',
    },
}


# ─── GUIDE PREVIEW (homepage, concise) ──────────────────────────────────────
PREVIEW = {}

PREVIEW['en'] = {
    'badge': 'How you use it',
    'title': 'Just say what happened.',
    'subtitle': "No keywords, no syntax. Speak the way you'd tell a colleague — VoiceLink turns it into the right CRM actions.",
    'youSayLabel': 'You say',
    'voicelinkLabel': 'VoiceLink does',
    'examples': [
        {
            'youSay': '"Just met Jan at Delta NV. They want a 15% discount on the premium package. Follow up with him next Friday."',
            'outcomes': [
                'Meeting report logged on Delta NV',
                'Deal updated with 15% discount note',
                'Task "Follow up with Jan" created — due Friday',
            ],
        },
        {
            'youSay': '"Add Sarah Leclercq as a contact at Delta NV, she\'s the new procurement manager."',
            'outcomes': [
                'Contact Sarah Leclercq created',
                'Linked to Delta NV with role "Procurement Manager"',
            ],
        },
        {
            'youSay': '"I just called Marc Peeters for 15 minutes about the contract renewal. He wants a new quote by Friday."',
            'outcomes': [
                'Call logged on Marc Peeters — 15 min',
                'Task "Prepare new quote for Marc" created — due Friday',
            ],
        },
        {
            'youSay': '"The SEO contract with Alpha Solutions is won."',
            'outcomes': ['Deal status updated to Won', 'Associated task marked complete'],
        },
    ],
    'tipsTitle': 'Quick tips',
    'tips': [
        'Use real names — "Delta NV" beats "that company".',
        'Combine several actions in one message — VoiceLink orders them.',
        'Speak any of 4 languages: EN / NL / FR / DE.',
    ],
}

PREVIEW['nl'] = {
    'badge': 'Zo gebruik je het',
    'title': 'Zeg gewoon wat er gebeurd is.',
    'subtitle': 'Geen trefwoorden, geen syntax. Praat zoals je het aan een collega zou vertellen — VoiceLink zet het om in de juiste CRM-acties.',
    'youSayLabel': 'Jij zegt',
    'voicelinkLabel': 'VoiceLink doet',
    'examples': [
        {
            'youSay': '"Net Jan gezien bij Delta NV. Ze willen 15% korting op het premium pakket. Volg hem op volgende vrijdag."',
            'outcomes': [
                'Meetingrapport geregistreerd op Delta NV',
                'Deal bijgewerkt met notitie over 15% korting',
                'Taak "Jan opvolgen" aangemaakt — vervalt vrijdag',
            ],
        },
        {
            'youSay': '"Voeg Sarah Leclercq toe als contact bij Delta NV, ze is de nieuwe inkoopmanager."',
            'outcomes': [
                'Contact Sarah Leclercq aangemaakt',
                'Gekoppeld aan Delta NV met rol "Inkoopmanager"',
            ],
        },
        {
            'youSay': '"Ik heb net 15 minuten met Marc Peeters gebeld over de contractverlenging. Hij wil vrijdag een nieuwe offerte."',
            'outcomes': [
                'Gesprek geregistreerd op Marc Peeters — 15 min',
                'Taak "Nieuwe offerte voor Marc" aangemaakt — vervalt vrijdag',
            ],
        },
        {
            'youSay': '"Het SEO-contract met Alpha Solutions is gewonnen."',
            'outcomes': ['Deal status bijgewerkt naar Gewonnen', 'Gekoppelde taak als klaar gemarkeerd'],
        },
    ],
    'tipsTitle': 'Snelle tips',
    'tips': [
        'Gebruik echte namen — "Delta NV" is beter dan "dat bedrijf".',
        'Combineer meerdere acties in één bericht — VoiceLink zet ze op orde.',
        'Spreek 1 van 4 talen: EN / NL / FR / DE.',
    ],
}

PREVIEW['fr'] = {
    'badge': "Comment l'utiliser",
    'title': "Dites simplement ce qui s'est passé.",
    'subtitle': "Pas de mots-clés, pas de syntaxe. Parlez comme vous le diriez à un collègue — VoiceLink le transforme en actions CRM.",
    'youSayLabel': 'Vous dites',
    'voicelinkLabel': 'VoiceLink fait',
    'examples': [
        {
            'youSay': '"Je viens de voir Jan chez Delta NV. Ils veulent 15% de remise sur le pack premium. Fais un suivi vendredi prochain."',
            'outcomes': [
                'Compte-rendu de réunion enregistré sur Delta NV',
                'Deal mis à jour avec la note de 15% de remise',
                'Tâche "Suivi de Jan" créée — échéance vendredi',
            ],
        },
        {
            'youSay': '"Ajoute Sarah Leclercq comme contact chez Delta NV, c\'est la nouvelle responsable achats."',
            'outcomes': [
                'Contact Sarah Leclercq créé',
                'Lié à Delta NV avec le rôle "Responsable achats"',
            ],
        },
        {
            'youSay': '"J\'ai appelé Marc Peeters 15 minutes pour le renouvellement. Il veut un nouveau devis pour vendredi."',
            'outcomes': [
                'Appel enregistré sur Marc Peeters — 15 min',
                'Tâche "Préparer nouveau devis pour Marc" créée — échéance vendredi',
            ],
        },
        {
            'youSay': '"Le contrat SEO avec Alpha Solutions est gagné."',
            'outcomes': ['Statut du deal passé à Gagné', 'Tâche associée marquée terminée'],
        },
    ],
    'tipsTitle': 'Astuces rapides',
    'tips': [
        "Utilisez de vrais noms — \"Delta NV\" vaut mieux que \"cette société\".",
        'Combinez plusieurs actions en un message — VoiceLink les ordonne.',
        'Parlez 4 langues : EN / NL / FR / DE.',
    ],
}

PREVIEW['de'] = {
    'badge': 'So benutzt du es',
    'title': 'Sag einfach, was passiert ist.',
    'subtitle': 'Keine Keywords, keine Syntax. Sprich, wie du es einem Kollegen erzählen würdest — VoiceLink macht daraus die richtigen CRM-Aktionen.',
    'youSayLabel': 'Du sagst',
    'voicelinkLabel': 'VoiceLink tut',
    'examples': [
        {
            'youSay': '"Gerade Jan bei Delta NV getroffen. Sie wollen 15% Rabatt auf das Premium-Paket. Follow-up nächsten Freitag."',
            'outcomes': [
                'Meeting-Report auf Delta NV protokolliert',
                'Deal mit Rabatt-Notiz (15%) aktualisiert',
                'Aufgabe "Jan nachfassen" angelegt — fällig Freitag',
            ],
        },
        {
            'youSay': '"Füge Sarah Leclercq als Kontakt bei Delta NV hinzu, sie ist die neue Einkaufsleiterin."',
            'outcomes': [
                'Kontakt Sarah Leclercq angelegt',
                'Mit Delta NV verknüpft, Rolle "Einkaufsleiterin"',
            ],
        },
        {
            'youSay': '"Ich habe gerade 15 Minuten mit Marc Peeters über die Vertragsverlängerung telefoniert. Er will bis Freitag ein neues Angebot."',
            'outcomes': [
                'Anruf auf Marc Peeters protokolliert — 15 Min',
                'Aufgabe "Neues Angebot für Marc" angelegt — fällig Freitag',
            ],
        },
        {
            'youSay': '"Der SEO-Vertrag mit Alpha Solutions ist gewonnen."',
            'outcomes': ['Deal-Status auf Gewonnen aktualisiert', 'Verknüpfte Aufgabe als erledigt markiert'],
        },
    ],
    'tipsTitle': 'Schnelle Tipps',
    'tips': [
        'Echte Namen — "Delta NV" schlägt "diese Firma".',
        'Mehrere Aktionen in einer Nachricht — VoiceLink sortiert sie.',
        '4 Sprachen: EN / NL / FR / DE.',
    ],
}


def merge_locale(lang: str):
    path = LOCALES / f'{lang}.json'
    with path.open(encoding='utf-8') as f:
        data = json.load(f)

    # Replace old `userGuide` (orphaned keys, unused by code) with our new
    # tree, and insert `guidePreview` just after it so the guide strings
    # live together.
    new_data = {}
    inserted_preview = False
    for k, v in data.items():
        if k == 'userGuide':
            new_data['userGuide'] = GUIDE[lang]
            new_data['guidePreview'] = PREVIEW[lang]
            inserted_preview = True
            continue
        new_data[k] = v
    if 'userGuide' not in new_data:
        new_data['userGuide'] = GUIDE[lang]
    if not inserted_preview:
        new_data['guidePreview'] = PREVIEW[lang]

    with path.open('w', encoding='utf-8', newline='\n') as f:
        json.dump(new_data, f, indent=2, ensure_ascii=False)
        f.write('\n')
    print(f'[{lang}] wrote userGuide + guidePreview -> {path.relative_to(ROOT)}')


for lang in ('en', 'nl', 'fr', 'de'):
    merge_locale(lang)
