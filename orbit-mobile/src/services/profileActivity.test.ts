import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from 'vitest';
import { getProfileStats, isStartupVoted, toggleStartupVote } from './profileActivity';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('toggleStartupVote', () => {
  it('votes then unvotes and keeps the profile count in sync', async () => {
    expect(await isStartupVoted(8001)).toBe(false);
    expect((await toggleStartupVote(8001)).voted).toBe(true);
    expect(await isStartupVoted(8001)).toBe(true);
    expect((await getProfileStats()).upvoted).toBe(1);

    expect((await toggleStartupVote(8001)).voted).toBe(false);
    expect(await isStartupVoted(8001)).toBe(false);
    expect((await getProfileStats()).upvoted).toBe(0);
  });
});
