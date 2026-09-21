// Browser tests (npm run test:e2e). Chromium once: `npx playwright install chromium`.
//
// They run against a production build served here with DUMMY Supabase values — every
// Supabase call a page makes is either irrelevant to the test or mocked with
// page.route(). Shell values win over .env files in Vite, so a developer's
// real .env never leaks into a run. Nothing here talks to a real backend.
import { defineConfig } from '@playwright/test';

export const E2E_ANON_KEY = 'dummy-anon-key-for-e2e';

export default defineConfig({
  testDir: 'e2e',
  timeout: 45_000,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    locale: 'en-US',
    headless: true,
    viewport: { width: 1280, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  // The PRODUCTION bundle, not `vite dev`: React 18 StrictMode double-mounts
  // in dev and DashboardLayout's `mounted` ref never recovers from the
  // simulated unmount, so the dashboard sits on its loader forever there.
  // The build bakes the dummy env below in (VITE_* is read at build time).
  webServer: {
    command: 'npx vite build --outDir dist-e2e --logLevel warn && npx vite preview --outDir dist-e2e --port 3000 --strictPort',
    url: 'http://localhost:3000/signup',
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      VITE_SUPABASE_URL: 'https://example-project.supabase.co',
      VITE_SUPABASE_ANON_KEY: E2E_ANON_KEY,
      VITE_VLAGENT_URL: 'http://127.0.0.1:8000',
    },
  },
});
