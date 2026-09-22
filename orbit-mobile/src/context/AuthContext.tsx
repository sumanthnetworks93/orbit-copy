import { useAuth as useClerkAuth, useUser } from '@clerk/expo';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isClerkConfigured } from '../config/clerk';
import { hydratePlatformControls } from '../services/adminControl';
import { hydrateJobOverrides } from '../services/adminJobs';
import { hydrateEmployerListings } from '../services/employerJobs';
import { hydrateAdminProfiles } from '../services/adminModeration';
import {
  getCurrentUser,
  isMockSession,
  subscribeAuth,
  type AuthUser,
} from '../services/auth';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  idToken: string | null;
  refreshToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapClerkUser(user: {
  id: string;
  primaryEmailAddress?: { emailAddress: string } | null;
  fullName?: string | null;
}): AuthUser {
  return {
    uid: user.id,
    email: user.primaryEmailAddress?.emailAddress ?? null,
    displayName: user.fullName ?? null,
    name: user.fullName ?? null,
    role: 'seeker',
  };
}

function useMockAuthUser() {
  const [mockUser, setMockUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void Promise.all([hydratePlatformControls(), hydrateJobOverrides(), hydrateEmployerListings(), hydrateAdminProfiles()]);
  }, []);

  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then((current) => {
        if (active && isMockSession(current)) {
          setMockUser(current);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });

    return subscribeAuth((nextUser) => {
      setMockUser(isMockSession(nextUser) ? nextUser : null);
    });
  }, []);

  return { mockUser, ready };
}

function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { mockUser } = useMockAuthUser();
  const user = mockUser ?? (isLoaded && isSignedIn && clerkUser ? mapClerkUser(clerkUser) : null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading: !isLoaded && !mockUser,
      idToken: null,
      refreshToken: () => getToken(),
    }),
    [mockUser, getToken, isLoaded, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function LocalAuthProvider({ children }: { children: React.ReactNode }) {
  const { mockUser, ready } = useMockAuthUser();

  const value = useMemo<AuthContextValue>(
    () => ({
      user: mockUser,
      loading: !ready && !mockUser,
      idToken: null,
      refreshToken: async () => null,
    }),
    [mockUser, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (isClerkConfigured) {
    return <ClerkAuthProvider>{children}</ClerkAuthProvider>;
  }

  return <LocalAuthProvider>{children}</LocalAuthProvider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
