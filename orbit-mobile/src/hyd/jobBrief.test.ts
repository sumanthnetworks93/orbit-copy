import { describe, expect, it } from 'vitest';
import { jobAbout, jobApplyHint, jobFacts, jobWorkLines, jobWorkplaceNotes } from './jobBrief';
import type { Job } from '../types';

const job: Job = {
  id: 9001,
  title: 'Staff Nurse',
  company: 'KIMS Hospitals',
  location: 'Gachibowli, Hyderabad',
  jobType: 'Full-time',
  tags: 'Night shift · Women-safe',
  salary: '₹28k–₹36k',
  initial: 'K',
  color: '#1B6B45',
  area: 'Gachibowli',
  commuteMin: 22,
  postedAt: new Date().toISOString(),
};

describe('jobBrief', () => {
  it('uses a written about when present', () => {
    expect(jobAbout({ ...job, about: 'Ward cover at KIMS.' })).toBe('Ward cover at KIMS.');
  });

  it('builds a fallback brief from the role', () => {
    const text = jobAbout(job);
    expect(text).toContain('Staff Nurse');
    expect(text).toContain('KIMS Hospitals');
    expect(text).toContain('six fields');
  });

  it('lists pay, type, area, and commute', () => {
    const labels = jobFacts(job).map((fact) => fact.label);
    expect(labels).toEqual(expect.arrayContaining(['Pay', 'Type', 'Area', 'Commute', 'Posted']));
  });

  it('splits tags into work lines', () => {
    expect(jobWorkLines(job)).toEqual(['Night shift', 'Women-safe']);
  });

  it('lists only workplace notes that apply', () => {
    expect(
      jobWorkplaceNotes(
        { ...job, womenSafe: true, cabProvided: true, nearMetro: false, lateShift: true, frozen: false },
        {
          womenSafe: 'Women-safe',
          cab: 'Cab provided',
          metro: 'Near metro',
          lateShift: 'Late shift',
          outsideLocation: 'Outside location',
          frozen: 'Frozen',
        },
      ),
    ).toEqual(['Women-safe', 'Cab provided', 'Late shift']);
  });

  it('describes freelance gigs and how to apply', () => {
    const gig = { ...job, jobType: 'Freelance', about: undefined };
    expect(jobAbout(gig)).toContain('freelance gig');
    expect(jobApplyHint(gig)).toContain('No PDF');
    expect(jobApplyHint(job)).toContain('Phone stays masked');
  });
});
