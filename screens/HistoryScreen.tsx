import React from "react";
import { View, StyleSheet, Pressable, Image, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { useResumes } from "@/contexts/ResumeContext";
import { HistoryStackParamList } from "@/navigation/HistoryStackNavigator";

type NavigationProp = NativeStackNavigationProp<HistoryStackParamList, "History">;

export default function HistoryScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { resumes, deleteResume } = useResumes();

  const handleClearAll = () => {
    if (resumes.length === 0) return;

    Alert.alert(
      "Clear History",
      "Are you sure you want to delete all resume history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            resumes.forEach((resume) => deleteResume(resume.id));
          },
        },
      ]
    );
  };

  const handleDelete = (id: string, filename: string) => {
    Alert.alert("Delete Resume", `Delete "${filename}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteResume(id),
      },
    ]);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        resumes.length > 0 ? (
          <Pressable onPress={handleClearAll} style={styles.headerButton}>
            <ThemedText style={[Typography.bodySmall, { color: theme.error }]}>
              Clear All
            </ThemedText>
          </Pressable>
        ) : null,
    });
  }, [navigation, theme, resumes.length, handleClearAll]);

  if (resumes.length === 0) {
    return (
      <ScreenScrollView>
        <View style={styles.emptyContainer}>
          <Image
            source={require("@/assets/images/empty-state.png")}
            style={styles.emptyImage}
          />
          <ThemedText style={[Typography.h2, styles.emptyTitle]}>No Resumes Yet</ThemedText>
          <ThemedText style={[Typography.body, { color: theme.textSecondary, textAlign: "center" }]}>
            Process your first resume to see it appear here
          </ThemedText>
        </View>
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        {resumes.map((resume) => (
          <Pressable
            key={resume.id}
            onPress={() =>
              navigation.navigate("ResumeDetail", { resumeId: resume.id })
            }
          >
            <Card style={styles.resumeCard}>
              <View style={styles.resumeHeader}>
                <View style={styles.resumeInfo}>
                  <Feather name="file-text" size={24} color={theme.primary} />
                  <View style={styles.resumeDetails}>
                    <ThemedText style={Typography.body} numberOfLines={1}>
                      {resume.originalFilename}
                    </ThemedText>
                    <ThemedText
                      style={[Typography.caption, { color: theme.textSecondary }]}
                    >
                      {formatDate(resume.dateProcessed)}
                    </ThemedText>
                  </View>
                </View>
                <Pressable
                  onPress={() =>
                    handleDelete(resume.id, resume.originalFilename)
                  }
                  style={styles.deleteButton}
                >
                  <Feather name="trash-2" size={20} color={theme.error} />
                </Pressable>
              </View>
              {resume.status === "completed" ? (
                <ThemedText
                  style={[
                    Typography.bodySmall,
                    { color: theme.textSecondary, marginTop: Spacing.sm },
                  ]}
                  numberOfLines={2}
                >
                  {resume.improvedText.substring(0, 100)}...
                </ThemedText>
              ) : null}
            </Card>
          </Pressable>
        ))}
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing["3xl"],
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
  },
  resumeCard: {
    marginBottom: Spacing.md,
  },
  resumeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resumeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  resumeDetails: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
});
