import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'orbit_onboarding_done';

let done = false;
let hydrated = false;

export function isOnboardingDoneSync() {
  return done;
}

export async function getOnboardingDone(): Promise<boolean> {
  try {
    done = (await AsyncStorage.getItem(KEY)) === '1';
    hydrated = true;
    return done;
  } catch {
    done = false;
    hydrated = true;
    return false;
  }
}

export async function hydrateOnboarding(): Promise<boolean> {
  if (hydrated) return done;
  return getOnboardingDone();
}

export async function completeOnboarding(): Promise<void> {
  done = true;
  hydrated = true;
  await AsyncStorage.setItem(KEY, '1');
}

export function setOnboardingDoneSync(value: boolean) {
  done = value;
  hydrated = true;
}
