import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropsWithChildren, createContext, startTransition, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { type AccentName } from '@/src/theme/palette';
import { buildThemes } from '@/src/theme/theme';

const STORAGE_KEY = 'ambitious-mobile.preferences';

type ColorMode = 'system' | 'light' | 'dark';

type PreferencesContextValue = {
  accent: AccentName;
  colorMode: ColorMode;
  colorModeLabel: string;
  isDarkMode: boolean;
  paperTheme: ReturnType<typeof buildThemes>['paperTheme'];
  navigationTheme: ReturnType<typeof buildThemes>['navigationTheme'];
  setAccent: (accent: AccentName) => void;
  setColorMode: (mode: ColorMode) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function PreferencesProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useColorScheme();
  const [accent, setAccentState] = useState<AccentName>('indigo');
  const [colorMode, setColorModeState] = useState<ColorMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return;
      const parsed = JSON.parse(raw) as { accent?: AccentName; colorMode?: ColorMode };
      // Use startTransition so initial hydration doesn't block the UI
      startTransition(() => {
        if (parsed.accent) setAccentState(parsed.accent);
        if (parsed.colorMode) setColorModeState(parsed.colorMode);
      });
    });
  }, []);

  const isDarkMode = colorMode === 'system' ? systemColorScheme === 'dark' : colorMode === 'dark';
  const { paperTheme, navigationTheme } = useMemo(
    () => buildThemes(isDarkMode ? 'dark' : 'light', accent),
    [accent, isDarkMode],
  );

  const setAccent = useCallback((nextAccent: AccentName) => {
    // startTransition marks re-renders as non-urgent — keeps UI responsive during theme change
    startTransition(() => setAccentState(nextAccent));
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ accent: nextAccent, colorMode }));
  }, [colorMode]);

  const setColorMode = useCallback((nextMode: ColorMode) => {
    startTransition(() => setColorModeState(nextMode));
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ accent, colorMode: nextMode }));
  }, [accent]);

  const colorModeLabel =
    colorMode === 'system' ? 'System default' : colorMode[0].toUpperCase() + colorMode.slice(1);

  const value = useMemo(
    () => ({
      accent,
      colorMode,
      colorModeLabel,
      isDarkMode,
      paperTheme,
      navigationTheme,
      setAccent,
      setColorMode,
    }),
    // setAccent and setColorMode are stable (useCallback) — omitted from deps intentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accent, colorMode, colorModeLabel, isDarkMode, paperTheme, navigationTheme],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used inside PreferencesProvider');
  return context;
}
