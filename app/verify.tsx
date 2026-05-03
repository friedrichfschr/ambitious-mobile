import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from "react-native";
import { Button, HelperText, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../src/contexts/auth-context";
import { usePreferences } from "../src/contexts/preferences-context";
import { resolveRedirect } from "../src/lib/navigation";

export default function VerifyScreen() {
  const { email, redirectTo } = useLocalSearchParams<{
    email: string;
    redirectTo?: string;
  }>();
  const { confirmEmailRegistration, isSigningIn } = useAuth();
  const { paperTheme } = usePreferences();
  const insets = useSafeAreaInsets();

  const target = resolveRedirect(redirectTo);

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<RNTextInput>(null);

  const digits = code.padEnd(4, " ").split("").slice(0, 4);
  const isComplete = code.length === 4;

  useEffect(() => {
    if (isComplete && !isSigningIn) handleVerify();
  }, [code]);

  function handleChange(value: string) {
    const clean = value.replace(/\D/g, "").slice(0, 4);
    setError(null);
    setCode(clean);
  }

  async function handleVerify() {
    if (!isComplete || isSigningIn) return;
    try {
      setError(null);
      await confirmEmailRegistration({ email: email ?? "", code });
      router.dismissAll();
      router.replace(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setCode("");
      inputRef.current?.focus();
    }
  }

  const c = paperTheme.colors;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: c.background, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.body}>
        <Text
          variant="headlineMedium"
          style={{ fontWeight: "700", color: c.onSurface }}
        >
          Check your email
        </Text>
        <Text
          variant="bodyMedium"
          style={{ color: c.onSurfaceVariant, marginTop: 8 }}
        >
          We sent a 4-digit code to{"\n"}
          <Text
            variant="bodyMedium"
            style={{ color: c.onSurface, fontWeight: "600" }}
          >
            {email}
          </Text>
        </Text>

        {/* Tap the visual boxes to focus the hidden input */}
        <Pressable
          onPress={() => inputRef.current?.focus()}
          style={styles.digitRow}
        >
          {digits.map((digit, i) => {
            const filled = digit.trim().length > 0;
            const active = i === code.length;
            return (
              <View
                key={i}
                style={[
                  styles.digitBox,
                  {
                    borderColor:
                      filled || active ? c.primary : c.outlineVariant,
                    backgroundColor: c.surface,
                  },
                ]}
              >
                <Text style={[styles.digitText, { color: c.onSurface }]}>
                  {filled ? digit : ""}
                </Text>
              </View>
            );
          })}
        </Pressable>

        {/* Hidden input that owns the actual text entry */}
        <RNTextInput
          ref={inputRef}
          value={code}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={4}
          textContentType="oneTimeCode"
          autoFocus
          caretHidden
          style={styles.hiddenInput}
        />

        {error ? (
          <HelperText type="error" visible style={{ textAlign: "center" }}>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleVerify}
          disabled={!isComplete || isSigningIn}
          loading={isSigningIn}
          contentStyle={styles.btnContent}
          style={{ marginTop: 8 }}
        >
          Verify
        </Button>

        <Button
          mode="text"
          onPress={() => router.back()}
          style={{ marginTop: 8 }}
          labelStyle={{ color: c.onSurfaceVariant }}
        >
          Change email address
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 70 },
  body: { flex: 1 },
  digitRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 40,
    marginBottom: 8,
    justifyContent: "center",
  },
  digitBox: {
    width: 64,
    height: 72,
    borderWidth: 2,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  digitText: { fontSize: 28, fontWeight: "700" },
  hiddenInput: { position: "absolute", width: 0, height: 0, opacity: 0 },
  btnContent: { height: 52 },
});
