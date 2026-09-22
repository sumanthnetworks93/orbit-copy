import type { Job } from '../types';

export function isFreelanceJob(job: Pick<Job, 'jobType' | 'tags'>): boolean {
  const blob = `${job.jobType ?? ''} ${job.tags ?? ''}`.toLowerCase();
  return /\bfreelance\b|\bgig\b/.test(blob);
}
