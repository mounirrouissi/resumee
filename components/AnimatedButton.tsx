import React from 'react';
import { Pressable, StyleSheet, ActivityIndicator, Animated, ViewStyle, TextStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Typography, Shadows, Animations, Gradients } from '@/constants/theme';

interface AnimatedButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    success?: boolean;
    variant?: 'primary' | 'secondary' | 'outline';
    icon?: keyof typeof Feather.glyphMap;
    style?: ViewStyle;
    textStyle?: TextStyle;
    gradient?: boolean;
}

export default function AnimatedButton({
    title,
    onPress,
    disabled = false,
    loading = false,
    success = false,
    variant = 'primary',
    icon,
    style,
    textStyle,
    gradient = false,
}: AnimatedButtonProps) {
    const { theme, colorScheme } = useTheme();
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
            speed: 50,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 3,
            tension: 40,
        }).start();
    };

    const getBackgroundColor = () => {
        if (disabled) return theme.border;
        if (variant === 'primary') return theme.primary;
        if (variant === 'secondary') return theme.backgroundSecondary;
        return 'transparent';
    };

    const getTextColor = () => {
        if (disabled) return theme.textSecondary;
        if (variant === 'primary') return theme.buttonText;
        return theme.text;
    };

    const getBorderColor = () => {
        if (variant === 'outline') return theme.border;
        return 'transparent';
    };

    const gradientColors = gradient
        ? (colorScheme === 'dark' ? Gradients.dark.primary : Gradients.light.primary)
        : [getBackgroundColor(), getBackgroundColor()];

    const renderContent = () => (
        <>
            {loading && (
                <ActivityIndicator
                    size="small"
                    color={getTextColor()}
                    style={styles.loader}
                />
            )}
            {success && !loading && (
                <Feather
                    name="check-circle"
                    size={20}
                    color={getTextColor()}
                    style={styles.icon}
                />
            )}
            {icon && !loading && !success && (
                <Feather
                    name={icon}
                    size={20}
                    color={getTextColor()}
                    style={styles.icon}
                />
            )}
            <ThemedText
                style={[
                    Typography.button,
                    { color: getTextColor() },
                    textStyle
                ]}
            >
                {title}
            </ThemedText>
        </>
    );

    return (
        <Animated.View
            style={[
                { transform: [{ scale: scaleAnim }] },
                style
            ]}
        >
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                style={({ pressed }) => [
                    styles.button,
                    {
                        borderColor: getBorderColor(),
                        borderWidth: variant === 'outline' ? 1 : 0,
                        opacity: pressed ? 0.8 : 1,
                    },
                    !gradient && { backgroundColor: getBackgroundColor() },
                    variant === 'primary' && !disabled && Shadows.medium,
                ]}
            >
                {gradient && !disabled ? (
                    <LinearGradient
                        colors={gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradient}
                    >
                        {renderContent()}
                    </LinearGradient>
                ) : (
                    <>{renderContent()}</>
                )}
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        height: Spacing.buttonHeight,
        borderRadius: BorderRadius.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
    },
    icon: {
        marginRight: Spacing.sm,
    },
    loader: {
        marginRight: Spacing.sm,
    },
});
