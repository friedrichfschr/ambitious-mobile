import { router } from 'expo-router';
import { Button, Text } from 'react-native-paper';

import { AppScreen } from '@/src/components/AppScreen';

export default function NotFoundScreen() {
  return (
    <AppScreen contentContainerStyle={{ flex: 1, justifyContent: 'center' }}>
      <Text variant="headlineMedium">Nothing here yet.</Text>
      <Text variant="bodyLarge" style={{ marginTop: 12, opacity: 0.8 }}>
        This route does not exist in the current app shell.
      </Text>
      <Button mode="contained" onPress={() => router.replace('/(tabs)')} style={{ marginTop: 20 }}>
        Back to opportunities
      </Button>
    </AppScreen>
  );
}
