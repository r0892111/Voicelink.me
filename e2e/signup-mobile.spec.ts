// The sign-up page must not trap the scroll on a phone.
//
// Alex, 2026-09-21: "this page is reloading on keyboard down?" on the Odoo
// account screen. Nothing reloaded. The page was `h-screen` with an inner
// scrolling column, so every visual-viewport change re-clamped that column's
// scrollTop: measured on the live site, its max scroll was 430 with the
// keyboard up and 206 with it down, so the browser yanked 328 → 206 and the
// form lurched. Letting the document scroll on small screens removes the
// range that gets clamped.
//
// The second test is the one that discriminates: it fails on the old layout
// (one trapped scroller) and passes on the fix. `setViewportSize` cannot
// reproduce the browser's own clamping, so the first test guards the thing
// that made the trap necessary in the first place — a form taller than a
// short phone must still be fully reachable.
import { test, expect, devices } from '@playwright/test';

// Pixel 5 (Chromium — the one browser this repo installs), deliberately SHORT:
// its real 851px fits the whole form, so nothing would scroll and neither the
// bug nor the fix would show. A phone with its keyboard up is around 500px.
test.use({ ...devices['Pixel 5'], viewport: { width: 393, height: 520 } });

async function openAccountScreen(page) {
  await page.addInitScript(() => {
    try { localStorage.setItem('i18nextLng', 'en'); } catch { /* the page falls back to English */ }
  });
  await page.goto('/signup');
  await page.getByRole('button', { name: /Continue with Odoo/ }).click();
  await expect(page.getByRole('heading', { name: 'Start with Odoo' })).toBeVisible();
}

test('every field and the submit button are reachable on a short phone screen', async ({ page }) => {
  await openAccountScreen(page);
  for (const id of ['#acct-email', '#acct-password', '#acct-confirm']) {
    await page.locator(id).scrollIntoViewIfNeeded();
    await expect(page.locator(id)).toBeVisible();
  }
  const submit = page.getByRole('button', { name: 'Create account' });
  await submit.scrollIntoViewIfNeeded();
  await expect(submit).toBeVisible();
  const box = (await submit.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(520);
});

test('the page itself can scroll — no ancestor pins it to the viewport', async ({ page }) => {
  await openAccountScreen(page);
  // The real guard. The first version of this fix only unpinned AuthPage's own
  // root; the App shell still carried `h-screen overflow-hidden` on /signup and
  // won, so the form stayed pinned on a phone (Alex: "it's still refreshing").
  const doc = await page.evaluate(() => {
    const el = document.scrollingElement as HTMLElement;
    const pinned = Array.from(document.querySelectorAll('body *')).filter((n) => {
      const cs = getComputedStyle(n as Element);
      return cs.overflowY === 'hidden' && (n as HTMLElement).scrollHeight > (n as HTMLElement).clientHeight + 4;
    }).map((n) => (n as HTMLElement).className.toString().slice(0, 60));
    return { scrollable: el.scrollHeight > el.clientHeight + 4, clipped: pinned };
  });
  expect(doc.clipped, `content clipped by an overflow-hidden ancestor: ${JSON.stringify(doc.clipped)}`).toEqual([]);
});

test('no element traps the scroll on a phone — the document scrolls', async ({ page }) => {
  await openAccountScreen(page);
  // html/body ARE expected to scroll now — that is the fix. Only an element
  // inside the page counts as a trap.
  const trapped = await page.evaluate(() =>
    Array.from(document.querySelectorAll('body *'))
      .filter((el) => {
        const cs = getComputedStyle(el as Element);
        const e = el as HTMLElement;
        return /auto|scroll/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 4;
      })
      .map((el) => `${el.tagName.toLowerCase()}.${(el as HTMLElement).className.toString().slice(0, 50)}`),
  );
  expect(trapped, `scroll traps found: ${JSON.stringify(trapped)}`).toEqual([]);
});

// Typing must not remount anything. A component declared INSIDE another is a
// new type on every render, so React throws the old subtree away and mounts a
// fresh one — and any entrance animation on it replays. `CornerWaves` was
// declared inside AuthPage, so every keystroke re-ran its 0.9s wave-in and the
// blue corner flashed (Alex, 2026-09-21).
test('typing does not remount the decorative wave (no flash on every keystroke)', async ({ page }) => {
  await openAccountScreen(page);
  await page.addStyleTag({ content: '@media (max-width: 9999px) { .auth-animate-waves { display: block !important; } }' });
  const handleBefore = await page.evaluateHandle(() => document.querySelector('.auth-animate-waves'));
  expect(await handleBefore.evaluate((n) => !!n)).toBe(true);
  // mark the node; a remount replaces it and the mark is gone
  await handleBefore.evaluate((n: Element) => n.setAttribute('data-kept', 'yes'));
  await page.locator('#acct-email').click();
  await page.keyboard.type('jord@finit.be', { delay: 25 });
  await page.locator('#acct-password').fill('longenough1');
  const survived = await page.evaluate(() => document.querySelector('.auth-animate-waves')?.getAttribute('data-kept'));
  expect(survived, 'the wave element was replaced while typing — it is remounting').toBe('yes');
});
