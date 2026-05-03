import { StyleSheet, View } from 'react-native';
import { Divider, List, Text } from 'react-native-paper';

import { AppScreen } from '../../src/components/AppScreen';
import { AuthGate } from '../../src/components/AuthGate';
import { useAuth } from '../../src/contexts/auth-context';
import { usePreferences } from '../../src/contexts/preferences-context';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { accent, colorModeLabel, paperTheme } = usePreferences();

  if (!user) {
    return (
      <AppScreen>
        <AuthGate
          title="Profiles start after sign-in"
          description="Applications, saved opportunities, forum identity, and messaging all hang off your authenticated profile."
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      {/* User hero */}
      <View style={styles.heroSection}>
        <View style={[styles.avatar, { backgroundColor: paperTheme.colors.primary }]}>
          <Text variant="titleLarge" style={{ color: paperTheme.colors.onPrimary, fontWeight: '700' }}>
            {(user.displayName ?? user.email ?? '?')[0].toUpperCase()}
          </Text>
        </View>
        <Text variant="headlineSmall" style={{ fontWeight: '700', color: paperTheme.colors.onSurface }}>
          {user.displayName ?? 'Ambitious user'}
        </Text>
        <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant, marginTop: 2 }}>
          {user.email ?? 'No public email'}
        </Text>
        {user.emailVerifiedAt ? null : (
          <Text variant="bodySmall" style={{ color: paperTheme.colors.tertiary, marginTop: 6 }}>
            Email not yet verified
          </Text>
        )}
      </View>

      <Divider style={styles.divider} />

      {/* Profile details */}
      <Text variant="labelLarge" style={[styles.sectionLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
        Profile
      </Text>
      <List.Item
        title="Headline"
        description={user.profile?.headline ?? 'Not set'}
        left={(props) => <List.Icon {...props} icon="card-account-details-outline" />}
      />
      <List.Item
        title="Location"
        description={user.profile?.location ?? 'Not set'}
        left={(props) => <List.Icon {...props} icon="map-marker-outline" />}
      />
      <List.Item
        title="Bio"
        description={user.profile?.bio ?? 'Not set'}
        left={(props) => <List.Icon {...props} icon="text-account" />}
      />

      <Divider style={styles.divider} />

      {/* Account details */}
      <Text variant="labelLarge" style={[styles.sectionLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
        Account
      </Text>
      <List.Item
        title="Sign-in methods"
        description={user.providers.join(', ') || 'None'}
        left={(props) => <List.Icon {...props} icon="shield-account-outline" />}
      />
      <List.Item
        title="Appearance"
        description={`${accent} · ${colorModeLabel}`}
        left={(props) => <List.Icon {...props} icon="palette-outline" />}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heroSection: { marginBottom: 8 },
  avatar:      { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  divider:     { marginVertical: 20 },
  sectionLabel: { marginBottom: 4 },
});
