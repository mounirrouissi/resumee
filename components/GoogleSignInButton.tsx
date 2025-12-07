import React from "react";
import { StyleSheet, Pressable, Image, View, ActivityIndicator, Platform } from "react-native";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography, Shadows } from "@/constants/theme";

interface GoogleSignInButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function GoogleSignInButton({
  onPress,
  isLoading = false,
  disabled = false
}: GoogleSignInButtonProps) {
  const { theme, colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isDark ? theme.backgroundSecondary : "#FFFFFF",
          borderColor: theme.border,
        },
        pressed && styles.pressed,
        disabled && styles.disabled,
        Shadows.small,
      ]}
    >
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.textSecondary} />
        ) : (
          <>
            <Image
              source={require("@/assets/images/google-icon.png")}
              style={styles.icon}
            />
            <ThemedText style={[Typography.button, { color: theme.text }]}>
              Continue with Google
            </ThemedText>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: Spacing.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.6,
  },
});
