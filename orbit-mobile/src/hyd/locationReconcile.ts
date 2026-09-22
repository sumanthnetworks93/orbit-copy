import { HYD_AREAS, TELANGANA_DISTRICTS, jobMatchesDistrict } from './areas';
import type { Job } from '../types';

export const OUTSIDE_LOCATION_TAG = 'Outside location';

const LOCAL_MARKERS = [
  'hyderabad',
  'secunderabad',
  'telangana',
  'hitec city',
  'hitech city',
  'hitec',
  'hitech',
  ...HYD_AREAS.map((area) => area.toLowerCase()),
  ...TELANGANA_DISTRICTS.map((district) => district.toLowerCase()),
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/[._/|]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function hasMarker(haystack: string, marker: string): boolean {
  if (marker.length <= 3) {
    return new RegExp(`(?:^|[^a-z0-9])${marker}(?:$|[^a-z0-9])`).test(haystack);
  }
  return haystack.includes(marker);
}

export function isIndiaHyderabadLocation(location: string, area?: string | null): boolean {
  const haystack = normalize(`${location} ${area ?? ''}`);
  if (!haystack) return false;
  return LOCAL_MARKERS.some((marker) => hasMarker(haystack, marker));
}

export function isOutsideLocation(location: string, area?: string | null): boolean {
  return !isIndiaHyderabadLocation(location, area);
}

function tagList(tags: string): string[] {
  return tags
    .split(/[·|,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function joinTags(tags: string[]): string {
  return tags.join(' · ');
}

export function applyOutsideLocationTag(tags: string, outside: boolean): string {
  const next = tagList(tags).filter((tag) => tag.toLowerCase() !== OUTSIDE_LOCATION_TAG.toLowerCase());
  if (outside) next.push(OUTSIDE_LOCATION_TAG);
  return joinTags(next);
}

export function withLocationReconciliation<T extends Pick<Job, 'location' | 'tags'> & { area?: string }>(job: T): T {
  const outside = isOutsideLocation(job.location ?? '', job.area);
  return {
    ...job,
    tags: applyOutsideLocationTag(job.tags ?? '', outside),
    outsideLocation: outside,
  };
}

export function withStartupLocation<T extends { location: string; area?: string }>(startup: T): T & { outsideLocation: boolean } {
  return {
    ...startup,
    outsideLocation: isOutsideLocation(startup.location, startup.area),
  };
}

export function areaFromGeo(city?: string | null, state?: string | null, district?: string | null): string | null {
  const cityName = city?.trim() ?? '';
  const stateName = state?.trim() ?? '';
  const districtName = district?.trim() ?? '';
  if ((HYD_AREAS as readonly string[]).includes(cityName)) return cityName;
  if (/secunderabad/i.test(cityName)) return 'Hyderabad';
  if (/hyderabad/i.test(cityName) || /hyderabad/i.test(districtName)) return 'Hyderabad';
  const local = [cityName, districtName].find((value) =>
    (TELANGANA_DISTRICTS as readonly string[]).includes(value),
  );
  if (local) return local;
  if (/telangana/i.test(stateName)) return 'Hyderabad';
  return null;
}

export function preferredLocationLabel(input: {
  area?: string | null;
  location?: string | null;
  geoCity?: string | null;
}): string {
  const area = input.area?.trim();
  if (area) return area;
  const location = input.location?.trim();
  if (location) return location.split(',')[0]?.trim() || location;
  return input.geoCity?.trim() || '';
}

export function matchesPreferredLocation(
  job: Pick<Job, 'location'> & { area?: string; outsideLocation?: boolean },
  preferred: string,
): boolean {
  const needle = preferred.trim();
  if (!needle) return !job.outsideLocation && !isOutsideLocation(job.location, job.area);
  if (job.outsideLocation || isOutsideLocation(job.location, job.area)) return false;

  const haystack = `${job.location} ${job.area ?? ''}`.toLowerCase();
  if (haystack.includes(needle.toLowerCase())) return true;
  if (job.area && jobMatchesDistrict(job.area, needle)) return true;
  return false;
}

export function partitionJobsByLocation<T extends Pick<Job, 'location'> & { area?: string; outsideLocation?: boolean }>(
  jobs: T[],
  preferred: string,
): { matching: T[]; other: T[]; outside: T[] } {
  const matching: T[] = [];
  const other: T[] = [];
  const outside: T[] = [];

  for (const job of jobs) {
    const isOutside = Boolean(job.outsideLocation) || isOutsideLocation(job.location, job.area);
    if (isOutside) {
      outside.push(job);
      continue;
    }
    if (matchesPreferredLocation(job, preferred)) matching.push(job);
    else other.push(job);
  }

  return { matching, other, outside };
}
