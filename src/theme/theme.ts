import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { MD3DarkTheme, MD3LightTheme, adaptNavigationTheme } from 'react-native-paper';

import { getAccent, type AccentName } from '@/src/theme/palette';

const { LightTheme: AdaptedLightTheme, DarkTheme: AdaptedDarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

export function buildThemes(mode: 'light' | 'dark', accentName: AccentName) {
  const accent = getAccent(accentName);
  const paperBase = mode === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const navigationBase = mode === 'dark' ? AdaptedDarkTheme : AdaptedLightTheme;

  const background = mode === 'dark' ? '#0A0D12' : '#F8FAFC';
  const surface = mode === 'dark' ? '#11161D' : '#FFFFFF';
  const surfaceVariant = mode === 'dark' ? '#1A222D' : '#EEF2F7';
  const outlineVariant = mode === 'dark' ? '#263142' : '#D8E0EA';
  const onSurface = mode === 'dark' ? '#F5F7FA' : '#111827';
  const onSurfaceVariant = mode === 'dark' ? '#C7D2DE' : '#5B6472';

  const paperTheme = {
    ...paperBase,
    roundness: 20,
    colors: {
      ...paperBase.colors,
      primary: accent.primary,
      secondary: accent.secondary,
      tertiary: accent.tertiary,
      background,
      surface,
      surfaceVariant,
      outlineVariant,
      onSurface,
      onSurfaceVariant,
      elevation: {
        ...paperBase.colors.elevation,
        level1: mode === 'dark' ? '#121923' : '#F5F7FB',
        level2: surface,
        level3: mode === 'dark' ? '#18212D' : '#FFFFFF',
      },
    },
  };

  const navigationTheme = {
    ...navigationBase,
    colors: {
      ...navigationBase.colors,
      primary: accent.primary,
      background,
      card: background,
      text: onSurface,
      border: outlineVariant,
      notification: accent.secondary,
    },
  };

  return { paperTheme, navigationTheme };
}
