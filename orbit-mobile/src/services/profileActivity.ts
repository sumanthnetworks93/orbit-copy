import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  applied: 'orbit_profile_applied',
  posted: 'orbit_profile_posted',
  upvoted: 'orbit_profile_upvoted',
} as const;

export type ProfileStatKey = keyof typeof KEYS;

export type ProfileStats = Record<ProfileStatKey, number>;

async function readCount(key: string): Promise<number> {
  const raw = await AsyncStorage.getItem(key);
  const value = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(value) ? value : 0;
}

export async function getProfileStats(): Promise<ProfileStats> {
  const [applied, posted, upvoted] = await Promise.all([
    readCount(KEYS.applied),
    readCount(KEYS.posted),
    readCount(KEYS.upvoted),
  ]);

  return { applied, posted, upvoted };
}

export async function incrementProfileStat(stat: ProfileStatKey): Promise<ProfileStats> {
  const key = KEYS[stat];
  const next = (await readCount(key)) + 1;
  await AsyncStorage.setItem(key, String(next));
  return getProfileStats();
}

const VOTED_KEY = 'orbit_voted_startup_ids';

async function readVotedIds(): Promise<number[]> {
  const raw = await AsyncStorage.getItem(VOTED_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as number[];
    return Array.isArray(parsed) ? parsed.filter((id) => Number.isFinite(id)) : [];
  } catch {
    return [];
  }
}

export async function isStartupVoted(id: number): Promise<boolean> {
  return (await readVotedIds()).includes(id);
}

export async function toggleStartupVote(id: number): Promise<{ voted: boolean }> {
  const ids = await readVotedIds();
  const voted = ids.includes(id);
  const nextIds = voted ? ids.filter((item) => item !== id) : [...ids, id];
  await AsyncStorage.setItem(VOTED_KEY, JSON.stringify(nextIds));
  const count = await readCount(KEYS.upvoted);
  await AsyncStorage.setItem(KEYS.upvoted, String(Math.max(0, count + (voted ? -1 : 1))));
  return { voted: !voted };
}
