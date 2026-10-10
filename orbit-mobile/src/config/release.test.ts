import { describe, expect, it } from 'vitest';
import { isStoreRelease, storeApiFallbackUrl } from './release';

describe('store release', () => {
  it('keeps local Expo / tests off the store path', () => {
    expect(isStoreRelease()).toBe(false);
    expect(storeApiFallbackUrl(true)).toBe('http://10.0.2.2:5189');
    expect(storeApiFallbackUrl(false)).toBe('http://localhost:5189');
  });
});
