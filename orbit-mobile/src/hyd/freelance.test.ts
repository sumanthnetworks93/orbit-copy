import { describe, expect, it } from 'vitest';
import { isFreelanceJob } from './freelance';

describe('isFreelanceJob', () => {
  it('matches freelance job types and gig tags', () => {
    expect(isFreelanceJob({ jobType: 'Freelance', tags: 'Figma' })).toBe(true);
    expect(isFreelanceJob({ jobType: 'Contract', tags: 'Weekend gig' })).toBe(true);
    expect(isFreelanceJob({ jobType: 'Full-time', tags: 'Nursing' })).toBe(false);
  });
});
