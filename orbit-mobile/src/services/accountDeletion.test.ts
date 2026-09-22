import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const signOutUser = vi.fn(async () => undefined);

vi.mock('./auth', () => ({
  signOutUser: () => signOutUser(),
}));

import { closeSeekerAccount } from './accountDeletion';

describe('accountDeletion', () => {
  beforeEach(() => {
    signOutUser.mockClear();
  });

  it('clears seeker data and signs out', async () => {
    await AsyncStorage.setItem('orbit_onboarding_done', '1');
    await AsyncStorage.setItem('orbit_profile_display_name', 'Priya Rao');
    await AsyncStorage.setItem('orbit_job_reports', '[]');
    await AsyncStorage.setItem('orbit_simple_resume', '{}');
    await AsyncStorage.setItem('unrelated', 'keep');

    await closeSeekerAccount();

    expect(await AsyncStorage.getItem('orbit_onboarding_done')).toBeNull();
    expect(await AsyncStorage.getItem('orbit_profile_display_name')).toBeNull();
    expect(await AsyncStorage.getItem('orbit_job_reports')).toBeNull();
    expect(await AsyncStorage.getItem('orbit_simple_resume')).toBeNull();
    expect(await AsyncStorage.getItem('unrelated')).toBe('keep');
    expect(signOutUser).toHaveBeenCalledOnce();
  });
});
