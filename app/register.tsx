import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, IconButton, Text, TextInput } from 'react-native-paper';

import { useAuth } from '../src/contexts/auth-context';

export default function RegisterScreen() {
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string | string[] }>();
  const { startEmailRegistration } = useAuth();

  const rawTarget = Array.isArray(redirectTo) ? redirectTo[0] : redirectTo;

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = !displayName.trim() || !email || !password || loading;

  async function handleRegister() {
    try {
      setError(null);
      setLoading(true);
      await startEmailRegistration({ email, password, displayName: displayName.trim() });
      router.push({
        pathname: '/verify',
        params: { email, ...(rawTarget ? { redirectTo: rawTarget } : {}) },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        bounces={false}>

        <IconButton
          icon="arrow-left"
          onPress={() => router.back()}
          style={styles.backBtn}
        />

        <Text variant="headlineMedium" style={styles.title}>
          Create your account
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          We'll send a 4-digit code to verify your email.
        </Text>

        <View style={styles.form}>
          <TextInput
            label="Display name"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            autoComplete="name"
          />
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
          <HelperText type="info" visible>
            Minimum 8 characters
          </HelperText>
          {error ? <HelperText type="error" visible>{error}</HelperText> : null}
          <Button
            mode="contained"
            onPress={handleRegister}
            disabled={disabled}
            loading={loading}
            contentStyle={styles.btnContent}>
            Send verification code
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 24, paddingTop: 8 },
  backBtn: { marginLeft: -8, marginBottom: 8 },
  title: { fontWeight: '700' },
  subtitle: { marginTop: 6, opacity: 0.7 },
  form: { gap: 12, marginTop: 32 },
  btnContent: { height: 52 },
});
