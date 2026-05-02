import { View } from 'react-native';
import { Button, Card, List, SegmentedButtons, Text } from 'react-native-paper';

import { AppScreen } from '@/src/components/AppScreen';
import { accentOptions } from '@/src/theme/palette';
import { useAuth } from '@/src/contexts/auth-context';
import { usePreferences } from '@/src/contexts/preferences-context';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { accent, colorMode, setAccent, setColorMode } = usePreferences();

  return (
    <AppScreen>
      <Card mode="contained">
        <Card.Content>
          <Text variant="titleLarge">Appearance</Text>
          <Text variant="bodyMedium" style={{ marginTop: 6, opacity: 0.72 }}>
            Keep the product minimal, but let users make it feel like theirs.
          </Text>

          <Text variant="labelLarge" style={{ marginTop: 20, marginBottom: 10 }}>
            Color mode
          </Text>
          <SegmentedButtons
            value={colorMode}
            onValueChange={(value) => setColorMode(value as 'system' | 'light' | 'dark')}
            buttons={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
          />

          <Text variant="labelLarge" style={{ marginTop: 20, marginBottom: 10 }}>
            Accent palette
          </Text>
          <View style={{ gap: 10 }}>
            {accentOptions.map((option) => (
              <Button
                key={option.name}
                mode={accent === option.name ? 'contained' : 'outlined'}
                onPress={() => setAccent(option.name)}
                contentStyle={{ justifyContent: 'space-between', flexDirection: 'row-reverse' }}
                icon={accent === option.name ? 'check' : 'palette-outline'}>
                {option.label}
              </Button>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card mode="contained" style={{ marginTop: 20 }}>
        <Card.Content>
          <Text variant="titleLarge">Future user settings</Text>
          <List.Item title="Saved opportunity alerts" description="Push and email notifications per category" left={(props) => <List.Icon {...props} icon="bell-outline" />} />
          <List.Item title="Privacy controls" description="Forum visibility, DM permissions, blocked users" left={(props) => <List.Icon {...props} icon="shield-outline" />} />
          <List.Item title="Accessibility" description="Text size, motion reduction, contrast tuning" left={(props) => <List.Icon {...props} icon="access-point" />} />
        </Card.Content>
      </Card>

      {user ? (
        <Button mode="outlined" onPress={signOut} style={{ marginTop: 20 }}>
          Sign out preview user
        </Button>
      ) : null}
    </AppScreen>
  );
}
