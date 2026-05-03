import { PropsWithChildren } from 'react';
import { ScrollView, StyleProp, ViewStyle } from 'react-native';

import { usePreferences } from '../contexts/preferences-context';

export function AppScreen({
  children,
  contentContainerStyle,
}: PropsWithChildren<{ contentContainerStyle?: StyleProp<ViewStyle> }>) {
  const { paperTheme } = usePreferences();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: paperTheme.colors.background }}
      contentContainerStyle={[
        {
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 32,
          gap: 16,
        },
        contentContainerStyle,
      ]}>
      {children}
    </ScrollView>
  );
}
