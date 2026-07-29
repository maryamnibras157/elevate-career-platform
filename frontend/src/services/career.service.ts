import apiClient from './api';

export const CareerService = {
  getCareers: async () => {
    const response = await apiClient.get('/careers');
    return response.data;
  },
  getSavedCareers: async () => {
    const response = await apiClient.get('/careers/saved');
    return response.data;
  },
  toggleSaveCareer: async (careerId: string) => {
    const response = await apiClient.post(`/careers/${careerId}/save`);
    return response.data;
  }
};
