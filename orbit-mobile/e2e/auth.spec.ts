import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';
import { loadLocalEnv } from './env';
import { hasClerkKeys } from './helpers';

loadLocalEnv();

test.describe('Auth screen', () => {
  test('shows Clerk sign in and sign up', async ({ page }) => {
    test.skip(!hasClerkKeys(), 'Clerk keys are not configured');
    await setupClerkTestingToken({ page });
    await page.goto('/');
    await expect(page.getByTestId('auth-screen')).toBeVisible();
    await expect(page.getByText('Discover startups.')).toBeVisible();
    await expect(page.getByTestId('auth-sign-in')).toBeVisible();
    await expect(page.getByTestId('auth-sign-up')).toBeVisible();
    await expect(page.getByText('Sign in', { exact: true })).toBeVisible();
    await expect(page.getByText('Sign up', { exact: true })).toBeVisible();
  });

  test('keeps chips, post startup, hiring desk, and support off the public landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Apply without a PDF')).toHaveCount(0);
    await expect(page.getByTestId('auth-post-startup')).toHaveCount(0);
    await expect(page.getByTestId('auth-admin')).toHaveCount(0);
    await expect(page.getByTestId('auth-employer')).toHaveCount(0);
    await expect(page.getByTestId('support-button')).toHaveCount(0);
  });

  test('user, employer, and super admin one-click logins are on the e2e auth screen', async ({ page }) => {
    await page.goto('/?e2e=1');
    await expect(page.getByTestId('auth-user')).toHaveText('Login as user');
    await expect(page.getByTestId('auth-employer')).toHaveText('Login as employer');
    await expect(page.getByTestId('auth-admin')).toHaveText('Login as super admin');
    await expect(page.getByTestId('auth-post-startup')).toHaveText('Post your startup');
    await page.getByTestId('auth-post-startup').click();
    await expect(page.getByTestId('post-sheet-title')).toHaveText('Post a startup');
    await page.getByTestId('post-sheet-cancel').click();
    await page.getByTestId('auth-user').click();
    await expect(page.getByTestId('jobs-screen')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('tab-profile')).toBeVisible();
  });

  test('demo account can log in without e2e mode', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('auth-email')).toHaveValue('priya@orbit.app');
    await expect(page.getByTestId('auth-password')).toBeVisible();
    await page.getByTestId('auth-login').click();
    await expect(page.getByTestId('jobs-screen')).toBeVisible({ timeout: 20_000 });
  });

  test('hides guest login unless e2e mode is on', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('auth-guest')).toHaveCount(0);
    await page.goto('/?e2e=1');
    await expect(page.getByTestId('auth-guest')).toBeVisible();
    await expect(page.getByTestId('legal-links')).toBeVisible();
    await expect(page.getByTestId('support-button')).toContainText('support@orbit.app');
  });

  test('desktop QR encodes a live LAN URL without e2e mode', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const qrUrl = page.getByTestId('mobile-qr-url');
    await expect(qrUrl).toBeVisible();
    await expect(qrUrl).toHaveText(/^(exp:\/\/(\d{1,3}\.){3}\d{1,3}:8081|https:\/\/.+\.ngrok[-a-z]*\.app\/?)$/);
    await expect(qrUrl).not.toContainText('192.168.1.68');
    await expect(qrUrl).not.toContainText('e2e=1');
    await expect(page.getByTestId('mobile-qr-image')).toBeVisible();
  });

  test('Sign in opens the Clerk modal', async ({ page }) => {
    test.skip(!hasClerkKeys(), 'Clerk keys are not configured');
    await setupClerkTestingToken({ page });
    await page.goto('/');
    await page.getByTestId('auth-sign-in').click();
    await expect(page.getByTestId('clerk-signin-panel')).toBeVisible({ timeout: 15_000 });
    await expect(
      page.locator('.cl-signIn-root, input[name="identifier"], input[type="email"]').first(),
    ).toBeVisible({ timeout: 20_000 });
  });
});
