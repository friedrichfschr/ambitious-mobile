import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider, List, Text } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { AppScreen } from '../../src/components/AppScreen';
import { AuthBanner } from '../../src/components/AuthBanner';
import { useAuth } from '../../src/contexts/auth-context';
import { usePreferences } from '../../src/contexts/preferences-context';
import { authApi } from '../../src/lib/auth-api';

export default function ProfileScreen() {
  const { user, accessToken, patchUser } = useAuth();
  const { accent, colorModeLabel, paperTheme } = usePreferences();
  const c = paperTheme.colors;

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  async function handleAvatarPress() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setAvatarError('Photo library access is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const form = new FormData();
    form.append('avatar', {
      uri: asset.uri,
      type: asset.mimeType ?? 'image/jpeg',
      name: asset.fileName ?? 'avatar.jpg',
    } as any);

    setUploadingAvatar(true);
    setAvatarError(null);
    try {
      const res = await authApi.uploadAvatar(form, accessToken!);
      patchUser({ avatarUrl: res.avatarUrl });
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  }

  if (!user) {
    return (
      <View style={styles.root}>
        <AuthBanner />
        <AppScreen>
          <View style={styles.empty}>
            <Text variant="bodyMedium" style={{ color: c.onSurfaceVariant, textAlign: 'center' }}>
              Your profile, saved opportunities, and applications will appear here.
            </Text>
          </View>
        </AppScreen>
      </View>
    );
  }

  const displayLabel = (user.displayName || user.username || '?').slice(0, 2).toUpperCase();

  return (
    <AppScreen>
      {/* ── Avatar + identity ─────────────────────────────────────────── */}
      <View style={styles.heroSection}>
        <TouchableOpacity
          onPress={handleAvatarPress}
          disabled={uploadingAvatar || !accessToken}
          activeOpacity={0.8}
          style={styles.avatarWrap}>
          {user.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              style={[styles.avatarImg, { borderColor: c.primaryContainer }]}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: c.primaryContainer }]}>
              <Text variant="titleLarge" style={{ color: c.onPrimaryContainer, fontWeight: '700' }}>
                {displayLabel}
              </Text>
            </View>
          )}

          {/* Camera badge */}
          <View style={[styles.cameraBadge, { backgroundColor: c.primary }]}>
            {uploadingAvatar
              ? <ActivityIndicator size={10} color={c.onPrimary} />
              : <MaterialCommunityIcons name="camera" size={12} color={c.onPrimary} />
            }
          </View>
        </TouchableOpacity>

        {avatarError ? (
          <Text variant="bodySmall" style={{ color: c.error, marginTop: 4, textAlign: 'center' }}>
            {avatarError}
          </Text>
        ) : null}

        <Text variant="headlineSmall" style={{ fontWeight: '700', color: c.onSurface, marginTop: 12 }}>
          {user.displayName || user.username}
        </Text>
        <Text variant="bodyMedium" style={{ color: c.onSurfaceVariant, marginTop: 2 }}>
          @{user.username}
        </Text>
        {user.email ? (
          <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, marginTop: 2 }}>
            {user.email}
          </Text>
        ) : null}
        {user.emailVerifiedAt ? null : (
          <Text variant="bodySmall" style={{ color: c.tertiary, marginTop: 6 }}>
            Email not yet verified
          </Text>
        )}
      </View>

      <Divider style={styles.divider} />

      {/* ── Profile details ───────────────────────────────────────────── */}
      <Text variant="labelLarge" style={[styles.sectionLabel, { color: c.onSurfaceVariant }]}>Profile</Text>
      <List.Item
        title="Headline"
        description={user.profile?.headline ?? 'Not set'}
        left={(p) => <List.Icon {...p} icon="card-account-details-outline" />}
        titleStyle={{ color: c.onSurface }}
        descriptionStyle={{ color: c.onSurfaceVariant }}
      />
      <List.Item
        title="Location"
        description={user.profile?.location ?? 'Not set'}
        left={(p) => <List.Icon {...p} icon="map-marker-outline" />}
        titleStyle={{ color: c.onSurface }}
        descriptionStyle={{ color: c.onSurfaceVariant }}
      />
      <List.Item
        title="Bio"
        description={user.profile?.bio ?? 'Not set'}
        left={(p) => <List.Icon {...p} icon="text-account" />}
        titleStyle={{ color: c.onSurface }}
        descriptionStyle={{ color: c.onSurfaceVariant }}
      />

      <Divider style={styles.divider} />

      {/* ── Account ───────────────────────────────────────────────────── */}
      <Text variant="labelLarge" style={[styles.sectionLabel, { color: c.onSurfaceVariant }]}>Account</Text>
      <List.Item
        title="Sign-in methods"
        description={user.providers.join(', ') || 'None'}
        left={(p) => <List.Icon {...p} icon="shield-account-outline" />}
        titleStyle={{ color: c.onSurface }}
        descriptionStyle={{ color: c.onSurfaceVariant }}
      />
      <List.Item
        title="Appearance"
        description={`${accent} · ${colorModeLabel}`}
        left={(p) => <List.Icon {...p} icon="palette-outline" />}
        titleStyle={{ color: c.onSurface }}
        descriptionStyle={{ color: c.onSurfaceVariant }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1 },
  heroSection:  { alignItems: 'center', paddingBottom: 8 },

  avatarWrap:        { position: 'relative' },
  avatarImg:         { width: 88, height: 88, borderRadius: 44, borderWidth: 3 },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  divider:      { marginVertical: 20 },
  sectionLabel: { marginBottom: 4 },
  empty:        { paddingTop: 40, alignItems: 'center' },
});
