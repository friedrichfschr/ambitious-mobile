import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { useAuth } from "../src/contexts/auth-context";
import { usePreferences } from "../src/contexts/preferences-context";
import { authApi } from "../src/lib/auth-api";
import { usersApi } from "../src/lib/feed-api";
import { resolveRedirect } from "../src/lib/navigation";

type UsernameState = "idle" | "checking" | "available" | "taken" | "invalid";

export default function ChooseUsernameScreen() {
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();
  const { user, accessToken, patchUser } = useAuth();
  const { paperTheme } = usePreferences();
  const c = paperTheme.colors;

  const target = resolveRedirect(redirectTo);

  const [username, setUsername] = useState(user?.username ?? "");
  const [usernameState, setUsernameState] = useState<UsernameState>("idle");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameState("idle");
      return;
    }
    if (trimmed.length < 3 || trimmed.length > 30) {
      setUsernameState("invalid");
      return;
    }

    // If unchanged from current, no need to check
    if (trimmed === user?.username) {
      setUsernameState("available");
      return;
    }

    setUsernameState("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await usersApi.checkUsername(trimmed);
        console.log("Username check result:", res);
        setUsernameState(res.available ? "available" : "taken");
      } catch {
        setUsernameState("idle");
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username, user?.username]);

  async function handleSave() {
    if (!accessToken || usernameState !== "available") return;
    setSaving(true);
    setError(null);
    try {
      const result = await authApi.updateUsername(username.trim(), accessToken);
      patchUser({ username: result.username });
      router.dismissAll();
      router.replace(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save username");
    } finally {
      setSaving(false);
    }
  }

  function getHelperText() {
    if (usernameState === "invalid")
      return username.length < 3
        ? "At least 3 characters required"
        : "Letters, numbers and underscores only";
    if (usernameState === "taken") return "This username is already taken";
    if (usernameState === "available") return "Username is available";
    return "Letters, numbers and underscores only";
  }

  const isAvailable = usernameState === "available";
  const disabled = !isAvailable || saving;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: c.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.body}>
        <Text
          variant="headlineMedium"
          style={{ color: c.onSurface, fontWeight: "700" }}
        >
          Choose your username
        </Text>
        <Text
          variant="bodyMedium"
          style={{ color: c.onSurfaceVariant, marginTop: 8 }}
        >
          This is how others will find and mention you. You can change it later.
        </Text>

        <View style={styles.field}>
          <TextInput
            label="Username"
            value={username}
            onChangeText={(v) => {
              setUsername(v.toLowerCase().replace(/[^a-z0-9_]/g, ""));
              setError(null);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            right={
              usernameState === "checking" ? (
                <TextInput.Icon icon="loading" />
              ) : isAvailable ? (
                <TextInput.Icon
                  icon={() => (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color={c.primary}
                    />
                  )}
                />
              ) : usernameState === "taken" ? (
                <TextInput.Icon
                  icon={() => (
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={20}
                      color={c.error}
                    />
                  )}
                />
              ) : null
            }
          />
          <HelperText
            type={
              usernameState === "invalid" || usernameState === "taken"
                ? "error"
                : "info"
            }
            visible
            style={isAvailable ? { color: c.primary } : undefined}
          >
            {getHelperText()}
          </HelperText>
        </View>

        {error ? (
          <HelperText type="error" visible style={{ marginBottom: 8 }}>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleSave}
          disabled={disabled}
          loading={saving}
          contentStyle={styles.btnContent}
        >
          Continue
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, padding: 24, paddingTop: 48 },
  field: { marginTop: 32, marginBottom: 8 },
  btnContent: { height: 52 },
});
