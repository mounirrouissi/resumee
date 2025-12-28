import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeStackNavigator from "@/navigation/HomeStackNavigator";
import HistoryStackNavigator from "@/navigation/HistoryStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

export type MainTabParamList = {
  HistoryTab: undefined;
  HomeTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

// ... (existing helper function to check if tab bar should be shown)
const getTabBarVisibility = (route: any) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? "Home";

  // List of screens where we want to HIDE the tab bar
  const hiddenScreens = ["Preview", "ResumeDetail", "Pricing", "EditProfile"];

  if (hiddenScreens.includes(routeName)) {
    return "none";
  }
  return "flex";
};

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          display: getTabBarVisibility(route), // Dynamically hide
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundDefault,
            web: theme.backgroundDefault,
          }),
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.select({
            ios: 88,
            android: 65 + Math.max(insets.bottom, 8),
            web: 70,
          }),
          paddingBottom: Platform.select({
            ios: 28,
            android: Math.max(insets.bottom, 12),
            web: 12,
          }),
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="HistoryTab"
        component={HistoryStackNavigator}
        options={{
          title: "History",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && { backgroundColor: theme.primary + "15" },
              ]}
            >
              <Feather name="clock" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: "Upload",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && { backgroundColor: theme.primary + "15" },
              ]}
            >
              <Feather name="upload-cloud" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && { backgroundColor: theme.primary + "15" },
              ]}
            >
              <Feather name="user" size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 44,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
