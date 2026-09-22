import AsyncStorage from '@react-native-async-storage/async-storage';

export type JobOverride = {
  frozen?: boolean;
  hidden?: boolean;
  orbitVerified?: boolean;
};

export type JobOverrides = Record<number, JobOverride>;

const KEY = 'orbit_admin_job_overrides';

let cache: JobOverrides = {};

function clean(overrides: JobOverrides): JobOverrides {
  const next: JobOverrides = {};
  Object.entries(overrides).forEach(([id, value]) => {
    if (value.frozen === undefined && value.hidden === undefined && value.orbitVerified === undefined) return;
    next[Number(id)] = value;
  });
  return next;
}

export function getJobOverridesSync(): JobOverrides {
  return cache;
}

export function getJobOverride(id: number): JobOverride | undefined {
  return cache[id];
}

export function setJobOverridesSync(next: JobOverrides) {
  cache = clean(next);
  return cache;
}

export async function getJobOverrides(): Promise<JobOverrides> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    cache = raw ? clean(JSON.parse(raw) as JobOverrides) : {};
    return cache;
  } catch {
    cache = {};
    return cache;
  }
}

export async function hydrateJobOverrides(): Promise<JobOverrides> {
  return getJobOverrides();
}

export async function setJobOverride(id: number, patch: JobOverride): Promise<JobOverrides> {
  const current = cache[id] ?? {};
  cache = clean({ ...cache, [id]: { ...current, ...patch } });
  await AsyncStorage.setItem(KEY, JSON.stringify(cache));
  return cache;
}

export async function toggleJobFrozen(id: number, currentlyFrozen: boolean): Promise<JobOverrides> {
  return setJobOverride(id, { frozen: !currentlyFrozen });
}

export async function toggleJobHidden(id: number, currentlyHidden: boolean): Promise<JobOverrides> {
  return setJobOverride(id, { hidden: !currentlyHidden });
}

export async function toggleJobOrbitVerified(id: number, currentlyVerified: boolean): Promise<JobOverrides> {
  return setJobOverride(id, { orbitVerified: !currentlyVerified });
}

export function countOverriddenJobs(overrides: JobOverrides = cache) {
  return Object.values(overrides).filter((item) => item.frozen || item.hidden).length;
}
