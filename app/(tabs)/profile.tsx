import { View } from 'react-native';
import { Button, Card, List, Text } from 'react-native-paper';

import { AppScreen } from '@/src/components/AppScreen';
import { AuthGate } from '@/src/components/AuthGate';
import { useAuth } from '@/src/contexts/auth-context';
import { usePreferences } from '@/src/contexts/preferences-context';

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
          <Text variant="headlineSmall">{user.name}</Text>
          <Text variant="bodyLarge" style={{ marginTop: 4, opacity: 0.75 }}>
            {user.email}
          </Text>
          <View style={{ flexDirection: 'row', gap: 24, marginTop: 20 }}>
            <View>
              <Text variant="headlineSmall">12</Text>
              <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                Saved
              </Text>
            </View>
            <View>
              <Text variant="headlineSmall">4</Text>
              <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                Posts
              </Text>
            </View>
            <View>
              <Text variant="headlineSmall">3</Text>
              <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                Chats
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card mode="contained" style={{ marginTop: 20 }}>
        <Card.Content>
          <Text variant="titleMedium">Current starter decisions</Text>
          <List.Item title="Component system" description="React Native Paper (Material 3, customized to stay minimal)" left={(props) => <List.Icon {...props} icon="layers-outline" />} />
          <List.Item title="Accent palette" description={accent} left={(props) => <List.Icon {...props} icon="palette-outline" />} />
          <List.Item title="Appearance mode" description={colorModeLabel} left={(props) => <List.Icon {...props} icon="theme-light-dark" />} />
          <List.Item title="Auth direction" description="Supabase + email, Google, and Apple next" left={(props) => <List.Icon {...props} icon="shield-account-outline" />} />
        </Card.Content>
      </Card>

      <Button mode="outlined" style={{ marginTop: 20 }}>
        Future: edit profile
      </Button>
    </AppScreen>
  );
}
