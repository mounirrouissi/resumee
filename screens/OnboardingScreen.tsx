import React, { useState, useRef } from "react";
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    useWindowDimensions,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolate,
    Extrapolation,
    useAnimatedScrollHandler,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@/contexts/UserContext";

const slides = [
    {
        id: "1",
        title: "Welcome to CVMe",
        description: "Create professional, Harvard-standard resumes in seconds with the power of AI.",
        icon: "document-text-outline",
    },
    {
        id: "2",
        title: "AI-Powered Enhancements",
        description: "Our intelligent algorithms optimize your content to beat Applicant Tracking Systems (ATS).",
        icon: "sparkles-outline",
    },
    {
        id: "3",
        title: "Get Hired Faster",
        description: "Stand out from the crowd with premium templates designed by recruiters.",
        icon: "briefcase-outline",
    },
];

const OnboardingItem = ({ item, index, scrollX }: { item: any, index: number, scrollX: any }) => {
    const { width } = useWindowDimensions();

    const animatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            scrollX.value,
            [(index - 1) * width, index * width, (index + 1) * width],
            [0.8, 1, 0.8],
            Extrapolation.CLAMP
        );

        const opacity = interpolate(
            scrollX.value,
            [(index - 1) * width, index * width, (index + 1) * width],
            [0.5, 1, 0.5],
            Extrapolation.CLAMP
        );

        return {
            transform: [{ scale }],
            opacity,
        };
    });

    return (
        <View style={[styles.itemContainer, { width }]}>
            <Animated.View style={[styles.iconContainer, animatedStyle]}>
                <LinearGradient
                    colors={["#E3F2FD", "#fff"]}
                    style={styles.circle}
                >
                    <Ionicons name={item.icon as any} size={100} color="#007AFF" />
                </LinearGradient>
            </Animated.View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        </View>
    );
};

const Paginator = ({ data, scrollX }: { data: any[], scrollX: any }) => {
    const { width } = useWindowDimensions();

    return (
        <View style={styles.paginatorContainer}>
            {data.map((_, i) => {
                const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

                const animatedDotStyle = useAnimatedStyle(() => {
                    const dotWidth = interpolate(
                        scrollX.value,
                        inputRange,
                        [10, 20, 10],
                        Extrapolation.CLAMP
                    );

                    const opacity = interpolate(
                        scrollX.value,
                        inputRange,
                        [0.3, 1, 0.3],
                        Extrapolation.CLAMP
                    );

                    return {
                        width: dotWidth,
                        opacity,
                    };
                });

                return (
                    <Animated.View
                        key={i.toString()}
                        style={[styles.dot, animatedDotStyle]}
                    />
                );
            })}
        </View>
    );
};

export default function OnboardingScreen() {
    const { completeOnboarding } = useUser();
    const { width } = useWindowDimensions();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useSharedValue(0);
    const slidesRef = useRef<FlatList>(null);

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollX.value = event.contentOffset.x;
    });

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            slidesRef.current?.scrollToOffset({
                offset: (currentIndex + 1) * width,
                animated: true
            });
        } else {
            completeOnboarding();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <LinearGradient
                colors={["#FFFFFF", "#F0F8FF", "#FFF3E0"]} // White -> Light Blue -> Light Orange hint
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <View style={{ flex: 3 }}>
                <Animated.FlatList
                    data={slides}
                    renderItem={({ item, index }) => (
                        <OnboardingItem item={item} index={index} scrollX={scrollX} />
                    )}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    keyExtractor={(item) => item.id}
                    onScroll={scrollHandler}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    scrollEventThrottle={32}
                    ref={slidesRef}
                    getItemLayout={(data, index) => ({
                        length: width,
                        offset: width * index,
                        index,
                    })}
                />
            </View>

            <View style={styles.footer}>
                <Paginator data={slides} scrollX={scrollX} />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleNext}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={["#007AFF", "#0056b3"]} // Blue gradient
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.buttonText}>
                            {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
                        </Text>
                        {currentIndex === slides.length - 1 && (
                            <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {currentIndex < slides.length - 1 && (
                    <TouchableOpacity onPress={completeOnboarding} style={styles.skipButton}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    itemContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    iconContainer: {
        marginBottom: 40,
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    circle: {
        width: 250,
        height: 250,
        borderRadius: 125,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(0,122,255,0.1)",
    },
    textContainer: {
        paddingHorizontal: 40,
        alignItems: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        marginBottom: 16,
        color: "#1A237E", // Dark Blue
        textAlign: "center",
    },
    description: {
        fontSize: 16,
        color: "#546E7A", // Blue Grey
        textAlign: "center",
        lineHeight: 24,
    },
    footer: {
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 50,
        width: "100%",
    },
    paginatorContainer: {
        flexDirection: "row",
        height: 64,
    },
    dot: {
        height: 10,
        borderRadius: 5,
        backgroundColor: "#FF9800", // Orange accent
        marginHorizontal: 8,
    },
    button: {
        width: "80%",
        height: 56,
        borderRadius: 28,
        shadowColor: "#FF9800", // Orange shadow for contrast
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    buttonGradient: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 28,
        flexDirection: "row",
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    skipButton: {
        marginTop: 20,
        padding: 10,
    },
    skipText: {
        color: "#78909C",
        fontSize: 16,
        fontWeight: "600",
    },
});
