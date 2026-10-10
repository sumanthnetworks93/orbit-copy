export function isStoreRelease() {
  if (process.env.EXPO_PUBLIC_E2E === '1') return false;
  if (process.env.EXPO_PUBLIC_STORE_RELEASE === '1') return true;
  return typeof __DEV__ !== 'undefined' && !__DEV__;
}

export function storeApiFallbackUrl(android: boolean) {
  if (isStoreRelease()) return '';
  return android ? 'http://10.0.2.2:5189' : 'http://localhost:5189';
}
