import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { isLoopbackHost, isTunnelHost, nativeApiBaseUrl, rewriteHost } from '../hyd/previewUrl';
import { storeApiFallbackUrl } from './release';

function metroHostUri(): string {
  return (
    Constants.expoConfig?.hostUri ??
    (Constants as { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig?.debuggerHost ??
    ''
  );
}

function resolveApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim() || storeApiFallbackUrl(Platform.OS === 'android');
  if (!configured) return '';

  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return configured;
    const host = window.location.hostname;
    if (!host || isLoopbackHost(host) || isTunnelHost(host)) return configured;
    try {
      return rewriteHost(configured, host);
    } catch {
      return `http://${host}:5189`;
    }
  }

  return nativeApiBaseUrl(configured, metroHostUri());
}

export const API_BASE_URL = resolveApiBaseUrl();
