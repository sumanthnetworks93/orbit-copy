import { beforeEach, vi } from 'vitest';

const store = new Map<string, string>();

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (key: string) => store.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: async (key: string) => {
      store.delete(key);
    },
    multiRemove: async (keys: string[]) => {
      keys.forEach((key) => store.delete(key));
    },
    clear: async () => {
      store.clear();
    },
  },
}));

vi.mock('expo-constants', () => ({
  default: {
    expoConfig: { hostUri: '' },
    expoGoConfig: { debuggerHost: '' },
  },
}));

beforeEach(() => {
  store.clear();
});
