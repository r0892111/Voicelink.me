export interface CountryCode {
  code: string;
  label: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+32', label: 'BE +32' },
  { code: '+31', label: 'NL +31' },
  { code: '+33', label: 'FR +33' },
  { code: '+49', label: 'DE +49' },
  { code: '+44', label: 'GB +44' },
  { code: '+352', label: 'LU +352' },
];

export const DEFAULT_COUNTRY_CODE = '+32';
