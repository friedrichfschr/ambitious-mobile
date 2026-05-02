import { View } from 'react-native';
import { Button, Card, List, Text } from 'react-native-paper';

import { AppScreen } from '../../src/components/AppScreen';
import { AuthGate } from '../../src/components/AuthGate';
import { useAuth } from '../../src/contexts/auth-context';
import { usePreferences } from '../../src/contexts/preferences-context';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { accent, colorModeLabel } = usePreferences();

  if (!user) {
    return (
      <AppScreen>
        <AuthGate
          title="Profiles start after sign-in"
          description="Applications, saved opportunities, forum identity, and messaging all hang off the authenticated profile layer."
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <Card mode="contained">
        <Card.Content>
          <Text variant="headlineSmall">{user.displayName || 'Ambitious user'}</Text>
          <Text variant="bodyLarge" style={{ marginTop: 4, opacity: 0.75 }}>
            {user.email || 'No public email'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 24, marginTop: 20 }}>
            <View>
              <Text variant="headlineSmall">{user.providers.length}</Text>
              <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                Providers
              </Text>
            </View>
            <View>
              <Text variant="headlineSmall">{user.profile?.location ? '1' : '0'}</Text>
              <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                Location set
              </Text>
            </View>
            <View>
              <Text variant="headlineSmall">{user.profile?.bio ? '1' : '0'}</Text>
              <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                Bio set
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card mode="contained" style={{ marginTop: 20 }}>
        <Card.Content>
          <Text variant="titleMedium">Backend-linked profile state</Text>
          <List.Item title="Providers" description={user.providers.join(', ') || 'None'} left={(props) => <List.Icon {...props} icon="shield-account-outline" />} />
          <List.Item title="Headline" description={user.profile?.headline || 'Not set yet'} left={(props) => <List.Icon {...props} icon="card-account-details-outline" />} />
          <List.Item title="Location" description={user.profile?.location || 'Not set yet'} left={(props) => <List.Icon {...props} icon="map-marker-outline" />} />
          <List.Item title="Accent palette" description={user.profile?.accentColor || accent} left={(props) => <List.Icon {...props} icon="palette-outline" />} />
          <List.Item title="Appearance mode" description={colorModeLabel} left={(props) => <List.Icon {...props} icon="theme-light-dark" />} />
        </Card.Content>
      </Card>

      <Button mode="outlined" style={{ marginTop: 20 }}>
        Future: edit profile form
      </Button>
    </AppScreen>
  );
}
