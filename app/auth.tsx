import * as Google from 'expo-auth-session/providers/google';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import { Platform, View } from 'react-native';
import { Button, Card, Divider, HelperText, SegmentedButtons, Text, TextInput } from 'react-native-paper';

import { AppScreen } from '../src/components/AppScreen';
import { appEnv } from '../src/config/env';
import { useAuth } from '../src/contexts/auth-context';

WebBrowser.maybeCompleteAuthSession();

const redirectMap = {
  '/(tabs)/feed': '/(tabs)/feed',
  '/(tabs)/messages': '/(tabs)/messages',
  '/(tabs)/profile': '/(tabs)/profile',
} as const;

export default function AuthScreen() {
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string | string[] }>();
  const { signInWithApple, signInWithEmail, signInWithGoogle, signUpWithEmail, isSigningIn } = useAuth();

  const rawTarget = Array.isArray(redirectTo) ? redirectTo[0] : redirectTo;
  const target = rawTarget && rawTarget in redirectMap ? redirectMap[rawTarget as keyof typeof redirectMap] : '/(tabs)/profile';

  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);

  const [googleRequest, googleResponse, promptGoogle] = Google.useIdTokenAuthRequest({
    clientId: appEnv.googleExpoClientId || undefined,
    iosClientId: appEnv.googleIosClientId || undefined,
    androidClientId: appEnv.googleAndroidClientId || undefined,
    webClientId: appEnv.googleWebClientId || undefined,
  });

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    (async () => {
      const AppleAuthentication = await import('expo-apple-authentication');
      const available = await AppleAuthentication.isAvailableAsync();
      setAppleAvailable(available);
    })().catch(() => setAppleAvailable(false));
  }, []);

  useEffect(() => {
    if (googleResponse?.type !== 'success') return;

    const idToken = (googleResponse.params as { id_token?: string } | undefined)?.id_token;
    if (!idToken) {
      setError('Google sign-in did not return an ID token. Check the OAuth client configuration.');
      return;
    }

    (async () => {
      try {
        setError(null);
        await signInWithGoogle(idToken);
        router.replace(target);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : 'Google sign-in failed');
      }
    })();
  }, [googleResponse, signInWithGoogle, target]);

  const submitDisabled = useMemo(() => {
    if (!email || !password) return true;
    if (mode === 'register' && !displayName.trim()) return true;
    return false;
  }, [displayName, email, mode, password]);

  async function handleEmailSubmit() {
    try {
      setError(null);
      if (mode === 'login') {
        await signInWithEmail({ email, password });
      } else {
        await signUpWithEmail({ email, password, displayName: displayName.trim() });
      }
      router.replace(target);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Authentication failed');
    }
  }

  async function handleAppleSignIn() {
    try {
      setError(null);
      const AppleAuthentication = await import('expo-apple-authentication');
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('Apple did not return an identity token.');
      }

      await signInWithApple({
        identityToken: credential.identityToken,
        firstName: credential.fullName?.givenName ?? undefined,
        lastName: credential.fullName?.familyName ?? undefined,
      });
      router.replace(target);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Apple sign-in failed');
    }
  }

  return (
    <AppScreen contentContainerStyle={{ flex: 1, justifyContent: 'center' }}>
      <Card mode="contained">
        <Card.Content>
          <Text variant="headlineSmall">Account access</Text>
          <Text variant="bodyMedium" style={{ marginTop: 10 }}>
            The app now expects a real backend session. Email/password is the fastest path. Google and Apple depend on the manual OAuth configuration listed in the repo docs.
          </Text>

          <SegmentedButtons
            value={mode}
            onValueChange={(value) => setMode(value as 'login' | 'register')}
            style={{ marginTop: 20 }}
            buttons={[
              { value: 'register', label: 'Create account' },
              { value: 'login', label: 'Log in' },
            ]}
          />

          <View style={{ gap: 12, marginTop: 20 }}>
            {mode === 'register' ? (
              <TextInput label="Display name" value={displayName} onChangeText={setDisplayName} autoCapitalize="words" />
            ) : null}
            <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
            <Button mode="contained" onPress={handleEmailSubmit} disabled={submitDisabled || isSigningIn} loading={isSigningIn}>
              {mode === 'login' ? 'Log in with email' : 'Create account with email'}
            </Button>
          </View>

          <Divider style={{ marginVertical: 20 }} />

          <View style={{ gap: 12 }}>
            <Button mode="outlined" onPress={() => promptGoogle()} disabled={!googleRequest || isSigningIn}>
              Continue with Google
            </Button>
            {Platform.OS === 'ios' && appleAvailable ? (
              <Button mode="outlined" onPress={handleAppleSignIn} disabled={isSigningIn}>
                Continue with Apple
              </Button>
            ) : null}
          </View>

          <HelperText type={error ? 'error' : 'info'} visible>
            {error ?? 'Manual setup still needed: API URL, Google OAuth client IDs, and Apple Sign In capability.'}
          </HelperText>
        </Card.Content>
      </Card>
    </AppScreen>
  );
}
