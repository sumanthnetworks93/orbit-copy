import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { OAuthProvider, type Models } from 'react-native-appwrite';
import { Platform } from 'react-native';
import {
  account,
  APPWRITE_CALLBACK_SCHEME,
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
} from '../config/appwrite';
import { isStoreRelease } from '../config/release';

import {
  DEMO_SEEKER,
  findDemoAccount,
} from './demoAccounts';
import { reportLoginAlert } from './api';

WebBrowser.maybeCompleteAuthSession();

export type AuthProviderId = 'apple' | 'google' | 'linkedin' | 'github';

export type UserRole = 'seeker' | 'employer' | 'admin';

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  name: string | null;
  role: UserRole;
  company?: string;
};

const E2E_SESSION_KEY = 'orbit_e2e_user';
const DEMO_SEEKER_SESSION_KEY = 'orbit_demo_seeker';
const EMPLOYER_SESSION_KEY = 'orbit_employer_user';
const ADMIN_SESSION_KEY = 'orbit_admin_user';
const E2E_USER: AuthUser = {
  uid: 'e2e-user',
  email: 'e2e@orbit.test',
  displayName: 'E2E User',
  name: 'E2E User',
  role: 'seeker',
};

export { DEMO_PASSWORD, DEMO_SEEKER, DEMO_ACCOUNTS } from './demoAccounts';

export const MOCK_EMPLOYER: AuthUser = {
  uid: 'employer-user',
  email: 'sarah@helios.health',
  displayName: 'Sarah Bennett',
  name: 'Sarah Bennett',
  role: 'employer',
  company: 'Helios Health',
};

export const MOCK_ADMIN: AuthUser = {
  uid: 'admin-user',
  email: 'admin@orbit.test',
  displayName: 'Orbit Super Admin',
  name: 'Orbit Super Admin',
  role: 'admin',
  company: 'Orbit Control',
};

export function isGuestSession(user: AuthUser | null) {
  return user?.uid === E2E_USER.uid;
}

function browserLocation(): Location | undefined {
  if (Platform.OS !== 'web') return undefined;
  if (typeof window === 'undefined') return undefined;
  return window.location;
}

export function isE2EMode() {
  if (process.env.EXPO_PUBLIC_E2E === '1') return true;
  const search = browserLocation()?.search;
  if (!search) return false;
  return new URLSearchParams(search).get('e2e') === '1';
}

const PROVIDERS: Record<AuthProviderId, OAuthProvider> = {
  apple: OAuthProvider.Apple,
  google: OAuthProvider.Google,
  linkedin: OAuthProvider.Linkedin,
  github: OAuthProvider.Github,
};

const authListeners = new Set<(user: AuthUser | null) => void>();

function notifyAuthChange(user: AuthUser | null) {
  authListeners.forEach((listener) => listener(user));
}

export function subscribeAuth(listener: (user: AuthUser | null) => void) {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
}

export function mapAppwriteUser(user: Models.User<Models.Preferences>): AuthUser {
  return {
    uid: user.$id,
    email: user.email || null,
    displayName: user.name || null,
    name: user.name || null,
    role: 'seeker',
  };
}

function getSsoRedirectUri() {
  // Appwrite only allows hostnames registered as Web platforms.
  // Expo tunnel hosts (*.exp.direct) change and are rejected unless added in Console.
  if (Platform.OS === 'web') {
    return 'http://localhost:8081/';
  }

  return makeRedirectUri({
    scheme: APPWRITE_CALLBACK_SCHEME,
    preferLocalhost: true,
    path: '/',
  });
}

function getCallbackParams(source?: string) {
  const raw = source ?? browserLocation()?.href ?? '';
  if (!raw) return { userId: null, secret: null, error: null };

  const url = new URL(raw);
  return {
    userId: url.searchParams.get('userId') ?? url.searchParams.get('user_id'),
    secret: url.searchParams.get('secret'),
    error: url.searchParams.get('error') ?? url.searchParams.get('message'),
  };
}

export async function completeSsoFromUrl(callbackUrl?: string): Promise<AuthUser | null> {
  const { userId, secret, error } = getCallbackParams(callbackUrl);
  if (error) {
    throw new Error(error);
  }
  if (!userId || !secret) {
    return null;
  }

  await account.createSession({ userId, secret });
  const user = mapAppwriteUser(await account.get());
  notifyAuthChange(user);
  notifyAdminLogin(user, 'sso');

  const page = browserLocation();
  if (page) {
    const clean = new URL(page.href);
    clean.searchParams.delete('userId');
    clean.searchParams.delete('user_id');
    clean.searchParams.delete('secret');
    clean.searchParams.delete('error');
    clean.searchParams.delete('message');
    window.history.replaceState({}, '', clean.toString());
  }

  return user;
}

export async function signInWithPassword(email: string, password: string): Promise<AuthUser> {
  const user = findDemoAccount(email, password);
  if (!user) {
    throw new Error(isStoreRelease() ? 'Check your email and password.' : 'Use priya@orbit.app / OrbitDemo1!');
  }
  await clearMockSessions();
  if (user.role === 'employer') {
    await AsyncStorage.setItem(EMPLOYER_SESSION_KEY, '1');
  } else if (user.role === 'admin') {
    await AsyncStorage.setItem(ADMIN_SESSION_KEY, '1');
  } else {
    await AsyncStorage.setItem(DEMO_SEEKER_SESSION_KEY, '1');
  }
  notifyAuthChange(user);
  notifyAdminLogin(user, 'password');
  return user;
}

export async function signInAsUser(): Promise<AuthUser> {
  await clearMockSessions();
  await AsyncStorage.setItem(DEMO_SEEKER_SESSION_KEY, '1');
  notifyAuthChange(DEMO_SEEKER);
  notifyAdminLogin(DEMO_SEEKER, 'demo-user');
  return DEMO_SEEKER;
}

export async function signInAsGuest(): Promise<AuthUser> {
  await clearMockSessions();
  await AsyncStorage.setItem(E2E_SESSION_KEY, '1');
  notifyAuthChange(E2E_USER);
  notifyAdminLogin(E2E_USER, 'guest');
  return E2E_USER;
}

export async function signInAsEmployer(): Promise<AuthUser> {
  await clearMockSessions();
  await AsyncStorage.setItem(EMPLOYER_SESSION_KEY, '1');
  notifyAuthChange(MOCK_EMPLOYER);
  notifyAdminLogin(MOCK_EMPLOYER, 'demo-employer');
  return MOCK_EMPLOYER;
}

export async function signInAsAdmin(): Promise<AuthUser> {
  await clearMockSessions();
  await AsyncStorage.setItem(ADMIN_SESSION_KEY, '1');
  notifyAuthChange(MOCK_ADMIN);
  notifyAdminLogin(MOCK_ADMIN, 'demo-admin');
  return MOCK_ADMIN;
}

function notifyAdminLogin(user: AuthUser, method: string) {
  if (isE2EMode()) return;
  void reportLoginAlert(user, method).catch(() => undefined);
}

async function clearMockSessions() {
  await AsyncStorage.multiRemove([
    E2E_SESSION_KEY,
    DEMO_SEEKER_SESSION_KEY,
    EMPLOYER_SESSION_KEY,
    ADMIN_SESSION_KEY,
  ]);
}

export function isMockSession(user: AuthUser | null): boolean {
  return (
    user?.uid === E2E_USER.uid
    || user?.uid === DEMO_SEEKER.uid
    || user?.uid === MOCK_EMPLOYER.uid
    || user?.uid === MOCK_ADMIN.uid
  );
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    if ((await AsyncStorage.getItem(ADMIN_SESSION_KEY)) === '1') {
      return MOCK_ADMIN;
    }
    if ((await AsyncStorage.getItem(EMPLOYER_SESSION_KEY)) === '1') {
      return MOCK_EMPLOYER;
    }
    if ((await AsyncStorage.getItem(DEMO_SEEKER_SESSION_KEY)) === '1') {
      return DEMO_SEEKER;
    }
    if ((await AsyncStorage.getItem(E2E_SESSION_KEY)) === '1') {
      return E2E_USER;
    }
    const fromCallback = await completeSsoFromUrl();
    if (fromCallback) return fromCallback;
    return mapAppwriteUser(await account.get());
  } catch {
    return null;
  }
}

export async function getIdToken(): Promise<string | null> {
  if ((await AsyncStorage.getItem(E2E_SESSION_KEY)) === '1') {
    return 'e2e-token';
  }
  try {
    const jwt = await account.createJWT();
    return jwt.jwt;
  } catch {
    return null;
  }
}

function buildSsoUrl(provider: OAuthProvider, redirectUri: string) {
  const url = new URL(`${APPWRITE_ENDPOINT}/account/tokens/oauth2/${provider}`);
  url.searchParams.set('project', APPWRITE_PROJECT_ID);
  url.searchParams.set('success', redirectUri);
  url.searchParams.set('failure', redirectUri);
  return url;
}

export async function signInWithSso(provider: AuthProviderId): Promise<AuthUser> {
  const redirectUri = getSsoRedirectUri();
  const loginUrl =
    (await account.createOAuth2Token({
      provider: PROVIDERS[provider],
      success: redirectUri,
      failure: redirectUri,
    })) ?? buildSsoUrl(PROVIDERS[provider], redirectUri);

  if (!loginUrl) {
    throw new Error('Appwrite did not return an SSO URL. Check that this provider is enabled.');
  }

  const page = browserLocation();
  if (page) {
    page.assign(String(loginUrl));
    return new Promise<AuthUser>(() => undefined);
  }

  const result = await WebBrowser.openAuthSessionAsync(String(loginUrl), redirectUri, {
    showInRecents: true,
    preferEphemeralSession: true,
  });

  if (result.type !== 'success' || !result.url) {
    throw new Error('SSO sign in was cancelled.');
  }

  const user = await completeSsoFromUrl(result.url);
  if (!user) {
    throw new Error('SSO callback was missing credentials. Enable this provider in Appwrite Auth.');
  }
  return user;
}

export async function signInWithApple() {
  return signInWithSso('apple');
}

export async function signInWithGoogle() {
  return signInWithSso('google');
}

export async function signInWithGitHub() {
  return signInWithSso('github');
}

export async function signInWithLinkedIn() {
  return signInWithSso('linkedin');
}

export async function signOutUser(): Promise<void> {
  await AsyncStorage.removeItem(E2E_SESSION_KEY);
  await AsyncStorage.removeItem(DEMO_SEEKER_SESSION_KEY);
  await AsyncStorage.removeItem(EMPLOYER_SESSION_KEY);
  await AsyncStorage.removeItem(ADMIN_SESSION_KEY);
  try {
    const { getClerkInstance } = await import('@clerk/expo');
    await getClerkInstance().signOut();
  } catch {
    // Clerk session may already be cleared.
  }
  try {
    await account.deleteSession({ sessionId: 'current' });
  } catch {
    // Already signed out or no session.
  }
  notifyAuthChange(null);
}
