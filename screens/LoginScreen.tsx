import React, { useState } from "react";
import { StyleSheet, View, Pressable, Image, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { useUser } from "@/contexts/UserContext";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { theme } = useTheme();
  const { signInWithGoogle, continueAsGuest } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  // Check if Google OAuth is configured
  const hasGoogleConfig = !!(
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
  );

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  React.useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      fetchUserInfo(authentication?.accessToken);
    }
  }, [response]);

  const fetchUserInfo = async (token: string | undefined) => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const userInfo = await userInfoResponse.json();
      
      signInWithGoogle({
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      });
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!hasGoogleConfig) {
      console.warn("Google OAuth is not configured. Continuing as guest instead.");
      handleGuestContinue();
      return;
    }
    
    if (!request) {
      console.error("Google OAuth request failed. Please check configuration.");
      handleGuestContinue();
      return;
    }
    
    setIsLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      console.error("Google sign-in error:", error);
      // Fall back to guest mode on error
      handleGuestContinue();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestContinue = () => {
    continueAsGuest();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primary }]}>
            <Feather name="file-text" size={48} color={theme.buttonText} />
          </View>
          <ThemedText style={[Typography.h1, styles.title]}>
            Resume Improver
          </ThemedText>
          <ThemedText style={[Typography.body, styles.subtitle, { color: theme.textSecondary }]}>
            AI-powered resume analysis and improvement
          </ThemedText>
        </View>

        <View style={styles.buttonsContainer}>
          {hasGoogleConfig && (
            <Pressable
              style={({ pressed }) => [
                styles.googleButton,
                { 
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                  opacity: pressed ? 0.7 : 1 
                },
              ]}
              onPress={handleGoogleSignIn}
              disabled={!request || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <>
                  <Image
                    source={require("@/assets/images/google-icon.png")}
                    style={styles.googleIcon}
                  />
                  <ThemedText style={[Typography.body, styles.buttonText]}>
                    Continue with Google
                  </ThemedText>
                </>
              )}
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [
              hasGoogleConfig ? styles.guestButton : styles.primaryButton,
              hasGoogleConfig ? {} : { backgroundColor: theme.primary },
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={handleGuestContinue}
            disabled={isLoading}
          >
            <ThemedText style={[
              hasGoogleConfig ? Typography.caption : Typography.body,
              hasGoogleConfig ? { color: theme.textSecondary } : { color: theme.buttonText, fontWeight: '600' }
            ]}>
              {hasGoogleConfig ? 'Continue as guest' : 'Get Started'}
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <ThemedText style={[Typography.caption, { color: theme.textSecondary }]}>
          By continuing, you agree to our Terms and Privacy Policy
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl * 3,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  buttonsContainer: {
    gap: Spacing.md,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  googleIcon: {
    width: 24,
    height: 24,
  },
  buttonText: {
    fontWeight: "600",
  },
  guestButton: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    alignItems: "center",
  },
});
