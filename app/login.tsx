import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

import { useAuth } from '../src/contexts/auth-context';
import { resolveRedirect } from '../src/lib/navigation';

export default function LoginScreen() {
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string | string[] }>();
  const { signInWithEmail, isSigningIn } = useAuth();

  const target = resolveRedirect(redirectTo);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);


  async function handleLogin() {
    try {
      setError(null);
      await signInWithEmail({ email, password });
      router.dismissAll();
      router.replace(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  const disabled = !email || !password || isSigningIn;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        bounces={false}>

        <Text variant="headlineMedium" style={styles.title}>
          Welcome back
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Log in to your Ambitious account
        </Text>

        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword((v) => !v)}
              />
            }
          />
          {error ? <HelperText type="error" visible>{error}</HelperText> : null}
          <Button
            mode="contained"
            onPress={handleLogin}
            disabled={disabled}
            loading={isSigningIn}
            contentStyle={styles.btnContent}
            style={{ marginTop: 4 }}>
            Log in
          </Button>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 24, paddingTop: 32 },
  title: { fontWeight: '700' },
  subtitle: { marginTop: 6, opacity: 0.7 },
  form: { gap: 12, marginTop: 32 },
  btnContent: { height: 52 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  line: { flex: 1, height: 1 },
  orText: { marginHorizontal: 12, opacity: 0.5 },
});
