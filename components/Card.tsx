import React from "react";
import { StyleSheet, ViewStyle, Pressable, Animated } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: "default" | "elevated" | "outlined";
}

export function Card({
  children,
  style,
  onPress,
  variant = "default",
}: CardProps) {
  const { theme } = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case "elevated":
        return { ...Shadows.medium, borderWidth: 0 };
      case "outlined":
        return { borderWidth: 1, borderColor: theme.border };
      default:
        return { borderWidth: 1, borderColor: theme.borderLight };
    }
  };

  const cardStyle = [
    styles.card,
    { backgroundColor: theme.backgroundDefault },
    getVariantStyle(),
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <ThemedView style={cardStyle}>{children}</ThemedView>;
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
