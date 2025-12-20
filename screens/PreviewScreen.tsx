import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Pressable, Alert, Share, Platform, Animated, Easing } from "react-native";
import { Feather } from "@expo/vector-icons";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as StoreReview from 'expo-store-review';
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { ScrollView, Modal } from "react-native";
import { RatingModal } from "@/components/RatingModal";

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
  const { theme, colorScheme, isDark } = useTheme();
  const route = useRoute<PreviewRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { getResumeById } = useResumes();
  const insets = useSafeAreaInsets();

  // Download states
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showRatingPrompt, setShowRatingPrompt] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const successScaleAnim = useRef(new Animated.Value(0)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;

  const resume = getResumeById(route.params.resumeId);

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: Animations.slow, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, ...Animations.spring, useNativeDriver: true }),
    ]).start();

    // Success icon pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(checkAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(checkAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    // Download button pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.02, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: downloadProgress,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [downloadProgress]);

  // Success animation
  useEffect(() => {
    if (downloadSuccess) {
      Animated.sequence([
        Animated.spring(successScaleAnim, { toValue: 1.2, useNativeDriver: true, ...Animations.spring }),
        Animated.spring(successScaleAnim, { toValue: 1, useNativeDriver: true, ...Animations.spring }),
      ]).start();
    } else {
      successScaleAnim.setValue(0);
    }
  }, [downloadSuccess]);

  // Loading icon rotation
  useEffect(() => {
    if (isDownloading) {
      Animated.loop(
        Animated.timing(iconRotateAnim, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })
      ).start();
    } else {
      iconRotateAnim.setValue(0);
    }
  }, [isDownloading]);

  if (!resume) {
    return (
      <ScreenScrollView>
        <View style={styles.container}>
          <ThemedText>Resume not found</ThemedText>
        </View>
      </ScreenScrollView>
    );
  }

  const handleButtonPressIn = () => {
    Animated.spring(buttonScaleAnim, { toValue: 0.96, useNativeDriver: true, ...Animations.spring }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScaleAnim, { toValue: 1, useNativeDriver: true, ...Animations.spring }).start();
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setDownloadSuccess(false);
      setDownloadProgress(0);

      // Check if PDF already exists, if not it will be generated on-demand
      const downloadUrl = resumeApi.getDownloadUrl(resume.id);

      if (Platform.OS === 'web') {
        // Simulate progress for web
        for (let i = 0; i <= 100; i += 20) {
          setDownloadProgress(i);
          await new Promise(r => setTimeout(r, 100));
        }

        // Try to download, if 404 the backend will handle it
        const response = await fetch(downloadUrl);
        if (response.ok) {
          window.open(downloadUrl, '_blank');
        } else {
          throw new Error('Failed to download PDF');
        }

        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
        return;
      }



      const fileUri = FileSystem.documentDirectory + 'CV.pdf';
      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl,
        fileUri,
        {},
        (progress) => {
          const percent = Math.round((progress.totalBytesWritten / progress.totalBytesExpectedToWrite) * 100);
          setDownloadProgress(percent);
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (!result || result.status !== 200) throw new Error('Download failed');

      setDownloadSuccess(true);

      // Haptic feedback would go here if using expo-haptics

      // Ask for review if available
      if (Platform.OS !== 'web') {
        setTimeout(async () => {
          setShowRatingPrompt(true);
        }, 2000);
      }

      setTimeout(async () => {
        if (Platform.OS === 'android') {
          // Android Direct Save
          try {
            const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (permissions.granted) {
              const base64 = await FileSystem.readAsStringAsync(result.uri, { encoding: FileSystem.EncodingType.Base64 });
              const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, 'Resume.pdf', 'application/pdf');
              await FileSystem.writeAsStringAsync(newFileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
              Alert.alert('Success', 'PDF Saved to selected folder');

              // Also offer to open
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(result.uri, {
                  mimeType: 'application/pdf',
                  UTI: 'com.adobe.pdf',
                  dialogTitle: 'Open with...'
                });
              }
            } else {
              // Fallback to "Open With" if permission denied
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(result.uri, {
                  mimeType: 'application/pdf',
                  UTI: 'com.adobe.pdf',
                  dialogTitle: 'Open with...'
                });
              }
            }
          } catch (e) {
            // Fallback to "Open With" if SAF fails
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(result.uri, {
                mimeType: 'application/pdf',
                UTI: 'com.adobe.pdf',
                dialogTitle: 'Open with...'
              });
            }
          }
        } else if (await Sharing.isAvailableAsync()) {
          // iOS
          await Sharing.shareAsync(result.uri, {
            mimeType: 'application/pdf',
            UTI: 'com.adobe.pdf',
            dialogTitle: 'Open with...'
          });
        }
        setDownloadSuccess(false);
      }, 1000);

    } catch (error: any) {
      Alert.alert('Download Error', error.message || 'Failed to download PDF. Please try again.');
      console.error(error);
      setDownloadSuccess(false);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleShare = async () => {
    try {
      const downloadUrl = resumeApi.getDownloadUrl(resume.id);

      if (Platform.OS === 'web') {
        // On web, share the download link
        if (navigator.share) {
          await navigator.share({
            title: 'My Improved Resume',
            text: 'Check out my professionally formatted resume',
            url: downloadUrl,
          });
        } else {
          // Fallback: copy link to clipboard
          await navigator.clipboard.writeText(downloadUrl);
          Alert.alert('Link Copied', 'Download link copied to clipboard');
        }
        return;
      }

      // On mobile, download the PDF first, then share it
      const fileUri = FileSystem.documentDirectory + 'CV.pdf';

      // Always download fresh copy for sharing
      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl,
        fileUri
      );
      const result = await downloadResumable.downloadAsync();

      if (!result || result.status !== 200) {
        throw new Error('Failed to download PDF for sharing');
      }

      // Share the PDF file with professional name
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Your CV',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Sharing Not Available', 'Sharing is not available on this device');
      }
    } catch (error: any) {
      console.error('Share error:', error);
      Alert.alert('Share Failed', error.message || 'Failed to share resume');
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
  }, [navigation, theme]);

  const iconRotation = iconRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const renderDownloadButtonContent = () => {
    if (downloadSuccess) {
      return (
        <Animated.View style={[styles.buttonContent, { transform: [{ scale: successScaleAnim }] }]}>
          <View style={styles.successCheckContainer}>
            <Feather name="check" size={24} color="#FFF" />
          </View>
          <ThemedText style={[Typography.button, styles.buttonText]}>Downloaded!</ThemedText>
        </Animated.View>
      );
    }

    if (isDownloading) {
      return (
        <View style={styles.buttonContent}>
          <Animated.View style={{ transform: [{ rotate: iconRotation }] }}>
            <Feather name="loader" size={22} color="#FFF" />
          </Animated.View>
          <View style={styles.downloadingTextContainer}>
            <ThemedText style={[Typography.button, styles.buttonText]}>Downloading</ThemedText>
            <ThemedText style={[Typography.caption, styles.progressText]}>{downloadProgress}%</ThemedText>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.buttonContent}>
        <View style={styles.downloadIconContainer}>
          <Feather name="download" size={22} color="#FFF" />
        </View>
        <ThemedText style={[Typography.button, styles.buttonText]}>Download PDF</ThemedText>
        <View style={styles.fileTypeBadge}>
          <ThemedText style={styles.fileTypeText}>PDF</ThemedText>
        </View>
      </View>
    );
  };

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
            <Pressable
              style={[styles.actionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
              onPress={() => setShowPreview(true)}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.primary + '15' }]}>
                <Feather name="eye" size={20} color={theme.primary} />
              </View>
              <ThemedText style={Typography.body}>Preview Content</ThemedText>
              <Feather name="chevron-right" size={20} color={theme.textSecondary} />
            </Pressable>

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

      {/* Enhanced Download Button */}
      <View style={[styles.downloadContainer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        {Platform.OS === 'ios' && (
          <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        )}
        <View style={[styles.downloadContainerInner, Platform.OS !== 'ios' && { backgroundColor: theme.backgroundDefault, borderTopWidth: 1, borderTopColor: theme.border }]}>

          {/* Progress bar background */}
          {isDownloading && (
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: theme.primary + '30',
                    width: progressWidth,
                  }
                ]}
              />
            </View>
          )}

          <Animated.View style={{ transform: [{ scale: isDownloading ? 1 : Animated.multiply(buttonScaleAnim, pulseAnim) }] }}>
            <Pressable
              onPress={handleDownload}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              disabled={isDownloading}
              style={styles.downloadButton}
            >
              <LinearGradient
                colors={
                  downloadSuccess
                    ? [theme.success, theme.success]
                    : isDownloading
                      ? [theme.primary + 'CC', theme.primary + 'CC']
                      : colorScheme === 'dark'
                        ? Gradients.dark.primary
                        : Gradients.light.primary
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.downloadGradient}
              >
                {renderDownloadButtonContent()}
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Helper text */}
          <View style={styles.helperTextContainer}>
            <Feather name="lock" size={12} color={theme.textMuted} />
            <ThemedText style={[Typography.small, { color: theme.textMuted, marginLeft: 4 }]}>
              Secure download • No watermarks
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Rating Prompt */}
      <RatingModal visible={showRatingPrompt} onClose={() => setShowRatingPrompt(false)} />

      {/* Preview Modal */}
      <Modal visible={showPreview} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.previewModalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={[styles.previewModalHeader, { borderBottomColor: theme.border }]}>
            <ThemedText style={Typography.h3}>Resume Preview</ThemedText>
            <Pressable onPress={() => setShowPreview(false)} style={styles.closeButton}>
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.previewContent}>
            {(() => {
              try {
                const data = typeof resume.improvedText === 'string' ? JSON.parse(resume.improvedText) : resume.improvedText;
                return (
                  <View style={styles.previewPaper}>
                    {/* Header */}
                    <View style={styles.previewHeaderSection}>
                      <ThemedText style={[Typography.h1, { textAlign: 'center' }]}>{data.header.name}</ThemedText>
                      <ThemedText style={[Typography.bodySmall, { textAlign: 'center', color: theme.textSecondary }]}>
                        {[data.header.location, data.header.phone, data.header.email, data.header.linkedin].filter(Boolean).join(' | ')}
                      </ThemedText>
                    </View>

                    {/* Summary/Experience */}
                    <View style={styles.previewSection}>
                      <ThemedText style={styles.previewSectionTitle}>WORK EXPERIENCE</ThemedText>
                      <View style={[styles.previewDivider, { backgroundColor: theme.border }]} />
                      {data.experience.map((exp: any, idx: number) => (
                        <View key={idx} style={styles.previewItem}>
                          <View style={styles.previewItemHeader}>
                            <ThemedText style={Typography.h4}>{exp.role}</ThemedText>
                            <ThemedText style={[Typography.bodySmall, { color: theme.textSecondary }]}>{exp.date}</ThemedText>
                          </View>
                          <ThemedText style={[Typography.bodySmall, { fontWeight: '600' }]}>{exp.company}</ThemedText>
                          {exp.bullets.map((bullet: string, bidx: number) => (
                            <ThemedText key={bidx} style={styles.previewBullet}>• {bullet}</ThemedText>
                          ))}
                        </View>
                      ))}
                    </View>

                    {/* Education */}
                    <View style={styles.previewSection}>
                      <ThemedText style={styles.previewSectionTitle}>EDUCATION</ThemedText>
                      <View style={[styles.previewDivider, { backgroundColor: theme.border }]} />
                      {data.education.map((edu: any, idx: number) => (
                        <View key={idx} style={styles.previewItem}>
                          <View style={styles.previewItemHeader}>
                            <ThemedText style={Typography.h4}>{edu.degree}</ThemedText>
                            <ThemedText style={[Typography.bodySmall, { color: theme.textSecondary }]}>{edu.date}</ThemedText>
                          </View>
                          <ThemedText style={Typography.bodySmall}>{edu.school}</ThemedText>
                        </View>
                      ))}
                    </View>

                    {/* Skills */}
                    <View style={styles.previewSection}>
                      <ThemedText style={styles.previewSectionTitle}>SKILLS</ThemedText>
                      <View style={[styles.previewDivider, { backgroundColor: theme.border }]} />
                      <ThemedText style={Typography.bodySmall}>{data.skills}</ThemedText>
                    </View>
                  </View>
                );
              } catch (e) {
                return (
                  <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
                    <ThemedText style={{ color: theme.textSecondary }}>Error parsing resume content. You can still download the PDF.</ThemedText>
                  </View>
                );
              }
            })()}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.lg, paddingBottom: 160 },
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

  // Enhanced download button styles
  downloadContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  downloadContainerInner: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  downloadButton: {
    height: 60,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.glow,
  },
  downloadGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    marginLeft: Spacing.md,
  },
  downloadIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCheckContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadingTextContainer: {
    marginLeft: Spacing.md,
    alignItems: 'flex-start',
  },
  progressText: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  fileTypeBadge: {
    marginLeft: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.xs,
  },
  fileTypeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  helperTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  // Preview Modal Styles
  previewModalContainer: { flex: 1 },
  previewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1
  },
  closeButton: { padding: Spacing.sm },
  previewContent: { padding: Spacing.lg },
  previewPaper: {
    padding: Spacing.xl,
    backgroundColor: '#FFF', // Always white like paper
    borderRadius: BorderRadius.sm,
    ...Shadows.medium,
  },
  previewHeaderSection: { marginBottom: Spacing.xl },
  previewSection: { marginBottom: Spacing.lg },
  previewSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1.2,
    marginBottom: 4
  },
  previewDivider: { height: 1, marginBottom: Spacing.md },
  previewItem: { marginBottom: Spacing.md },
  previewItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2
  },
  previewBullet: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
    marginTop: 2,
    paddingLeft: 4,
  },
});
