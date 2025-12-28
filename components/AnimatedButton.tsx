import React, { ReactNode } from "react";
import { StyleSheet, Pressable, ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
  useAnimatedProps,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import {
  BorderRadius,
  Spacing,
  Typography,
  Gradients,
  Shadows,
  Animations,
} from "@/constants/theme";

interface AnimatedButtonProps {
  onPress?: () => void;
  title: string;
  icon?: keyof typeof Feather.glyphMap;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "success";
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnimatedButton({
  onPress,
  title,
  icon,
  style,
  disabled = false,
  loading = false,
  variant = "primary",
}: AnimatedButtonProps) {
  const { theme, colorScheme } = useTheme();
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : 1,
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.96, Animations.spring);
      pressed.value = withSpring(1, Animations.spring);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Animations.spring);
    pressed.value = withSpring(0, Animations.spring);
  };

  const getGradientColors = () => {
    switch (variant) {
      case "success":
        return colorScheme === "dark"
          ? Gradients.dark.success
          : Gradients.light.success;
      case "secondary":
        return colorScheme === "dark"
          ? Gradients.dark.secondary
          : Gradients.light.secondary;
      default:
        return colorScheme === "dark"
          ? Gradients.dark.primary
          : Gradients.light.primary;
    }
  };

  const getShadow = () => {
    switch (variant) {
      case "success":
        return Shadows.glowSuccess;
      default:
        return Shadows.glow;
    }
  };

  return (
    <AnimatedPressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[styles.button, getShadow(), style, animatedStyle]}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {icon && (
          <Feather
            name={icon}
            size={20}
            color="#FFF"
            style={{ marginRight: Spacing.sm }}
          />
        )}
        <ThemedText style={[Typography.button, { color: "#FFF" }]}>
          {title}
        </ThemedText>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
});
