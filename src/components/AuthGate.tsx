import { router, usePathname } from 'expo-router';
import { Button, Card, Text } from 'react-native-paper';

export function AuthGate({ title, description }: { title: string; description: string }) {
  const pathname = usePathname();

  return (
    <Card mode="contained">
      <Card.Content>
        <Text variant="headlineSmall">{title}</Text>
        <Text variant="bodyMedium" style={{ marginTop: 10 }}>
          {description}
        </Text>
        <Button
          mode="contained"
          style={{ marginTop: 20, alignSelf: 'flex-start' }}
          onPress={() => router.push({ pathname: '/auth', params: { redirectTo: pathname } })}>
          Sign in to continue
        </Button>
      </Card.Content>
    </Card>
  );
}
