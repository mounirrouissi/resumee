import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Pressable, Alert, Share, Platform, ActivityIndicator, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography, Gradients, Shadows, Animations } from "@/constants/theme";
import { useResumes } from "@/contexts/ResumeContext";
import { resumeApi } from "@/services/resumeApi";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";

type PreviewRouteProp = RouteProp<HomeStackParamList, "Preview">;
type NavigationProp = NativeStackNavigationProp<HomeStackParamList, "Preview">;

export default function PreviewScreen() {
  const { theme, colorScheme } = useTheme();
  const route = useRoute<PreviewRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { getResumeById } = useResumes();
  const insets = useSafeAreaInsets();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  const resume = getResumeById(route.params.resumeId);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: Animations.slow, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, ...Animations.spring, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(checkAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(checkAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (!resume) {
    return (
      <ScreenScrollView>
        <View style={styles.container}>
          <ThemedText>Resume not found</ThemedText>
        </View>
      </ScreenScrollView>
    );
  }

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setDownloadSuccess(false);
      const downloadUrl = resumeApi.getDownloadUrl(resume.id);

      if (Platform.OS === 'web') {
        window.open(downloadUrl, '_blank');
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2000);
        return;
      }

      const fileUri = FileSystem.documentDirectory + `improved_resume_${resume.id}.pdf`;
      const downloadResumable = FileSystem.createDownloadResumable(downloadUrl, fileUri, {}, (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        console.log(`Download progress: ${progress * 100}%`);
      });

      const result = await downloadResumable.downloadAsync();
      if (!result || result.status !== 200) throw new Error('Download failed');

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
      } else {
        Alert.alert('Success', 'PDF saved to documents directory');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download PDF');
      console.error(error);
      setDownloadSuccess(false);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: resume.improvedText, title: "My Improved Resume" });
    } catch (error) {
      Alert.alert("Error", "Failed to share resume");
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleShare} style={styles.headerButton}>
          <Feather name="share-2" size={22} color={theme.primary} />
        </Pressable>
      ),
    });
  }, [navigation, theme, handleShare]);

  return (
    <>
      <ScreenScrollView>
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          {/* Success Animation */}
          <View style={styles.successContainer}>
            <Animated.View style={[styles.successIcon, { backgroundColor: theme.success + '15', transform: [{ scale: checkAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }] }]}>
              <View style={[styles.successIconInner, { backgroundColor: theme.success }]}>
                <Feather name="check" size={40} color="#FFF" />
              </View>
            </Animated.View>
            <ThemedText style={[Typography.h1, { marginTop: Spacing.xl, textAlign: 'center' }]}>Resume Improved!</ThemedText>
            <ThemedText style={[Typography.body, { marginTop: Spacing.sm, textAlign: 'center', color: theme.textSecondary, paddingHorizontal: Spacing.xl }]}>
              Your Harvard-style PDF resume is ready for download
            </ThemedText>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            {[
              { icon: "file-text", label: "Format", value: "Harvard Style" },
              { icon: "shield", label: "ATS", value: "Optimized" },
              { icon: "zap", label: "AI", value: "Enhanced" },
            ].map((stat, index) => (
              <View key={index} style={[styles.statCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                <View style={[styles.statIcon, { backgroundColor: theme.primary + '15' }]}>
                  <Feather name={stat.icon as any} size={18} color={theme.primary} />
                </View>
                <ThemedText style={[Typography.caption, { color: theme.textSecondary }]}>{stat.label}</ThemedText>
                <ThemedText style={[Typography.h4]}>{stat.value}</ThemedText>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <Pressable style={[styles.actionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]} onPress={handleShare}>
              <View style={[styles.actionIcon, { backgroundColor: theme.accent + '15' }]}>
                <Feather name="share-2" size={20} color={theme.accent} />
              </View>
              <ThemedText style={Typography.body}>Share Resume</ThemedText>
              <Feather name="chevron-right" size={20} color={theme.textSecondary} />
            </Pressable>
          </View>
        </Animated.View>
      </ScreenScrollView>

      {/* Download Button */}
      <View style={[styles.downloadContainer, { backgroundColor: theme.backgroundDefault, paddingBottom: insets.bottom + Spacing.lg, borderTopColor: theme.border }]}>
        <Pressable style={({ pressed }) => [styles.downloadButton, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]} onPress={handleDownload} disabled={isDownloading}>
          <LinearGradient colors={downloadSuccess ? [theme.success, theme.success] : (colorScheme === 'dark' ? Gradients.dark.primary : Gradients.light.primary)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.downloadGradient}>
            {isDownloading ? (
              <>
                <ActivityIndicator size="small" color="#FFF" />
                <ThemedText style={[Typography.button, { color: "#FFF", marginLeft: Spacing.sm }]}>Downloading...</ThemedText>
              </>
            ) : downloadSuccess ? (
              <>
                <Feather name="check-circle" size={20} color="#FFF" />
                <ThemedText style={[Typography.button, { color: "#FFF", marginLeft: Spacing.sm }]}>Downloaded!</ThemedText>
              </>
            ) : (
              <>
                <Feather name="download" size={20} color="#FFF" />
                <ThemedText style={[Typography.button, { color: "#FFF", marginLeft: Spacing.sm }]}>Download PDF</ThemedText>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.lg, paddingBottom: 120 },
  headerButton: { padding: Spacing.sm },
  successContainer: { alignItems: 'center', paddingVertical: Spacing["3xl"] },
  successIcon: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  successIconInner: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  statsContainer: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  statCard: { flex: 1, padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, alignItems: 'center' },
  statIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  actionsContainer: { gap: Spacing.md },
  actionCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1 },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  downloadContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, borderTopWidth: 1 },
  downloadButton: { height: Spacing.buttonHeight, borderRadius: BorderRadius.md, overflow: 'hidden', ...Shadows.glow },
  downloadGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
