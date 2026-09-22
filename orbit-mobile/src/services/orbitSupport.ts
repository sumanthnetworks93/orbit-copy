import { getJobOverride } from './adminJobs';
import { isCompanyVerifiedByOrbitSupport } from './adminModeration';

export const ORBIT_SUPPORT_TAG = 'Verified by Orbit Support';

export function isJobVerifiedByOrbitSupport(job: { id: number; company: string }): boolean {
  const override = getJobOverride(job.id);
  if (override?.orbitVerified === false) return false;
  if (override?.orbitVerified === true) return true;
  return isCompanyVerifiedByOrbitSupport(job.company);
}

export function withOrbitSupportTag<T extends { id: number; company: string; verifiedEmployer?: boolean }>(job: T): T {
  return { ...job, verifiedEmployer: isJobVerifiedByOrbitSupport(job) };
}
