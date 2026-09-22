import { expect, test } from '@playwright/test';

test.describe('Employer workspace', () => {
  test('mock employer can post a Hyderabad job and open billing', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.getByTestId('auth-employer')).toBeVisible();
    await page.getByTestId('auth-employer').click();
    await expect(page.getByTestId('employer-screen')).toBeVisible();
    await expect(page.getByTestId('employer-welcome')).toContainText('Sarah');
    await expect(page.getByTestId('employer-company')).toHaveText('Helios Health');
    await expect(page.getByTestId('kpi-Active Jobs')).toContainText('2');
    await expect(page.getByTestId('employer-job-7101')).toContainText('Staff Nurse');
    await expect(page.getByTestId('employer-job-7101')).toContainText('Gachibowli');

    await page.getByTestId('job-filter-Draft').click();
    await expect(page.getByTestId('employer-job-7101')).toHaveCount(0);
    await page.getByTestId('job-filter-All Jobs').click();
    await expect(page.getByTestId('employer-job-7101')).toBeVisible();

    await page.getByTestId('employer-nav-settings').click();
    await expect(page.getByTestId('legal-links')).toBeVisible();
    await expect(page.getByTestId('support-button')).toContainText('support@orbit.app');
    await page.getByTestId('legal-link-terms').click();
    await expect(page.getByTestId('legal-sheet-terms')).toBeVisible();
    await page.getByTestId('legal-close').click();

    await page.getByTestId('employer-nav-billing').click();
    await expect(page.getByTestId('employer-billing')).toBeVisible();
    await expect(page.getByTestId('employer-plan-free')).toContainText('2 jobs included');
    await expect(page.getByTestId('employer-plan-free')).toContainText('₹25');
    await expect(page.getByTestId('employer-plan-starter')).toContainText('₹199');

    await page.getByTestId('employer-nav-jobs').click();
    await page.getByTestId('employer-go-post').click();
    await expect(page.getByTestId('employer-post-screen')).toBeVisible();
    await page.getByTestId('employer-post-title').fill('Staff Backend Engineer');
    await page.getByTestId('employer-post-salary').fill('₹120,000–₹150,000 / year');
    await page.getByTestId('employer-publish').click();
    await expect(page.getByText('Staff Backend Engineer')).toBeVisible();

    await page.getByTestId('employer-nav-settings').click();
    await page.getByTestId('employer-sign-out').click();
    await expect(page.getByTestId('auth-screen')).toBeVisible();
  });
});
