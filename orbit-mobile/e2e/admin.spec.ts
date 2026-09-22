import { expect, test } from '@playwright/test';

test.describe('Admin workspace', () => {
  test('mock admin can sign in, verify a profile, and sign out', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('auth-admin')).toBeVisible();
    await page.getByTestId('auth-admin').click();
    await expect(page.getByTestId('admin-screen')).toBeVisible();
    await expect(page.getByText('Trust & safety', { exact: true })).toBeVisible();
    await expect(page.getByText('Super Admin', { exact: true })).toBeVisible();
    await expect(page.getByTestId('admin-pending-ap-1')).toBeVisible();
    await expect(page.getByTestId('admin-control-guestApply')).toContainText('On');
    await expect(page.getByTestId('admin-pending-job-el-3')).toBeVisible();

    await page.getByTestId('admin-approve-ap-1').click();
    await expect(page.getByTestId('admin-pending-ap-1')).toHaveCount(0);

    await page.getByTestId('tab-admin-people').click();
    await expect(page.getByTestId('admin-people-screen')).toBeVisible();
    await expect(page.getByTestId('admin-user-ap-1')).toContainText('Verified by Orbit Support');
    await page.getByTestId('admin-suspend-ap-1').click();
    await page.getByTestId('confirm-yes').click();
    await expect(page.getByTestId('admin-user-ap-1')).toContainText('Suspended');

    await page.getByTestId('tab-admin-jobs').click();
    await expect(page.getByTestId('admin-jobs-screen')).toBeVisible();
    await page.getByTestId('admin-job-filter-pending').click();
    await expect(page.getByTestId('admin-job-7103')).toBeVisible();
    await page.getByTestId('admin-job-filter-all').click();
    await page.getByTestId('admin-freeze-9002').click();
    await expect(page.getByTestId('admin-job-9002')).toContainText('Frozen');

    await page.getByTestId('tab-admin-profile').click();
    await expect(page.getByTestId('admin-profile-screen')).toBeVisible();
    await expect(page.getByText('Super Admin · Orbit Control', { exact: true })).toBeVisible();
    await expect(page.getByTestId('support-button')).toContainText('support@orbit.app');
    await page.getByTestId('legal-link-notice').click();
    await expect(page.getByTestId('legal-sheet-notice')).toBeVisible();
    await page.getByTestId('legal-close').click();
    await page.getByTestId('admin-sign-out').click();
    await expect(page.getByTestId('auth-screen')).toBeVisible();
  });

  test('super admin freeze hides a job from the guest feed', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('auth-admin').click();
    await expect(page.getByTestId('admin-screen')).toBeVisible();
    await page.getByTestId('tab-admin-jobs').click();
    await page.getByTestId('admin-verify-9001').click();
    await expect(page.getByTestId('admin-job-9001')).toContainText('Verified by Orbit Support');
    await page.getByTestId('admin-freeze-9002').click();
    await expect(page.getByTestId('admin-job-9002')).toContainText('Frozen');
    await page.getByTestId('tab-admin-profile').click();
    await page.getByTestId('admin-sign-out').click();

    await page.getByTestId('auth-guest').click();
    await expect(page.getByTestId('jobs-screen')).toBeVisible();
    await expect(page.getByTestId('job-row-9001')).toBeVisible();
    await expect(page.getByTestId('job-orbit-verified-9001')).toHaveText('Verified by Orbit Support');
    await expect(page.getByTestId('job-row-9002')).toHaveCount(0);
  });
});
