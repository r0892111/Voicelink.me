// Browser tests (npm run test:e2e). Chromium once: `npx playwright install chromium`.
//
// They run against `vite dev` started here with DUMMY Supabase values — every
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
  webServer: {
    command: 'npx vite --port 3000 --strictPort',
    url: 'http://localhost:3000/signup',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      VITE_SUPABASE_URL: 'https://example-project.supabase.co',
      VITE_SUPABASE_ANON_KEY: E2E_ANON_KEY,
      VITE_VLAGENT_URL: 'http://127.0.0.1:8000',
    },
  },
});
