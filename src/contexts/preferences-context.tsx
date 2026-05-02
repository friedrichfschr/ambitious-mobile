import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
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
  setAccent: (accent: AccentName) => Promise<void>;
  setColorMode: (mode: ColorMode) => Promise<void>;
};

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function PreferencesProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useColorScheme();
  const [accent, setAccentState] = useState<AccentName>('indigo');
  const [colorMode, setColorModeState] = useState<ColorMode>('system');

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { accent?: AccentName; colorMode?: ColorMode };
      if (parsed.accent) setAccentState(parsed.accent);
      if (parsed.colorMode) setColorModeState(parsed.colorMode);
    })();
  }, []);

  const isDarkMode = colorMode === 'system' ? systemColorScheme === 'dark' : colorMode === 'dark';
  const { paperTheme, navigationTheme } = useMemo(() => buildThemes(isDarkMode ? 'dark' : 'light', accent), [accent, isDarkMode]);

  async function persist(nextAccent: AccentName, nextColorMode: ColorMode) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ accent: nextAccent, colorMode: nextColorMode }));
  }

  async function setAccent(nextAccent: AccentName) {
    setAccentState(nextAccent);
    await persist(nextAccent, colorMode);
  }

  async function setColorMode(nextMode: ColorMode) {
    setColorModeState(nextMode);
    await persist(accent, nextMode);
  }

  const colorModeLabel = colorMode === 'system' ? 'System default' : colorMode[0].toUpperCase() + colorMode.slice(1);

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
    [accent, colorMode, colorModeLabel, isDarkMode, paperTheme, navigationTheme],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used inside PreferencesProvider');
  return context;
}
