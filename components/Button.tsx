import React, { ReactNode } from "react";
import { StyleSheet, Pressable, ViewStyle, StyleProp, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Typography, Gradients, Shadows, Animations } from "@/constants/theme";

interface ButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  onPress,
  children,
  style,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "medium",
}: ButtonProps) {
  const { theme, colorScheme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.97, Animations.spring);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Animations.spring);
  };

  const getSizeStyle = () => {
    switch (size) {
      case "small": return { height: 40, paddingHorizontal: Spacing.md };
      case "large": return { height: 56, paddingHorizontal: Spacing.xl };
      default: return { height: Spacing.buttonHeight, paddingHorizontal: Spacing.lg };
    }
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={variant === "primary" ? "#FFF" : theme.primary} />;
    }
    return (
      <ThemedText style={[Typography.button, { color: variant === "primary" ? "#FFF" : theme.primary }]}>
        {children}
      </ThemedText>
    );
  };

  if (variant === "primary") {
    return (
      <AnimatedPressable
        onPress={disabled || loading ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[styles.button, getSizeStyle(), { opacity: disabled ? 0.5 : 1 }, Shadows.glow, style, animatedStyle]}
      >
        <LinearGradient
          colors={colorScheme === "dark" ? Gradients.dark.primary : Gradients.light.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        getSizeStyle(),
        variant === "outline" && { borderWidth: 1.5, borderColor: theme.primary },
        variant === "secondary" && { backgroundColor: theme.primaryLight + "20" },
        { opacity: disabled ? 0.5 : 1 },
        style,
        animatedStyle,
      ]}
    >
      {renderContent()}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
