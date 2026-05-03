import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router, Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import { IconButton } from "react-native-paper";

import { usePreferences } from "@/src/contexts/preferences-context";

function TabIcon(props: {
  name: ComponentProps<typeof MaterialCommunityIcons>["name"];
  color: string;
}) {
  return <MaterialCommunityIcons size={24} {...props} />;
}

function HeaderLeft() {
  return (
    <IconButton
      icon="bell-outline"
      size={22}
      style={styles.headerLeftBtn}
      onPress={() => router.push("/notifications")}
    />
  );
}

function HeaderRight() {
  return (
    <View style={styles.headerRight}>
      <IconButton
        icon="message-text-outline"
        size={22}
        onPress={() => router.push("/messages")}
      />
      <IconButton
        icon="cog-outline"
        size={22}
        onPress={() => router.push("/settings")}
      />
    </View>
  );
}

export default function TabLayout() {
  const { paperTheme } = usePreferences();

  return (
    <Tabs
      initialRouteName="index"
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
        headerStyle: { backgroundColor: paperTheme.colors.background },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 17,
          color: paperTheme.colors.onSurface,
        },
        sceneStyle: { backgroundColor: paperTheme.colors.background },
        headerLeft: () => <HeaderLeft />,
        headerRight: () => <HeaderRight />,
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <TabIcon name="compass-outline" color={color} />
          ),
          headerTitle: "Opportunities",
        }}
      />
      <Tabs.Screen
        name="network"
        options={{
          title: "Network",
          tabBarIcon: ({ color }) => (
            <TabIcon name="account-group-outline" color={color} />
          ),
          headerTitle: "Network",
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Feed",
          tabBarIcon: ({ color }) => (
            <TabIcon name="forum-outline" color={color} />
          ),
          headerTitle: "Feed",
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          tabBarIcon: ({ color }) => (
            <TabIcon name="plus-circle-outline" color={color} />
          ),
          headerTitle: "Add",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <TabIcon name="account-circle-outline" color={color} />
          ),
          headerTitle: "Profile",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerLeftBtn: { marginLeft: 4 },
  headerRight: { flexDirection: "row", alignItems: "center", marginRight: 4 },
});
