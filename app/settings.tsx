import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import { Divider, List, SegmentedButtons, Text, TouchableRipple } from 'react-native-paper';

import { AppScreen } from '@/src/components/AppScreen';
import { useAuth } from '@/src/contexts/auth-context';
import { usePreferences } from '@/src/contexts/preferences-context';
import { accentOptions } from '@/src/theme/palette';

// ─── Section header ──────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  const { paperTheme } = usePreferences();
  return (
    <Text variant="labelMedium" style={[styles.sectionHeader, { color: paperTheme.colors.primary }]}>
      {label}
    </Text>
  );
}

// ─── Settings card (grouped rows) ────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  const { paperTheme } = usePreferences();
  return (
    <View style={[styles.card, {
      backgroundColor: paperTheme.colors.surface,
      borderRadius: paperTheme.roundness * 3,
    }]}>
      {children}
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { user, signOut, deleteAccount } = useAuth();
  const { accent, colorMode, setAccent, setColorMode, paperTheme } = usePreferences();
  const c = paperTheme.colors;

  function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.dismissAll();
          router.replace({ pathname: '/auth', params: { firstLaunch: '1' } });
        },
      },
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Delete account',
      'This will permanently delete your account and all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteAccount();
            router.dismissAll();
            router.replace({ pathname: '/auth', params: { firstLaunch: '1' } });
          },
        },
      ],
    );
  }

  return (
    <AppScreen>

      {/* ── Appearance ────────────────────────────────────────────────────── */}
      <SectionHeader label="APPEARANCE" />

      <Card>
        <View style={styles.cardInner}>
          <Text variant="bodyMedium" style={{ color: c.onSurface }}>Color mode</Text>
          <SegmentedButtons
            value={colorMode}
            onValueChange={(v) => setColorMode(v as 'system' | 'light' | 'dark')}
            style={styles.segmented}
            buttons={[
              { value: 'system', label: 'System', icon: 'brightness-auto' },
              { value: 'light',  label: 'Light',  icon: 'weather-sunny' },
              { value: 'dark',   label: 'Dark',   icon: 'weather-night' },
            ]}
          />
        </View>
      </Card>

      <Card>
        {accentOptions.map((option, i) => {
          const selected = accent === option.name;
          return (
            <View key={option.name}>
              <TouchableRipple onPress={() => setAccent(option.name)} style={styles.accentRow}>
                <View style={styles.accentRowInner}>
                  <View style={[styles.swatch, { backgroundColor: option.swatch }]} />
                  <View style={styles.accentText}>
                    <Text variant="bodyMedium" style={{ color: c.onSurface }}>{option.label}</Text>
                    <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>{option.description}</Text>
                  </View>
                  {selected && (
                    <View style={[styles.checkCircle, { backgroundColor: option.swatch }]}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>✓</Text>
                    </View>
                  )}
                </View>
              </TouchableRipple>
              {i < accentOptions.length - 1 && <Divider style={styles.rowDivider} />}
            </View>
          );
        })}
      </Card>

      {/* ── Notifications ─────────────────────────────────────────────────── */}
      <SectionHeader label="NOTIFICATIONS" />

      <Card>
        <List.Item
          title="Deadline reminders"
          description="Get notified before opportunities close"
          left={(p) => <List.Icon {...p} icon="bell-ring-outline" />}
          right={(p) => <List.Icon {...p} icon="chevron-right" />}
          titleStyle={{ color: c.onSurface }}
          descriptionStyle={{ color: c.onSurfaceVariant }}
          onPress={() => {}}
        />
        <Divider style={styles.rowDivider} />
        <List.Item
          title="Community activity"
          description="Replies, mentions and new posts"
          left={(p) => <List.Icon {...p} icon="forum-outline" />}
          right={(p) => <List.Icon {...p} icon="chevron-right" />}
          titleStyle={{ color: c.onSurface }}
          descriptionStyle={{ color: c.onSurfaceVariant }}
          onPress={() => {}}
        />
        <Divider style={styles.rowDivider} />
        <List.Item
          title="Messages"
          description="New direct messages"
          left={(p) => <List.Icon {...p} icon="message-outline" />}
          right={(p) => <List.Icon {...p} icon="chevron-right" />}
          titleStyle={{ color: c.onSurface }}
          descriptionStyle={{ color: c.onSurfaceVariant }}
          onPress={() => {}}
        />
      </Card>

      {/* ── About ─────────────────────────────────────────────────────────── */}
      <SectionHeader label="ABOUT" />

      <Card>
        <List.Item
          title="Privacy policy"
          left={(p) => <List.Icon {...p} icon="shield-outline" />}
          right={(p) => <List.Icon {...p} icon="open-in-new" />}
          titleStyle={{ color: c.onSurface }}
          onPress={() => {}}
        />
        <Divider style={styles.rowDivider} />
        <List.Item
          title="Terms of service"
          left={(p) => <List.Icon {...p} icon="file-document-outline" />}
          right={(p) => <List.Icon {...p} icon="open-in-new" />}
          titleStyle={{ color: c.onSurface }}
          onPress={() => {}}
        />
        <Divider style={styles.rowDivider} />
        <List.Item
          title="Version"
          description="1.0.0"
          left={(p) => <List.Icon {...p} icon="information-outline" />}
          titleStyle={{ color: c.onSurface }}
          descriptionStyle={{ color: c.onSurfaceVariant }}
        />
      </Card>

      {/* ── Account ───────────────────────────────────────────────────────── */}
      {user ? (
        <>
          <SectionHeader label="ACCOUNT" />
          <Card>
            <List.Item
              title="Sign out"
              left={(p) => <List.Icon {...p} icon="logout" color={c.error} />}
              titleStyle={{ color: c.error }}
              onPress={handleSignOut}
            />
            <Divider style={styles.rowDivider} />
            <List.Item
              title="Delete account"
              left={(p) => <List.Icon {...p} icon="delete-outline" color={c.error} />}
              titleStyle={{ color: c.error, opacity: 0.7 }}
              onPress={handleDeleteAccount}
            />
          </Card>
        </>
      ) : null}

    </AppScreen>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 4,
    marginLeft: 4,
  },
  card: {
    overflow: 'hidden',
  },
  cardInner: {
    padding: 16,
    gap: 12,
  },
  segmented: {
    marginTop: 4,
  },
  accentRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  accentRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  accentText: {
    flex: 1,
    gap: 1,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowDivider: {
    marginLeft: 56,
  },
});
