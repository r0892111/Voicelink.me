"""One-off: add the `invite` namespace to all four locale files.
Placed next to `teamManagement` so related team features live together."""
import json, io, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
LOCALES = ROOT / 'src' / 'i18n' / 'locales'

TRANSLATIONS = {
    'en': {
        'verifying': 'Verifying your invitation…',
        'title': "You're invited to VoiceLink",
        'description': '{{name}} wants you to join their team on VoiceLink. Connect your Teamleader account in one click to get started.',
        'invitedYou': 'Invited you to their team',
        'acceptCta': 'Accept & Connect Teamleader',
        'termsNotice': 'By continuing, you agree to the SaaS Agreement and Privacy Policy.',
        'expiredTitle': 'This invitation has expired',
        'expiredMessage': 'Ask your admin to send you a new invitation link.',
        'invalidTitle': 'Invitation not found',
        'invalidMessage': 'This invitation link is invalid or has already been used.',
    },
    'nl': {
        'verifying': 'Uitnodiging controleren…',
        'title': 'Je bent uitgenodigd voor VoiceLink',
        'description': '{{name}} wil je toevoegen aan hun VoiceLink-team. Koppel je Teamleader-account met één klik om te beginnen.',
        'invitedYou': 'Heeft je uitgenodigd voor hun team',
        'acceptCta': 'Accepteren & Teamleader koppelen',
        'termsNotice': 'Door verder te gaan ga je akkoord met de SaaS-overeenkomst en het Privacybeleid.',
        'expiredTitle': 'Deze uitnodiging is verlopen',
        'expiredMessage': 'Vraag je admin om een nieuwe uitnodigingslink te sturen.',
        'invalidTitle': 'Uitnodiging niet gevonden',
        'invalidMessage': 'Deze uitnodigingslink is ongeldig of al gebruikt.',
    },
    'fr': {
        'verifying': 'Vérification de votre invitation…',
        'title': 'Vous êtes invité à rejoindre VoiceLink',
        'description': "{{name}} souhaite vous ajouter à son équipe VoiceLink. Connectez votre compte Teamleader en un clic pour commencer.",
        'invitedYou': 'Vous a invité à rejoindre son équipe',
        'acceptCta': 'Accepter & connecter Teamleader',
        'termsNotice': "En continuant, vous acceptez le Contrat SaaS et la Politique de confidentialité.",
        'expiredTitle': 'Cette invitation a expiré',
        'expiredMessage': "Demandez à votre administrateur de vous envoyer un nouveau lien d'invitation.",
        'invalidTitle': 'Invitation introuvable',
        'invalidMessage': "Ce lien d'invitation est invalide ou a déjà été utilisé.",
    },
    'de': {
        'verifying': 'Einladung wird überprüft…',
        'title': 'Du bist zu VoiceLink eingeladen',
        'description': '{{name}} möchte dich zum VoiceLink-Team hinzufügen. Verbinde dein Teamleader-Konto mit einem Klick, um loszulegen.',
        'invitedYou': 'Hat dich zum Team eingeladen',
        'acceptCta': 'Annehmen & Teamleader verbinden',
        'termsNotice': 'Durch Fortfahren akzeptierst du die SaaS-Vereinbarung und die Datenschutzerklärung.',
        'expiredTitle': 'Diese Einladung ist abgelaufen',
        'expiredMessage': 'Bitte deinen Admin, dir einen neuen Einladungslink zu senden.',
        'invalidTitle': 'Einladung nicht gefunden',
        'invalidMessage': 'Dieser Einladungslink ist ungültig oder wurde bereits verwendet.',
    },
}

# Preserve original key order; insert `invite` just before `teamManagement`
# so related team-flow strings live next to each other in every locale.
for lang, strings in TRANSLATIONS.items():
    path = LOCALES / f'{lang}.json'
    with path.open(encoding='utf-8') as f:
        data = json.load(f)

    if 'invite' in data:
        print(f'[{lang}] already has `invite` namespace, updating in place')
        data['invite'] = strings
    else:
        # Rebuild dict preserving key order, inserting `invite` before `teamManagement`
        new_data = {}
        inserted = False
        for k, v in data.items():
            if k == 'teamManagement' and not inserted:
                new_data['invite'] = strings
                inserted = True
            new_data[k] = v
        if not inserted:
            new_data['invite'] = strings  # fallback: append at end
        data = new_data

    with path.open('w', encoding='utf-8', newline='\n') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')
    print(f'[{lang}] wrote {len(strings)} invite keys -> {path.relative_to(ROOT)}')
