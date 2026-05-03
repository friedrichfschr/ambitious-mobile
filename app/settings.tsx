import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, Divider, SegmentedButtons, Text, TouchableRipple } from 'react-native-paper';

import { AppScreen } from '@/src/components/AppScreen';
import { accentOptions } from '@/src/theme/palette';
import { useAuth } from '@/src/contexts/auth-context';
import { usePreferences } from '@/src/contexts/preferences-context';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { accent, colorMode, setAccent, setColorMode, paperTheme } = usePreferences();

  return (
    <AppScreen>
      <Text variant="titleMedium" style={{ color: paperTheme.colors.onSurface, fontWeight: '700', marginBottom: 16 }}>
        Appearance
      </Text>

      <Text variant="labelMedium" style={{ color: paperTheme.colors.onSurfaceVariant, marginBottom: 10 }}>
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

      <Text variant="labelMedium" style={{ color: paperTheme.colors.onSurfaceVariant, marginTop: 24, marginBottom: 10 }}>
        Accent color
      </Text>
      <View style={{ gap: 8 }}>
        {accentOptions.map((option) => {
          const selected = accent === option.name;
          return (
            <TouchableRipple
              key={option.name}
              onPress={() => setAccent(option.name)}
              borderless
              style={{
                borderRadius: 12,
                borderWidth: 2,
                borderColor: selected ? option.swatch : paperTheme.colors.outlineVariant,
                backgroundColor: selected ? option.swatch + '12' : paperTheme.colors.surface,
                overflow: 'hidden',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: option.swatch,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    variant="labelLarge"
                    style={{ color: selected ? option.swatch : paperTheme.colors.onSurface }}>
                    {option.label}
                  </Text>
                  <Text variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                    {option.description}
                  </Text>
                </View>
                {selected ? (
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: option.swatch,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text style={{ color: paperTheme.colors.onPrimary, fontSize: 12, fontWeight: '700' }}>✓</Text>
                  </View>
                ) : null}
              </View>
            </TouchableRipple>
          );
        })}
      </View>

      <Divider style={{ marginVertical: 24 }} />

      {user ? (
        <Button
          mode="outlined"
          textColor={paperTheme.colors.error}
          onPress={async () => {
            await signOut();
            router.dismissAll();
            router.replace({ pathname: '/auth', params: { firstLaunch: '1' } });
          }}>
          Sign out
        </Button>
      ) : null}
    </AppScreen>
  );
}
