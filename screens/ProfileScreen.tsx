import React, { useState } from "react";
import { StyleSheet, View, TextInput, Pressable, Image, Switch } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { useUser } from "@/contexts/UserContext";

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const colorScheme = useColorScheme();
  const { displayName, setDisplayName, avatarUri, setAvatarUri } = useUser();
  const [localName, setLocalName] = useState(displayName);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSelectAvatar = () => {
    const presetAvatar = require("@/assets/images/avatar-preset.png");
    setAvatarUri(avatarUri ? "" : Image.resolveAssetSource(presetAvatar).uri);
  };

  const handleNameBlur = () => {
    if (localName.trim()) {
      setDisplayName(localName.trim());
    }
  };

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <Card style={styles.avatarCard}>
          <View style={styles.avatarSection}>
            <Pressable onPress={handleSelectAvatar} style={styles.avatarContainer}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <View
                  style={[styles.avatarPlaceholder, { backgroundColor: theme.backgroundTertiary }]}
                >
                  <Feather name="user" size={40} color={theme.textSecondary} />
                </View>
              )}
              <View style={[styles.editBadge, { backgroundColor: theme.primary }]}>
                <Feather name="edit-2" size={14} color={theme.buttonText} />
              </View>
            </Pressable>
          </View>
        </Card>

        <Card style={styles.fieldCard}>
          <ThemedText style={[Typography.bodySmall, styles.fieldLabel, { color: theme.textSecondary }]}>
            Display Name
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={localName}
            onChangeText={setLocalName}
            onBlur={handleNameBlur}
            placeholder="Enter your name"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="words"
            returnKeyType="done"
          />
        </Card>

        <View style={styles.sectionHeader}>
          <ThemedText style={Typography.h2}>Preferences</ThemedText>
        </View>

        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText style={Typography.body}>Appearance</ThemedText>
              <ThemedText style={[Typography.caption, { color: theme.textSecondary }]}>
                {colorScheme === "dark" ? "Dark" : "Light"} mode
              </ThemedText>
            </View>
            <ThemedText style={[Typography.body, { color: theme.textSecondary }]}>
              System
            </ThemedText>
          </View>
        </Card>

        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText style={Typography.body}>Notifications</ThemedText>
              <ThemedText style={[Typography.caption, { color: theme.textSecondary }]}>
                Get notified when processing completes
              </ThemedText>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={notificationsEnabled ? theme.primary : theme.backgroundTertiary}
            />
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <ThemedText style={Typography.h2}>About</ThemedText>
        </View>

        <Card style={styles.linkCard}>
          <Pressable style={styles.linkRow}>
            <ThemedText style={Typography.body}>Version</ThemedText>
            <View style={styles.linkRight}>
              <ThemedText style={[Typography.body, { color: theme.textSecondary }]}>
                1.0.0
              </ThemedText>
            </View>
          </Pressable>
        </Card>

        <Card style={styles.linkCard}>
          <Pressable style={styles.linkRow}>
            <ThemedText style={Typography.body}>Privacy Policy</ThemedText>
            <View style={styles.linkRight}>
              <Feather name="chevron-right" size={20} color={theme.textSecondary} />
            </View>
          </Pressable>
        </Card>

        <Card style={styles.linkCard}>
          <Pressable style={styles.linkRow}>
            <ThemedText style={Typography.body}>Terms of Service</ThemedText>
            <View style={styles.linkRight}>
              <Feather name="chevron-right" size={20} color={theme.textSecondary} />
            </View>
          </Pressable>
        </Card>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
  },
  avatarCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  avatarSection: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldCard: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.body.fontSize,
  },
  sectionHeader: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  settingCard: {
    marginBottom: Spacing.md,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingInfo: {
    flex: 1,
  },
  linkCard: {
    marginBottom: Spacing.md,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  linkRight: {
    flexDirection: "row",
    alignItems: "center",
  },
});
