import apiClient from './api';
import { APIResponse } from '@/types/api.types';
import { UserPreferences, UserPreferencesUpdate, UserUpdate } from '@/types/user.types';
import { User } from '@/types/auth.types';

export const userService = {
  async getProfile(): Promise<User> {
    const response = await apiClient.get<APIResponse<User>>('/users/me');
    return response.data.data!;
  },

  async updateProfile(data: UserUpdate): Promise<User> {
    const response = await apiClient.patch<APIResponse<User>>('/users/me', data);
    return response.data.data!;
  },

  async getPreferences(): Promise<UserPreferences> {
    const response = await apiClient.get<APIResponse<UserPreferences>>('/users/me/preferences');
    return response.data.data!;
  },

  async updatePreferences(data: UserPreferencesUpdate): Promise<UserPreferences> {
    const response = await apiClient.patch<APIResponse<UserPreferences>>('/users/me/preferences', data);
    return response.data.data!;
  },
};
