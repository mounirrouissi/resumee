import React from "react";
import { View, StyleSheet, Modal, Pressable, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as StoreReview from "expo-store-review";
import { BlurView } from "expo-blur";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography, Shadows, Animations } from "@/constants/theme";

interface RatingModalProps {
    visible: boolean;
    onClose: () => void;
}

export function RatingModal({ visible, onClose }: RatingModalProps) {
    const { theme, isDark } = useTheme();
    const [rating, setRating] = React.useState(0);

    const handleRateNow = async () => {
        try {
            if (await StoreReview.hasAction()) {
                await StoreReview.requestReview();
            }
            onClose();
        } catch (error) {
            console.error("Failed to request review:", error);
            onClose();
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
                <View style={[styles.content, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
                        <Feather name="star" size={32} color={theme.gold} />
                    </View>

                    <ThemedText style={[Typography.h2, { textAlign: 'center', marginBottom: Spacing.sm }]}>
                        Enjoying Resumax?
                    </ThemedText>

                    <ThemedText style={[Typography.body, { textAlign: 'center', color: theme.textSecondary, marginBottom: Spacing.xl }]}>
                        Your feedback helps us improve! It only takes a second to rate us on the store.
                    </ThemedText>

                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Pressable key={s} onPress={() => setRating(s)}>
                                <Feather
                                    name={rating >= s ? "star" : "star"}
                                    size={32}
                                    color={rating >= s ? theme.gold : theme.textMuted}
                                    style={{ marginHorizontal: 6 }}
                                />
                                {rating >= s && (
                                    <Animated.View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                                        <Feather name="star" size={32} color={theme.gold} />
                                    </Animated.View>
                                )}
                            </Pressable>
                        ))}
                    </View>

                    <Pressable
                        style={({ pressed }) => [styles.rateButton, { backgroundColor: theme.primary }, (pressed || rating === 0) && { opacity: 0.8 }]}
                        onPress={handleRateNow}
                        disabled={rating === 0}
                    >
                        <ThemedText style={[Typography.button, { color: '#FFF' }]}>
                            {rating > 0 ? `Rate ${rating} Stars` : 'Select Rating'}
                        </ThemedText>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [styles.laterButton, pressed && { opacity: 0.7 }]}
                        onPress={onClose}
                    >
                        <ThemedText style={[Typography.bodySmall, { color: theme.textSecondary }]}>Maybe Later</ThemedText>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: Spacing.xl,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    content: {
        width: "100%",
        maxWidth: 340,
        borderRadius: BorderRadius.xl,
        padding: Spacing["2xl"],
        alignItems: "center",
        borderWidth: 1,
        ...Shadows.large,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: Spacing.lg,
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: Spacing.xl,
    },
    rateButton: {
        width: "100%",
        height: 50,
        borderRadius: BorderRadius.md,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: Spacing.md,
    },
    laterButton: {
        padding: Spacing.sm,
    },
});
