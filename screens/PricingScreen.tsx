import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useRevenueCat } from "@/contexts/RevenueCatContext";
import {
  Spacing,
  BorderRadius,
  Typography,
  Gradients,
  Shadows,
  Animations,
} from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const FEATURES = [
  { icon: "zap", text: "AI-powered resume enhancement" },
  { icon: "file-text", text: "Harvard-style PDF formatting" },
  { icon: "download", text: "Unlimited downloads" },
  { icon: "shield", text: "ATS-optimized output" },
];

export default function PricingScreen() {
  const { theme, colorScheme } = useTheme();
  const { currentOffering, purchasePackage, isPro, isLoading, restorePurchases } = useRevenueCat();
  const insets = useSafeAreaInsets();
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: Animations.slow,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: Animations.slow,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePurchase = async () => {
    if (!currentOffering) return;
    setIsPurchasing(true);
    try {
      await purchasePackage(currentOffering);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScreenScrollView>
        <View style={styles.content}>
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <ThemedText style={[Typography.h1, styles.title, { textAlign: 'center' }]}>
              {isPro ? "You are a Pro Member" : "Upgrade to Pro"}
            </ThemedText>
            <ThemedText style={[Typography.body, { color: theme.textSecondary, textAlign: "center" }]}>
              {isPro ? "Enjoy unlimited access to all features." : "Unlock the full potential of your career with Resumax Pro."}
            </ThemedText>
          </Animated.View>

          {/* Features */}
          <Animated.View
            style={[styles.featuresSection, { opacity: fadeAnim }]}
          >
            <ThemedText style={[Typography.h3, { marginBottom: Spacing.lg }]}>
              What's included in Pro
            </ThemedText>
            {FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: theme.primaryLight + "30" },
                  ]}
                >
                  <Feather
                    name={feature.icon as any}
                    size={16}
                    color={theme.primary}
                  />
                </View>
                <ThemedText style={[Typography.body, { flex: 1 }]}>
                  {feature.text}
                </ThemedText>
              </View>
            ))}
          </Animated.View>

          {/* Pricing Card */}
          {!isPro && currentOffering && (
            <Animated.View
              style={[
                styles.pricingCard,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: theme.primary,
                  transform: [{ translateY: slideAnim }]
                },
                Shadows.glow
              ]}
            >
              <View style={styles.cardHeader}>
                <ThemedText style={Typography.h2}>{currentOffering.product.title}</ThemedText>
                <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                  <ThemedText style={[Typography.caption, { color: '#FFF' }]}>BEST VALUE</ThemedText>
                </View>
              </View>
              <ThemedText style={[Typography.hero, { color: theme.primary, marginVertical: Spacing.md }]}>
                {currentOffering.product.priceString}
              </ThemedText>
              <ThemedText style={[Typography.body, { color: theme.textSecondary }]}>
                {currentOffering.product.description}
              </ThemedText>
            </Animated.View>
          )}

          {!isPro && !currentOffering && (
            <View style={styles.errorContainer}>
              <ThemedText style={{ color: theme.textSecondary }}>No packages available. Please try again later.</ThemedText>
            </View>
          )}

        </View>
      </ScreenScrollView>

      {/* Footer Actions */}
      {!isPro && currentOffering && (
        <View
          style={[
            styles.purchaseContainer,
            {
              backgroundColor: theme.backgroundDefault,
              paddingBottom: insets.bottom + Spacing.lg,
              borderTopColor: theme.border,
            },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.purchaseButton,
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
            onPress={handlePurchase}
            disabled={isPurchasing}
          >
            <LinearGradient
              colors={
                colorScheme === "dark"
                  ? Gradients.dark.primary
                  : Gradients.light.primary
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.purchaseGradient}
            >
              <ThemedText style={[Typography.button, { color: "#FFF" }]}>
                {isPurchasing
                  ? "Processing..."
                  : `Subscribe for ${currentOffering.product.priceString}`}
              </ThemedText>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={restorePurchases} style={{ marginTop: Spacing.md, alignItems: 'center' }}>
            <ThemedText style={[Typography.caption, { color: theme.textSecondary }]}>Restore Purchases</ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },
  header: {
    alignItems: "center",
    marginVertical: Spacing["2xl"],
  },
  title: {
    marginBottom: Spacing.sm
  },
  pricingCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 2,
    marginBottom: Spacing.xl
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full
  },
  featuresSection: {
    marginBottom: Spacing["2xl"],
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  purchaseContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  purchaseButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    ...Shadows.glow,
  },
  purchaseGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    padding: Spacing.xl,
    alignItems: 'center'
  }
});
