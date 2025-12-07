import React, { useState } from "react";
import { View, StyleSheet, Pressable, Alert, Share, Platform, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from "expo-linear-gradient";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography, Gradients, Shadows } from "@/constants/theme";
import { useResumes } from "@/contexts/ResumeContext";
import { resumeApi } from "@/services/resumeApi";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PreviewRouteProp = RouteProp<HomeStackParamList, "Preview">;
type NavigationProp = NativeStackNavigationProp<HomeStackParamList, "Preview">;

export default function PreviewScreen() {
  const { theme, colorScheme } = useTheme();
  const route = useRoute<PreviewRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { getResumeById } = useResumes();
  const insets = useSafeAreaInsets();
  const [showComparison, setShowComparison] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const resume = getResumeById(route.params.resumeId);

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

      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          console.log(`Download progress: ${progress * 100}%`);
        }
      );

      const result = await downloadResumable.downloadAsync();

      if (!result || result.status !== 200) {
        throw new Error('Download failed');
      }

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, {
          mimeType: 'application/pdf',
          UTI: 'com.adobe.pdf'
        });
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
      await Share.share({
        message: resume.improvedText,
        title: "My Improved Resume",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share resume");
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleShare} style={styles.headerButton}>
          <Feather name="share-2" size={24} color={theme.primary} />
        </Pressable>
      ),
    });
  }, [navigation, theme, handleShare]);

  return (
    <>
      <ScreenScrollView>
        <View style={styles.container}>
          <View style={styles.successContainer}>
            <Feather name="check-circle" size={64} color={theme.success} />
            <ThemedText style={[Typography.h2, { marginTop: Spacing.md, textAlign: 'center' }]}>
              Resume Improved!
            </ThemedText>
            <ThemedText style={[Typography.body, { marginTop: Spacing.sm, textAlign: 'center', color: theme.textSecondary }]}>
              Your Harvard-style PDF resume is ready for download.
            </ThemedText>
          </View>
        </View>
      </ScreenScrollView>

      <View
        style={[
          styles.downloadButtonContainer,
          { bottom: insets.bottom + Spacing.xl },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.downloadButton,
            Shadows.large,
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
          onPress={handleDownload}
          disabled={isDownloading}
        >
          <LinearGradient
            colors={colorScheme === 'dark' ? Gradients.dark.primary : Gradients.light.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            {isDownloading ? (
              <>
                <ActivityIndicator size="small" color={theme.buttonText} />
                <ThemedText style={[Typography.button, { color: theme.buttonText, marginLeft: Spacing.sm }]}>
                  Downloading...
                </ThemedText>
              </>
            ) : downloadSuccess ? (
              <>
                <Feather name="check-circle" size={20} color={theme.buttonText} />
                <ThemedText style={[Typography.button, { color: theme.buttonText, marginLeft: Spacing.sm }]}>
                  Downloaded!
                </ThemedText>
              </>
            ) : (
              <>
                <Feather name="download" size={20} color={theme.buttonText} />
                <ThemedText style={[Typography.button, { color: theme.buttonText, marginLeft: Spacing.sm }]}>
                  Download PDF
                </ThemedText>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  toggleContainer: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  contentCard: {
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    marginBottom: Spacing.md,
  },
  resumeText: {
    lineHeight: 20,
  },
  downloadButtonContainer: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
  },
  downloadButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  gradientButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
  },
});
