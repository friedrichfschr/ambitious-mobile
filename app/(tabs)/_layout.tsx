import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { IconButton } from 'react-native-paper';

import { useAuth } from '@/src/contexts/auth-context';
import { usePreferences } from '@/src/contexts/preferences-context';

function TabIcon(props: { name: ComponentProps<typeof MaterialCommunityIcons>['name']; color: string }) {
  return <MaterialCommunityIcons size={24} {...props} />;
}

export default function TabLayout() {
  const { user } = useAuth();
  const { paperTheme } = usePreferences();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: paperTheme.colors.primary,
        tabBarInactiveTintColor: paperTheme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: paperTheme.colors.surface,
          borderTopColor: paperTheme.colors.outlineVariant,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          elevation: 0,
        },
        headerStyle: {
          backgroundColor: paperTheme.colors.background,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 17,
          color: paperTheme.colors.onSurface,
        },
        sceneStyle: {
          backgroundColor: paperTheme.colors.background,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <TabIcon name="compass-outline" color={color} />,
          headerTitle: 'Opportunities',
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <TabIcon name="forum-outline" color={color} />,
          headerTitle: 'Community',
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <TabIcon name="message-text-outline" color={color} />,
          headerTitle: 'Messages',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="account-circle-outline" color={color} />,
          headerTitle: 'Profile',
          headerRight: () =>
            user ? <IconButton icon="cog-outline" onPress={() => router.push('/settings')} /> : null,
        }}
      />
    </Tabs>
  );
}
