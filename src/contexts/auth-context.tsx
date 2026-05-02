import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'ambitious-mobile.auth.preview-user';

type Provider = 'email' | 'google' | 'apple';

type User = {
  id: string;
  name: string;
  email: string;
  provider: Provider;
};

type AuthContextValue = {
  user: User | null;
  isSigningIn: boolean;
  signIn: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        setUser(JSON.parse(raw));
      }
    })();
  }, []);

  async function signIn(provider: Provider) {
    setIsSigningIn(true);
    const nextUser: User = {
      id: `preview-${provider}`,
      name: 'Preview User',
      email: `preview+${provider}@ambitious.app`,
      provider,
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    setIsSigningIn(false);
  }

  async function signOut() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isSigningIn,
      signIn,
      signOut,
    }),
    [user, isSigningIn],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
