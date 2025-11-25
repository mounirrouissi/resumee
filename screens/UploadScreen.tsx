import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, ActivityIndicator, Modal, Alert, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as DocumentPicker from 'expo-document-picker';
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { useResumes } from "@/contexts/ResumeContext";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { resumeApi, CVTemplate } from "@/services/resumeApi";

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, "Upload">;

export default function UploadScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { addResume, updateResume, deleteResume, currentProcessingId, setCurrentProcessingId } = useResumes();
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    uri: string;
  } | null>(null);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("professional");

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

    addResume({
      id: tempId,
      originalFilename: selectedFile.name,
      originalText: "",
      improvedText: "",
      dateProcessed: new Date(),
      status: "processing",
    });

    try {
      setProcessingStage("Uploading and processing your resume...");

      const response = await resumeApi.uploadResume(selectedFile.uri, selectedFile.name, selectedTemplate);

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
            style={[
              styles.uploadZone,
              { borderColor: theme.border },
            ]}
            onPress={pickDocument}
          >
            <Feather name="upload-cloud" size={64} color={theme.textSecondary} />
            <ThemedText style={[styles.uploadText, { color: theme.textSecondary }]}>
              Tap to select your resume PDF
            </ThemedText>
            <ThemedText style={[styles.uploadHint, { color: theme.textSecondary }]}>
              Supports PDF files only
            </ThemedText>
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
                <ThemedText style={[Typography.body, styles.templateLabel]}>Choose Template</ThemedText>
                <View style={styles.templateList}>
                  {templates.map((template) => (
                    <Pressable
                      key={template.id}
                      style={[
                        styles.templateCard,
                        { 
                          borderColor: selectedTemplate === template.id ? theme.primary : theme.border,
                          backgroundColor: selectedTemplate === template.id ? theme.primary + '10' : 'transparent'
                        },
                      ]}
                      onPress={() => setSelectedTemplate(template.id)}
                    >
                      <View style={styles.templateContent}>
                        <View style={styles.templateHeader}>
                          <Feather 
                            name="layout" 
                            size={20} 
                            color={selectedTemplate === template.id ? theme.primary : theme.textSecondary} 
                          />
                          <ThemedText style={[
                            Typography.body, 
                            styles.templateName,
                            { color: selectedTemplate === template.id ? theme.primary : theme.text }
                          ]}>
                            {template.name}
                          </ThemedText>
                        </View>
                        <ThemedText style={[Typography.caption, { color: theme.textSecondary }]}>
                          {template.description}
                        </ThemedText>
                      </View>
                      {selectedTemplate === template.id && (
                        <Feather name="check-circle" size={20} color={theme.primary} />
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable
                style={[styles.processButton, { backgroundColor: theme.primary }]}
                onPress={processResume}
              >
                <ThemedText style={[Typography.button, { color: theme.buttonText }]}>
                  Process Resume
                </ThemedText>
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
            <ThemedText style={[Typography.body, { color: theme.textSecondary, textAlign: "center" }]}>
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
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: BorderRadius.md,
    padding: Spacing["3xl"],
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
    marginBottom: Spacing.xl,
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
    marginBottom: Spacing.sm,
  },
  templateSection: {
    marginBottom: Spacing.lg,
  },
  templateLabel: {
    marginBottom: Spacing.md,
    fontWeight: '600',
  },
  templateList: {
    gap: Spacing.sm,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderWidth: 2,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  templateContent: {
    flex: 1,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  templateName: {
    marginLeft: Spacing.sm,
    fontWeight: '600',
  },
});
