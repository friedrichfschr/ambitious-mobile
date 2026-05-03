import { StyleSheet, View } from 'react-native';
import { Divider, Text } from 'react-native-paper';

import { AppScreen } from '../src/components/AppScreen';
import { AuthBanner } from '../src/components/AuthBanner';
import { useAuth } from '../src/contexts/auth-context';
import { usePreferences } from '../src/contexts/preferences-context';

const SAMPLE_NOTIFICATIONS = [
  { id: '1', title: 'New opportunity match', body: 'The Rhodes Scholarship deadline is in 30 days.', time: '2h ago', read: false },
  { id: '2', title: 'Application reminder', body: 'You saved the Schwarzman Scholars program. Applications open next month.', time: '1d ago', read: false },
  { id: '3', title: 'Community reply', body: 'Someone replied to your post in the Fulbright community.', time: '3d ago', read: true },
  { id: '4', title: 'Deadline passed', body: 'The Knight-Hennessy Scholars deadline has passed.', time: '1w ago', read: true },
];

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { paperTheme } = usePreferences();
  const c = paperTheme.colors;

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      {!user && <AuthBanner />}
      <AppScreen>
        {SAMPLE_NOTIFICATIONS.map((n, i) => (
          <View key={n.id}>
            <View style={[styles.row, !n.read && { backgroundColor: c.primaryContainer }]}>
              {!n.read && <View style={[styles.dot, { backgroundColor: c.primary }]} />}
              <View style={[styles.content, n.read && styles.contentIndented]}>
                <Text variant="labelLarge" style={{ color: c.onSurface }}>{n.title}</Text>
                <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, marginTop: 2 }}>{n.body}</Text>
                <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, opacity: 0.6, marginTop: 4 }}>{n.time}</Text>
              </View>
            </View>
            {i < SAMPLE_NOTIFICATIONS.length - 1 && <Divider />}
          </View>
        ))}
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1 },
  row:            { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 14 },
  dot:            { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: 10 },
  content:        { flex: 1 },
  contentIndented: { marginLeft: 18 },
});
