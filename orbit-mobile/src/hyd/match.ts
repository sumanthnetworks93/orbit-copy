import type { Job } from '../types';
import { isJobVerifiedByOrbitSupport } from '../services/orbitSupport';
import { asHyd, isJobVisibleToSeekers } from './filter';

export type MatchProfile = {
  role: string;
  area: string;
};

export type RankedMatch = {
  job: Job;
  score: number;
  reasons: string[];
};

const ROLE_ALIASES: Record<string, string[]> = {
  nurse: ['nurse', 'nursing', 'staff nurse'],
  driver: ['driver', 'cab', 'delivery', 'fleet', 'lmv'],
  delivery: ['delivery', 'driver', 'associate'],
  accountant: ['accountant', 'tally', 'gst', 'finance', 'analyst'],
  sales: ['sales', 'store', 'kirana', 'shop'],
  cook: ['cook', 'kitchen', 'chef'],
  pharmacist: ['pharmacist', 'pharma', 'd.pharm'],
  bpo: ['bpo', 'voice', 'evening'],
  receptionist: ['front office', 'reception', 'executive'],
  security: ['security', 'supervisor'],
};

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9\u0c00-\u0c7f.]+/)
    .filter((token) => token.length > 1);
}

function roleNeedles(role: string): string[] {
  const raw = role.trim().toLowerCase();
  if (!raw) return [];
  const extra = Object.entries(ROLE_ALIASES).flatMap(([key, aliases]) =>
    raw.includes(key) || aliases.some((alias) => raw.includes(alias)) ? [key, ...aliases] : [],
  );
  return Array.from(new Set([raw, ...tokenize(raw), ...extra]));
}

export function scoreJobMatch(job: Job, profile: MatchProfile): { score: number; reasons: string[] } {
  const haystack = `${job.title} ${job.tags} ${job.company} ${job.jobType}`.toLowerCase();
  const reasons: string[] = [];
  let score = 0;

  const needles = roleNeedles(profile.role);
  if (needles.some((needle) => haystack.includes(needle))) {
    score += 55;
    reasons.push('Role matches your voice resume');
  }

  const area = profile.area.trim().toLowerCase();
  if (area && (`${job.area ?? ''} ${job.location}`.toLowerCase().includes(area) || area.includes((job.area ?? '').toLowerCase()))) {
    score += 30;
    reasons.push(`Near ${job.area ?? profile.area}`);
  }

  if (isJobVerifiedByOrbitSupport(job)) {
    score += 8;
    reasons.push('Verified by Orbit Support');
  }
  if (job.walkIn) {
    score += 7;
    reasons.push('Walk-in this week');
  }

  return { score: Math.min(99, score), reasons };
}

export function rankMatchedJobs(jobs: Job[], profile: MatchProfile, minScore = 45): RankedMatch[] {
  return jobs
    .filter((job) => {
      const hyd = asHyd(job);
      if (hyd) return isJobVisibleToSeekers(hyd);
      return !job.frozen;
    })
    .map((job) => ({ job, ...scoreJobMatch(job, profile) }))
    .filter((item) => item.score >= minScore)
    .sort((a, b) => b.score - a.score);
}
