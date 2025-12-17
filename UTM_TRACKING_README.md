# UTM Tracking & Analytics

This document explains how UTM parameters and analytics tracking work throughout the application.

## Overview

The application captures UTM parameters from URLs and tracks user interactions with call-to-action (CTA) buttons. This enables marketing attribution analysis to understand which campaigns drive engagement.

## How It Works

### 1. UTM Parameter Capture

When users visit the site with UTM parameters in the URL (e.g., `?utm_source=google&utm_medium=cpc&utm_campaign=spring_sale`), these parameters are:

- **Captured** by `src/utils/utm.ts`
- **Stored** in `sessionStorage` for the duration of the session
- **Automatically included** in all analytics events

#### Supported UTM Parameters

- `utm_source` - Identifies the source (e.g., google, facebook, newsletter)
- `utm_medium` - Identifies the medium (e.g., cpc, email, social)
- `utm_campaign` - Identifies the campaign name
- `utm_term` - Identifies paid search keywords
- `utm_content` - Differentiates similar content or links

### 2. Analytics Tracking

All CTA clicks are tracked using the `trackCTAClick()` function from `src/utils/analytics.ts`.

**What Gets Tracked:**
- Button identifier (e.g., `start_free_trial`, `watch_demo`)
- Current page path
- All UTM parameters (if present)
- Timestamp

**Where Data Goes:**
- **Google Analytics** via `window.gtag()` (Tracking ID: `G-V2GHSHWX23`)
  - Events sent as `CTA_click` with all parameters
  - Visible in Google Analytics dashboard under Events
- Only tracked if user has given analytics consent
- Includes user ID if authenticated

### 3. Tracked CTAs on Homepage

The following CTAs on the homepage (`src/components/Homepage.tsx`) are tracked:

| Button | Event ID | Description |
|--------|----------|-------------|
| Contact for Custom | `contact_for_custom` | Opens contact modal for custom integrations |
| Custom Integration CTA | `custom_integration_cta` | CTA in "How It Works" section |
| Schedule Custom Demo | `schedule_custom_demo` | Opens Calendly booking link |
| Discuss Your Needs | `discuss_your_needs` | Opens contact modal |
| Start Free Trial | `start_free_trial` | Opens authentication modal |
| Watch Demo | `watch_demo` | Opens YouTube demo video |

## Implementation Example

```typescript
// Button with UTM tracking
<button
  onClick={() => {
    trackCTAClick('start_free_trial', '/');
    openModal();
  }}
>
  Start Free Trial
</button>
```

The `trackCTAClick()` function automatically:
1. Retrieves stored UTM parameters from sessionStorage
2. Checks user consent preferences
3. Sends event to Google Analytics via gtag with all parameters

## Data Flow

```
1. User visits: example.com/?utm_source=google&utm_medium=cpc
   ↓
2. UTM params stored in sessionStorage
   ↓
3. User clicks "Start Free Trial" button
   ↓
4. trackCTAClick() called with button_id='start_free_trial'
   ↓
5. Event sent to Google Analytics via gtag:
   - event: 'CTA_click'
   - cta_name: 'start_free_trial'
   - lp_path: '/'
   - page_location: full URL
   - utm_source: 'google'
   - utm_medium: 'cpc'
   - utm_campaign: (if present)
   - utm_term: (if present)
   - utm_content: (if present)
```

## Privacy & Consent

- Analytics tracking respects user consent preferences
- Users must accept analytics cookies via the cookie banner
- Managed through `ConsentContext` (`src/contexts/ConsentContext.tsx`)
- No tracking occurs if user declines analytics consent

## Viewing Data in Google Analytics

All CTA events are sent to Google Analytics (ID: `G-V2GHSHWX23`). To view them:

1. **Go to Google Analytics** → Events
2. **Look for event:** `CTA_click`
3. **View event parameters:**
   - `cta_name` - Which button was clicked
   - `lp_path` - Which page the click occurred on
   - `utm_source`, `utm_medium`, `utm_campaign` - Campaign attribution
   - `page_location` - Full URL with query parameters

### Creating Custom Reports

You can create custom reports in GA4 to analyze:
- Which CTAs drive the most engagement
- Which campaigns lead to trial signups
- Conversion paths by traffic source
- A/B testing different campaign parameters

### Example GA4 Explorations

**Top Performing CTAs:**
- Dimension: Event name (`CTA_click`)
- Breakdown: `cta_name` parameter
- Metric: Event count

**Campaign Performance:**
- Dimension: `utm_campaign` parameter
- Secondary dimension: `cta_name` parameter
- Metric: Event count, Users

**Traffic Source Analysis:**
- Dimension: `utm_source` parameter
- Secondary dimension: `utm_medium` parameter
- Breakdown: `cta_name` parameter
- Metric: Event count

## Adding Tracking to New Buttons

To add tracking to a new CTA button:

1. Import the tracking function:
```typescript
import { trackCTAClick } from '../utils/analytics';
```

2. Wrap the button's onClick handler:
```typescript
<button
  onClick={() => {
    trackCTAClick('your_button_id', '/current-page');
    // ... existing onClick logic
  }}
>
  Your Button Text
</button>
```

3. Choose a descriptive `button_id` using snake_case
4. Provide the current page path as the second parameter

## Testing

To test UTM tracking:

1. Visit with UTM parameters: `http://localhost:5173/?utm_source=test&utm_medium=manual&utm_campaign=testing`
2. Click any tracked CTA button
3. Check the `analytics_events` table in Supabase
4. Verify the event includes the UTM parameters

## Notes

- UTM parameters persist throughout the user's session
- Parameters are cleared when the browser tab is closed
- Multiple clicks from the same user are tracked separately
- All timestamps are in UTC
