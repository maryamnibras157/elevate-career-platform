import apiClient from './api';

export const ResumeService = {
  getLatestAnalysis: async () => {
    const response = await apiClient.get('/resume-analysis/latest');
    return response.data;
  },
  analyzeResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/resume-analysis/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
