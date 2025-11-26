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
    const { colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || isLoading}
            style={({ pressed }) => [
                styles.container,
                isDark ? styles.containerDark : styles.containerLight,
                pressed && styles.pressed,
                disabled && styles.disabled,
                Shadows.small,
            ]}
        >
            <View style={styles.content}>
                {isLoading ? (
                    <ActivityIndicator size="small" color={isDark ? "#FFFFFF" : "#757575"} />
                ) : (
                    <>
                        <Image
                            source={require("@/assets/images/google-icon.png")}
                            style={styles.icon}
                        />
                        <ThemedText
                            style={[
                                styles.text,
                                isDark ? styles.textDark : styles.textLight
                            ]}
                        >
                            Sign in with Google
                        </ThemedText>
                    </>
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 50, // Google standard height
        borderRadius: 25, // Pill shape
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        maxWidth: 300,
        alignSelf: "center",
    },
    containerLight: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#DADCE0",
    },
    containerDark: {
        backgroundColor: "#4285F4", // Google Blue for dark mode context
        borderWidth: 0,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: Spacing.md,
    },
    icon: {
        width: 20,
        height: 20,
        marginRight: Spacing.md,
    },
    text: {
        fontSize: 14,
        fontWeight: "500",
        fontFamily: Platform.select({ ios: "System", android: "Roboto-Medium", default: "System" }),
    },
    textLight: {
        color: "#3C4043",
    },
    textDark: {
        color: "#FFFFFF",
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    disabled: {
        opacity: 0.6,
    },
});
