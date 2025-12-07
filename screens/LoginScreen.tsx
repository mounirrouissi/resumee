import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { useTheme } from "@/hooks/useTheme";
import {
  Spacing,
  BorderRadius,
  Typography,
  Gradients,
  Shadows,
  Animations,
} from "@/constants/theme";
import { useUser } from "@/contexts/UserContext";

WebBrowser.maybeCompleteAuthSession();

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function LoginScreen() {
  const { theme, colorScheme } = useTheme();
  const { signInWithGoogle, continueAsGuest } = useUser();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: Animations.slow, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, ...Animations.spring, useNativeDriver: true }),
      Animated.spring(logoScaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, { toValue: 1, duration: 6000, useNativeDriver: true }),
        Animated.timing(orb1Anim, { toValue: 0, duration: 6000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, { toValue: 1, duration: 8000, useNativeDriver: true }),
        Animated.timing(orb2Anim, { toValue: 0, duration: 8000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      fetchUserInfo(authentication?.accessToken);
    }
  }, [response]);

  const fetchUserInfo = async (token: string | undefined) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const userInfoResponse = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userInfo = await userInfoResponse.json();
      signInWithGoogle({ id: userInfo.id, email: userInfo.email, name: userInfo.name, picture: userInfo.picture });
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!hasGoogleConfig || !request) { handleGuestContinue(); return; }
    setIsLoading(true);
    try { await promptAsync(); } catch (error) { handleGuestContinue(); } finally { setIsLoading(false); }
  };

  const handleGuestContinue = () => continueAsGuest();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <LinearGradient
        colors={colorScheme === "dark" ? ["#0F0F1A", "#1A1A2E", "#16162A"] : ["#FAFAFA", "#F3F4F6", "#EEF2FF"]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.orb, styles.orb1, { backgroundColor: theme.primary, transform: [
        { translateY: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 40] }) },
        { translateX: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) },
      ]}]} />
      <Animated.View style={[styles.orb, styles.orb2, { backgroundColor: theme.accent, transform: [
        { translateY: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -50] }) },
        { translateX: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -30] }) },
      ]}]} />

      <View style={[styles.content, { paddingTop: insets.top + Spacing["3xl"] }]}>
        <Animated.View style={[styles.logoSection, { opacity: fadeAnim, transform: [{ scale: logoScaleAnim }] }]}>
          <View style={[styles.logoContainer, Shadows.xl]}>
            <LinearGradient colors={colorScheme === "dark" ? Gradients.dark.primary : Gradients.light.primary} style={styles.logoGradient}>
              <Image source={require("@/assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
            </LinearGradient>
          </View>
        </Animated.View>

        <Animated.View style={[styles.textSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <ThemedText style={[Typography.hero, styles.title]}>Resume Improver</ThemedText>
          <ThemedText style={[Typography.body, styles.subtitle, { color: theme.textSecondary }]}>
            Transform your resume with AI-powered enhancements and professional Harvard-style formatting
          </ThemedText>
        </Animated.View>

        <Animated.View style={[styles.featuresSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {[{ icon: "zap", text: "AI Enhancement" }, { icon: "file-text", text: "Harvard Format" }, { icon: "shield", text: "ATS Optimized" }].map((f, i) => (
            <View key={i} style={[styles.featurePill, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name={f.icon as any} size={14} color={theme.primary} />
              <ThemedText style={[Typography.caption, { color: theme.text, marginLeft: 6 }]}>{f.text}</ThemedText>
            </View>
          ))}
        </Animated.View>

        <Animated.View style={[styles.buttonsSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {hasGoogleConfig && <GoogleSignInButton onPress={handleGoogleSignIn} isLoading={isLoading} disabled={!request} />}
          <Pressable style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]} onPress={handleGuestContinue} disabled={isLoading}>
            <LinearGradient colors={colorScheme === "dark" ? Gradients.dark.primary : Gradients.light.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.buttonGradient}>
              {isLoading ? <ActivityIndicator color="#FFF" /> : (
                <>
                  <ThemedText style={[Typography.button, { color: "#FFF" }]}>{hasGoogleConfig ? "Continue as Guest" : "Get Started"}</ThemedText>
                  <Feather name="arrow-right" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                </>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <ThemedText style={[Typography.caption, { color: theme.textMuted }]}>By continuing, you agree to our Terms and Privacy Policy</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.xl, justifyContent: "center" },
  orb: { position: "absolute", borderRadius: 999, opacity: 0.15 },
  orb1: { width: 300, height: 300, top: -50, right: -100 },
  orb2: { width: 250, height: 250, bottom: 100, left: -80 },
  logoSection: { alignItems: "center", marginBottom: Spacing["2xl"] },
  logoContainer: { width: 100, height: 100, borderRadius: BorderRadius.xl, overflow: "hidden" },
  logoGradient: { flex: 1, alignItems: "center", justifyContent: "center" },
  logo: { width: 60, height: 60, tintColor: "#FFF" },
  textSection: { alignItems: "center", marginBottom: Spacing.xl },
  title: { textAlign: "center", marginBottom: Spacing.sm },
  subtitle: { textAlign: "center", paddingHorizontal: Spacing.lg, lineHeight: 24 },
  featuresSection: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: Spacing.sm, marginBottom: Spacing["3xl"] },
  featurePill: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  buttonsSection: { gap: Spacing.md, maxWidth: 340, alignSelf: "center", width: "100%" },
  primaryButton: { height: Spacing.buttonHeight, borderRadius: BorderRadius.md, overflow: "hidden", ...Shadows.glow },
  buttonGradient: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  footer: { alignItems: "center", paddingHorizontal: Spacing.xl },
});
