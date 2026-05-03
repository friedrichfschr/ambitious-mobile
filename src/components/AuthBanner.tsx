import { router, usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { usePreferences } from '../contexts/preferences-context';

/**
 * Subtle top banner shown on auth-required screens when the user is signed out.
 * The screen content is still rendered behind it so the layout doesn't jump.
 */
export function AuthBanner() {
  const pathname = usePathname();
  const { paperTheme } = usePreferences();
  const c = paperTheme.colors;

  return (
    <View style={[styles.banner, { backgroundColor: c.surfaceVariant, borderBottomColor: c.outlineVariant }]}>
      <Text variant="bodySmall" style={[styles.text, { color: c.onSurfaceVariant }]}>
        Sign in to access this section
      </Text>
      <Button
        mode="text"
        compact
        labelStyle={[styles.btnLabel, { color: c.primary }]}
        onPress={() => router.push({ pathname: '/auth', params: { redirectTo: pathname } })}>
        Sign in
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  text:     { flex: 1 },
  btnLabel: { fontSize: 13, marginVertical: 0 },
});
