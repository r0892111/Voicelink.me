// ── Phone normalisation ──────────────────────────────────────────────────────
// Teamleader stores phone numbers however the user typed them — so we get the
// full range: "+32 473 34 69 35", "0032473346935", "0473346935", "473346935".
// WhatsApp providers (Meta Cloud API, Twilio) all require E.164: `+` followed
// by country code and subscriber digits, 8-15 digits total.
//
// This module returns a best-effort E.164 string, or null when the input is
// too mangled to interpret. Default country is Belgium (+32) because that's
// where our current users are — override per call if that changes.

const E164_RE = /^\+[1-9]\d{7,14}$/;

export function normalizePhone(
  raw: string | null | undefined,
  defaultCountryCode = '32',
): string | null {
  if (!raw) return null;

  // Strip any character that isn't a digit or a leading +.
  // "(+32) 473-34.69 35" → "+32473346935".
  const compact = raw.trim().replace(/[^\d+]/g, '');
  if (!compact) return null;

  let candidate: string;
  if (compact.startsWith('+')) {
    candidate = compact;
  } else if (compact.startsWith('00')) {
    candidate = '+' + compact.slice(2);
  } else if (compact.startsWith('0')) {
    // Local format ("0473...") — assume the configured default country.
    candidate = `+${defaultCountryCode}${compact.slice(1)}`;
  } else {
    // No prefix at all — could be "473..." (local without 0) or
    // "32473..." (CC without +). Heuristic: if it already starts with the
    // default CC and the remaining length is plausible (7-13 digits), treat
    // it as CC-prefixed. Otherwise prepend the default CC.
    if (
      compact.startsWith(defaultCountryCode) &&
      compact.length - defaultCountryCode.length >= 7 &&
      compact.length - defaultCountryCode.length <= 13
    ) {
      candidate = '+' + compact;
    } else {
      candidate = `+${defaultCountryCode}${compact}`;
    }
  }

  return E164_RE.test(candidate) ? candidate : null;
}
