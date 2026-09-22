import { describe, expect, it, beforeEach } from 'vitest';
import {
  completeOnboarding,
  getOnboardingDone,
  isOnboardingDoneSync,
  setOnboardingDoneSync,
} from './onboarding';

beforeEach(() => {
  setOnboardingDoneSync(false);
});

describe('onboarding', () => {
  it('starts incomplete and completes after the first run', async () => {
    expect(isOnboardingDoneSync()).toBe(false);
    await completeOnboarding();
    expect(isOnboardingDoneSync()).toBe(true);
    expect(await getOnboardingDone()).toBe(true);
  });
});
