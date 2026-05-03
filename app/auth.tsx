import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { Button, Divider, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../src/contexts/auth-context';
import { usePreferences } from '../src/contexts/preferences-context';
import { useAppleAuth } from '../src/hooks/useAppleAuth';
import { useGoogleAuth } from '../src/hooks/useGoogleAuth';
import { resolveRedirect } from '../src/lib/navigation';

WebBrowser.maybeCompleteAuthSession();

export default function AuthWelcomeScreen() {
  const { redirectTo, firstLaunch } = useLocalSearchParams<{ redirectTo?: string | string[]; firstLaunch?: string }>();
  const { signInWithGoogle, signInWithApple, isSigningIn } = useAuth();
  const { paperTheme } = usePreferences();
  const insets = useSafeAreaInsets();

  const isFirstLaunch = firstLaunch === '1';
  const rawTarget = Array.isArray(redirectTo) ? redirectTo[0] : redirectTo;
  const target = resolveRedirect(redirectTo);
  const params = rawTarget ? { redirectTo: rawTarget } : {};

  const [error, setError] = useState<string | null>(null);

  const [googleRequest, googleResponse, promptGoogle] = useGoogleAuth();
  const { appleAvailable, getAppleCredential } = useAppleAuth();

  useEffect(() => {
    if (googleResponse?.type !== 'success') return;
    const idToken = (googleResponse.params as { id_token?: string } | undefined)?.id_token;
    if (!idToken) { setError('Google sign-in did not return an ID token.'); return; }
    (async () => {
      try {
        setError(null);
        await signInWithGoogle(idToken);
        router.dismissAll();
        router.replace(target);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Google sign-in failed');
      }
    })();
  }, [googleResponse]);

  async function handleAppleSignIn() {
    try {
      setError(null);
      const credential = await getAppleCredential();
      await signInWithApple(credential);
      // Always visit choose-username after Apple so users can set/confirm their handle.
      router.dismissAll();
      router.replace({ pathname: '/choose-username', params: rawTarget ? { redirectTo: rawTarget } : {} });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Apple sign-in failed');
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: paperTheme.colors.background,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        },
      ]}>
      {!isFirstLaunch ? (
        <View style={styles.top}>
          <Button
            icon="arrow-left"
            mode="text"
            onPress={() => router.back()}
            style={styles.backBtn}
            labelStyle={{ color: paperTheme.colors.onSurfaceVariant }}>
            Back
          </Button>
        </View>
      ) : <View style={styles.top} />}

      <View style={styles.hero}>
        <Text variant="displaySmall" style={{ color: paperTheme.colors.primary, fontWeight: '700' }}>
          Ambitious
        </Text>
        <Text variant="titleMedium" style={{ color: paperTheme.colors.onSurfaceVariant, marginTop: 8 }}>
          Scholarships, fellowships & opportunities — all in one place.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          mode="contained"
          contentStyle={styles.btnContent}
          onPress={() => router.push({ pathname: '/register', params })}>
          Create account
        </Button>
        <Button
          mode="outlined"
          contentStyle={styles.btnContent}
          style={{ marginTop: 12 }}
          onPress={() => router.push({ pathname: '/login', params })}>
          Log in
        </Button>

        {(googleRequest || (Platform.OS === 'ios' && appleAvailable)) ? (
          <>
            <View style={styles.dividerRow}>
              <View style={[styles.line, { backgroundColor: paperTheme.colors.outlineVariant }]} />
              <Text variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant, marginHorizontal: 12 }}>or</Text>
              <View style={[styles.line, { backgroundColor: paperTheme.colors.outlineVariant }]} />
            </View>

            {googleRequest ? (
              <Button
                mode="outlined"
                icon="google"
                contentStyle={styles.btnContent}
                disabled={isSigningIn}
                onPress={() => promptGoogle()}>
                Continue with Google
              </Button>
            ) : null}

            {Platform.OS === 'ios' && appleAvailable ? (
              <Button
                mode="outlined"
                icon="apple"
                contentStyle={styles.btnContent}
                style={{ marginTop: 12 }}
                disabled={isSigningIn}
                onPress={handleAppleSignIn}>
                Continue with Apple
              </Button>
            ) : null}
          </>
        ) : null}

        {error ? (
          <Text variant="bodySmall" style={{ color: paperTheme.colors.error, textAlign: 'center', marginTop: 12 }}>
            {error}
          </Text>
        ) : null}

        {isFirstLaunch ? (
          <Button
            mode="text"
            onPress={() => router.replace('/(tabs)/profile')}
            style={{ marginTop: 16 }}
            labelStyle={{ color: paperTheme.colors.onSurfaceVariant, fontSize: 13 }}>
            Continue as guest
          </Button>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  top: { alignItems: 'flex-start' },
  backBtn: { marginLeft: -8 },
  hero: { flex: 1, justifyContent: 'center' },
  actions: { paddingBottom: 8 },
  btnContent: { height: 52 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1 },
});
