// The Odoo Experience QR page (/lp/odoo-experience?ref=oxp): the 2-month
// Professional promo travels from the landing page through the Odoo sign-up to
// the dashboard, which grants it via provision-promo-subscription — after
// odoo-account has made sure the account's billing row exists. Supabase Auth,
// REST and the edge functions are MOCKED; the function's own table choice is
// covered by its deploy check, not here.
import { test, expect, type Page, type Route } from '@playwright/test';

const USER_ID = '22222222-2222-4222-8222-222222222222';
const EMAIL = 'visitor@odoo-experience.be';

const b64url = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
const now = () => Math.floor(Date.now() / 1000);
const fakeJwt = () => `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url({ sub: USER_ID, email: EMAIL, role: 'authenticated', aud: 'authenticated', iat: now(), exp: now() + 3600 })}.sig`;

const authUser = (meta: Record<string, unknown> = {}) => ({
  id: USER_ID, aud: 'authenticated', role: 'authenticated', email: EMAIL,
  email_confirmed_at: '2026-09-24T09:00:00Z', confirmed_at: '2026-09-24T09:00:00Z', last_sign_in_at: '2026-09-24T09:00:00Z',
  app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: { provider: 'odoo', name: 'visitor', ...meta },
  identities: [{ identity_id: 'i1', id: USER_ID, user_id: USER_ID, provider: 'email', identity_data: { email: EMAIL } }],
  created_at: '2026-09-24T09:00:00Z', updated_at: '2026-09-24T09:00:00Z',
});
const session = (meta: Record<string, unknown> = {}) => ({ access_token: fakeJwt(), token_type: 'bearer', expires_in: 3600, expires_at: now() + 3600, refresh_token: 'r-1', user: authUser(meta) });
const json = (route: Route, body: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

async function english(page: Page) {
  await page.addInitScript(() => { try { localStorage.setItem('i18nextLng', 'en'); } catch { /* falls back to English */ } });
}

/** Dashboard backend for an Odoo account; records the order of the promo calls. */
async function mockDashboard(page: Page, calls: string[], opts: { promoStatus?: number; meta?: Record<string, unknown> } = {}) {
  const row = {
    odoo_user_id: `pending:${USER_ID}`, user_id: USER_ID, env: 'prod', whatsapp_number: null, whatsapp_status: 'not_set',
    is_test_user: false, language: 'en', language_locked: true, is_admin: true, admin_user_id: null, stripe_customer_id: null, deleted_at: null,
  };
  await page.route('**/rest/v1/**', (r) => json(r, []));
  await page.route('**/rest/v1/odoo_users*', (r) => json(r, [row]));
  await page.route('**/functions/v1/**', (r) => json(r, { success: false }));
  await page.route('**/functions/v1/get-subscription*', (r) => json(r, { success: true, subscription: { subscription_status: 'none' } }));
  await page.route('**/functions/v1/odoo-account', (r) => { calls.push('odoo-account'); return json(r, { success: true, status: 'pending', env: 'prod' }); });
  await page.route('**/functions/v1/provision-promo-subscription', (r) => {
    calls.push(`promo:${JSON.stringify(r.request().postDataJSON())}`);
    const status = opts.promoStatus ?? 200;
    return json(r, status === 200 ? { success: true, months: 2 } : { success: false, code: 'no_billing_row' }, status);
  });
  await page.route('**/auth/v1/user', (r) => {
    if (r.request().method() === 'PUT') calls.push(`updateUser:${JSON.stringify(r.request().postDataJSON())}`);
    return json(r, authUser(opts.meta));
  });
  await page.route('**/auth/v1/token*', (r) => json(r, session(opts.meta)));
}

test('without the booth QR the page sends the visitor home', async ({ page }) => {
  await english(page);
  await page.goto('/lp/odoo-experience');
  await page.waitForURL((u) => u.pathname === '/');
});

test('QR → Start now opens the Odoo account screen with the promo pending, and sign-up carries it', async ({ page }) => {
  await english(page);
  let sent: Record<string, unknown> | null = null;
  await page.route('**/auth/v1/signup*', (r) => {
    sent = r.request().postDataJSON();
    return json(r, { ...authUser(), email_confirmed_at: null, confirmed_at: null, confirmation_sent_at: '2026-09-24T09:00:00Z' });
  });
  await page.goto('/lp/odoo-experience?ref=oxp');
  await expect(page.getByRole('heading', { name: '2 months of Professional, free' })).toBeVisible();
  await page.getByRole('button', { name: /Start now/ }).click();
  await page.waitForURL(/\/signup\?provider=odoo/);
  await expect(page.getByRole('heading', { name: 'Start with Odoo' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('pending_promo'))).toContain('"months":2');
  await page.fill('#acct-email', EMAIL);
  await page.fill('#acct-password', 'longenough1');
  await page.fill('#acct-confirm', 'longenough1');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('status')).toContainText(/Check your inbox/);
  expect(sent).toMatchObject({ data: { provider: 'odoo', promo_months: 2 } });
});

test('dashboard: odoo-account runs before the grant; success clears both carriers', async ({ page }) => {
  await english(page);
  const calls: string[] = [];
  await mockDashboard(page, calls);
  await page.route('**/auth/v1/signup*', (r) => json(r, session({ promo_months: 2 })));
  await page.goto('/lp/odoo-experience?ref=oxp');
  await page.getByRole('button', { name: /Start now/ }).click();
  await page.fill('#acct-email', EMAIL);
  await page.fill('#acct-password', 'longenough1');
  await page.fill('#acct-confirm', 'longenough1');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.waitForURL(/\/dashboard/);
  await expect.poll(() => calls.find((c) => c.startsWith('promo:'))).toBe('promo:{"months":2}');
  expect(calls.indexOf('odoo-account')).toBeLessThan(calls.findIndex((c) => c.startsWith('promo:')));
  await expect.poll(() => page.evaluate(() => localStorage.getItem('pending_promo'))).toBeNull();
});

test('a confirmation link opened in another browser still grants the promo from the account metadata', async ({ page }) => {
  await english(page);
  const calls: string[] = [];
  await mockDashboard(page, calls, { meta: { promo_months: 2 } });
  // A fresh browser: sign in, no pending_promo in localStorage.
  await page.route('**/auth/v1/token?grant_type=password', (r) => json(r, session({ promo_months: 2 })));
  await page.goto('/signin?provider=odoo');
  await page.fill('#acct-email', EMAIL);
  await page.fill('#acct-password', 'longenough1');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/dashboard/);
  await expect.poll(() => calls.find((c) => c.startsWith('promo:'))).toBe('promo:{"months":2}');
  await expect.poll(() => calls.find((c) => c.startsWith('updateUser:'))).toContain('"promo_months":null');
});

test('when the account row is not there yet (409) the promo stays pending for the next load', async ({ page }) => {
  await english(page);
  const calls: string[] = [];
  await mockDashboard(page, calls, { promoStatus: 409 });
  await page.route('**/auth/v1/signup*', (r) => json(r, session()));
  await page.goto('/lp/odoo-experience?ref=oxp');
  await page.getByRole('button', { name: /Start now/ }).click();
  await page.fill('#acct-email', EMAIL);
  await page.fill('#acct-password', 'longenough1');
  await page.fill('#acct-confirm', 'longenough1');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.waitForURL(/\/dashboard/);
  await expect.poll(() => calls.some((c) => c.startsWith('promo:'))).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem('pending_promo'))).toContain('"months":2');
});
