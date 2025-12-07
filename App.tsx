import React from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import LoginScreen from "@/screens/LoginScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ResumeProvider } from "@/contexts/ResumeContext";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { CreditsProvider } from "@/contexts/CreditsContext";
import { RevenueCatProvider } from "@/contexts/RevenueCatContext";

function AppContent() {
  const { isAuthenticated } = useUser();

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabNavigator /> : <LoginScreen />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.root}>
          <KeyboardProvider>
            <UserProvider>
              <CreditsProvider>
                <RevenueCatProvider>
                  <ResumeProvider>
                    <AppContent />
                    <StatusBar style="auto" />
                  </ResumeProvider>
                </RevenueCatProvider>
              </CreditsProvider>
            </UserProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
