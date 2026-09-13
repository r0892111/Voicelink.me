# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VoiceLink (voicelink.me) is a SaaS product that integrates WhatsApp with CRM platforms (Teamleader, Pipedrive, Odoo). It's a React SPA with a Supabase backend and Stripe billing.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build (TypeScript + Vite)
- `npm run lint` — ESLint across the project
- `npm run preview` — Preview production build locally

No test framework is configured.

## Architecture

**Frontend:** React 18 + TypeScript + Vite + Tailwind CSS 3 + react-router-dom v7

**Backend:** Supabase (auth, database, edge functions). No custom backend server — the frontend talks directly to Supabase and its edge functions.

**Key integrations:**
- **CRM OAuth:** Teamleader, Pipedrive, and Odoo via `src/services/authService.ts`. Each CRM has its own OAuth flow and `{platform}_users` table in Supabase. Catermonkey (platform key `catermonkey_mcp`, table `catermonkey_mcp_users`) is different: its OAuth runs in the VoiceLink backend over MCP; the portal only redeems a handoff token in `supabase/functions/catermonkey-mcp-auth` (identity only — the CRM tokens never reach this project).
- **Stripe:** Checkout sessions created via Supabase edge function (`supabase/functions/create-stripe-customer`, `stripe-checkout`). Client-side in `src/services/stripeService.ts` and `src/lib/stripe.ts`.
- **WhatsApp:** Verification and OTP flows via Supabase edge functions (`whatsapp-otp`, `whatsapp-verify-external`, `whatsapp-welcome`).

**Auth flow:** `useAuth` hook (`src/hooks/useAuth.ts`) manages auth state. It checks Supabase session, then resolves the user's CRM platform by querying `{platform}_users` tables. Platform is cached in localStorage (`userPlatform`, `auth_provider`). OAuth callbacks land at `/auth/:platform/callback`.

**Routing:** All routes defined in `src/App.tsx`. Main routes:
- `/` — Homepage
- `/landing` — Standalone landing page (no nav bar)
- `/lp/*` — Industry-specific landing pages (field-service, installateurs, b2b-sales)
- `/dashboard` — User dashboard (authenticated)
- `/test` — Waitlist signup
- `/whatsapp-auth`, `/verify-whatsapp` — WhatsApp connection flow

**i18n:** react-i18next with 4 languages (en, nl, fr, de). Translation files in `src/i18n/locales/`. Use the `useI18n` hook for translations, date/number formatting. When adding UI text, add keys to all 4 locale JSON files.

**Consent/Cookies:** `ConsentProvider` context wraps the app. `CookieBanner` and `CookieSettingsModal` handle GDPR consent.

**UTM tracking:** `src/utils/utm.ts` provides `withUTM()` helper to preserve UTM params across navigation. Initialized in `main.tsx`.

## Environment Variables

All prefixed with `VITE_`:
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_TEAMLEADER_CLIENT_ID`, `VITE_TEAMLEADER_REDIRECT_URI`
- `VITE_PIPEDRIVE_CLIENT_ID`
- `VITE_ODOO_CLIENT_ID`, `VITE_ODOO_AUTH_URL`
- `VITE_VLAGENT_URL` — public base of the VoiceLink backend (VLAgent). Used by the Catermonkey button on `/signup`: the MCP OAuth flow runs there (`/oauth/mcp/start?server=catermonkey&return_to=<this origin>`) and returns to `/auth/catermonkey_mcp/callback?handoff=…`, which `catermonkey-mcp-auth` redeems. Dev: `http://127.0.0.1:8000` (the backend must list this origin in its `MCP_ONBOARDING_RETURN_ORIGINS`).

## Supabase

- Edge functions in `supabase/functions/`
- Migrations in `supabase/migrations/`
- Single Supabase client instance in `src/lib/supabase.ts` — always import from there

## Conventions

- Components are in `src/components/` as individual `.tsx` files (no subdirectories)
- Landing pages use a template pattern (`LandingPageTemplate.tsx`)
- Tailwind for all styling — no CSS modules or styled-components
- Icons from `lucide-react`
- All user-facing text must use i18n translation keys, not hardcoded strings
