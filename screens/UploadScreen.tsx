import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Pressable, ActivityIndicator, Modal, Alert, Platform, Animated, Image, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useCredits } from "@/contexts/CreditsContext";
import { Spacing, BorderRadius, Typography, Gradients, Shadows, Animations } from "@/constants/theme";
import { useResumes } from "@/contexts/ResumeContext";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { resumeApi, CVTemplate } from "@/services/resumeApi";

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, "Upload">;

export default function UploadScreen() {
  const { theme, colorScheme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { credits, hasCredits } = useCredits();
  const { addResume, updateResume, deleteResume, currentProcessingId, setCurrentProcessingId } = useResumes();

  const [selectedFile, setSelectedFile] = useState<{ name: string; uri: string } | null>(null);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("professional");
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    loadTemplates();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: Animations.slow, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, ...Animations.spring, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await resumeApi.getTemplates();
      setTemplates(response.templates);
      if (response.templates.length > 0) setSelectedTemplate(response.templates[0].id);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
      if (result.canceled) return;
      const file = result.assets[0];
      setSelectedFile({ name: file.name, uri: file.uri });
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const processResume = async () => {
    if (!selectedFile) return;
    if (!hasCredits) {
      Alert.alert('No Credits', 'You need credits to process a resume. Get more credits to continue.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Get Credits', onPress: () => navigation.navigate('Pricing' as any) },
      ]);
      return;
    }

    const tempId = Date.now().toString();
    setCurrentProcessingId(tempId);
    setProgress(0);
    setProcessingStage("Initializing...");

    addResume({ id: tempId, originalFilename: selectedFile.name, originalText: "", improvedText: "", dateProcessed: new Date(), status: "processing" });

    try {
      setProgress(10);
      setProcessingStage("Uploading your resume...");

      const progressSteps = [
        { delay: 500, progress: 25, message: "Upload complete! Extracting text..." },
        { delay: 2000, progress: 40, message: "Reading your resume with OCR..." },
        { delay: 3000, progress: 60, message: "AI is enhancing your resume..." },
        { delay: 5000, progress: 80, message: "Formatting your professional resume..." },
      ];

      let currentStep = 0;
      const progressInterval = setInterval(() => {
        if (currentStep < progressSteps.length) {
          const step = progressSteps[currentStep];
          setProgress(step.progress);
          setProcessingStage(step.message);
          currentStep++;
        }
      }, 1500);

      const response = await resumeApi.uploadResume(selectedFile.uri, selectedFile.name, selectedTemplate);
      clearInterval(progressInterval);
      setProgress(100);
      setProcessingStage("Your resume is ready!");

      deleteResume(tempId);
      addResume({ id: response.id, originalFilename: selectedFile.name, originalText: response.original_text, improvedText: typeof response.improved_data === 'string' ? response.improved_data : JSON.stringify(response.improved_data), dateProcessed: new Date(), status: "completed", downloadUrl: response.download_url });

      setCurrentProcessingId(null);
      setSelectedFile(null);
      navigation.navigate("Preview", { resumeId: response.id });
    } catch (error) {
      console.error('Error processing resume:', error);
      updateResume(tempId, { status: "error" });
      setCurrentProcessingId(null);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to process resume. Please try again.');
    }
  };

  return (
    <>
      <ScreenScrollView>
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          {/* Credits Banner */}
          <Pressable style={[styles.creditsBanner, { backgroundColor: theme.backgroundSecondary }]} onPress={() => navigation.navigate('Pricing' as any)}>
            <View style={styles.creditsLeft}>
              <View style={[styles.creditsIcon, { backgroundColor: theme.gold + '20' }]}>
                <Feather name="zap" size={18} color={theme.gold} />
              </View>
              <View>
                <ThemedText style={[Typography.h3]}>{credits} {credits === 1 ? 'Credit' : 'Credits'}</ThemedText>
                <ThemedText style={[Typography.caption, { color: theme.textSecondary }]}>Tap to get more</ThemedText>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>

          {/* Upload Zone */}
          <Pressable style={({ pressed }) => [styles.uploadZone, { borderColor: theme.border }, pressed && styles.uploadZonePressed]} onPress={pickDocument}>
            <LinearGradient colors={[theme.backgroundDefault, theme.backgroundSecondary]} style={styles.uploadZoneInner}>
              <View style={[styles.uploadIconContainer, { backgroundColor: theme.primary + '15' }]}>
                <Feather name="upload-cloud" size={40} color={theme.primary} />
              </View>
              <ThemedText style={[Typography.h3, { marginTop: Spacing.lg }]}>Upload Your Resume</ThemedText>
              <ThemedText style={[Typography.bodySmall, { color: theme.textSecondary, marginTop: Spacing.xs }]}>Tap to select a PDF file</ThemedText>
            </LinearGradient>
          </Pressable>

          {selectedFile && (
            <Animated.View style={[styles.fileSection]}>
              {/* Selected File Card */}
              <View style={[styles.fileCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                <View style={[styles.fileIconContainer, { backgroundColor: theme.primary + '15' }]}>
                  <Feather name="file-text" size={24} color={theme.primary} />
                </View>
                <View style={styles.fileDetails}>
                  <ThemedText style={Typography.body} numberOfLines={1}>{selectedFile.name}</ThemedText>
                  <ThemedText style={[Typography.caption, { color: theme.success }]}>Ready to process</ThemedText>
                </View>
                <Pressable onPress={() => setSelectedFile(null)} style={styles.removeButton}>
                  <Feather name="x" size={20} color={theme.textSecondary} />
                </Pressable>
              </View>

              <View style={styles.templateSection}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
                  <ThemedText style={[Typography.h3]}>Choose Template</ThemedText>
                  <Pressable onPress={() => setShowTemplatePreview(true)}>
                    <ThemedText style={[Typography.bodySmall, { color: theme.primary }]}>Preview Style</ThemedText>
                  </Pressable>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templateScroll}>
                  {templates.map((template) => (
                    <Pressable key={template.id} style={[styles.templateCard, { backgroundColor: theme.backgroundDefault, borderColor: selectedTemplate === template.id ? theme.primary : theme.border, borderWidth: selectedTemplate === template.id ? 2 : 1 }]} onPress={() => setSelectedTemplate(template.id)}>
                      <Image source={{ uri: template.preview_image || 'https://via.placeholder.com/80x100' }} style={styles.templateImage} resizeMode="cover" />
                      {selectedTemplate === template.id && (
                        <View style={[styles.templateCheck, { backgroundColor: theme.primary }]}>
                          <Feather name="check" size={12} color="#FFF" />
                        </View>
                      )}
                      <ThemedText style={[Typography.caption, { marginTop: Spacing.xs, color: selectedTemplate === template.id ? theme.primary : theme.text }]} numberOfLines={1}>{template.name}</ThemedText>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Process Button */}
              <Pressable style={({ pressed }) => [styles.processButton, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]} onPress={processResume}>
                <LinearGradient colors={colorScheme === 'dark' ? Gradients.dark.primary : Gradients.light.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.processGradient}>
                  <Feather name="zap" size={20} color="#FFF" />
                  <ThemedText style={[Typography.button, { color: "#FFF", marginLeft: Spacing.sm }]}>Process Resume</ThemedText>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          )}

          {/* How it works */}
          {!selectedFile && (
            <View style={styles.howItWorks}>
              <ThemedText style={[Typography.h3, { marginBottom: Spacing.lg }]}>How it works</ThemedText>
              {[
                { step: 1, icon: "upload", title: "Upload", desc: "Select your resume PDF" },
                { step: 2, icon: "cpu", title: "AI Enhancement", desc: "Our AI improves your content" },
                { step: 3, icon: "download", title: "Download", desc: "Get your polished resume" },
              ].map((item) => (
                <View key={item.step} style={[styles.stepCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                  <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
                    <ThemedText style={[Typography.caption, { color: "#FFF", fontWeight: "700" }]}>{item.step}</ThemedText>
                  </View>
                  <View style={styles.stepContent}>
                    <ThemedText style={Typography.h4}>{item.title}</ThemedText>
                    <ThemedText style={[Typography.caption, { color: theme.textSecondary }]}>{item.desc}</ThemedText>
                  </View>
                  <Feather name={item.icon as any} size={24} color={theme.primary} />
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScreenScrollView>

      {/* Processing Modal */}
      <Modal visible={currentProcessingId !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={[styles.processingIcon, { backgroundColor: theme.primary + '15' }]}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
            <ThemedText style={[Typography.h2, { marginTop: Spacing.lg }]}>Processing Resume</ThemedText>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: theme.backgroundTertiary }]}>
                <Animated.View style={[styles.progressFill, { backgroundColor: theme.primary, width: `${progress}%` }]} />
              </View>
              <ThemedText style={[Typography.caption, { color: theme.textSecondary, marginTop: Spacing.xs }]}>{progress}%</ThemedText>
            </View>
            <ThemedText style={[Typography.body, { color: theme.textSecondary, textAlign: "center" }]}>{processingStage}</ThemedText>
          </View>
        </View>
      </Modal>

      {/* Template Preview Modal */}
      <Modal visible={showTemplatePreview} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.previewModalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={[styles.previewModalHeader, { borderBottomColor: theme.border }]}>
            <ThemedText style={Typography.h3}>Template Preview</ThemedText>
            <Pressable onPress={() => setShowTemplatePreview(false)} style={styles.closeButton}>
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.previewModalContent}>
            <ThemedText style={[Typography.h2, { marginBottom: Spacing.md, textAlign: 'center' }]}>
              {templates.find(t => t.id === selectedTemplate)?.name || "Template"}
            </ThemedText>
            <Image
              source={{ uri: templates.find(t => t.id === selectedTemplate)?.preview_image || 'https://via.placeholder.com/300x400' }}
              style={styles.largePreviewImage}
              resizeMode="contain"
            />
            <ThemedText style={[Typography.body, { marginTop: Spacing.lg, textAlign: 'center', color: theme.textSecondary }]}>
              {templates.find(t => t.id === selectedTemplate)?.description || "A professional, ATS-optimized template suitable for most industries."}
            </ThemedText>
            <Pressable style={[styles.processButton, { marginTop: Spacing.xl, width: '100%' }]} onPress={() => setShowTemplatePreview(false)}>
              <LinearGradient colors={colorScheme === 'dark' ? Gradients.dark.primary : Gradients.light.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.processGradient}>
                <ThemedText style={[Typography.button, { color: "#FFF" }]}>Select This Style</ThemedText>
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </View>
      </Modal >
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.lg },
  creditsBanner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.xl },
  creditsLeft: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  creditsIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  uploadZone: { borderRadius: BorderRadius.lg, borderWidth: 2, borderStyle: "dashed", overflow: "hidden", marginBottom: Spacing.xl },
  uploadZoneInner: { padding: Spacing["3xl"], alignItems: "center", justifyContent: "center", minHeight: 200 },
  uploadZonePressed: { opacity: 0.8 },
  uploadIconContainer: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  fileSection: { gap: Spacing.xl },
  fileCard: { flexDirection: "row", alignItems: "center", padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1 },
  fileIconContainer: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  fileDetails: { flex: 1, marginLeft: Spacing.md },
  removeButton: { padding: Spacing.sm },
  templateSection: { marginTop: Spacing.md },
  templateScroll: { gap: Spacing.md, paddingRight: Spacing.lg },
  templateCard: { width: 100, padding: Spacing.sm, borderRadius: BorderRadius.md, alignItems: "center" },
  templateImage: { width: 80, height: 100, borderRadius: BorderRadius.xs, backgroundColor: "#e2e8f0" },
  templateCheck: { position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  processButton: { height: Spacing.buttonHeight, borderRadius: BorderRadius.md, overflow: "hidden", ...Shadows.glow },
  processGradient: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  howItWorks: { marginTop: Spacing.lg },
  stepCard: { flexDirection: "row", alignItems: "center", padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.md },
  stepNumber: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  stepContent: { flex: 1, marginLeft: Spacing.md },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.6)", alignItems: "center", justifyContent: "center", padding: Spacing.xl },
  modalContent: { borderRadius: BorderRadius.xl, padding: Spacing["2xl"], alignItems: "center", width: "100%", maxWidth: 320 },
  processingIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  progressContainer: { width: "100%", marginVertical: Spacing.lg },
  progressBar: { width: "100%", height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  previewModalContainer: { flex: 1 },
  previewModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1 },
  closeButton: { padding: Spacing.sm },
  previewModalContent: { padding: Spacing.xl, alignItems: 'center' },
  largePreviewImage: { width: 300, height: 420, borderRadius: BorderRadius.lg, backgroundColor: '#f0f0f0', ...Shadows.medium },
});
