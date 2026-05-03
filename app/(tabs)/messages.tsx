import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Text } from 'react-native-paper';

import { AppScreen } from '@/src/components/AppScreen';
import { AuthGate } from '@/src/components/AuthGate';
import { useAuth } from '@/src/contexts/auth-context';
import { messagePreviewThreads } from '@/src/data/opportunities';

export default function MessagesScreen() {
  const { user } = useAuth();

  if (!user) {
    return (
      <AppScreen>
        <AuthGate
          title="Messages are private by design"
          description="One-to-one conversations, opportunity follow-ups, and mentor coordination should only exist behind authentication."
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View style={styles.list}>
        {messagePreviewThreads.map((thread) => (
          <Card key={thread.id} mode="contained">
            <Card.Content style={styles.threadContent}>
              <Avatar.Text size={48} label={thread.name.slice(0, 2).toUpperCase()} />
              <View style={styles.threadBody}>
                <View style={styles.threadHeader}>
                  <Text variant="titleMedium">{thread.name}</Text>
                  <Text variant="bodySmall" style={styles.threadTime}>
                    {thread.time}
                  </Text>
                </View>
                <Text variant="bodyMedium" style={styles.threadPreview}>
                  {thread.preview}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list:          { gap: 12 },
  threadContent: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  threadBody:    { flex: 1 },
  threadHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  threadTime:    { opacity: 0.65 },
  threadPreview: { marginTop: 4, opacity: 0.82 },
});
