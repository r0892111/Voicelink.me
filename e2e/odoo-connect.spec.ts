// The Odoo sign-up (trial first, spec VoiceLink docs/crm-onboarding/odoo/
// specs/D3-portal.md rev. 2026-09-20) and the dashboard's Connect Odoo step,
// with Supabase Auth, the REST reads and the odoo-account / odoo-connect
// functions MOCKED at the network layer: what the browser sends, what it
// never stores, how every state renders. The functions themselves and the
// VoiceLink round-trip are the OD-20 acceptance test, not this file.
import { test, expect, type Page, type Route } from '@playwright/test';
import { E2E_ANON_KEY } from '../playwright.config';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const EMAIL = 'alex@finit.be';
const KEY = 'abcd1234efgh5678ijkl9012mnop3456qrst7890';

const b64url = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
const now = () => Math.floor(Date.now() / 1000);
/** Signature never checked client-side; supabase-js only reads exp/sub. */
const fakeJwt = () => `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url({ sub: USER_ID, email: EMAIL, role: 'authenticated', aud: 'authenticated', iat: now(), exp: now() + 3600 })}.sig`;

const authUser = () => ({
  id: USER_ID, aud: 'authenticated', role: 'authenticated', email: EMAIL,
  email_confirmed_at: '2026-09-20T09:00:00Z', confirmed_at: '2026-09-20T09:00:00Z', last_sign_in_at: '2026-09-20T09:00:00Z',
  app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: { provider: 'odoo', name: 'alex' },
  identities: [{ identity_id: 'i1', id: USER_ID, user_id: USER_ID, provider: 'email', identity_data: { email: EMAIL } }],
  created_at: '2026-09-20T09:00:00Z', updated_at: '2026-09-20T09:00:00Z',
});
const session = () => ({ access_token: fakeJwt(), token_type: 'bearer', expires_in: 3600, expires_at: now() + 3600, refresh_token: 'r-1', user: authUser() });

const json = (route: Route, body: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

async function english(page: Page) {
  await page.addInitScript(() => { try { localStorage.setItem('i18nextLng', 'en'); } catch { /* the page falls back to English anyway */ } });
}

async function openAccountScreen(page: Page, mode: 'signup' | 'login' = 'signup') {
  await english(page);
  await page.goto(mode === 'signup' ? '/signup?enable=odoo' : '/signin?enable=odoo');
  const btn = page.getByRole('button', { name: /Continue with Odoo/ });
  await expect(btn).toBeEnabled();
  await btn.click();
  await expect(page.getByRole('heading', { name: mode === 'signup' ? 'Start with Odoo' : 'Sign in' })).toBeVisible();
}

/** Everything the dashboard asks for, with an Odoo account that has its
 *  placeholder row and the subscription the test wants. */
async function mockDashboard(page: Page, opts: { subscription?: string; odooStatus?: 'pending' | 'connected' } = {}) {
  const sub = opts.subscription ?? 'trialing';
  const row = {
    odoo_user_id: `pending:${USER_ID}`, user_id: USER_ID, env: 'staging', whatsapp_number: null, whatsapp_status: 'not_set',
    whatsapp_otp_phone: null, is_test_user: false, language: 'en', language_locked: true, is_admin: true, admin_user_id: null,
    stripe_customer_id: sub === 'none' ? null : 'cus_e2e', deleted_at: null,
  };
  // Playwright checks routes newest-first: catch-alls first, specifics after.
  await page.route('**/rest/v1/**', (r) => json(r, []));
  await page.route('**/rest/v1/odoo_users*', (r) => json(r, [row]));
  await page.route('**/functions/v1/**', (r) => json(r, { success: false }));
  await page.route('**/functions/v1/get-subscription*', (r) => json(r, {
    success: true,
    subscription: sub === 'none'
      ? { subscription_status: 'none' }
      : { subscription_status: sub, trial_end: now() + 12 * 86400, current_period_end: null, plan_name: 'Starter', voicelink_key: 'starter', amount: 4900, currency: 'eur', interval: 'month' },
  }));
  await page.route('**/functions/v1/odoo-account', (r) => json(r, opts.odooStatus === 'connected'
    ? { success: true, status: 'connected', env: 'staging', instance: 'https://finit-solutions.odoo.com', login: 'voicelink@finit.be' }
    : { success: true, status: 'pending', env: 'staging' }));
  await page.route('**/auth/v1/user', (r) => json(r, authUser()));
  await page.route('**/auth/v1/token*', (r) => json(r, session()));
  await page.route('**/auth/v1/logout*', (r) => r.fulfill({ status: 204, body: '' }));
}

test('without ?enable=odoo the Odoo button is "coming soon" and disabled', async ({ page }) => {
  await english(page);
  await page.goto('/signup');
  const btn = page.getByRole('button', { name: /Continue with Odoo/ });
  await expect(btn).toBeDisabled();
  await expect(btn).toContainText(/coming soon/i);
});

test('sign-up validates before it talks to Supabase: short password, mismatch, bad e-mail', async ({ page }) => {
  let called = false;
  await page.route('**/auth/v1/signup*', (r) => { called = true; return json(r, {}, 500); });
  await openAccountScreen(page);
  await page.fill('#acct-email', 'not-an-email');
  await page.fill('#acct-password', 'longenough1');
  await page.fill('#acct-confirm', 'longenough1');
  await page.getByRole('button', { name: 'Create account' }).click();
  // type="email": the browser's own check stops the submit before the handler runs
  expect(await page.locator('#acct-email').evaluate((el) => (el as HTMLInputElement).validity.valid)).toBe(false);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.fill('#acct-email', EMAIL);
  await page.fill('#acct-password', 'short');
  await page.fill('#acct-confirm', 'short');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('alert')).toContainText(/at least 8 characters/);
  await page.fill('#acct-password', 'longenough1');
  await page.fill('#acct-confirm', 'longenough2');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('alert')).toContainText(/don't match/);
  expect(called).toBe(false);
});

test('sign-up posts e-mail, password and the odoo provider; with e-mail confirmation on it shows "check your inbox" and stores no password', async ({ page }) => {
  let sent: Record<string, unknown> | null = null;
  let url = '';
  await page.route('**/auth/v1/signup*', (r) => {
    sent = r.request().postDataJSON();
    url = r.request().url();
    const u = authUser();
    return json(r, { ...u, email_confirmed_at: null, confirmed_at: null, confirmation_sent_at: '2026-09-20T09:00:00Z' });
  });
  await openAccountScreen(page);
  await page.fill('#acct-email', ` ${EMAIL.toUpperCase()} `);
  await page.fill('#acct-password', 'longenough1');
  await page.fill('#acct-confirm', 'longenough1');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('status')).toContainText(/Check your inbox/);
  expect(sent).toMatchObject({ email: EMAIL, password: 'longenough1', data: { provider: 'odoo', name: 'alex' } });
  expect(decodeURIComponent(url)).toContain('redirect_to=http://localhost:3000/dashboard');
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }));
  expect(stored).not.toContain('longenough1');
  expect(stored).toContain('"userPlatform":"odoo"');
  await expect(page.locator('#acct-password')).toHaveValue('');
});

test('an address that already has an account is told to sign in (Supabase answers a user with no identities)', async ({ page }) => {
  await page.route('**/auth/v1/signup*', (r) => json(r, { ...authUser(), identities: [] }));
  await openAccountScreen(page);
  await page.fill('#acct-email', EMAIL);
  await page.fill('#acct-password', 'longenough1');
  await page.fill('#acct-confirm', 'longenough1');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('alert')).toContainText(/already an account/);
});

test('sign-in: wrong credentials show the mapped message; right ones open the dashboard', async ({ page }) => {
  await mockDashboard(page);
  let attempts = 0;
  await page.route('**/auth/v1/token?grant_type=password', (r) => {
    attempts += 1;
    return attempts === 1
      ? json(r, { code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' }, 400)
      : json(r, session());
  });
  await openAccountScreen(page, 'login');
  await expect(page.locator('#acct-confirm')).toHaveCount(0);
  await page.fill('#acct-email', EMAIL);
  await page.fill('#acct-password', 'wrongpass1');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toContainText(/Wrong e-mail address or password/);
  await page.fill('#acct-password', 'rightpass1');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/dashboard/);
  await expect(page.getByText('Odoo — not connected yet')).toBeVisible({ timeout: 15000 });
});

test('forgot password sends the reset e-mail with the reset page as landing', async ({ page }) => {
  let url = '';
  await page.route('**/auth/v1/recover*', (r) => { url = r.request().url(); return json(r, {}); });
  await openAccountScreen(page, 'login');
  await page.fill('#acct-email', EMAIL);
  await page.getByRole('button', { name: 'Forgot your password?' }).click();
  await expect(page.getByRole('status')).toContainText(/Reset e-mail sent/);
  expect(decodeURIComponent(url)).toContain('redirect_to=http://localhost:3000/reset-password');
});

test('the reset page turns the recovery link into a session and saves the new password', async ({ page }) => {
  await english(page);
  let saved: Record<string, unknown> | null = null;
  await page.route('**/auth/v1/user', (r) => {
    if (r.request().method() === 'PUT') { saved = r.request().postDataJSON(); }
    return json(r, authUser());
  });
  await page.goto(`/reset-password#access_token=${fakeJwt()}&expires_in=3600&refresh_token=r-1&token_type=bearer&type=recovery`);
  await expect(page.getByRole('heading', { name: 'Choose a new password' })).toBeVisible();
  await page.fill('#new-password', 'freshpass1');
  await page.fill('#confirm-password', 'freshpass1');
  await page.getByRole('button', { name: 'Save password' }).click();
  await expect(page.getByText('Password saved')).toBeVisible();
  expect(saved).toMatchObject({ password: 'freshpass1' });
});

test('the reset page without a token says the link no longer works', async ({ page }) => {
  await english(page);
  await page.goto('/reset-password');
  await expect(page.getByText('This link no longer works')).toBeVisible({ timeout: 10000 });
});

test('trial first: without a subscription the Odoo step offers "Start Trial First", not the form', async ({ page }) => {
  await mockDashboard(page, { subscription: 'none' });
  await page.route('**/auth/v1/signup*', (r) => json(r, session()));
  await openAccountScreen(page);
  await page.fill('#acct-email', EMAIL);
  await page.fill('#acct-password', 'longenough1');
  await page.fill('#acct-confirm', 'longenough1');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.waitForURL(/\/dashboard/);
  await expect(page.getByText('Odoo is not connected yet')).toBeVisible({ timeout: 15000 });
  // both gated steps (Connect Odoo, Connect WhatsApp) point at the trial
  await expect(page.getByRole('button', { name: 'Start Trial First' })).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Start Trial First' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Connect Now' })).toHaveCount(0);
  await expect(page.locator('#odoo-key')).toHaveCount(0);
});

test('with the trial running: Connect Now opens the form, the key goes once to odoo-connect with the session, the step turns done', async ({ page }) => {
  await mockDashboard(page, { subscription: 'trialing' });
  let sent: Record<string, unknown> | null = null;
  let headers: Record<string, string> | null = null;
  await page.route('**/functions/v1/odoo-connect', (r) => {
    sent = r.request().postDataJSON();
    headers = r.request().headers();
    return json(r, { success: true, name: 'VoiceLink', company_name: 'Finit Solutions', version: 'saas~19.4', transport: 'json2', instance: 'https://finit-solutions.odoo.com', login: 'voicelink@finit.be' });
  });
  await page.route('**/auth/v1/signup*', (r) => json(r, session()));
  await openAccountScreen(page);
  await page.fill('#acct-email', EMAIL);
  await page.fill('#acct-password', 'longenough1');
  await page.fill('#acct-confirm', 'longenough1');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.waitForURL(/\/dashboard/);
  const connectNow = page.getByRole('button', { name: 'Connect Now' }).first();
  await expect(connectNow).toBeVisible({ timeout: 15000 });
  await connectNow.click();
  await page.fill('#odoo-url', 'https://finit-solutions.odoo.com/');
  await expect(page.locator('#odoo-db')).toHaveValue('finit-solutions');
  await page.fill('#odoo-login', 'voicelink@finit.be');
  await page.fill('#odoo-key', `  ${KEY.slice(0, 20)} \n ${KEY.slice(20)}  `);
  await page.getByRole('button', { name: 'Connect Odoo' }).click();
  await expect(page.getByText('Odoo Connected')).toBeVisible({ timeout: 15000 });
  expect(sent).toEqual({ url: 'https://finit-solutions.odoo.com', db: 'finit-solutions', login: 'voicelink@finit.be', api_key: KEY, language: 'en' });
  expect(headers!['authorization']).toMatch(/^Bearer eyJ/);
  expect(headers!['authorization']).not.toBe(`Bearer ${E2E_ANON_KEY}`);
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }));
  expect(stored).not.toContain(KEY.slice(0, 12));
  await expect(page.getByText('finit-solutions.odoo.com', { exact: true })).toBeVisible(); // the CRM card
});

test('a rejected key renders its message on the dashboard form and keeps the step open', async ({ page }) => {
  await mockDashboard(page, { subscription: 'trialing' });
  await page.route('**/functions/v1/odoo-connect', (r) => json(r, { success: false, code: 'odoo_bad_credentials', error: 'server text' }, 400));
  await page.route('**/auth/v1/signup*', (r) => json(r, session()));
  await openAccountScreen(page);
  await page.fill('#acct-email', EMAIL);
  await page.fill('#acct-password', 'longenough1');
  await page.fill('#acct-confirm', 'longenough1');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.waitForURL(/\/dashboard/);
  await page.getByRole('button', { name: 'Connect Now' }).first().click({ timeout: 15000 });
  await page.fill('#odoo-url', 'https://finit-solutions.odoo.com');
  await page.fill('#odoo-login', 'voicelink@finit.be');
  await page.fill('#odoo-key', KEY);
  await page.getByRole('button', { name: 'Connect Odoo' }).click();
  await expect(page.getByText(/Odoo rejected the login or the API key/)).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#odoo-key')).toBeVisible();
});

test('a connected Odoo shows its instance and offers "Replace API key"', async ({ page }) => {
  await mockDashboard(page, { subscription: 'active', odooStatus: 'connected' });
  await page.route('**/auth/v1/token?grant_type=password', (r) => json(r, session()));
  await openAccountScreen(page, 'login');
  await page.fill('#acct-email', EMAIL);
  await page.fill('#acct-password', 'rightpass1');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/dashboard/);
  await expect(page.getByText('finit-solutions.odoo.com', { exact: true })).toBeVisible({ timeout: 15000 }); // the CRM card
  await page.getByRole('button', { name: 'Replace API key' }).click();
  await expect(page.locator('#odoo-key')).toBeVisible();
});
