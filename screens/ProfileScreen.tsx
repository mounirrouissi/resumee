import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, View, TextInput, Pressable, Image, Switch, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useCredits } from "@/contexts/CreditsContext";
import { Spacing, BorderRadius, Typography, Gradients, Shadows, Animations } from "@/constants/theme";
import { useUser } from "@/contexts/UserContext";

export default function ProfileScreen() {
  const { theme, isDark, colorScheme } = useTheme();
  const navigation = useNavigation();
  const { credits } = useCredits();
  const { isAuthenticated, userType, userProfile, displayName, setDisplayName, avatarUri, setAvatarUri, signOut } = useUser();
  const [localName, setLocalName] = useState(displayName);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: Animations.slow, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, ...Animations.spring, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSelectAvatar = () => {
    const presetAvatar = require("@/assets/images/avatar-preset.png");
    setAvatarUri(avatarUri ? "" : Image.resolveAssetSource(presetAvatar).uri);
  };

  const handleNameBlur = () => {
    if (localName.trim()) setDisplayName(localName.trim());
  };

  const handleSignOut = () => signOut();

  return (
    <ScreenScrollView>
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <Pressable onPress={userType === "guest" ? handleSelectAvatar : undefined} style={styles.avatarContainer}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <LinearGradient colors={colorScheme === "dark" ? Gradients.dark.primary : Gradients.light.primary} style={styles.avatarPlaceholder}>
                <Feather name="user" size={32} color="#FFF" />
              </LinearGradient>
            )}
            {userType === "guest" && (
              <View style={[styles.editBadge, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                <Feather name="edit-2" size={12} color={theme.primary} />
              </View>
            )}
          </Pressable>
          {userType === "google" && userProfile ? (
            <View style={styles.userInfo}>
              <ThemedText style={Typography.h2}>{userProfile.name}</ThemedText>
              <ThemedText style={[Typography.bodySmall, { color: theme.textSecondary }]}>{userProfile.email}</ThemedText>
            </View>
          ) : (
            <View style={styles.userInfo}>
              <ThemedText style={Typography.h2}>{displayName || "Guest User"}</ThemedText>
              <ThemedText style={[Typography.bodySmall, { color: theme.textSecondary }]}>Free account</ThemedText>
            </View>
          )}
        </View>

        {/* Credits Card */}
        <Pressable style={[styles.creditsCard, Shadows.medium]} onPress={() => navigation.navigate('Pricing' as any)}>
          <LinearGradient colors={colorScheme === "dark" ? Gradients.dark.primary : Gradients.light.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.creditsGradient}>
            <View style={styles.creditsContent}>
              <View>
                <ThemedText style={[Typography.caption, { color: "rgba(255,255,255,0.8)" }]}>Available Credits</ThemedText>
                <ThemedText style={[Typography.hero, { color: "#FFF" }]}>{credits}</ThemedText>
              </View>
              <View style={styles.creditsAction}>
                <ThemedText style={[Typography.button, { color: "#FFF" }]}>Get More</ThemedText>
                <Feather name="arrow-right" size={18} color="#FFF" />
              </View>
            </View>
          </LinearGradient>
        </Pressable>

        {userType === "guest" && (
          <View style={[styles.inputCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <ThemedText style={[Typography.caption, { color: theme.textSecondary, marginBottom: Spacing.sm }]}>Display Name</ThemedText>
            <TextInput style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]} value={localName} onChangeText={setLocalName} onBlur={handleNameBlur} placeholder="Enter your name" placeholderTextColor={theme.textMuted} />
          </View>
        )}

        {/* Settings Section */}
        <View style={styles.section}>
          <ThemedText style={[Typography.h3, styles.sectionTitle]}>Settings</ThemedText>
          
          <View style={[styles.settingCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: theme.primary + '15' }]}>
                <Feather name={isDark ? "moon" : "sun"} size={18} color={theme.primary} />
              </View>
              <View style={styles.settingInfo}>
                <ThemedText style={Typography.body}>Appearance</ThemedText>
                <ThemedText style={[Typography.caption, { color: theme.textSecondary }]}>{isDark ? "Dark" : "Light"} mode (System)</ThemedText>
              </View>
            </View>
          </View>

          <View style={[styles.settingCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: theme.primary + '15' }]}>
                <Feather name="bell" size={18} color={theme.primary} />
              </View>
              <View style={styles.settingInfo}>
                <ThemedText style={Typography.body}>Notifications</ThemedText>
                <ThemedText style={[Typography.caption, { color: theme.textSecondary }]}>Processing alerts</ThemedText>
              </View>
              <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: theme.border, true: theme.primaryLight }} thumbColor={notificationsEnabled ? theme.primary : theme.backgroundTertiary} />
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <ThemedText style={[Typography.h3, styles.sectionTitle]}>About</ThemedText>
          
          {[
            { icon: "info", label: "Version", value: "1.0.0" },
            { icon: "shield", label: "Privacy Policy", chevron: true },
            { icon: "file-text", label: "Terms of Service", chevron: true },
          ].map((item, index) => (
            <Pressable key={index} style={[styles.settingCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
              <View style={styles.settingRow}>
                <View style={[styles.settingIcon, { backgroundColor: theme.backgroundSecondary }]}>
                  <Feather name={item.icon as any} size={18} color={theme.textSecondary} />
                </View>
                <ThemedText style={[Typography.body, { flex: 1 }]}>{item.label}</ThemedText>
                {item.value && <ThemedText style={[Typography.body, { color: theme.textSecondary }]}>{item.value}</ThemedText>}
                {item.chevron && <Feather name="chevron-right" size={20} color={theme.textSecondary} />}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Sign Out */}
        {isAuthenticated && (
          <Pressable style={[styles.signOutButton, { borderColor: theme.error }]} onPress={handleSignOut}>
            <Feather name="log-out" size={18} color={theme.error} />
            <ThemedText style={[Typography.body, { color: theme.error, marginLeft: Spacing.sm }]}>Sign Out</ThemedText>
          </Pressable>
        )}
      </Animated.View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing["3xl"] },
  profileHeader: { alignItems: "center", padding: Spacing.xl, borderRadius: BorderRadius.xl, borderWidth: 1, marginBottom: Spacing.lg },
  avatarContainer: { position: "relative", marginBottom: Spacing.md },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  editBadge: { position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  userInfo: { alignItems: "center" },
  creditsCard: { borderRadius: BorderRadius.xl, overflow: "hidden", marginBottom: Spacing.lg },
  creditsGradient: { padding: Spacing.xl },
  creditsContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  creditsAction: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  inputCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.lg },
  input: { height: Spacing.inputHeight, borderWidth: 1, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.lg, fontSize: Typography.body.fontSize },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { marginBottom: Spacing.md },
  settingCard: { borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.sm, overflow: "hidden" },
  settingRow: { flexDirection: "row", alignItems: "center", padding: Spacing.lg },
  settingIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: Spacing.md },
  settingInfo: { flex: 1 },
  signOutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1 },
});
