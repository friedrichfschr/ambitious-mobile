import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput as RNTextInput, View } from 'react-native';
import { Button, HelperText, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../src/contexts/auth-context';
import { usePreferences } from '../src/contexts/preferences-context';
import { resolveRedirect } from '../src/lib/navigation';

export default function VerifyScreen() {
  const { email, redirectTo } = useLocalSearchParams<{ email: string; redirectTo?: string }>();
  const { confirmEmailRegistration, isSigningIn } = useAuth();
  const { paperTheme } = usePreferences();
  const insets = useSafeAreaInsets();

  const target = resolveRedirect(redirectTo);

  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(RNTextInput | null)[]>([null, null, null, null]);

  const code = digits.join('');
  const isComplete = code.length === 4;

  useEffect(() => {
    // Auto-submit when all 4 digits are entered
    if (isComplete && !isSigningIn) handleVerify();
  }, [code]);

  function handleDigitChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError(null);
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(index: number, key: string) {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
    }
  }

  async function handleVerify() {
    if (!isComplete || isSigningIn) return;
    try {
      setError(null);
      await confirmEmailRegistration({ email: email ?? '', code });
      router.dismissAll();
      router.replace(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setDigits(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background, paddingBottom: insets.bottom + 24 },
      ]}>
      <View style={styles.body}>
        <Text variant="headlineMedium" style={{ fontWeight: '700', color: paperTheme.colors.onSurface }}>
          Check your email
        </Text>
        <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant, marginTop: 8 }}>
          We sent a 4-digit code to{'\n'}
          <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurface, fontWeight: '600' }}>
            {email}
          </Text>
        </Text>

        <View style={styles.digitRow}>
          {digits.map((digit, i) => (
            <RNTextInput
              key={i}
              ref={(ref) => { inputRefs.current[i] = ref; }}
              value={digit}
              onChangeText={(v) => handleDigitChange(i, v)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(i, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              style={[
                styles.digitInput,
                {
                  borderColor: digit
                    ? paperTheme.colors.primary
                    : paperTheme.colors.outlineVariant,
                  backgroundColor: paperTheme.colors.surface,
                  color: paperTheme.colors.onSurface,
                },
              ]}
            />
          ))}
        </View>

        {error ? (
          <HelperText type="error" visible style={{ textAlign: 'center' }}>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleVerify}
          disabled={!isComplete || isSigningIn}
          loading={isSigningIn}
          contentStyle={styles.btnContent}
          style={{ marginTop: 8 }}>
          Verify
        </Button>

        <Button
          mode="text"
          onPress={() => router.back()}
          style={{ marginTop: 8 }}
          labelStyle={{ color: paperTheme.colors.onSurfaceVariant }}>
          Change email address
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  body: { flex: 1, justifyContent: 'center', gap: 0 },
  digitRow: { flexDirection: 'row', gap: 12, marginTop: 40, marginBottom: 8, justifyContent: 'center' },
  digitInput: {
    width: 64,
    height: 72,
    borderWidth: 2,
    borderRadius: 16,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
  },
  btnContent: { height: 52 },
});
