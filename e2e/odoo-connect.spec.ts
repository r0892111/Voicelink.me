// The Odoo connect form on /signup (AuthPage.renderOdooConnect, spec
// VoiceLink docs/crm-onboarding/odoo/specs/D3-portal.md OD-17) and its
// contract with the odoo-connect edge function (OD-18), which is MOCKED at
// the network layer here: what the browser sends, what it never stores, how
// every error code renders, where success lands. The function itself and
// the VoiceLink round-trip are the OD-20 acceptance test, not this file.
import { test, expect, type Page } from '@playwright/test';
import { E2E_ANON_KEY } from '../playwright.config';

const FN = '**/functions/v1/odoo-connect';
const KEY = 'abcd1234efgh5678ijkl9012mnop3456qrst7890';

async function openForm(page: Page) {
  await page.addInitScript(() => {
    try { localStorage.setItem('i18nextLng', 'en'); } catch { /* storage blocked: the page falls back to English anyway */ }
  });
  await page.goto('/signup?enable=odoo');
  const btn = page.getByRole('button', { name: /Continue with Odoo/ });
  await expect(btn).toBeEnabled();
  await btn.click();
  await expect(page.getByRole('heading', { name: 'Connect Odoo' })).toBeVisible();
}

async function fill(page: Page, { url = 'https://finit-solutions.odoo.com/', db, login = 'voicelink@finit.be', key = KEY }: { url?: string; db?: string; login?: string; key?: string } = {}) {
  await page.fill('#odoo-url', url);
  if (db !== undefined) await page.fill('#odoo-db', db);
  await page.fill('#odoo-login', login);
  await page.fill('#odoo-key', key);
}

test('without ?enable=odoo the Odoo button is "coming soon" and disabled', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('i18nextLng', 'en'); } catch { /* see openForm */ } });
  await page.goto('/signup');
  const btn = page.getByRole('button', { name: /Continue with Odoo/ });
  await expect(btn).toBeDisabled();
  await expect(btn).toContainText(/coming soon/i);
});

test('the form pre-fills the database from an Odoo Online address, not from a self-hosted one, and never overwrites a typed one', async ({ page }) => {
  await openForm(page);
  await page.fill('#odoo-url', 'https://finit-solutions.odoo.com');
  await expect(page.locator('#odoo-db')).toHaveValue('finit-solutions');
  await page.fill('#odoo-url', 'https://odoo.acme.be');
  await expect(page.locator('#odoo-db')).toHaveValue('');
  await page.fill('#odoo-db', 'acme_prod');
  await page.fill('#odoo-url', 'https://acme.odoo.com');
  await expect(page.locator('#odoo-db')).toHaveValue('acme_prod');
});

test('an http:// address is refused before anything is sent', async ({ page }) => {
  let called = false;
  await page.route(FN, async (route) => { called = true; await route.fulfill({ status: 500, body: '{}' }); });
  await openForm(page);
  await fill(page, { url: 'http://finit-solutions.odoo.com', db: 'finit-solutions' });
  await page.getByRole('button', { name: 'Connect Odoo' }).click();
  await expect(page.getByText(/must start with https:\/\//)).toBeVisible();
  expect(called).toBe(false);
});

test('success: trimmed fields, the key without whitespace, session_url followed, the key never stored', async ({ page }) => {
  let sent: Record<string, unknown> | null = null;
  let headers: Record<string, string> | null = null;
  await page.route(FN, async (route) => {
    sent = route.request().postDataJSON();
    headers = route.request().headers();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, session_url: 'http://localhost:3000/?e2e=session-followed' }),
    });
  });
  await openForm(page);
  // pasted with spaces and a line break; address with a trailing slash
  await fill(page, { url: 'https://finit-solutions.odoo.com/', key: `  ${KEY.slice(0, 20)} \n ${KEY.slice(20)}  ` });
  await expect(page.locator('#odoo-db')).toHaveValue('finit-solutions');
  await page.getByRole('button', { name: 'Connect Odoo' }).click();
  await page.waitForURL(/e2e=session-followed/);

  expect(sent).toEqual({
    url: 'https://finit-solutions.odoo.com',
    db: 'finit-solutions',
    login: 'voicelink@finit.be',
    api_key: KEY,
    redirect_uri: 'http://localhost:3000/dashboard',
    language: 'en',
  });
  expect(headers!['authorization']).toBe(`Bearer ${E2E_ANON_KEY}`);

  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }));
  expect(stored).not.toContain(KEY.slice(0, 12));
  expect(stored).toContain('"userPlatform":"odoo"');
  expect(page.url()).not.toContain(KEY.slice(0, 12));
});

const ERROR_CASES: Array<[string, RegExp]> = [
  ['odoo_bad_credentials', /Odoo rejected the login or the API key/],
  ['odoo_db_unknown', /does not know that database name/],
  ['odoo_crm_missing', /CRM app is not installed/],
  ['odoo_plan_gate', /Custom plan/],
  ['odoo_unreachable', /No Odoo answered/],
];
for (const [code, expected] of ERROR_CASES) {
  test(`error code ${code} renders its own message and stays on the form`, async ({ page }) => {
    await page.route(FN, (route) => route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ success: false, code, error: 'server text' }) }));
    await openForm(page);
    await fill(page, { db: 'finit-solutions' });
    await page.getByRole('button', { name: 'Connect Odoo' }).click();
    await expect(page.getByText(expected)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Connect Odoo' })).toBeVisible();
  });
}

test('an unknown code shows the server text; an empty 502 shows the generic line', async ({ page }) => {
  await page.route(FN, (route) => route.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ success: false, code: 'claim_failed', error: 'VoiceLink said something specific' }) }));
  await openForm(page);
  await fill(page, { db: 'finit-solutions' });
  await page.getByRole('button', { name: 'Connect Odoo' }).click();
  await expect(page.getByText('VoiceLink said something specific')).toBeVisible();

  await page.unroute(FN);
  await page.route(FN, (route) => route.fulfill({ status: 502, body: '' }));
  await page.getByRole('button', { name: 'Connect Odoo' }).click();
  await expect(page.getByText('Something went wrong. Please try again.')).toBeVisible();
});

test('back returns to the provider list', async ({ page }) => {
  await openForm(page);
  await page.getByRole('button', { name: /Back to login options/ }).click();
  await expect(page.getByRole('button', { name: /Continue with Odoo/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Connect Odoo' })).toHaveCount(0);
});

test('on a short viewport the Connect button can be reached by scrolling (the page is overflow-hidden)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openForm(page);
  const btn = page.getByRole('button', { name: 'Connect Odoo' });
  // wheel-scroll like a user — scrollIntoView can move an overflow-hidden
  // box the user cannot
  for (let i = 0; i < 12; i++) await page.mouse.wheel(0, 200);
  await page.waitForTimeout(300);
  const box = await btn.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(720);
});
