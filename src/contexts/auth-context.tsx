import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';

import { ApiClientError } from '../lib/api';
import { authApi } from '../lib/auth-api';
import type { AuthResponse, AuthUser } from '../types/auth';

const STORAGE_KEY = 'ambitious-mobile.auth.session';

type StoredSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isHydrating: boolean;
  isSigningIn: boolean;
  signInWithEmail: (input: { email: string; password: string }) => Promise<void>;
  signUpWithEmail: (input: { email: string; password: string; displayName: string }) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signInWithApple: (input: { identityToken: string; firstName?: string; lastName?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function persistSession(next: StoredSession | null) {
    if (!next) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setSession(null);
      return;
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
  }

  async function applyAuthResult(result: AuthResponse) {
    await persistSession({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  }

  async function refreshSession() {
    if (!session?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const result = await authApi.refresh(session.refreshToken);
    await applyAuthResult(result);
  }

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
          setIsHydrating(false);
          return;
        }

        const stored = JSON.parse(raw) as StoredSession;
        setSession(stored);

        try {
          const me = await authApi.me(stored.accessToken);
          await persistSession({ ...stored, user: me.user });
        } catch (error) {
          if (error instanceof ApiClientError && error.statusCode === 401) {
            const refreshed = await authApi.refresh(stored.refreshToken);
            await applyAuthResult(refreshed);
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.warn('Failed to hydrate auth session', error);
        await AsyncStorage.removeItem(STORAGE_KEY);
        setSession(null);
      } finally {
        setIsHydrating(false);
      }
    })();
  }, []);

  async function wrapSignIn(work: () => Promise<AuthResponse>) {
    setIsSigningIn(true);
    try {
      const result = await work();
      await applyAuthResult(result);
    } finally {
      setIsSigningIn(false);
    }
  }

  async function signOut() {
    try {
      if (session?.accessToken) {
        await authApi.logout(session.accessToken);
      }
    } catch (error) {
      console.warn('Logout request failed, clearing local session anyway', error);
    } finally {
      await persistSession(null);
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isHydrating,
      isSigningIn,
      signInWithEmail: (input) => wrapSignIn(() => authApi.login(input)),
      signUpWithEmail: (input) => wrapSignIn(() => authApi.register(input)),
      signInWithGoogle: (idToken) => wrapSignIn(() => authApi.loginWithGoogle(idToken)),
      signInWithApple: (input) => wrapSignIn(() => authApi.loginWithApple(input)),
      signOut,
      refreshSession: async () => {
        if (!session?.refreshToken) {
          throw new Error('No refresh token available');
        }
        const result = await authApi.refresh(session.refreshToken);
        await applyAuthResult(result);
      },
    }),
    [isHydrating, isSigningIn, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
