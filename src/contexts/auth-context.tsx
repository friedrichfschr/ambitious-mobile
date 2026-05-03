import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { ApiClientError, registerTokenStore } from '../lib/api';
import { authApi } from '../lib/auth-api';
import type { AuthResponse, AuthUser } from '../types/auth';

const STORAGE_KEY = 'ambitious-mobile.auth.session';
const LAUNCHED_KEY = 'ambitious-mobile.has-launched';

type StoredSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isHydrating: boolean;
  isFirstLaunch: boolean;
  isSigningIn: boolean;
  signInWithEmail: (input: { email: string; password: string }) => Promise<void>;
  // Register step 1: sends OTP, returns the email back. Does NOT sign in.
  startEmailRegistration: (input: { email: string; password: string; displayName: string }) => Promise<{ email: string }>;
  // Register step 2: verifies OTP and signs in.
  confirmEmailRegistration: (input: { email: string; code: string }) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signInWithApple: (input: { identityToken: string; firstName?: string; lastName?: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const persistSession = useCallback(async (next: StoredSession | null) => {
    if (!next) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setSession(null);
      return;
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
  }, []);

  const applyAuthResult = useCallback(async (result: AuthResponse) => {
    await persistSession({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  }, [persistSession]);

  useEffect(() => {
    (async () => {
      try {
        // Check first launch before anything else
        const launched = await AsyncStorage.getItem(LAUNCHED_KEY);
        if (!launched) {
          await AsyncStorage.setItem(LAUNCHED_KEY, '1');
          setIsFirstLaunch(true);
        }

        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) { setIsHydrating(false); return; }

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

  const sessionRef = useRef(session);
  useEffect(() => { sessionRef.current = session; }, [session]);

  // Register a token store so apiRequest can silently refresh on 401
  useEffect(() => {
    registerTokenStore({
      getRefreshToken: () => sessionRef.current?.refreshToken ?? null,
      onRefreshed: (accessToken, refreshToken) => {
        setSession((prev) => prev ? { ...prev, accessToken, refreshToken } : prev);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...sessionRef.current,
          accessToken,
          refreshToken,
        })).catch(() => {});
      },
    });
  }, []);

  const wrapSignIn = useCallback(async (work: () => Promise<AuthResponse>) => {
    setIsSigningIn(true);
    try {
      const result = await work();
      await applyAuthResult(result);
    } finally {
      setIsSigningIn(false);
    }
  }, [applyAuthResult]);

  const signOut = useCallback(async () => {
    try {
      const token = sessionRef.current?.accessToken;
      if (token) await authApi.logout(token);
    } catch (error) {
      console.warn('Logout request failed, clearing local session anyway', error);
    } finally {
      await persistSession(null);
    }
  }, [persistSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isHydrating,
      isFirstLaunch,
      isSigningIn,
      // wrapSignIn and signOut are stable (useCallback) — included directly
      signInWithEmail: (input) => wrapSignIn(() => authApi.login(input)),
      startEmailRegistration: (input) => authApi.register(input),
      confirmEmailRegistration: (input) => wrapSignIn(() => authApi.confirmRegistration(input)),
      signInWithGoogle: (idToken) => wrapSignIn(() => authApi.loginWithGoogle(idToken)),
      signInWithApple: (input) => wrapSignIn(() => authApi.loginWithApple(input)),
      signOut,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isHydrating, isFirstLaunch, isSigningIn, session, wrapSignIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
