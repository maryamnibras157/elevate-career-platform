import apiClient from './api';

export const RecommendationService = {
  getRecommendations: async () => {
    const response = await apiClient.get('/recommendations');
    return response.data;
  },
  generateRecommendations: async (profileData: any) => {
    const response = await apiClient.post('/recommendations/generate', profileData);
    return response.data;
  }
};
