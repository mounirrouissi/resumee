import React from "react";
import { View, StyleSheet, Pressable, Share, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { useResumes } from "@/contexts/ResumeContext";
import { HistoryStackParamList } from "@/navigation/HistoryStackNavigator";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ResumeDetailRouteProp = RouteProp<HistoryStackParamList, "ResumeDetail">;
type NavigationProp = NativeStackNavigationProp<
  HistoryStackParamList,
  "ResumeDetail"
>;

export default function ResumeDetailScreen() {
  const { theme } = useTheme();
  const route = useRoute<ResumeDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { getResumeById } = useResumes();
  const insets = useSafeAreaInsets();

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

  const handleDownload = () => {
    Alert.alert(
      "Success",
      "Resume downloaded! In a production app, this would save the improved PDF to your device.",
      [{ text: "OK" }]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: resume.improvedText,
        title: resume.originalFilename,
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
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <ThemedText style={[Typography.bodySmall, { color: theme.textSecondary }]}>
                Filename
              </ThemedText>
              <ThemedText style={Typography.body}>{resume.originalFilename}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={[Typography.bodySmall, { color: theme.textSecondary }]}>
                Processed
              </ThemedText>
              <ThemedText style={Typography.body}>
                {resume.dateProcessed.toLocaleDateString()}
              </ThemedText>
            </View>
          </Card>

          <Card style={styles.contentCard}>
            <View style={{ alignItems: 'center', padding: Spacing.md }}>
              <Feather name="check-circle" size={48} color={theme.success} />
              <ThemedText style={[Typography.h3, { marginTop: Spacing.md, textAlign: 'center' }]}>
                Ready for Download
              </ThemedText>
              <ThemedText style={[Typography.bodySmall, { marginTop: Spacing.sm, textAlign: 'center', color: theme.textSecondary }]}>
                This resume has been processed and formatted.
              </ThemedText>
            </View>
          </Card>

          <View style={{ height: 80 }} />
        </View>
      </ScreenScrollView>

      <View
        style={[
          styles.downloadButtonContainer,
          { bottom: insets.bottom + Spacing.xl },
        ]}
      >
        <Pressable
          style={[styles.downloadButton, { backgroundColor: theme.primary }]}
          onPress={handleDownload}
        >
          <Feather name="download" size={20} color={theme.buttonText} />
          <ThemedText
            style={[
              Typography.button,
              { color: theme.buttonText, marginLeft: Spacing.sm },
            ]}
          >
            Download PDF
          </ThemedText>
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
  infoCard: {
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
