import { partitionJobsByLocation } from './locationReconcile';

export function dayKeyInIst(at: Date | string | number): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(at));
}

export function postedDayLabel(dayKey: string, now = Date.now()): string {
  if (dayKey === 'earlier') return 'Earlier';
  const today = dayKeyInIst(now);
  if (dayKey === today) return 'Today';
  if (dayKey === dayKeyInIst(now - 86_400_000)) return 'Yesterday';
  const [year, month, day] = dayKey.split('-').map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1)).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function isPostedOnDay(postedAt: string | null | undefined, dayKey: string): boolean {
  if (!postedAt) return false;
  return dayKeyInIst(postedAt) === dayKey;
}

export function countPostedOnDay<T extends { postedAt?: string | null }>(jobs: T[], dayKey: string): number {
  return jobs.filter((job) => isPostedOnDay(job.postedAt, dayKey)).length;
}

export type PostedDayCount = { date: string; count: number };

export function mergeDayCounts(api: PostedDayCount[] | undefined, extraJobs: { postedAt?: string | null }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of api ?? []) {
    if (!row.date) continue;
    counts[row.date] = (counts[row.date] ?? 0) + row.count;
  }
  for (const job of extraJobs) {
    if (!job.postedAt) continue;
    const key = dayKeyInIst(job.postedAt);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export type JobsFeedRow<T extends { id: number; postedAt?: string | null }> =
  | { kind: 'section'; key: string; label: string; hint?: string; count: number }
  | { kind: 'day'; key: string; label: string; count: number; group: string }
  | { kind: 'job'; job: T };

function appendDayGroups<T extends { id: number; postedAt?: string | null }>(
  rows: JobsFeedRow<T>[],
  jobs: T[],
  counts: Record<string, number>,
  now: number,
  group: string,
) {
  const sorted = [...jobs].sort((left, right) => {
    const leftAt = left.postedAt ? Date.parse(left.postedAt) : 0;
    const rightAt = right.postedAt ? Date.parse(right.postedAt) : 0;
    if (rightAt !== leftAt) return rightAt - leftAt;
    return right.id - left.id;
  });

  const groups: { key: string; items: T[] }[] = [];
  for (const job of sorted) {
    const key = job.postedAt ? dayKeyInIst(job.postedAt) : 'earlier';
    const last = groups[groups.length - 1];
    if (last?.key === key) last.items.push(job);
    else groups.push({ key, items: [job] });
  }

  for (const item of groups) {
    rows.push({
      kind: 'day',
      key: item.key,
      label: postedDayLabel(item.key, now),
      count: item.key === 'earlier' ? item.items.length : counts[item.key] ?? item.items.length,
      group,
    });
    for (const job of item.items) {
      rows.push({ kind: 'job', job });
    }
  }
}

export function jobsFeedRows<T extends { id: number; postedAt?: string | null; location?: string; area?: string; outsideLocation?: boolean }>(
  jobs: T[],
  counts: Record<string, number>,
  now = Date.now(),
  preferredLocation = '',
): JobsFeedRow<T>[] {
  const hasLocation = jobs.some((job) => job.location != null || job.outsideLocation != null);
  if (!hasLocation) {
    const rows: JobsFeedRow<T>[] = [];
    appendDayGroups(rows, jobs, counts, now, 'nearby');
    return rows;
  }

  const { matching, other, outside } = partitionJobsByLocation(jobs, preferredLocation);
  const rows: JobsFeedRow<T>[] = [];
  const nearbyLabel = preferredLocation ? `In ${preferredLocation}` : 'Nearby';
  if (matching.length > 0) {
    rows.push({
      kind: 'section',
      key: 'nearby',
      label: nearbyLabel,
      hint: preferredLocation ? `Roles in ${preferredLocation}` : 'Roles near you',
      count: matching.length,
    });
    appendDayGroups(rows, matching, counts, now, 'nearby');
  }
  if (other.length > 0) {
    rows.push({
      kind: 'section',
      key: 'other',
      label: 'More local roles',
      hint: 'Still in Telangana, outside your selected city',
      count: other.length,
    });
    appendDayGroups(rows, other, counts, now, 'other');
  }
  if (outside.length > 0) {
    rows.push({
      kind: 'section',
      key: 'outside',
      label: 'Outside location',
      hint: 'Roles beyond India and Hyderabad',
      count: outside.length,
    });
    appendDayGroups(rows, outside, counts, now, 'outside');
  }
  return rows;
}

export type StartupFeedRow<T extends { id: number }> =
  | { kind: 'section'; key: string; label: string; hint?: string; count: number }
  | { kind: 'startup'; startup: T };

export function startupFeedRows<T extends { id: number; location?: string; area?: string; outsideLocation?: boolean }>(
  startups: T[],
  preferredLocation = '',
): StartupFeedRow<T>[] {
  const { matching, other, outside } = partitionJobsByLocation(
    startups.map((startup) => ({ ...startup, location: startup.location ?? '' })),
    preferredLocation,
  );
  const rows: StartupFeedRow<T>[] = [];
  const nearbyLabel = preferredLocation ? `In ${preferredLocation}` : 'Nearby';
  if (matching.length > 0) {
    rows.push({
      kind: 'section',
      key: 'nearby',
      label: nearbyLabel,
      hint: preferredLocation ? `Startups in ${preferredLocation}` : 'Startups near you',
      count: matching.length,
    });
    for (const startup of matching) {
      rows.push({ kind: 'startup', startup });
    }
  }
  if (other.length > 0) {
    rows.push({
      kind: 'section',
      key: 'other',
      label: 'More local startups',
      hint: 'Still in Telangana, outside your selected city',
      count: other.length,
    });
    for (const startup of other) {
      rows.push({ kind: 'startup', startup });
    }
  }
  if (outside.length > 0) {
    rows.push({
      kind: 'section',
      key: 'outside',
      label: 'Outside location',
      hint: 'Startups beyond India and Hyderabad',
      count: outside.length,
    });
    for (const startup of outside) {
      rows.push({ kind: 'startup', startup });
    }
  }
  return rows;
}
