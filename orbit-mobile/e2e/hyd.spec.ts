import { expect, test } from '@playwright/test';
import { fillEasyApply, signInAsGuest } from './helpers';

test.describe('Hyderabad hiring layer', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await signInAsGuest(page);
  });

  test('shows social buttons and seeded jobs', async ({ page }) => {
    await expect(page.getByTestId('hyd-area-row')).toHaveCount(0);
    await page.getByTestId('jobs-screen').getByTestId('social-footer').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('jobs-screen').getByTestId('social-footer')).toBeVisible();
    await expect(page.getByTestId('social-whatsapp')).toBeVisible();
    await expect(page.getByTestId('social-instagram')).toBeVisible();
    await expect(page.getByTestId('social-linkedin')).toBeVisible();
    await expect(page.getByTestId('social-x')).toBeVisible();
    await expect(page.getByTestId('job-row-9001')).toContainText('Staff Nurse');
    await expect(page.getByTestId('job-orbit-verified-9001')).toHaveCount(0);
    await expect(page.getByTestId('job-orbit-verified-7101')).toHaveText('Verified by Orbit Support');
    await expect(page.getByTestId('jobs-day-today').first()).toBeVisible();
    await expect(page.getByTestId('jobs-day-today').first()).toContainText('posted');
    await expect(page.getByTestId('feed-meta').first()).toContainText('POSTED TODAY');
    await expect(page.getByTestId('job-row-9001')).not.toContainText('Verified by Orbit Support');
    await expect(page.getByTestId('job-wa-9001')).toHaveCount(0);
    await expect(page.getByTestId('job-row-9001').getByText('WhatsApp')).toHaveCount(0);
    await expect(page.getByTestId('job-row-9005')).toHaveCount(0);
    await expect(page.getByTestId('job-row-9101')).toHaveCount(0);
  });

  test('opens startup detail from a row and returns to the feed', async ({ page }) => {
    await page.getByTestId('segment-startups').click();
    await expect(page.getByTestId('startup-row-8001')).toBeVisible();
    await page.getByTestId('startup-row-8001').click();
    await expect(page.getByTestId('startup-detail')).toBeVisible();
    await expect(page.getByTestId('startup-detail')).toContainText('Kite Health');
    await expect(page.getByTestId('startup-detail-about')).toContainText('Telugu voice follow-ups');
    await page.getByTestId('startup-detail-back').click();
    await expect(page.getByTestId('startups-screen')).toBeVisible();
  });

  test('opens job detail from a row and returns to the feed', async ({ page }) => {
    await page.getByTestId('job-row-9001').click();
    await expect(page.getByTestId('job-detail')).toBeVisible();
    await expect(page.getByTestId('job-detail')).toContainText('Staff Nurse');
    await expect(page.getByTestId('job-detail-apply')).toBeVisible();
    await expect(page.getByTestId('report-job')).toBeVisible();
    await expect(page.getByTestId('report-employer')).toBeVisible();
    await expect(page.getByTestId('job-detail-whatsapp')).toHaveCount(0);
    await page.getByTestId('job-subscribe-matches').click();
    await expect(page.getByTestId('job-subscribe-matches')).toContainText('Subscribed');
    await page.getByTestId('job-detail').getByTestId('social-footer').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('job-detail').getByTestId('social-footer')).toBeVisible();
    await page.getByTestId('job-detail-back').click();
    await expect(page.getByTestId('jobs-screen')).toBeVisible();
    await page.getByTestId('header-alerts').click();
    await expect(page.getByTestId('ai-matches-sheet')).toBeVisible();
    await expect(page.getByTestId('matches-subscribe')).toContainText('Subscribed');
    await expect(page.getByTestId('ai-match-9001')).toContainText('Staff Nurse');
  });

  test('filters jobs from the header location picker', async ({ page }) => {
    await expect(page.getByTestId('header-location')).toBeVisible();
    await page.getByTestId('header-location').click();
    await expect(page.getByTestId('location-sheet')).toBeVisible();
    await expect(page.getByTestId('location-all')).toHaveText('All Telangana');
    await expect(page.locator('[data-testid^="location-choice-"]')).toHaveCount(33);
    await expect(page.getByTestId('location-choice-Adilabad')).toBeVisible();
    await expect(page.getByTestId('location-choice-Hyderabad')).toHaveCount(1);
    await expect(page.getByTestId('location-choice-Warangal')).toHaveCount(1);
    await expect(page.getByTestId('location-choice-Khammam')).toHaveCount(1);
    await page.getByTestId('location-choice-Hyderabad').click();
    await expect(page.getByTestId('header-location')).toContainText('Hyderabad');
    await expect(page.getByTestId('job-row-9001')).toBeVisible();
    await page.getByTestId('header-location').click();
    await page.getByTestId('location-choice-Warangal').click();
    await expect(page.getByTestId('job-row-9001')).toHaveCount(0);
    await page.getByTestId('header-location').click();
    await page.getByTestId('location-all').click();
    await expect(page.getByTestId('job-row-9002')).toBeVisible();
  });

  test('applies from the feed and shows the job under Applied', async ({ page }) => {
    await expect(page.getByTestId('job-row-9001')).toBeVisible();
    await page.getByTestId('job-row-9001').getByTestId('job-apply-9001').click();
    await fillEasyApply(page);
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByTestId('apply-submit').click();

    await page.getByTestId('tab-applied').click();
    await expect(page.getByTestId('applied-screen')).toContainText('Staff Nurse');
  });

  test('switches profile copy to Telugu', async ({ page }) => {
    await page.getByTestId('tab-profile').click();
    await page.getByTestId('lang-te').click();
    await expect(page.getByTestId('lang-te')).toBeVisible();
    await page.getByTestId('voice-resume-save').click();
    await expect(page.getByTestId('voice-resume-input')).toHaveValue(/Ravi/);
  });

  test('creates a simple resume from profile', async ({ page }) => {
    await page.getByTestId('tab-profile').click();
    await page.getByTestId('profile-menu-resume').click();
    await expect(page.getByTestId('resume-sheet')).toBeVisible();
    await page.getByTestId('resume-name').fill('Priya Rao');
    await page.getByTestId('resume-phone').fill('9876543210');
    await page.getByTestId('resume-area').fill('Gachibowli');
    await page.getByTestId('resume-last-job').fill('Staff Nurse');
    await page.getByTestId('resume-education').fill('B.Sc Nursing');
    await page.getByTestId('resume-skills').fill('Telugu · Night shift');
    await page.getByTestId('resume-join').fill('Immediate');
    await page.getByTestId('resume-save').click();
    await expect(page.getByTestId('resume-preview')).toContainText('Priya Rao');
    await expect(page.getByTestId('resume-preview')).toContainText('Staff Nurse');
    await expect(page.getByTestId('resume-preview')).toContainText('987****210');
    await expect(page.getByTestId('resume-preview')).not.toContainText('9876543210');
  });
});
