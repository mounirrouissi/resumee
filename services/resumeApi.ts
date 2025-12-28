import Constants from "expo-constants";

// Production backend URL
const PRODUCTION_API_URL = "https://resumee-nhrs.onrender.com";

const getBaseUrl = () => {
  // 1. Check for environment variable first (set in eas.json for builds)
  if (process.env.EXPO_PUBLIC_API_URL) {
    console.log("📡 Using EXPO_PUBLIC_API_URL:", process.env.EXPO_PUBLIC_API_URL);
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. For development in Expo Go - use local backend
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(":")[0];
    console.log("📡 Using Expo Go development URL:", `http://${ip}:8000`);
    return `http://${ip}:8000`;
  }

  // 3. For web development (localhost)
  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      console.log("📡 Using localhost for web development");
      return "http://localhost:8000";
    }
  }

  // 4. Default: Production URL (for APK/AAB builds)
  console.log("📡 Using production URL:", PRODUCTION_API_URL);
  return PRODUCTION_API_URL;
};

const API_BASE_URL = getBaseUrl();

// Log the API URL for debugging
console.log("🔗 API Base URL:", API_BASE_URL);

export interface UploadResumeResponse {
  id: string;
  original_filename: string;
  timestamp: string;
  original_text: string;
  improved_data: any; // JSON object with structured resume data
  download_url: string;
}

export interface CVTemplate {
  id: string;
  name: string;
  description: string;
  preview_image: string;
}

export interface TemplatesResponse {
  templates: CVTemplate[];
}

export const resumeApi = {
  async getTemplates(): Promise<TemplatesResponse> {
    try {
      console.log(
        "📡 Fetching templates from:",
        `${API_BASE_URL}/api/templates`,
      );
      const response = await fetch(`${API_BASE_URL}/api/templates`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch templates: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      // Prepend base URL to preview images if they are relative paths
      if (data.templates) {
        data.templates = data.templates.map((t: any) => ({
          ...t,
          preview_image: t.preview_image.startsWith("/")
            ? `${API_BASE_URL}${t.preview_image}`
            : t.preview_image,
        }));
      }

      console.log("✅ Templates loaded:", data);
      return data;
    } catch (error) {
      console.error("❌ Failed to fetch templates:", error);
      throw error;
    }
  },

  async uploadResume(
    fileUri: string,
    fileName: string,
    templateId: string = "professional",
  ): Promise<UploadResumeResponse> {
    try {
      console.log("📤 Uploading resume:", fileName);
      const formData = new FormData();

      // For web
      if (fileUri.startsWith("blob:") || fileUri.startsWith("data:")) {
        const response = await fetch(fileUri);
        const blob = await response.blob();
        formData.append("file", blob, fileName);
      } else {
        // For mobile
        formData.append("file", {
          uri: fileUri,
          type: "application/pdf",
          name: fileName,
        } as any);
      }

      formData.append("template_id", templateId);

      console.log(
        "🚀 Sending request to:",
        `${API_BASE_URL}/api/upload-resume`,
      );

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes timeout

      const response = await fetch(`${API_BASE_URL}/api/upload-resume`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ detail: "Unknown error" }));
        throw new Error(
          error.detail || `Failed to upload resume: ${response.status}`,
        );
      }

      const data = await response.json();
      console.log("✅ Resume processed successfully");
      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(
            "Request timeout - processing took too long. Please try again.",
          );
        }
        console.error("❌ Upload error:", error.message);
      }
      throw error;
    }
  },

  async downloadResume(fileId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/download/${fileId}`);

    if (!response.ok) {
      throw new Error("Failed to download resume");
    }

    return response.blob();
  },

  getDownloadUrl(fileId: string): string {
    return `${API_BASE_URL}/api/download/${fileId}`;
  },

  getTemplatePreviewUrl(templateId: string): string {
    return `${API_BASE_URL}/api/template-preview/${templateId}`;
  },

  async getProgress(
    fileId: string,
  ): Promise<{ stage: string; message: string; progress: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/progress/${fileId}`);
      if (!response.ok) {
        throw new Error("Failed to get progress");
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to get progress:", error);
      return { stage: "unknown", message: "Processing...", progress: 0 };
    }
  },

  async generatePdf(
    fileId: string,
    userId: string,
    templateId: string = "professional",
  ): Promise<{ download_url: string }> {
    const response = await fetch(`${API_BASE_URL}/api/generate-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file_id: fileId,
        user_id: userId,
        template_id: templateId,
      }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Failed to generate PDF" }));
      throw new Error(error.detail);
    }

    return await response.json();
  },
};
