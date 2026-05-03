import { router, usePathname } from 'expo-router';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { usePreferences } from '../contexts/preferences-context';

export function AuthGate({ title, description }: { title: string; description: string }) {
  const pathname = usePathname();
  const { paperTheme } = usePreferences();

  return (
    <View style={{ gap: 16 }}>
      <Text variant="headlineSmall" style={{ color: paperTheme.colors.onSurface }}>
        {title}
      </Text>
      <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
        {description}
      </Text>
      <Button
        mode="contained"
        style={{ alignSelf: 'flex-start' }}
        onPress={() => router.push({ pathname: '/auth', params: { redirectTo: pathname } })}>
        Sign in to continue
      </Button>
    </View>
  );
}
