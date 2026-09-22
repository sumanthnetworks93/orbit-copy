import { defaultJobFilters, type Job, type JobFilters, type Startup, type StartupFilters } from '../types';
import { getPlatformControlsSync } from '../services/adminControl';
import { getJobOverride } from '../services/adminJobs';
import { getVisiblePostedJobs } from '../services/employerJobs';
import { isJobVerifiedByOrbitSupport, withOrbitSupportTag } from '../services/orbitSupport';
import { HYD_JOBS, HYD_STARTUPS, isGhostFrozen, type HydJob } from './seed';
import { jobMatchesDistrict } from './areas';
import { isFreelanceJob } from './freelance';
import { withLocationReconciliation, withStartupLocation } from './locationReconcile';

export function asHyd(job: Job): HydJob | null {
  return job.id >= 9000 ? (job as HydJob) : null;
}

export { isFreelanceJob } from './freelance';

function matchesFreelanceMode(job: Pick<Job, 'jobType' | 'tags'>, filters: JobFilters): boolean {
  return filters.freelanceOnly ? isFreelanceJob(job) : !isFreelanceJob(job);
}

export function isJobVisibleToSeekers(job: Pick<Job, 'id' | 'frozen' | 'lastReplyAt'>): boolean {
  const override = getJobOverride(job.id);
  if (override?.hidden) return false;
  if (override?.frozen !== undefined) {
    if (override.frozen) return false;
  } else if (job.frozen) {
    return false;
  }
  const hyd = asHyd(job as Job);
  if (hyd && getPlatformControlsSync().autoFreezeGhosts && isGhostFrozen({ ...hyd, frozen: false })) return false;
  return true;
}

export function isJobFrozenForDisplay(job: Job): boolean {
  const override = getJobOverride(job.id);
  if (override?.frozen !== undefined) return override.frozen;
  if (job.frozen) return true;
  const hyd = asHyd(job);
  if (hyd && getPlatformControlsSync().autoFreezeGhosts) {
    return isGhostFrozen({ ...hyd, frozen: false });
  }
  return false;
}

export function countFrozenHydJobs(jobs: HydJob[] = HYD_JOBS): number {
  return jobs.filter((job) => !isJobVisibleToSeekers(job)).length;
}

export function visibleWalkInJobs(jobs: HydJob[] = HYD_JOBS): HydJob[] {
  return jobs.filter((job) => Boolean(job.walkIn) && isJobVisibleToSeekers(job));
}

export function matchesHydFilters(job: HydJob, filters: JobFilters): boolean {
  if (!isJobVisibleToSeekers(job)) return false;
  if (!matchesFreelanceMode(job, filters)) return false;
  const q = filters.search.trim().toLowerCase();
  if (q && !`${job.title} ${job.company} ${job.tags} ${job.area}`.toLowerCase().includes(q)) return false;
  if (filters.jobType && job.jobType !== filters.jobType) return false;
  const loc = filters.location.trim().toLowerCase();
  if (loc && !filters.area && !`${job.location} ${job.area}`.toLowerCase().includes(loc)) return false;
  if (filters.remoteOnly) return false;
  if (filters.area && !jobMatchesDistrict(job.area, filters.area)) return false;
  if (filters.womenSafe && !job.womenSafe) return false;
  if (filters.cabProvided && !job.cabProvided) return false;
  if (filters.nearMetro && !job.nearMetro) return false;
  if (filters.lateShift && !job.lateShift) return false;
  if (filters.verifiedOnly && !isJobVerifiedByOrbitSupport(job)) return false;
  if (filters.walkInOnly && !job.walkIn) return false;
  return true;
}

export function mergeHydJobs(remote: Job[], filters: JobFilters, page: number): Job[] {
  const visibleRemote = remote
    .filter((job) => isJobVisibleToSeekers(job) && matchesFreelanceMode(job, filters))
    .map(withLocationReconciliation);
  if (page > 1) return visibleRemote;
  const hyd = HYD_JOBS.filter((job) => matchesHydFilters(job, filters));
  const posted = getVisiblePostedJobs(filters);
  const taken = new Set([...hyd, ...visibleRemote].map((job) => job.id));
  return [...hyd.filter((job) => !visibleRemote.some((item) => item.id === job.id)), ...posted.filter((job) => !taken.has(job.id)), ...visibleRemote]
    .map(withLocationReconciliation)
    .map(withOrbitSupportTag);
}

export function matchesHydStartupFilters(startup: Startup, filters: StartupFilters): boolean {
  const q = filters.search.trim().toLowerCase();
  if (q && !`${startup.name} ${startup.description} ${startup.category} ${startup.location}`.toLowerCase().includes(q)) {
    return false;
  }
  if (filters.category && !startup.category.includes(filters.category)) return false;
  if (filters.hiringOnly && startup.openRoles <= 0) return false;
  return true;
}

export function jobsForStartup(name: string, remote: Job[] = []): Job[] {
  const jobs = mergeHydJobs(remote, defaultJobFilters, 1);
  const gigs = mergeHydJobs(remote, { ...defaultJobFilters, freelanceOnly: true }, 1);
  return [...jobs, ...gigs].filter((job) => job.company === name);
}

export function mergeHydStartups(remote: Startup[], filters: StartupFilters, page: number): Startup[] {
  const mapped = remote.map((startup) =>
    withStartupLocation({
      ...startup,
      location: startup.location?.trim() || 'Remote',
    }),
  );
  if (page > 1) return mapped;
  const hyd = HYD_STARTUPS.filter((startup) => matchesHydStartupFilters(startup, filters)).map(withStartupLocation);
  const remoteIds = new Set(mapped.map((startup) => startup.id));
  return [...hyd.filter((startup) => !remoteIds.has(startup.id)), ...mapped];
}
