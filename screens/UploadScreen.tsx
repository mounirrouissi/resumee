import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, ActivityIndicator, Modal, Alert, Platform, Animated, Image, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from "expo-linear-gradient";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography, Gradients, Shadows } from "@/constants/theme";
import { useResumes } from "@/contexts/ResumeContext";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { resumeApi, CVTemplate } from "@/services/resumeApi";

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, "Upload">;

export default function UploadScreen() {
  const { theme, colorScheme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { addResume, updateResume, deleteResume, currentProcessingId, setCurrentProcessingId } = useResumes();
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    uri: string;
  } | null>(null);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("professional");
  const [hoveredUploadZone, setHoveredUploadZone] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await resumeApi.getTemplates();
      setTemplates(response.templates);
      if (response.templates.length > 0) {
        setSelectedTemplate(response.templates[0].id);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handlePreviewTemplate = (templateId: string) => {
    const previewPdfUrl = resumeApi.getTemplatePreviewUrl(templateId);
    setPreviewUrl(previewPdfUrl);
    setShowPreview(true);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      setSelectedFile({
        name: file.name,
        uri: file.uri,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
      console.error(error);
    }
  };

  const processResume = async () => {
    if (!selectedFile) return;

    // Create a temporary ID for the processing state
    const tempId = Date.now().toString();
    setCurrentProcessingId(tempId);
    setProgress(0);
    setProcessingStage("Initializing...");

    addResume({
      id: tempId,
      originalFilename: selectedFile.name,
      originalText: "",
      improvedText: "",
      dateProcessed: new Date(),
      status: "processing",
    });

    try {
      setProgress(10);
      setProcessingStage("Uploading your resume...");

      // Simulate progress updates while waiting for response
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
      
      // Clear the progress interval
      clearInterval(progressInterval);
      
      // Set to 100% complete
      setProgress(100);
      setProcessingStage("Your resume is ready!");

      // Delete the temporary resume and add a new one with the backend's UUID
      deleteResume(tempId);

      addResume({
        id: response.id,
        originalFilename: selectedFile.name,
        originalText: response.original_text,
        improvedText: response.improved_text,
        dateProcessed: new Date(),
        status: "completed",
        downloadUrl: response.download_url,
      });

      setCurrentProcessingId(null);
      setSelectedFile(null);

      navigation.navigate("Preview", { resumeId: response.id });
    } catch (error) {
      console.error('Error processing resume:', error);
      updateResume(tempId, {
        status: "error",
      });
      setCurrentProcessingId(null);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to process resume. Please try again.'
      );
    }
  };

  return (
    <>
      <ScreenScrollView>
        <View style={styles.container}>
          <Pressable
            style={({ pressed }) => [
              styles.uploadZone,
              Shadows.small,
              pressed && styles.uploadZonePressed,
            ]}
            onPress={pickDocument}
            onPressIn={() => Platform.OS === 'web' && setHoveredUploadZone(true)}
            onPressOut={() => Platform.OS === 'web' && setHoveredUploadZone(false)}
          >
            <LinearGradient
              colors={hoveredUploadZone
                ? (colorScheme === 'dark' ? Gradients.dark.primary : Gradients.light.primary)
                : [theme.border, theme.border]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBorder}
            >
              <View style={[styles.uploadZoneInner, { backgroundColor: theme.backgroundDefault }]}>
                <Feather name="upload-cloud" size={64} color={hoveredUploadZone ? theme.primary : theme.textSecondary} />
                <ThemedText style={[styles.uploadText, { color: theme.textSecondary }]}>
                  Tap to select your resume PDF
                </ThemedText>
                <ThemedText style={[styles.uploadHint, { color: theme.textSecondary }]}>
                  Supports PDF files only
                </ThemedText>
              </View>
            </LinearGradient>
          </Pressable>

          {selectedFile ? (
            <Card style={styles.fileCard}>
              <View style={styles.fileInfo}>
                <Feather name="file-text" size={24} color={theme.primary} />
                <View style={styles.fileDetails}>
                  <ThemedText style={Typography.body}>{selectedFile.name}</ThemedText>
                  <ThemedText style={[Typography.caption, { color: theme.textSecondary }]}>
                    Ready to process
                  </ThemedText>
                </View>
              </View>

              {/* Template Selection */}
              <View style={styles.templateSection}>
                <View style={styles.sectionHeader}>
                  <ThemedText style={Typography.h2}>Choose Template</ThemedText>
                </View>

                {/* Main Preview Card */}
                {templates.length > 0 && (
                  <View style={styles.mainPreviewContainer}>
                    <Pressable
                      style={[styles.mainPreviewCard, { backgroundColor: theme.backgroundSecondary }]}
                      onPress={() => handlePreviewTemplate(selectedTemplate)}
                    >
                      <Image
                        source={{ uri: templates.find(t => t.id === selectedTemplate)?.preview_image || 'https://via.placeholder.com/300x400' }}
                        style={styles.mainPreviewImage}
                        resizeMode="contain"
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.previewGradient}
                      >
                        <View style={styles.previewContent}>
                          <ThemedText style={[Typography.h2, { color: '#fff' }]}>
                            {templates.find(t => t.id === selectedTemplate)?.name || 'Template Name'}
                          </ThemedText>
                          <ThemedText style={[Typography.bodySmall, { color: '#ddd' }]}>
                            {templates.find(t => t.id === selectedTemplate)?.description || 'Professional resume template'}
                          </ThemedText>
                          <View style={styles.previewAction}>
                            <Feather name="eye" size={16} color="#fff" />
                            <ThemedText style={[Typography.caption, { color: '#fff', marginLeft: 4 }]}>Tap to Preview</ThemedText>
                          </View>
                        </View>
                      </LinearGradient>
                    </Pressable>
                  </View>
                )}

                {/* Template Carousel */}
                <View style={styles.carouselContainer}>
                  <ThemedText style={[Typography.h2, styles.carouselTitle]}>All Templates</ThemedText>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carouselContent}
                  >
                    {templates.map((template) => (
                      <Pressable
                        key={template.id}
                        style={[
                          styles.carouselItem,
                          selectedTemplate === template.id && styles.carouselItemSelected,
                          { borderColor: selectedTemplate === template.id ? theme.primary : 'transparent' }
                        ]}
                        onPress={() => setSelectedTemplate(template.id)}
                      >
                        <Image
                          source={{ uri: template.preview_image || 'https://via.placeholder.com/100x140' }}
                          style={styles.carouselImage}
                          resizeMode="cover"
                        />
                        {selectedTemplate === template.id && (
                          <View style={[styles.checkmarkContainer, { backgroundColor: theme.primary }]}>
                            <Feather name="check" size={12} color="#fff" />
                          </View>
                        )}
                        <ThemedText
                          style={[
                            Typography.caption,
                            styles.carouselItemName,
                            { color: selectedTemplate === template.id ? theme.primary : theme.textSecondary }
                          ]}
                          numberOfLines={1}
                        >
                          {template.name}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.processButton,
                  Shadows.large,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
                onPress={processResume}
              >
                <LinearGradient
                  colors={colorScheme === 'dark' ? Gradients.dark.primary : Gradients.light.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  <ThemedText style={[Typography.button, { color: theme.buttonText }]}>
                    Process Resume
                  </ThemedText>
                </LinearGradient>
              </Pressable>
            </Card>
          ) : null}

          <View style={styles.infoSection}>
            <ThemedText style={[Typography.h2, styles.sectionTitle]}>How it works</ThemedText>
            <Card style={styles.stepCard}>
              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
                  <ThemedText style={[Typography.body, { color: theme.buttonText }]}>1</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={Typography.body}>Upload Your Resume</ThemedText>
                  <ThemedText style={[Typography.bodySmall, { color: theme.textSecondary }]}>
                    Select a PDF file of your current resume
                  </ThemedText>
                </View>
              </View>
            </Card>
            <Card style={styles.stepCard}>
              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
                  <ThemedText style={[Typography.body, { color: theme.buttonText }]}>2</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={Typography.body}>AI Enhancement</ThemedText>
                  <ThemedText style={[Typography.bodySmall, { color: theme.textSecondary }]}>
                    Our AI improves grammar, formatting, and professionalism
                  </ThemedText>
                </View>
              </View>
            </Card>
            <Card style={styles.stepCard}>
              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
                  <ThemedText style={[Typography.body, { color: theme.buttonText }]}>3</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={Typography.body}>Download & Apply</ThemedText>
                  <ThemedText style={[Typography.bodySmall, { color: theme.textSecondary }]}>
                    Get your polished resume as a PDF ready to send
                  </ThemedText>
                </View>
              </View>
            </Card>
          </View>
        </View>
      </ScreenScrollView>

      <Modal visible={currentProcessingId !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <ThemedText style={[Typography.h2, styles.modalTitle]}>
              Processing Resume
            </ThemedText>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: theme.primary,
                      width: `${progress}%`
                    }
                  ]} 
                />
              </View>
              <ThemedText style={[Typography.caption, { color: theme.textSecondary, marginTop: Spacing.xs }]}>
                {progress}%
              </ThemedText>
            </View>
            
            <ThemedText style={[Typography.body, { color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }]}>
              {processingStage}
            </ThemedText>
          </ThemedView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
  },
  uploadZone: {
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.xl,
  },
  gradientBorder: {
    borderRadius: BorderRadius.md,
    padding: 2,
  },
  uploadZoneInner: {
    borderRadius: BorderRadius.md - 2,
    padding: Spacing["3xl"],
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  uploadZonePressed: {
    opacity: 0.8,
  },
  uploadText: {
    ...Typography.body,
    marginTop: Spacing.lg,
  },
  uploadHint: {
    ...Typography.bodySmall,
    marginTop: Spacing.xs,
  },
  fileCard: {
    marginBottom: Spacing.xl,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  fileDetails: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  processButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  gradientButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  infoSection: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  stepCard: {
    marginBottom: Spacing.md,
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stepContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    borderRadius: BorderRadius.md,
    padding: Spacing["2xl"],
    alignItems: "center",
    minWidth: 280,
  },
  modalTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  templateSection: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  mainPreviewContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  mainPreviewCard: {
    width: '100%',
    height: 400,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  mainPreviewImage: {
    width: '100%',
    height: '100%',
  },
  previewGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    justifyContent: 'flex-end',
    padding: Spacing.lg,
  },
  previewContent: {
    marginBottom: Spacing.sm,
  },
  previewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  carouselContainer: {
    marginTop: Spacing.md,
  },
  carouselTitle: {
    marginBottom: Spacing.md,
  },
  carouselContent: {
    paddingRight: Spacing.lg,
    gap: Spacing.md,
  },
  carouselItem: {
    width: 100,
    marginRight: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: BorderRadius.sm,
    padding: 4,
  },
  carouselItemSelected: {
    // Border color handled in style prop
  },
  carouselImage: {
    width: '100%',
    height: 130,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.xs,
    backgroundColor: '#e2e8f0',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  carouselItemName: {
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
  previewModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  previewModalContent: {
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    width: '90%',
    maxWidth: 800,
    maxHeight: '90%',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  closePreviewButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginTop: Spacing.lg,
  },
});
