# ICP Landing Pages & UTM Tracking Implementation

## Overview
This implementation adds 3 ICP-specific landing pages with UTM parameter tracking and persistence across the entire user journey.

## What Was Added

### 1. UTM Tracking Utility (`src/utils/utm.ts`)
A comprehensive utility that:
- Extracts UTM parameters from URL query strings
- Persists UTM params in localStorage
- Automatically appends UTM params to CTA links
- Provides React hook `useUTM()` for easy integration

**Supported UTM Parameters:**
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`

### 2. Landing Pages

#### Route: `/lp/field-service`
**Target:** Field service companies
- Hero: "Work orders & follow-ups in your CRM in 10 seconds (with voice)."
- Focus: Fast updates after interventions, no admin backlog
- Component: `FieldServiceLanding.tsx`

#### Route: `/lp/installateurs`
**Target:** Installers/contractors
- Hero: "From site notes to CRM updates — without the hassle."
- Focus: Site visits, change requests, project updates
- Component: `InstallatorsLanding.tsx`

#### Route: `/lp/b2b-sales`
**Target:** B2B sales teams
- Hero: "Keep Pipedrive/Teamleader up-to-date while you're on the road."
- Focus: Real pipeline, no missed follow-ups
- Component: `B2BSalesLanding.tsx`

### 3. Shared Template (`LandingPageTemplate.tsx`)
Reusable landing page component that:
- Matches homepage design and styling
- Supports customizable hero copy and bullets
- Includes 2 CTAs: "Get Started Free" and "Watch Demo"
- Shows integration logos and trust indicators
- Automatically appends UTM params to all CTA links

## How UTM Tracking Works

### 1. Initial Visit
When a user visits any page with UTM parameters:
```
/lp/b2b-sales?utm_source=linkedin&utm_campaign=sprint1_icp3_outbound&utm_content=variant_a
```

The UTM params are automatically:
1. Extracted from the URL
2. Stored in localStorage under key `"utm"`
3. Available throughout the session

### 2. Link Click Tracking
Links marked with `data-append-utm="true"` automatically get UTM params appended:

```tsx
<button data-append-utm="true" onClick={() => navigate('/test')}>
  Get Started Free
</button>
```

When clicked, the user navigates to:
```
/test?utm_source=linkedin&utm_campaign=sprint1_icp3_outbound&utm_content=variant_a
```

### 3. Persistence
UTM params persist across:
- Page navigation
- Browser refreshes
- Multiple sessions (stored in localStorage)

## Testing & Verification

### Test 1: UTM Capture
1. Visit: `/lp/b2b-sales?utm_source=linkedin&utm_campaign=test&utm_content=variant_a`
2. Open browser console
3. Check localStorage: `localStorage.getItem('utm')`
4. Should see: `{"utm_source":"linkedin","utm_campaign":"test","utm_content":"variant_a"}`

### Test 2: UTM Append on CTA
1. Visit landing page with UTM params (as above)
2. Click "Get Started Free" button
3. Verify redirect URL includes all UTM params
4. Expected: `/test?utm_source=linkedin&utm_campaign=test&utm_content=variant_a`

### Test 3: UTM Persistence
1. Visit landing page with UTMs
2. Navigate to homepage (click logo)
3. Return to landing page
4. Click CTA - UTMs should still be appended

### Test 4: Multiple Landing Pages
Test each landing page independently:
- `/lp/field-service?utm_source=google&utm_campaign=field_service_ads`
- `/lp/installateurs?utm_source=facebook&utm_campaign=installer_campaign`
- `/lp/b2b-sales?utm_source=linkedin&utm_campaign=sales_outreach`

## Files Changed

### New Files
1. `src/utils/utm.ts` - UTM tracking utility
2. `src/components/LandingPageTemplate.tsx` - Shared landing page component
3. `src/components/FieldServiceLanding.tsx` - Field service landing page
4. `src/components/InstallatorsLanding.tsx` - Installers landing page
5. `src/components/B2BSalesLanding.tsx` - B2B sales landing page

### Modified Files
1. `src/main.tsx` - Added `initializeUTMTracking()` call
2. `src/App.tsx` - Added 3 new routes for landing pages

## Design Consistency

All landing pages:
- Use the same color scheme as homepage (#1C2C55 navy, #F7E69B yellow)
- Reuse typography and button styles
- Include platform integration logos
- Show trust indicators (1-click setup, real-time sync, secure OAuth)
- Mobile responsive with proper breakpoints

## Navigation Behavior

On landing pages:
- Back arrow appears (clicking returns to homepage)
- Homepage-specific links (Features, Pricing) are hidden
- Language switcher and user menu remain visible
- Clean, focused experience for conversion

## Future Enhancements

To create additional ICP landing pages:

1. Create new component (e.g., `ManufacturingLanding.tsx`):
```tsx
import React from 'react';
import { LandingPageTemplate } from './LandingPageTemplate';

export const ManufacturingLanding: React.FC = () => {
  return (
    <LandingPageTemplate
      hero={{
        title: 'Your custom hero title',
        subtitle: 'Your custom subtitle',
        bullets: [
          'Bullet point 1',
          'Bullet point 2',
          'Bullet point 3',
        ],
      }}
    />
  );
};
```

2. Add route in `App.tsx`:
```tsx
<Route path="/lp/manufacturing" element={<ManufacturingLanding />} />
```

## Analytics Integration

UTM params are now captured and can be:
- Sent to analytics platforms (Google Analytics, Mixpanel, etc.)
- Included in signup/conversion tracking
- Used for campaign performance analysis
- Tracked through the entire user journey

The current implementation stores UTMs locally but does NOT automatically send them to GA4 or other analytics tools. This was intentional per requirements (no GA4 work in this task).

## Support & Maintenance

All code is well-commented and follows the existing codebase patterns. The UTM utility is self-contained and can be easily extended with additional parameters or tracking features if needed.
