Voicelink.me

## Internationalization (i18n) Implementation

This project includes comprehensive internationalization support with the following features:

### Supported Languages
- English (en) - Default
- Dutch (nl)
- French (fr)
- German (de)

### Libraries Used
- **react-i18next**: React integration for i18next
- **i18next**: Core internationalization framework
- **i18next-browser-languagedetector**: Automatic language detection
- **i18next-http-backend**: Loading translations from files
- **date-fns**: Date and time formatting with locale support

### Features Implemented

#### 1. Text Translation
- Separate JSON files for each language in `src/i18n/locales/`
- Nested translation keys for better organization
- Interpolation support for dynamic content
- Pluralization support

#### 2. Date/Time Formatting
- Locale-aware date formatting using date-fns
- Relative time formatting (e.g., "2 hours ago")
- Time distance formatting
- Automatic locale detection and application

#### 3. Number Formatting
- Currency formatting with proper locale symbols
- Number formatting with locale-specific separators
- Percentage formatting
- Intl.NumberFormat integration

#### 4. RTL Layout Support
- Automatic RTL detection for Arabic, Hebrew, etc.
- CSS classes for RTL-specific styling
- Document direction and language attributes
- Spacing and positioning adjustments

### Usage Examples

#### Basic Translation
```tsx
import { useI18n } from '../hooks/useI18n';

const MyComponent = () => {
  const { t } = useI18n();
  
  return <h1>{t('hero.title')}</h1>;
};
```

#### With Interpolation
```tsx
const { t } = useI18n();

// Translation: "Welcome back, {{name}}!"
return <h1>{t('dashboard.welcome', { name: user.name })}</h1>;
```

#### Number and Currency Formatting
```tsx
const { currency, number, percentage } = useI18n();

return (
  <div>
    <p>Price: {currency(29.90)}</p>
    <p>Users: {number(1250)}</p>
    <p>Discount: {percentage(20)}</p>
  </div>
);
```

#### Date Formatting
```tsx
const { date, relativeTime } = useI18n();

return (
  <div>
    <p>Created: {date(new Date(), 'PPP')}</p>
    <p>Last seen: {relativeTime(lastSeen)}</p>
  </div>
);
```

### File Structure
```
src/
├── i18n/
│   ├── index.ts              # i18n configuration
│   └── locales/
│       ├── en.json           # English translations
│       ├── nl.json           # Dutch translations
│       ├── fr.json           # French translations
│       └── de.json           # German translations
├── hooks/
│   └── useI18n.ts           # Custom i18n hook
├── utils/
│   └── i18n.ts              # Formatting utilities
└── components/
    ├── LanguageSwitcher.tsx  # Language selection component
    └── RTLProvider.tsx       # RTL layout provider
```

### Adding New Languages

1. Create a new JSON file in `src/i18n/locales/` (e.g., `es.json`)
2. Add the language to the resources in `src/i18n/index.ts`
3. Add the language option to `src/components/LanguageSwitcher.tsx`
4. Add date-fns locale import in `src/utils/i18n.ts`

### Adding New Translations

1. Add the key-value pair to all language files
2. Use nested objects for better organization:
   ```json
   {
     "dashboard": {
       "welcome": "Welcome back, {{name}}!",
       "settings": {
         "title": "Settings",
         "save": "Save Changes"
       }
     }
   }
   ```

### Best Practices

1. **Consistent Key Naming**: Use descriptive, hierarchical keys
2. **Avoid Inline Text**: Always use translation keys instead of hardcoded text
3. **Context-Aware Keys**: Group related translations together
4. **Interpolation**: Use variables for dynamic content
5. **Pluralization**: Handle singular/plural forms properly
6. **RTL Testing**: Test layout with RTL languages
7. **Date Formats**: Use appropriate date formats for each locale
8. **Number Formats**: Respect locale-specific number formatting

### Language Detection

The system automatically detects user language preference from:
1. localStorage (user's previous selection)
2. Browser navigator language
3. HTML lang attribute
4. Falls back to English if none found

### Performance Considerations

- Translations are loaded synchronously for better UX
- Language switching is instant without page reload
- Date-fns locales are imported only when needed
- RTL styles are applied conditionally
