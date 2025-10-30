// src/api/taskApi.ts
import apiClient from './apiClient';
import { ApiResponse } from '../types';

export const taskApi = {
  getTaskDetails: async (taskId: string): Promise<ApiResponse<any>> => {
    return await apiClient.get(`/tasks/${taskId}`);
  },

  submitTask: async (
    taskId: string,
    content: any,
    files: Array<{ uri: string; type: string; name: string }> = []
  ): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('taskId', taskId);
    formData.append('content', JSON.stringify(content));

    files.forEach((file, index) => {
      formData.append('files', {
        uri: file.uri,
        type: file.type,
        name: file.name || `file_${index}`,
      } as any);
    });

    return await apiClient.post('/submissions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getMySubmissions: async (): Promise<ApiResponse<any[]>> => {
    return await apiClient.get('/submissions/my-submissions');
  },
};

export default taskApi;