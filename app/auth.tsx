import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Button, Card, Divider, Text } from 'react-native-paper';

import { AppScreen } from '@/src/components/AppScreen';
import { useAuth } from '@/src/contexts/auth-context';

const redirectMap = {
  '/(tabs)/feed': '/(tabs)/feed',
  '/(tabs)/messages': '/(tabs)/messages',
  '/(tabs)/profile': '/(tabs)/profile',
} as const;

export default function AuthScreen() {
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string | string[] }>();
  const { signIn, isSigningIn } = useAuth();

  const rawTarget = Array.isArray(redirectTo) ? redirectTo[0] : redirectTo;
  const target = rawTarget && rawTarget in redirectMap ? redirectMap[rawTarget as keyof typeof redirectMap] : '/(tabs)/profile';

  async function handleSignIn(provider: 'email' | 'google' | 'apple') {
    await signIn(provider);
    router.replace(target);
  }

  return (
    <AppScreen contentContainerStyle={{ flex: 1, justifyContent: 'center' }}>
      <Card mode="contained">
        <Card.Content>
          <Text variant="headlineSmall">Authentication starter</Text>
          <Text variant="bodyMedium" style={{ marginTop: 10 }}>
            These provider buttons currently create a local preview session so the authenticated tabs can
            be tested immediately. Swap the same actions to Supabase auth next.
          </Text>

          <View style={{ gap: 12, marginTop: 24 }}>
            <Button mode="contained" onPress={() => handleSignIn('email')} loading={isSigningIn}>
              Continue with email
            </Button>
            <Button mode="outlined" onPress={() => handleSignIn('google')} disabled={isSigningIn}>
              Continue with Google
            </Button>
            <Button mode="outlined" onPress={() => handleSignIn('apple')} disabled={isSigningIn}>
              Continue with Apple
            </Button>
          </View>

          <Divider style={{ marginVertical: 20 }} />

          <Text variant="bodySmall" style={{ opacity: 0.7 }}>
            Recommended production path: Supabase Auth with native email auth, Google OAuth via AuthSession,
            and Sign in with Apple on iOS.
          </Text>
        </Card.Content>
      </Card>
    </AppScreen>
  );
}
