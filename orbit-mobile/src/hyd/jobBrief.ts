import type { Job } from '../types';
import { dayKeyInIst, postedDayLabel } from './postedAt';

export type JobFact = { label: string; value: string };

export function jobAbout(job: Job): string {
  if (job.about?.trim()) return job.about.trim();
  const area = job.area ?? job.location.split(',')[0]?.trim() ?? 'Hyderabad';
  const lines = [`${job.title} with ${job.company} in ${area}.`];
  if (job.jobType.toLowerCase() === 'freelance') {
    lines.push('A short freelance gig. Pay is per project, not a monthly desk job.');
  } else {
    lines.push(`This is a ${job.jobType.toLowerCase()} role.`);
  }
  if (job.lateShift) lines.push('Expect evening or night cover.');
  if (job.walkIn) lines.push(`Walk-in on ${job.walkIn.date} at ${job.walkIn.venue}.`);
  lines.push('Apply in six fields. No PDF resume.');
  return lines.join(' ');
}

export function jobFacts(job: Job): JobFact[] {
  const facts: JobFact[] = [
    { label: 'Pay', value: job.salary },
    { label: 'Type', value: job.jobType },
    { label: 'Area', value: job.area ?? job.location },
  ];
  if (job.commuteMin) facts.push({ label: 'Commute', value: `About ${job.commuteMin} min` });
  if (job.postedAt) {
    facts.push({ label: 'Posted', value: postedDayLabel(dayKeyInIst(job.postedAt)) });
  }
  return facts;
}

export function jobWorkLines(job: Job): string[] {
  return String(job.tags ?? '')
    .split(/[·,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function jobWorkplaceNotes(job: Job, labels: {
  womenSafe: string;
  cab: string;
  metro: string;
  lateShift: string;
  outsideLocation: string;
  frozen: string;
}): string[] {
  const notes: string[] = [];
  if (job.womenSafe) notes.push(labels.womenSafe);
  if (job.cabProvided) notes.push(labels.cab);
  if (job.nearMetro) notes.push(labels.metro);
  if (job.lateShift) notes.push(labels.lateShift);
  if (job.outsideLocation) notes.push(labels.outsideLocation);
  if (job.frozen) notes.push(labels.frozen);
  return notes;
}

export function jobApplyHint(job: Job): string {
  if (job.jobType.toLowerCase() === 'freelance') {
    return 'Tell them your name, area, and when you can start. No PDF.';
  }
  return 'Name, phone, area, last job, and joining date. Phone stays masked.';
}
