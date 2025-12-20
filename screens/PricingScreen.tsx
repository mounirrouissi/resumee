import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useCredits } from "@/contexts/CreditsContext";
import { paymentsApi, CREDIT_PACKS, CreditPack } from "@/services/paymentsApi";
import {
  Spacing,
  BorderRadius,
  Typography,
  Gradients,
  Shadows,
  Animations,
} from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface PricingPlan extends CreditPack { }

const PRICING_PLANS: PricingPlan[] = CREDIT_PACKS;

const FEATURES = [
  { icon: "zap", text: "AI-powered resume enhancement" },
  { icon: "file-text", text: "Harvard-style PDF formatting" },
  { icon: "download", text: "Unlimited downloads" },
  { icon: "shield", text: "ATS-optimized output" },
];

export default function PricingScreen() {
  const { theme, colorScheme } = useTheme();
  const { credits } = useCredits();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<string>("5");
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handlePurchase = async (planId: string) => {
    setIsProcessing(true);
    try {
      // Generate a unique session ID for this purchase
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await paymentsApi.openCheckout(sessionId, planId);
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert(
        "Purchase Credits",
        `Stripe checkout is configured in the backend. To enable payments:\n\n1. Set STRIPE_SECRET_KEY in .env\n2. Set STRIPE_WEBHOOK_SECRET\n3. Restart the backend`,
        [{ text: "OK" }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPricingCard = (plan: PricingPlan, index: number) => {
    const isSelected = selectedPlan === plan.id;
    const cardScale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(cardScale, {
        toValue: 0.97,
        useNativeDriver: true,
        ...Animations.spring,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(cardScale, {
        toValue: 1,
        useNativeDriver: true,
        ...Animations.spring,
      }).start();
    };

    return (
      <Animated.View
        key={plan.id}
        style={[
          { transform: [{ scale: cardScale }] },
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Pressable
          onPress={() => setSelectedPlan(plan.id)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.pricingCard,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: isSelected ? theme.primary : theme.border,
              borderWidth: isSelected ? 2 : 1,
            },
            isSelected && Shadows.glow,
            plan.popular && styles.popularCard,
          ]}
        >
          {plan.popular && (
            <LinearGradient
              colors={colorScheme === "dark" ? Gradients.dark.primary : Gradients.light.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.popularBadge}
            >
              <ThemedText style={[Typography.caption, { color: "#FFF" }]}>
                MOST POPULAR
              </ThemedText>
            </LinearGradient>
          )}

          <View style={styles.cardHeader}>
            <ThemedText style={[Typography.h3, { color: theme.textSecondary }]}>
              {plan.name}
            </ThemedText>
            {plan.savings && (
              <View style={[styles.savingsBadge, { backgroundColor: theme.successLight }]}>
                <ThemedText style={[Typography.caption, { color: theme.success }]}>
                  {plan.savings}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.priceContainer}>
            <ThemedText style={[Typography.hero, { color: theme.text }]}>
              ${plan.price.toFixed(2)}
            </ThemedText>
          </View>

          <View style={styles.creditsContainer}>
            <View style={[styles.creditsBadge, { backgroundColor: theme.primaryLight + "30" }]}>
              <Feather name="zap" size={16} color={theme.primary} />
              <ThemedText style={[Typography.body, { color: theme.primary, fontWeight: "600", marginLeft: 6 }]}>
                {plan.credits} {plan.credits === 1 ? "Credit" : "Credits"}
              </ThemedText>
            </View>
            <ThemedText style={[Typography.caption, { color: theme.textMuted, marginTop: 4 }]}>
              ${plan.pricePerCredit.toFixed(2)} per credit
            </ThemedText>
          </View>

          {isSelected && (
            <View style={[styles.selectedIndicator, { backgroundColor: theme.primary }]}>
              <Feather name="check" size={14} color="#FFF" />
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScreenScrollView>
        <View style={styles.content}>
          {/* Header */}
          {/* <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <View style={[styles.creditsDisplay, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="zap" size={20} color={theme.gold} />
              <ThemedText style={[Typography.h3, { marginLeft: 8 }]}>
                {credits} {credits === 1 ? "Credit" : "Credits"}
              </ThemedText>
            </View>
            <ThemedText style={[Typography.h1, styles.title]}>
              Get More Credits
            </ThemedText>
            <ThemedText style={[Typography.body, { color: theme.textSecondary, textAlign: "center" }]}>
              Each credit lets you transform one resume into a professional, ATS-optimized PDF
            </ThemedText>
          </Animated.View> */}

          {/* Pricing Cards */}
          <View style={styles.pricingContainer}>
            {PRICING_PLANS.map((plan, index) => renderPricingCard(plan, index))}
          </View>

          {/* Features */}
          <Animated.View style={[styles.featuresSection, { opacity: fadeAnim }]}>
            <ThemedText style={[Typography.h3, { marginBottom: Spacing.lg }]}>
              What's included
            </ThemedText>
            {FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: theme.primaryLight + "30" }]}>
                  <Feather name={feature.icon as any} size={16} color={theme.primary} />
                </View>
                <ThemedText style={[Typography.body, { flex: 1 }]}>
                  {feature.text}
                </ThemedText>
              </View>
            ))}
          </Animated.View>

          {/* Trust badges */}
          <View style={styles.trustSection}>
            <View style={styles.trustBadge}>
              <Feather name="lock" size={14} color={theme.textMuted} />
              <ThemedText style={[Typography.caption, { color: theme.textMuted, marginLeft: 4 }]}>
                Secure payment
              </ThemedText>
            </View>
            <View style={styles.trustBadge}>
              <Feather name="refresh-cw" size={14} color={theme.textMuted} />
              <ThemedText style={[Typography.caption, { color: theme.textMuted, marginLeft: 4 }]}>
                Money-back guarantee
              </ThemedText>
            </View>
          </View>
        </View>
      </ScreenScrollView>

      {/* Purchase Button */}
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
          onPress={() => handlePurchase(selectedPlan)}
          disabled={isProcessing}
        >
          <LinearGradient
            colors={colorScheme === "dark" ? Gradients.dark.primary : Gradients.light.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.purchaseGradient}
          >
            <ThemedText style={[Typography.button, { color: "#FFF" }]}>
              {isProcessing ? "Processing..." : `Purchase ${PRICING_PLANS.find(p => p.id === selectedPlan)?.credits} Credits`}
            </ThemedText>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  creditsDisplay: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  pricingContainer: {
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  pricingCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    position: "relative",
    overflow: "hidden",
  },
  popularCard: {
    marginVertical: Spacing.xs,
  },
  popularBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderBottomLeftRadius: BorderRadius.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  savingsBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  priceContainer: {
    marginBottom: Spacing.md,
  },
  creditsContainer: {
    alignItems: "flex-start",
  },
  creditsBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  selectedIndicator: {
    position: "absolute",
    top: Spacing.lg,
    left: Spacing.lg,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
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
  trustSection: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xl,
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
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
});
