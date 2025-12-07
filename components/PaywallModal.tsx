import React from 'react';
import { View, Modal, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import { useRevenueCat } from '@/contexts/RevenueCatContext';

interface PaywallModalProps {
    visible: boolean;
    onClose: () => void;
}

export function PaywallModal({ visible, onClose }: PaywallModalProps) {
    const { theme } = useTheme();
    const { currentOffering, purchasePackage, isLoading } = useRevenueCat();

    const handlePurchase = async () => {
        if (currentOffering) {
            await purchasePackage(currentOffering);
            onClose();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
                <View style={styles.header}>
                    <Pressable onPress={onClose} style={styles.closeButton}>
                        <Feather name="x" size={24} color={theme.text} />
                    </Pressable>
                </View>

                <View style={styles.content}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
                        <Feather name="star" size={48} color={theme.primary} />
                    </View>

                    <ThemedText style={[Typography.h1, { textAlign: 'center', marginTop: Spacing.xl }]}>
                        Unlock Pro Access
                    </ThemedText>

                    <ThemedText style={[Typography.body, { textAlign: 'center', marginTop: Spacing.md, color: theme.textSecondary }]}>
                        Get 7 days of unlimited AI resume improvements and PDF downloads.
                    </ThemedText>

                    <View style={styles.features}>
                        {[
                            "Unlimited AI Improvements",
                            "Harvard-Style PDF Downloads",
                            "ATS Optimization",
                            "No Watermarks"
                        ].map((feature, index) => (
                            <View key={index} style={styles.featureRow}>
                                <Feather name="check" size={20} color={theme.success} />
                                <ThemedText style={[Typography.body, { marginLeft: Spacing.md }]}>
                                    {feature}
                                </ThemedText>
                            </View>
                        ))}
                    </View>

                    <View style={styles.spacer} />

                    {isLoading ? (
                        <ActivityIndicator size="large" color={theme.primary} />
                    ) : (
                        <Pressable
                            style={({ pressed }) => [
                                styles.purchaseButton,
                                { backgroundColor: theme.primary },
                                pressed && { opacity: 0.9 }
                            ]}
                            onPress={handlePurchase}
                        >
                            <ThemedText style={[Typography.button, { color: theme.buttonText }]}>
                                {currentOffering
                                    ? `Get 7-Day Pass for ${currentOffering.product.priceString}`
                                    : "Get 7-Day Pass for $6.99 (Dev)"}
                            </ThemedText>
                        </Pressable>
                    )}

                    <Pressable onPress={onClose} style={{ marginTop: Spacing.md }}>
                        <ThemedText style={[Typography.caption, { color: theme.textSecondary, textAlign: 'center' }]}>
                            Restore Purchases
                        </ThemedText>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: Spacing.lg,
        alignItems: 'flex-end',
    },
    closeButton: {
        padding: Spacing.sm,
    },
    content: {
        flex: 1,
        padding: Spacing.xl,
        alignItems: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    features: {
        marginTop: Spacing['2xl'],
        width: '100%',
        gap: Spacing.md,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    spacer: {
        flex: 1,
    },
    purchaseButton: {
        width: '100%',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        ...Shadows.medium,
    },
});
