import Constants from 'expo-constants';

const getBaseUrl = () => {
  // For web execution
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
  }

  // For mobile execution (Expo Go)
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:8000`;
  }

  // Fallback for Android Emulator
  if (Constants.platform?.android) {
    return 'http://10.0.2.2:8000';
  }

  return 'http://localhost:8000';
};

const API_BASE_URL = getBaseUrl();

export interface UploadResumeResponse {
  id: string;
  original_filename: string;
  timestamp: string;
  original_text: string;
  improved_text: string;
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
    const response = await fetch(`${API_BASE_URL}/api/templates`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    
    return response.json();
  },

  async uploadResume(fileUri: string, fileName: string, templateId: string = "professional"): Promise<UploadResumeResponse> {
    const formData = new FormData();
    
    // For web
    if (fileUri.startsWith('blob:') || fileUri.startsWith('data:')) {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      formData.append('file', blob, fileName);
    } else {
      // For mobile
      formData.append('file', {
        uri: fileUri,
        type: 'application/pdf',
        name: fileName,
      } as any);
    }
    
    formData.append('template_id', templateId);

    const response = await fetch(`${API_BASE_URL}/api/upload-resume`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload resume');
    }

    return response.json();
  },

  async downloadResume(fileId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/download/${fileId}`);
    
    if (!response.ok) {
      throw new Error('Failed to download resume');
    }

    return response.blob();
  },

  getDownloadUrl(fileId: string): string {
    return `${API_BASE_URL}/api/download/${fileId}`;
  },
};
