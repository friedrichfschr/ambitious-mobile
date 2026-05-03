import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '../src/contexts/auth-context';
import { PreferencesProvider, usePreferences } from '../src/contexts/preferences-context';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function AppNavigator() {
  const { isDarkMode, navigationTheme, paperTheme } = usePreferences();
  const { isHydrating, isFirstLaunch, user } = useAuth();

  // On first launch with no session, send to auth welcome screen
  useEffect(() => {
    if (isHydrating) return;
    if (isFirstLaunch && !user) {
      router.replace({ pathname: '/auth', params: { firstLaunch: '1' } });
    }
  }, [isHydrating, isFirstLaunch, user]);

  if (isHydrating) return null;

  const h = paperTheme.colors;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <NavigationThemeProvider value={navigationTheme}>
          <StatusBar style={isDarkMode ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: h.background },
              headerShadowVisible: false,
              headerTintColor: h.primary,
              headerTitleStyle: { color: h.onSurface, fontWeight: '600', fontSize: 17 },
              headerBackTitleVisible: false,
              contentStyle: { backgroundColor: h.background },
              animation: 'slide_from_right',
            }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            {/* Auth flow — no swipe-back, no back button at any step */}
            <Stack.Screen name="auth" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="login" options={{ title: 'Log in' }} />
            <Stack.Screen name="register" options={{ title: 'Create account' }} />
            <Stack.Screen name="verify" options={{ title: 'Verify your email', gestureEnabled: false, headerBackVisible: false }} />
            <Stack.Screen name="settings" options={{ title: 'Settings' }} />
          </Stack>
        </NavigationThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <PreferencesProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </PreferencesProvider>
  );
}
