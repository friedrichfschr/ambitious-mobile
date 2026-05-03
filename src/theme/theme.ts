import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { MD3DarkTheme, MD3LightTheme, adaptNavigationTheme } from 'react-native-paper';

import { getAccent, type AccentName } from '@/src/theme/palette';

const { LightTheme: AdaptedLightTheme, DarkTheme: AdaptedDarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

// Cache all 12 theme combinations (6 accents × 2 modes) so repeated accent
// switches return the same object reference — React bails out of re-renders via Object.is.
const themeCache = new Map<string, { paperTheme: object; navigationTheme: object }>();

export function buildThemes(mode: 'light' | 'dark', accentName: AccentName) {
  const key = `${mode}:${accentName}`;
  const cached = themeCache.get(key);
  if (cached) return cached as ReturnType<typeof computeThemes>;
  const result = computeThemes(mode, accentName);
  themeCache.set(key, result);
  return result;
}

function computeThemes(mode: 'light' | 'dark', accentName: AccentName) {
  const accent = getAccent(accentName);
  const paperBase = mode === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const navigationBase = mode === 'dark' ? AdaptedDarkTheme : AdaptedLightTheme;

  // --- Surfaces ---
  const background     = mode === 'dark' ? '#0A0D12' : '#F4F6FA';
  const surface        = mode === 'dark' ? '#12181F' : '#FFFFFF';
  const surfaceVariant = mode === 'dark' ? '#1C2530' : '#EEF1F7';
  const outlineVariant = mode === 'dark' ? '#2A3547' : '#D4D9E4';
  const outline        = mode === 'dark' ? '#3D4F65' : '#9BA5B4';

  // --- Text ---
  const onSurface        = mode === 'dark' ? '#F0F4FA' : '#0F1623';
  const onSurfaceVariant = mode === 'dark' ? '#94A3B8' : '#5B6785';
  const onBackground     = onSurface;

  // --- Primary derived ---
  const primaryContainer    = mode === 'dark'
    ? accent.primary + '28'   // 16% opacity tint for dark
    : accent.primary + '18';  // 10% opacity tint for light
  const onPrimaryContainer  = accent.primary;

  const paperTheme = {
    ...paperBase,
    roundness: 4, // Used as base unit; Paper multiplies by 3 for most components → 12px
    colors: {
      ...paperBase.colors,
      primary:              accent.primary,
      onPrimary:            '#FFFFFF',
      primaryContainer,
      onPrimaryContainer,
      secondary:            accent.secondary,
      tertiary:             accent.tertiary,
      background,
      onBackground,
      surface,
      onSurface,
      surfaceVariant,
      onSurfaceVariant,
      outline,
      outlineVariant,
      elevation: {
        ...paperBase.colors.elevation,
        level0: background,
        level1: mode === 'dark' ? '#0F1520' : '#F8FAFD',
        level2: surface,
        level3: mode === 'dark' ? '#16202C' : '#FFFFFF',
        level4: mode === 'dark' ? '#18222F' : '#FFFFFF',
        level5: mode === 'dark' ? '#1A2433' : '#FFFFFF',
      },
    },
  };

  const navigationTheme = {
    ...navigationBase,
    colors: {
      ...navigationBase.colors,
      primary:      accent.primary,
      background,
      card:         background,
      text:         onSurface,
      border:       outlineVariant,
      notification: accent.secondary,
    },
  };

  return { paperTheme, navigationTheme };
}
