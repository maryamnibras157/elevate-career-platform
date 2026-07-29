import apiClient from './api';
import { LoginData, RegisterData, TokenResponse, User } from '@/types/auth.types';
import { APIResponse } from '@/types/api.types';

export const authService = {
  async register(data: RegisterData): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/login', data);
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refresh_token: refreshToken });
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<APIResponse<User>>('/auth/me');
    return response.data.data!;
  },

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(data: { token: string; new_password: string }): Promise<void> {
    await apiClient.post('/auth/reset-password', data);
  },

  async googleLogin(code: string): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/google', { code });
    return response.data;
  },

  setTokens(tokens: TokenResponse) {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
  },

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};
