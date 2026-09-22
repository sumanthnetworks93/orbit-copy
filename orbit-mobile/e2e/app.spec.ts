import { expect, test } from '@playwright/test';
import { signInAsGuest } from './helpers';

test.describe('Customer job feed', () => {
  test('guest can open jobs and switch to startups', async ({ page }) => {
    await signInAsGuest(page);
    await expect(page.getByText('Jobs', { exact: true }).first()).toBeVisible();
    await expect
      .poll(async () => page.getByTestId('feed-meta').innerText(), { timeout: 8_000 })
      .toMatch(/POSTED TODAY/);

    await page.getByTestId('segment-startups').click();
    await expect(page.getByTestId('startups-screen')).toBeVisible();
    await expect(page.getByText('Startups', { exact: true }).first()).toBeVisible();

    await page.getByTestId('segment-freelance').click();
    await expect(page.getByTestId('freelance-screen')).toBeVisible();
    await expect(page.getByText('Freelance', { exact: true }).first()).toBeVisible();
    await expect(page.getByTestId('job-row-9101')).toBeVisible();
    await expect(page.getByTestId('job-row-9001')).toHaveCount(0);
  });

  test('guest can filter jobs by location', async ({ page }) => {
    await signInAsGuest(page);
    await page.getByTestId('open-filters').first().click();
    await expect(page.getByTestId('jobs-filter-title')).toBeVisible();
    await page.getByTestId('jobs-filter-location').fill('Hyderabad');
    await page.getByTestId('jobs-filter-apply').click();
    await expect(page.getByTestId('open-filters').last()).toContainText('Filter (1)');
  });

  test('guest can open job filters and applied tab', async ({ page }) => {
    await signInAsGuest(page);
    await page.getByTestId('open-filters').click();
    await expect(page.getByTestId('jobs-filter-title')).toBeVisible();
    await page.getByText('Back').click();
    await expect(page.getByTestId('jobs-screen').first()).toBeVisible();

    await page.getByTestId('tab-applied').click();
    await expect(page.getByTestId('applied-screen')).toBeVisible();
    await expect(page.getByTestId('applied-screen').getByText('Applied', { exact: true })).toBeVisible();
    await expect(page.getByText('No applications yet')).toBeVisible();
    await page.getByTestId('applied-browse').click();
    await expect(page.getByTestId('jobs-screen').last()).toBeVisible();
  });

  test('guest can open profile and sign out', async ({ page }) => {
    await signInAsGuest(page);
    await page.getByTestId('tab-profile').click();
    await expect(page.getByText('Sign out')).toBeVisible();
    await expect(page.getByTestId('close-account')).toBeVisible();
    await page.getByTestId('sign-out').click();
    await expect(page.getByTestId('auth-screen')).toBeVisible();
    await expect(page.getByTestId('auth-sign-in')).toBeVisible();
    await expect(page.getByTestId('auth-sign-up')).toBeVisible();
  });

  test('guest can read legal docs and see support email', async ({ page }) => {
    await signInAsGuest(page);
    await page.getByTestId('tab-profile').click();
    await expect(page.getByTestId('support-button')).toContainText('support@orbit.app');
    await page.getByTestId('profile-menu-privacy').click();
    await expect(page.getByTestId('legal-sheet-privacy')).toBeVisible();
    await expect(page.getByTestId('legal-sheet-privacy')).toContainText('Digital Personal Data Protection Act');
    await page.getByTestId('legal-close').click();
    await page.getByTestId('profile-menu-terms').click();
    await expect(page.getByTestId('legal-sheet-terms')).toBeVisible();
    await page.getByTestId('legal-close').click();
    await page.getByTestId('profile-menu-notice').click();
    await expect(page.getByTestId('legal-sheet-notice')).toBeVisible();
    await page.getByTestId('legal-close').click();
    await page.getByTestId('sign-out').click();
    await expect(page.getByTestId('legal-links')).toBeVisible();
    await expect(page.getByTestId('legal-link-privacy')).toBeVisible();
    await expect(page.getByTestId('legal-link-terms')).toBeVisible();
    await expect(page.getByTestId('legal-link-notice')).toBeVisible();
    await expect(page.getByTestId('support-button')).toContainText('support@orbit.app');
    await page.getByTestId('legal-link-privacy').click();
    await expect(page.getByTestId('legal-sheet-privacy')).toBeVisible();
  });
});
