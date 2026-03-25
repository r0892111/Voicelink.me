# VoiceLink Dashboard Redesign Plan

## Context

The current dashboard is a single monolithic page — everything (status cards, team management, onboarding, tips, support) lives on one screen with no sidebar and no sub-pages. This doesn't feel like a proper SaaS product. The goal is to redesign it into a clean, multi-page dashboard with a left sidebar, separate pages for each concern, and a modern user guide with embedded screen recordings.

---

## Current Pricing Structure (for reference)

Found in `src/components/PricingSection.tsx` — credit-based, per-user pricing:

| Tier | Price/user/month | Credits/user/month | ~Voice Messages |
|------|------------------|--------------------|-----------------|
| **Free Trial** | €0 | 100 | 10–14 |
| **Starter** | €24 | 350 | 35–50 |
| **Professional** | €59 | 1,000 | 100–142 |
| **Business** | €109 | 2,000 | 200–285 |

- Auto top-up: €7 per 100 credits
- Annual billing: 20% discount
- Professional & Business have volume discounts (5–18% off based on team size)

The seat-based config in `src/config/teamPricing.ts` is **NOT the one going live.** The credit-based model above is the actual pricing.

---

## Overall Layout

**Before:** Single `/dashboard` page, no sidebar, global nav pill on top.

**After:** Sidebar shell wrapping all `/dashboard/*` pages.

```
+------------------+---------------------------------------------+
|                  |  [Mobile: hamburger + page title]            |
|   SIDEBAR        |                                             |
|                  |  Page Content                               |
|   Logo           |  (renders based on current route)            |
|                  |                                             |
|   -- Main --     |                                             |
|   Dashboard      |                                             |
|   Team           |                                             |
|   Usage          |                                             |
|                  |                                             |
|   -- Account --  |                                             |
|   Settings       |                                             |
|   Profile        |                                             |
|   Billing        |                                             |
|                  |                                             |
|   -- Help --     |                                             |
|   User Guide     |                                             |
|                  |                                             |
|   [User + Sign Out]                                            |
+------------------+---------------------------------------------+
```

- **Desktop (>=1024px):** Sidebar always visible, 256px wide, white background with subtle right border
- **Mobile:** Sidebar hidden, opens as a slide-in drawer via hamburger button
- **Background:** Clean `#FDFBF7` (porcelain) — the same as the homepage. **Remove the grainy NoiseOverlay** from the dashboard
- The global navigation pill (top bar on the homepage) gets hidden on `/dashboard/*` routes — the sidebar replaces it

---

## Route Structure

```
/dashboard              → DashboardLayout (sidebar + auth guard)
  /dashboard            → DashboardHome (overview, onboarding)
  /dashboard/team       → DashboardTeam (multi-tenancy, admin only)
  /dashboard/usage      → DashboardUsage (credit tracking)
  /dashboard/settings   → DashboardSettings (integrations, preferences)
  /dashboard/profile    → DashboardProfile (user info)
  /dashboard/billing    → DashboardBilling (subscription, invoices)
  /dashboard/guide      → DashboardGuide (user guide + videos)
```

---

## Pages — What Each One Contains

### 1. Dashboard Home (`/dashboard`)

The landing page when you log in. Clean overview, not overloaded.

**For new/incomplete users:**
- Welcome greeting (time-based: "Good morning, Alex")
- 3 status cards in a row: CRM status, WhatsApp status, Subscription status
- Onboarding checklist (connect CRM, connect WhatsApp, send first voice note)
- The WhatsApp connect form appears inline when that step is active
- Subscription banner if trial hasn't started yet

**For fully set-up users:**
- Same greeting + status cards
- "You're all set" card replaces the onboarding checklist
- Quick action buttons: "Send a Voice Note", "Invite Team Member", "View Usage", "User Guide"
- Tips card (condensed, links to full guide)

**What moves OFF this page vs. current dashboard:**
- Team management → its own page
- Support section → accessible via User Guide page
- Detailed subscription management → Billing page

### 2. Team (`/dashboard/team`)

For admins only (members see a "managed by [admin]" message).

- Uses the existing `TeamManagement` component as-is — it's already well built
- Shows seat usage bar, member list, invite flow, WhatsApp status per member
- No changes to the component itself, just moves to its own page

### 3. Usage (`/dashboard/usage`)

Credit consumption tracking.

- **Summary cards:** Credits used / Credits remaining / Days until renewal / Current plan
- **Usage chart:** Visual bar or line chart showing daily/weekly credit consumption
- **Per-user breakdown** (admin only): Table with each team member's usage
- **Auto top-up info:** Current rate, link to billing to manage

> **Note for developer:** This page needs a new Supabase edge function (`get-usage-stats`) to return usage data. If not built yet, show the subscription info we already have + skeleton/placeholder for the chart with "Detailed analytics coming soon."

### 4. Settings (`/dashboard/settings`)

App configuration.

- **CRM Integration:** Connected platform + status + "Reconnect" button
- **WhatsApp Connection:** Current number + status + ability to change number or disconnect
- **Language preference:** Dropdown to switch between EN/NL/FR/DE
- **Notification preferences:** Email toggle(s) — can be placeholder initially

### 5. Profile (`/dashboard/profile`)

User account info.

- **User info card:** Name, email, platform — read-only for CRM-OAuth users (data comes from the CRM)
- **Connected accounts:** Which CRM is linked
- **Account actions:** Sign out, "Delete account" (links to support for now)

### 6. Billing (`/dashboard/billing`)

Subscription and payment management.

- **Current plan card:** Plan name, price, interval, credits included, trial countdown if applicable
- **"Manage Subscription" button** → opens Stripe Customer Portal (existing functionality)
- **Plan comparison cards** for upgrades (if on a lower tier)
- **"View Invoices" button** → Stripe portal
- For team members (non-admin): Just shows "Your subscription is managed by [admin name]"

### 7. User Guide (`/dashboard/guide`)

Modern, visual, step-by-step guide.

**Structure — vertical scroll with sections:**

1. **Overview** — Brief text: what VoiceLink does, how it works at a high level. Clear, simple, non-technical.

2. **Setup Process** — Embedded screen recording showing CRM connection + step-by-step text

3. **WhatsApp Verification** — Screen recording showing:
   - Entering your phone number
   - Receiving the OTP code on WhatsApp
   - Entering the code in the dashboard
   - Step-by-step text alongside

4. **How Voice Notes Flow** — Screen recording showing:
   - Sending a voice note through WhatsApp
   - It appearing in the CRM (Teamleader environment)
   - Typing a message in WhatsApp → showing up in Teamleader
   - Text explanation of the flow

5. **Use Cases** — More screen recordings of practical examples + bulleted descriptions

6. **Best Practices** — Tips cards (speak clearly, keep messages concise, etc.)

7. **Troubleshooting** — FAQ-style accordion (expandable sections)

8. **Still need help?** — Book a call link (Calendly) + support email

**Video embed approach:**
- Videos hosted on **YouTube (unlisted)** — easiest to manage, just upload and embed
- Responsive iframe embed container with rounded corners matching the card style
- A reusable `VideoEmbed` component wraps YouTube iframes with consistent styling
- Video URLs stored as constants in the component — easy to swap when recordings are updated
- YouTube's built-in player handles playback, quality, and mobile responsiveness

---

## Sidebar Navigation Details

**Grouped sections with labels:**
- **Main:** Dashboard, Team, Usage
- **Account:** Settings, Profile, Billing
- **Help:** User Guide

**Active state:** Highlighted background + bold text + left accent border

**Icons:** All from lucide-react (already in the project): `LayoutDashboard`, `Users`, `BarChart3`, `Settings`, `UserCircle`, `CreditCard`, `BookOpen`

**Admin-only items (Team, Billing):**
- Visible to all users, but **greyed out and non-clickable** for team members
- Tooltip or subtle label like "Managed by admin" on hover
- This keeps the sidebar transparent — members can see those features exist

**Footer of sidebar:** User avatar (initials) + name + sign out button

---

## Technical Approach

### New files to create:
- `DashboardLayout.tsx` — Shell: auth guard, sidebar, context provider, `<Outlet />`
- `DashboardSidebar.tsx` — Left navigation
- `DashboardTopBar.tsx` — Mobile header with hamburger
- `DashboardHome.tsx` — Overview page (extracted from current Dashboard.tsx)
- `DashboardTeam.tsx` — Wrapper around existing TeamManagement
- `DashboardUsage.tsx` — Credit tracking page
- `DashboardSettings.tsx` — App settings
- `DashboardProfile.tsx` — User info
- `DashboardBilling.tsx` — Subscription management
- `DashboardGuide.tsx` — User guide with video embeds
- `useDashboardContext.ts` — Shared context hook so sub-pages don't each re-fetch user/subscription/role data

### Files to modify:
- `App.tsx` — Change `/dashboard` from single route to nested routes; hide global nav on dashboard routes
- `TeamManagement.tsx` — Update one link from `/dashboard?tab=billing` to `/dashboard/billing`
- `en.json`, `nl.json`, `fr.json`, `de.json` — Add i18n keys for all new navigation labels and page content

### Files to leave alone:
- All existing hooks (`useAuth`, `useTeamRole`, `useTeamManagement`, `useWhatsAppConnect`) — reused as-is
- `WhatsAppConnectForm.tsx` — reused in DashboardHome onboarding
- `TeamManagement.tsx` / `TeamMemberRow.tsx` — reused in DashboardTeam
- Stripe service, WhatsApp service — all reused

### Key architectural decisions:
1. **DashboardContext** — The layout fetches auth, subscription, role, and WhatsApp status once and shares via React Context. Sub-pages consume this instead of making their own calls.
2. **No NoiseOverlay** on dashboard — conditionally hide it in App.tsx when on `/dashboard/*` routes.
3. **Incremental build** — Phase 1: build the shell + home page (looks the same but now has sidebar). Phase 2: extract existing functionality into separate pages. Phase 3: build new pages (Usage, Guide).

### Backend work needed:
- **Usage page:** New edge function `get-usage-stats` to return credit consumption data per user per period. Until built, the page shows available subscription info + "coming soon" for detailed charts.
- **Video hosting:** Screen recordings will be uploaded to YouTube as unlisted videos. The guide page just needs the embed URLs.

---

## Implementation Order (suggested)

1. Shell: `DashboardLayout` + `DashboardSidebar` + `DashboardTopBar` + context
2. `DashboardHome` — move current Dashboard content here
3. Update `App.tsx` routes + hide global nav on dashboard
4. `DashboardTeam` — wrap existing TeamManagement
5. `DashboardBilling` — extract subscription/portal logic
6. `DashboardProfile` — new, straightforward
7. `DashboardSettings` — new, moderate complexity
8. `DashboardGuide` — content-heavy, video embeds (depends on recordings being ready)
9. `DashboardUsage` — depends on backend edge function
10. i18n keys across all 4 locale files
11. Remove NoiseOverlay from dashboard routes
12. Mobile testing

---

## Verification / Testing

- Navigate to `/dashboard` → should see sidebar + home page
- Click each sidebar item → correct page renders, active state highlights
- Resize to mobile → sidebar collapses, hamburger works, drawer slides in
- Non-admin user → "Team" and "Billing" greyed out in sidebar
- `/dashboard/guide` → videos load, sections scroll, accordions expand
- Stripe portal → still works from Billing page
- WhatsApp connect → still works from Home page onboarding
- Team management → still works from Team page
- All text uses i18n keys, switch language → everything translates
- No grainy noise overlay on any dashboard page
- Homepage still has the clean white background (unchanged)
