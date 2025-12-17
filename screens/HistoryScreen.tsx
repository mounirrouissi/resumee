import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Pressable, Image, Alert, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography, Gradients, Shadows, Animations } from "@/constants/theme";
import { useResumes } from "@/contexts/ResumeContext";
import { HistoryStackParamList } from "@/navigation/HistoryStackNavigator";

type NavigationProp = NativeStackNavigationProp<HistoryStackParamList, "History">;

export default function HistoryScreen() {
  const { theme, colorScheme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { resumes, deleteResume, clearAllResumes } = useResumes();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: Animations.slow, useNativeDriver: true }).start();
  }, []);

  const handleClearAll = () => {
    if (resumes.length === 0) return;
    Alert.alert("Clear History", "Are you sure you want to delete all resume history?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear All", style: "destructive", onPress: () => clearAllResumes() },
    ]);
  };

  const handleDelete = (id: string, filename: string) => {
    Alert.alert("Delete Resume", `Delete "${filename}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteResume(id) },
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
      headerRight: () => resumes.length > 0 ? (
        <Pressable onPress={handleClearAll} style={styles.headerButton}>
          <ThemedText style={[Typography.bodySmall, { color: theme.error }]}>Clear All</ThemedText>
        </Pressable>
      ) : null,
    });
  }, [navigation, theme, resumes.length, handleClearAll]);

  if (resumes.length === 0) {
    return (
      <ScreenScrollView>
        <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="inbox" size={48} color={theme.textMuted} />
          </View>
          <ThemedText style={[Typography.h2, { marginTop: Spacing.xl }]}>No Resumes Yet</ThemedText>
          <ThemedText style={[Typography.body, { color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm, paddingHorizontal: Spacing.xl }]}>
            Process your first resume to see it appear here
          </ThemedText>
          <Pressable style={[styles.emptyButton, { borderColor: theme.primary }]} onPress={() => navigation.getParent()?.navigate('HomeTab')}>
            <ThemedText style={[Typography.button, { color: theme.primary }]}>Upload Resume</ThemedText>
          </Pressable>
        </Animated.View>
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {resumes.map((resume, index) => (
          <Pressable key={resume.id} onPress={() => navigation.navigate("ResumeDetail", { resumeId: resume.id })} style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
            <Animated.View style={[styles.resumeCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
              <View style={styles.resumeHeader}>
                <View style={[styles.fileIcon, { backgroundColor: theme.primary + '15' }]}>
                  <Feather name="file-text" size={22} color={theme.primary} />
                </View>
                <View style={styles.resumeInfo}>
                  <ThemedText style={Typography.body} numberOfLines={1}>{resume.originalFilename}</ThemedText>
                  <View style={styles.resumeMeta}>
                    <ThemedText style={[Typography.caption, { color: theme.textSecondary }]}>{formatDate(resume.dateProcessed)}</ThemedText>
                    {resume.status === "completed" && (
                      <View style={[styles.statusBadge, { backgroundColor: theme.successLight }]}>
                        <Feather name="check" size={10} color={theme.success} />
                        <ThemedText style={[Typography.small, { color: theme.success, marginLeft: 2 }]}>Completed</ThemedText>
                      </View>
                    )}
                  </View>
                </View>
                <Pressable onPress={() => handleDelete(resume.id, resume.originalFilename)} style={styles.deleteButton} hitSlop={8}>
                  <Feather name="trash-2" size={18} color={theme.error} />
                </Pressable>
              </View>
            </Animated.View>
          </Pressable>
        ))}
      </Animated.View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  headerButton: { padding: Spacing.sm },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.xl, paddingTop: Spacing["4xl"] },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  emptyButton: { marginTop: Spacing.xl, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1.5 },
  resumeCard: { borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.md, overflow: "hidden" },
  resumeHeader: { flexDirection: "row", alignItems: "center", padding: Spacing.lg },
  fileIcon: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  resumeInfo: { flex: 1, marginLeft: Spacing.md },
  resumeMeta: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginTop: Spacing.xs },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  deleteButton: { padding: Spacing.sm },
});
