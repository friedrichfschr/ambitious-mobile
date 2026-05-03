import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Avatar, Divider, Text, TouchableRipple } from 'react-native-paper';

import { AuthBanner } from '@/src/components/AuthBanner';
import { useAuth } from '@/src/contexts/auth-context';
import { usePreferences } from '@/src/contexts/preferences-context';
import { messagePreviewThreads } from '@/src/data/opportunities';

export default function MessagesScreen() {
  const { user } = useAuth();
  const { paperTheme } = usePreferences();
  const c = paperTheme.colors;

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      {!user && <AuthBanner />}

      {user ? (
        messagePreviewThreads.map((thread, i) => (
          <View key={thread.id}>
            <TouchableRipple
              onPress={() => router.push({ pathname: '/chat', params: { id: thread.id, name: thread.name } })}
              style={styles.row}>
              <View style={styles.rowInner}>
                <Avatar.Text size={46} label={thread.name.slice(0, 2).toUpperCase()} />
                <View style={styles.body}>
                  <View style={styles.topLine}>
                    <Text variant="titleSmall" style={{ color: c.onSurface, fontWeight: '600', flex: 1 }}>
                      {thread.name}
                    </Text>
                    <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>
                      {thread.time}
                    </Text>
                  </View>
                  <Text
                    variant="bodySmall"
                    numberOfLines={1}
                    style={{ color: c.onSurfaceVariant, marginTop: 2 }}>
                    {thread.preview}
                  </Text>
                </View>
              </View>
            </TouchableRipple>
            {i < messagePreviewThreads.length - 1 && <Divider style={styles.divider} />}
          </View>
        ))
      ) : (
        <View style={styles.empty}>
          <Text variant="bodyMedium" style={{ color: c.onSurfaceVariant, textAlign: 'center' }}>
            Your conversations will appear here.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:     { flex: 1 },
  row:      { paddingHorizontal: 16, paddingVertical: 12 },
  rowInner: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  body:     { flex: 1 },
  topLine:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  divider:  { marginLeft: 76 },
  empty:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
});
