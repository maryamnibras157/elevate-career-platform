import apiClient from './api';

export const SkillGapService = {
  getSkillGaps: async () => {
    const response = await apiClient.get('/skill-gap');
    return response.data;
  },
  generateSkillGap: async (careerId: string) => {
    const response = await apiClient.post(`/skill-gap/generate/${careerId}`);
    return response.data;
  }
};
