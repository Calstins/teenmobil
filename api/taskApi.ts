// src/api/taskApi.ts
import apiClient from './apiClient';
import { ApiResponse } from '../types';

export const taskApi = {
  getTaskDetails: async (taskId: string): Promise<ApiResponse<any>> => {
    return await apiClient.get(`/teen/tasks/${taskId}`);
  },

  submitTask: async (
    taskId: string,
    content: any,
    files: Array<{ url?: string; uri?: string; type?: string; name?: string }> = []
  ): Promise<ApiResponse<any>> => {
    console.log('📤 taskApi.submitTask called:', {
      taskId,
      content,
      contentType: typeof content,
      files: files.length,
      filesDetail: files,
    });

    // ✅ CRITICAL FIX: For IMAGE tasks, files contain URLs from Cloudinary
    // We need to send these URLs in the content, not as multipart files
    const hasUploadedFiles = files.length > 0 && files[0].url;

    if (hasUploadedFiles) {
      // Images already uploaded to Cloudinary, send URLs in content
      console.log('📸 Sending pre-uploaded image URLs');
      
      const payload = {
        taskId,
        content: JSON.stringify({
          ...content,
          fileUrls: files.map(f => f.url),
        }),
      };

      console.log('📦 Payload:', payload);

      return await apiClient.post('/teen/submissions', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // Regular submission without files (or files not yet uploaded)
      console.log('📝 Sending regular submission');
      
      const payload = {
        taskId,
        content: JSON.stringify(content),
      };

      console.log('📦 Payload:', payload);

      return await apiClient.post('/teen/submissions', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  getMySubmissions: async (): Promise<ApiResponse<any[]>> => {
    return await apiClient.get('/teen/submissions/my-submissions');
  },
};

export default taskApi;