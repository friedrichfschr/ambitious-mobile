import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/src/contexts/auth-context';
import { PreferencesProvider, usePreferences } from '@/src/contexts/preferences-context';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function AppNavigator() {
  const { isDarkMode, navigationTheme, paperTheme } = usePreferences();

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <NavigationThemeProvider value={navigationTheme}>
          <AuthProvider>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="auth" options={{ presentation: 'modal', title: 'Sign in' }} />
              <Stack.Screen name="settings" options={{ title: 'Settings' }} />
            </Stack>
          </AuthProvider>
        </NavigationThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <PreferencesProvider>
      <AppNavigator />
    </PreferencesProvider>
  );
}
