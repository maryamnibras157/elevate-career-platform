import apiClient from './api';

export const RoadmapService = {
  getRoadmaps: async () => {
    const response = await apiClient.get('/roadmaps');
    return response.data;
  },
  generateRoadmap: async (careerId: string) => {
    const response = await apiClient.post(`/roadmaps/generate/${careerId}`);
    return response.data;
  },
  updateStep: async (stepId: string, isCompleted: boolean) => {
    const response = await apiClient.patch(`/roadmaps/steps/${stepId}`, {
      is_completed: isCompleted
    });
    return response.data;
  }
};
