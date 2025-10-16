import axios from 'axios';
import { supabase } from './supabaseClient';

// Create API instance for storage operations
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers = config.headers ?? {};
      (config.headers as any)['Authorization'] = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    console.error('Error getting session:', error);
  }
  return config;
});

interface UploadTokenResponse {
  uploadUrl: string;
  publicUrl: string;
  fileName: string;
}

class AzureStorageService {
  async uploadImage(file: File): Promise<string> {
    try {
      // Step 1: Get SAS token from backend
      const tokenResponse = await api.post('/Storage/upload-token', {
        fileName: file.name,
        contentType: file.type
      });

      const { uploadUrl, publicUrl }: UploadTokenResponse = tokenResponse.data;

      // Step 2: Upload file directly to Azure Storage using SAS token
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type || 'application/octet-stream'
        }
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      // Step 3: Return the public URL
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image to Azure Storage:', error);
      throw new Error('Failed to upload image');
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      await api.delete('/Storage/delete', {
        data: { imageUrl }
      });
    } catch (error) {
      console.error('Error deleting image from Azure Storage:', error);
      throw new Error('Failed to delete image');
    }
  }

  isConfigured(): boolean {
    // Always return true since we're using backend API
    return true;
  }
}

export const azureStorage = new AzureStorageService();