import { describe, expect, it, beforeEach } from 'vitest';
import { HYD_AREAS, TELANGANA_DISTRICTS } from './areas';
import { asHyd, isFreelanceJob, jobsForStartup, matchesHydFilters, mergeHydJobs, mergeHydStartups, visibleWalkInJobs } from './filter';
import { previewHydJobs } from './previewJobs';
import { HYD_JOBS, isGhostFrozen, walkInJobs } from './seed';
import { DEFAULT_PLATFORM_CONTROLS, setPlatformControlsSync } from '../services/adminControl';
import { setJobOverridesSync } from '../services/adminJobs';
import { setEmployerListingsSync } from '../services/employerJobs';
import { ADMIN_PROFILE_SEED, setAdminProfilesSync } from '../services/adminModeration';
import { defaultJobFilters, defaultStartupFilters, type Job } from '../types';

beforeEach(() => {
  setJobOverridesSync({});
  setPlatformControlsSync(DEFAULT_PLATFORM_CONTROLS);
  setEmployerListingsSync([]);
  setAdminProfilesSync(ADMIN_PROFILE_SEED);
});

describe('asHyd', () => {
  it('treats 9000+ ids as Hyderabad jobs', () => {
    expect(asHyd({ id: 9001 } as Job)?.id).toBe(9001);
    expect(asHyd({ id: 12 } as Job)).toBeNull();
  });
});

describe('matchesHydFilters', () => {
  const nurse = HYD_JOBS.find((job) => job.id === 9001)!;

  it('keeps the nurse job on the default filter', () => {
    expect(matchesHydFilters(nurse, defaultJobFilters)).toBe(true);
  });

  it('filters by area and by Telangana district', () => {
    expect(matchesHydFilters(nurse, { ...defaultJobFilters, area: 'Gachibowli' })).toBe(true);
    expect(matchesHydFilters(nurse, { ...defaultJobFilters, area: 'Madhapur' })).toBe(false);
    expect(matchesHydFilters(nurse, { ...defaultJobFilters, area: 'Hyderabad', location: 'Hyderabad, Telangana' })).toBe(true);
    expect(matchesHydFilters(nurse, { ...defaultJobFilters, area: 'Rangareddy' })).toBe(true);
    expect(matchesHydFilters(nurse, { ...defaultJobFilters, area: 'Warangal' })).toBe(false);
  });

  it('filters verified-only to Orbit Support listings', () => {
    expect(matchesHydFilters(nurse, { ...defaultJobFilters, verifiedOnly: true })).toBe(false);
    setJobOverridesSync({ 9001: { orbitVerified: true } });
    expect(matchesHydFilters(nurse, { ...defaultJobFilters, verifiedOnly: true })).toBe(true);
  });

  it('filters by search and women-safe', () => {
    expect(matchesHydFilters(nurse, { ...defaultJobFilters, search: 'staff' })).toBe(true);
    expect(matchesHydFilters(nurse, { ...defaultJobFilters, search: 'tally' })).toBe(false);
    expect(matchesHydFilters(nurse, { ...defaultJobFilters, womenSafe: true })).toBe(true);
  });

  it('hides frozen jobs', () => {
    expect(matchesHydFilters({ ...nurse, frozen: true }, defaultJobFilters)).toBe(false);
  });

  it('hides jobs frozen or hidden by Super Admin', () => {
    setJobOverridesSync({ 9001: { frozen: true } });
    expect(matchesHydFilters(nurse, defaultJobFilters)).toBe(false);
    setJobOverridesSync({ 9001: { hidden: true } });
    expect(matchesHydFilters(nurse, defaultJobFilters)).toBe(false);
  });

  it('keeps silent jobs visible when Super Admin turns off auto-freeze', () => {
    const silent = { ...HYD_JOBS[0], lastReplyAt: new Date('2026-01-01').toISOString(), frozen: false };
    setPlatformControlsSync({ ...DEFAULT_PLATFORM_CONTROLS, autoFreezeGhosts: false });
    expect(matchesHydFilters(silent, defaultJobFilters)).toBe(true);
  });

  it('lets Super Admin unfreeze a seed-frozen job', () => {
    const frozen = HYD_JOBS.find((job) => job.id === 9005)!;
    expect(matchesHydFilters(frozen, defaultJobFilters)).toBe(false);
    setPlatformControlsSync({ ...DEFAULT_PLATFORM_CONTROLS, autoFreezeGhosts: false });
    setJobOverridesSync({ 9005: { frozen: false } });
    expect(matchesHydFilters(frozen, defaultJobFilters)).toBe(true);
  });

  it('keeps freelance gigs off the jobs feed', () => {
    const gig = HYD_JOBS.find((job) => job.id === 9101)!;
    expect(isFreelanceJob(gig)).toBe(true);
    expect(matchesHydFilters(gig, defaultJobFilters)).toBe(false);
    expect(matchesHydFilters(gig, { ...defaultJobFilters, freelanceOnly: true })).toBe(true);
    expect(matchesHydFilters(nurse, { ...defaultJobFilters, freelanceOnly: true })).toBe(false);
  });
});

describe('mergeHydJobs', () => {
  it('prepends Hyd jobs on page 1 and skips later pages', () => {
    const remote: Job[] = [{ id: 1, title: 'Remote Role' } as Job];
    const merged = mergeHydJobs(remote, defaultJobFilters, 1);
    expect(merged[0]?.id).toBeGreaterThanOrEqual(9000);
    expect(merged.some((job) => job.id === 1)).toBe(true);
    expect(mergeHydJobs(remote, defaultJobFilters, 2).map((job) => job.id)).toEqual([1]);
  });

  it('omits Super Admin frozen jobs from the seeker merge', () => {
    setJobOverridesSync({ 9002: { frozen: true } });
    const merged = mergeHydJobs([], defaultJobFilters, 1);
    expect(merged.some((job) => job.id === 9002)).toBe(false);
    expect(merged.some((job) => job.id === 9001)).toBe(true);
  });

  it('prepends live employer posts on page 1', () => {
    setEmployerListingsSync([
      {
        id: 'el-test',
        boardJobId: 7101,
        title: 'Staff Nurse',
        company: 'Helios Health',
        location: 'Gachibowli, Hyderabad',
        jobType: 'Full-time',
        salary: '₹28k',
        tags: 'Nursing',
        applicants: 0,
        status: 'open',
        postedAt: 'Just now',
      },
    ]);
    const merged = mergeHydJobs([], defaultJobFilters, 1);
    expect(merged.some((job) => job.id === 7101)).toBe(true);
    expect(merged.find((job) => job.id === 7101)?.verifiedEmployer).toBe(true);
    expect(mergeHydJobs([], defaultJobFilters, 2).some((job) => job.id === 7101)).toBe(false);
  });

  it('stamps Verified by Orbit Support only after Super Admin verifies a listing', () => {
    const merged = mergeHydJobs([], defaultJobFilters, 1);
    expect(merged.find((job) => job.id === 9001)?.verifiedEmployer).toBe(false);
    setJobOverridesSync({ 9001: { orbitVerified: true } });
    expect(mergeHydJobs([], defaultJobFilters, 1).find((job) => job.id === 9001)?.verifiedEmployer).toBe(true);
  });

  it('splits freelance gigs onto their own feed', () => {
    const jobs = mergeHydJobs([], defaultJobFilters, 1);
    const gigs = mergeHydJobs([], { ...defaultJobFilters, freelanceOnly: true }, 1);
    expect(jobs.some((job) => job.id === 9101)).toBe(false);
    expect(jobs.some((job) => job.id === 9001)).toBe(true);
    expect(gigs.some((job) => job.id === 9101)).toBe(true);
    expect(gigs.some((job) => job.id === 9001)).toBe(false);
  });
});

describe('jobsForStartup', () => {
  it('lists jobs and gigs for that company only', () => {
    const roles = jobsForStartup('Orbit Fleet');
    expect(roles.some((job) => job.id === 9007)).toBe(true);
    expect(roles.some((job) => job.id === 9102)).toBe(true);
    expect(roles.every((job) => job.company === 'Orbit Fleet')).toBe(true);
    expect(jobsForStartup('Missing Co')).toEqual([]);
  });
});

describe('mergeHydStartups', () => {
  it('prepends Hyderabad startups on page 1 and skips later pages', () => {
    const remote = [{
      id: 1,
      name: 'Marble',
      description: '',
      category: 'Dev Tools',
      openRoles: 1,
      upvotes: 1,
      initial: 'M',
      color: '#000',
      location: 'San Francisco',
    }];
    const merged = mergeHydStartups(remote, defaultStartupFilters, 1);
    expect(merged[0]?.id).toBeGreaterThanOrEqual(8000);
    expect(merged.some((startup) => startup.id === 1)).toBe(true);
    expect(merged.find((startup) => startup.id === 1)?.outsideLocation).toBe(true);
    expect(mergeHydStartups(remote, defaultStartupFilters, 2).every((startup) => startup.id < 8000)).toBe(true);
  });
});

describe('ghost freeze', () => {
  it('freezes jobs with no recruiter reply for 7 days', () => {
    const job = { ...HYD_JOBS[0], lastReplyAt: new Date('2026-01-01').toISOString() };
    expect(isGhostFrozen(job, Date.parse('2026-01-10T00:00:00.000Z'))).toBe(true);
    expect(isGhostFrozen(job, Date.parse('2026-01-02T00:00:00.000Z'))).toBe(false);
  });
});

describe('walk-ins and areas', () => {
  it('lists live walk-ins and known Hyd areas', () => {
    expect(walkInJobs().length).toBeGreaterThan(0);
    expect(visibleWalkInJobs().length).toBeGreaterThan(0);
    expect(HYD_AREAS).toContain('Gachibowli');
    expect(HYD_AREAS).toContain('HITEC City');
    expect(TELANGANA_DISTRICTS).toHaveLength(33);
    expect(TELANGANA_DISTRICTS).toContain('Hyderabad');
    expect(TELANGANA_DISTRICTS).toContain('Warangal');
    expect(TELANGANA_DISTRICTS).toContain('Khammam');
  });

  it('drops walk-ins Super Admin froze', () => {
    const walkIn = visibleWalkInJobs()[0];
    expect(walkIn).toBeTruthy();
    setJobOverridesSync({ [walkIn.id]: { frozen: true } });
    expect(visibleWalkInJobs().some((job) => job.id === walkIn.id)).toBe(false);
  });
});

describe('previewHydJobs', () => {
  it('returns Telangana jobs immediately without calling the API', () => {
    const page = previewHydJobs(defaultJobFilters);
    expect(page.jobs.length).toBeGreaterThan(0);
    expect(page.jobs.every((job) => job.id >= 9000)).toBe(true);
    expect(page.postedTodayCount).toBeGreaterThanOrEqual(0);
  });
});
