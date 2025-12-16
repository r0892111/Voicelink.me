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
- Stored in Supabase `analytics_events` table
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
1. Retrieves stored UTM parameters
2. Checks user consent preferences
3. Sends event to Supabase with all data

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
5. Event stored in database with:
   - button_id: 'start_free_trial'
   - page_path: '/'
   - utm_source: 'google'
   - utm_medium: 'cpc'
   - user_id: (if logged in)
   - timestamp: current time
```

## Privacy & Consent

- Analytics tracking respects user consent preferences
- Users must accept analytics cookies via the cookie banner
- Managed through `ConsentContext` (`src/contexts/ConsentContext.tsx`)
- No tracking occurs if user declines analytics consent

## Database Schema

Analytics events are stored in the `analytics_events` table:

```sql
CREATE TABLE analytics_events (
  id uuid PRIMARY KEY,
  event_type text NOT NULL,
  button_id text,
  page_path text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  user_id uuid,
  created_at timestamptz DEFAULT now()
);
```

## Querying Analytics Data

### Find top-performing campaigns
```sql
SELECT
  utm_campaign,
  COUNT(*) as clicks,
  COUNT(DISTINCT user_id) as unique_users
FROM analytics_events
WHERE event_type = 'cta_click'
GROUP BY utm_campaign
ORDER BY clicks DESC;
```

### Track conversion funnel
```sql
SELECT
  button_id,
  COUNT(*) as clicks
FROM analytics_events
WHERE utm_source = 'google'
  AND event_type = 'cta_click'
GROUP BY button_id
ORDER BY clicks DESC;
```

### Analyze by traffic source
```sql
SELECT
  utm_source,
  utm_medium,
  COUNT(*) as total_clicks,
  COUNT(DISTINCT user_id) as unique_users
FROM analytics_events
WHERE event_type = 'cta_click'
GROUP BY utm_source, utm_medium
ORDER BY total_clicks DESC;
```

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
