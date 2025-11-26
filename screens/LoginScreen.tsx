import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Pressable, Image, ActivityIndicator, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography, Gradients, Shadows, Animations } from "@/constants/theme";
import { useUser } from "@/contexts/UserContext";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { theme, colorScheme } = useTheme();
  const { signInWithGoogle, continueAsGuest } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;

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

  // Start animations on mount
  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Animations.slow,
      useNativeDriver: true,
    }).start();

    // Pulse animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating animations for background shapes
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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

  const gradientColors = colorScheme === 'dark'
    ? Gradients.dark.background
    : Gradients.light.background;

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Shapes */}
      <Animated.View
        style={[
          styles.floatingShape1,
          {
            opacity: 0.1,
            transform: [
              {
                translateY: floatAnim1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 30],
                }),
              },
            ],
          },
        ]}
      >
        <View style={[styles.circle, { backgroundColor: theme.primary }]} />
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingShape2,
          {
            opacity: 0.08,
            transform: [
              {
                translateY: floatAnim2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -40],
                }),
              },
            ],
          },
        ]}
      >
        <View style={[styles.circle, { backgroundColor: theme.primary }]} />
      </Animated.View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.logoContainer}>
          <Animated.View
            style={[
              styles.iconCircle,
              {
                backgroundColor: theme.primary,
                transform: [{ scale: pulseAnim }],
              },
              Shadows.large
            ]}
          >
            <Feather name="file-text" size={48} color={theme.buttonText} />
          </Animated.View>
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
                },
                Shadows.medium,
                pressed && styles.pressed,
              ]}
              onPress={handleGoogleSignIn}
              disabled={!request || isLoading}
            >
              <BlurView
                intensity={20}
                tint={colorScheme === 'dark' ? 'dark' : 'light'}
                style={styles.blurContainer}
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
              </BlurView>
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [
              hasGoogleConfig ? styles.guestButton : styles.primaryButton,
              hasGoogleConfig ? {} : [
                { backgroundColor: 'transparent', overflow: 'hidden' },
                Shadows.large
              ],
              pressed && styles.pressed,
            ]}
            onPress={handleGuestContinue}
            disabled={isLoading}
          >
            {hasGoogleConfig ? (
              <ThemedText style={[
                Typography.caption,
                { color: theme.textSecondary }
              ]}>
                Continue as guest
              </ThemedText>
            ) : (
              <LinearGradient
                colors={colorScheme === 'dark' ? Gradients.dark.primary : Gradients.light.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <ThemedText style={[
                  Typography.body,
                  { color: theme.buttonText, fontWeight: '600' }
                ]}>
                  Get Started
                </ThemedText>
              </LinearGradient>
            )}
          </Pressable>
        </View>
      </Animated.View>

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
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  blurContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    height: 56,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  gradientButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    alignItems: "center",
  },
  floatingShape1: {
    position: 'absolute',
    top: 100,
    right: 30,
  },
  floatingShape2: {
    position: 'absolute',
    bottom: 150,
    left: 40,
  },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
});

