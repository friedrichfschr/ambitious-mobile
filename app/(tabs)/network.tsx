import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Text } from 'react-native-paper';

import { AppScreen } from '@/src/components/AppScreen';
import { AuthBanner } from '@/src/components/AuthBanner';
import { useAuth } from '@/src/contexts/auth-context';
import { messagePreviewThreads } from '@/src/data/opportunities';

export default function NetworkScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.root}>
      {!user && <AuthBanner />}
      <AppScreen>
        {user ? (
          <View style={styles.list}>
            {messagePreviewThreads.map((thread) => (
              <Card key={thread.id} mode="contained">
                <Card.Content style={styles.threadContent}>
                  <Avatar.Text size={48} label={thread.name.slice(0, 2).toUpperCase()} />
                  <View style={styles.threadBody}>
                    <View style={styles.threadHeader}>
                      <Text variant="titleMedium">{thread.name}</Text>
                      <Text variant="bodySmall" style={styles.threadTime}>{thread.time}</Text>
                    </View>
                    <Text variant="bodyMedium" style={styles.threadPreview}>{thread.preview}</Text>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Connect with fellow scholars, mentors, and alumni.
            </Text>
          </View>
        )}
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1 },
  list:          { gap: 12 },
  threadContent: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  threadBody:    { flex: 1 },
  threadHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  threadTime:    { opacity: 0.65 },
  threadPreview: { marginTop: 4, opacity: 0.82 },
  empty:         { paddingTop: 40, alignItems: 'center' },
  emptyText:     { opacity: 0.5 },
});
