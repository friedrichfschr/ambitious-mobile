import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { useAuth } from '../src/contexts/auth-context';
import { usePreferences } from '../src/contexts/preferences-context';
import { usersApi } from '../src/lib/feed-api';

type UsernameState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

function UsernameAdornment({ state, colors }: {
  state: UsernameState;
  colors: ReturnType<typeof usePreferences>['paperTheme']['colors'];
}) {
  if (state === 'checking') return <TextInput.Icon icon="loading" />;
  if (state === 'available') {
    return <TextInput.Icon icon={() =>
      <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />
    } />;
  }
  if (state === 'taken') {
    return <TextInput.Icon icon={() =>
      <MaterialCommunityIcons name="close-circle" size={20} color={colors.error} />
    } />;
  }
  return null;
}

export default function RegisterScreen() {
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string | string[] }>();
  const { startEmailRegistration } = useAuth();
  const { paperTheme } = usePreferences();
  const c = paperTheme.colors;

  const rawTarget = Array.isArray(redirectTo) ? redirectTo[0] : redirectTo;

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameState, setUsernameState] = useState<UsernameState>('idle');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = username.trim();
    if (!trimmed) { setUsernameState('idle'); return; }
    if (trimmed.length < 3 || trimmed.length > 30) { setUsernameState('invalid'); return; }

    setUsernameState('checking');
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await usersApi.checkUsername(trimmed);
        setUsernameState(res.available ? 'available' : 'taken');
      } catch {
        setUsernameState('idle');
      }
    }, 500);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [username]);

  // Block only when we *know* the username is bad. If the availability check
  // failed (network down, API cold-start) we fall through to 'idle' and let
  // the server reject duplicates rather than trapping the user permanently.
  const usernameBlocked = usernameState === 'invalid' || usernameState === 'taken' || usernameState === 'checking';
  const disabled = usernameBlocked || !username.trim() || !email.trim() || password.length < 8 || loading;

  async function handleRegister() {
    if (disabled) return;
    try {
      setError(null);
      setLoading(true);
      await startEmailRegistration({ email: email.trim(), password, username: username.trim() });
      router.push({
        pathname: '/verify',
        params: { email: email.trim(), ...(rawTarget ? { redirectTo: rawTarget } : {}) },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  function getUsernameHelper() {
    if (usernameState === 'invalid') return username.length < 3 ? 'At least 3 characters required' : 'Letters, numbers and underscores only';
    if (usernameState === 'taken') return 'This username is already taken';
    if (usernameState === 'available') return 'Username is available';
    return 'Letters, numbers and underscores only';
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

        <Text variant="headlineMedium" style={[styles.title, { color: c.onSurface }]}>
          Create your account
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: c.onSurfaceVariant }]}>
          We'll send a 4-digit code to verify your email.
        </Text>

        <View style={styles.form}>
          {/* Username */}
          <View>
            <TextInput
              label="Username"
              value={username}
              onChangeText={(v) => setUsername(v.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              right={<UsernameAdornment state={usernameState} colors={c} />}
            />
            <HelperText
              type={usernameState === 'invalid' || usernameState === 'taken' ? 'error' : 'info'}
              visible
              style={usernameState === 'available' ? { color: c.primary } : undefined}>
              {getUsernameHelper()}
            </HelperText>
          </View>

          {/* Email */}
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          {/* Password */}
          <View>
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
          </View>

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
  flex:       { flex: 1 },
  content:    { padding: 24, paddingTop: 16 },
  title:      { fontWeight: '700' },
  subtitle:   { marginTop: 6, opacity: 0.7 },
  form:       { gap: 4, marginTop: 32 },
  btnContent: { height: 52 },
});
