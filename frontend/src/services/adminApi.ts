import apiClient from './api';
import { 
  AdminContextData, ApiResponse, PaginatedResponse, User, UserFilterParams, UserActivity,
  AdminCareer, AdminCareerFilterParams, AdminCareerCreatePayload, AdminCareerUpdatePayload,
  AdminResumeStatisticsOut, AdminResumeStatsFilterParams,
  SystemSettingsResponse,
  SystemInfo, AdminResumeAnalysis,
  AuditLog, AuditStatisticsOut, AuditFilterParams,
  Notification, NotificationStatisticsOut, NotificationFilterParams,
  ReportConfigCreate, ReportConfigOut, ReportHistoryOut, ReportFilterParams, ExecutiveMetricsOut, ReportCategory,
  AdminAccountUpdate, AdminPasswordChange, AdminPreferencesUpdate, SessionOut, SessionFilterParams, ActivityFilterParams
} from '@/types/admin';
export const adminApi = {
  // Auth / Context
  getMe: async (): Promise<ApiResponse<AdminContextData>> => {
    const response = await apiClient.get<ApiResponse<AdminContextData>>('/admin/me');
    return response.data;
  },

  // Dashboard
  getDashboardSummary: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },

  // Users
  getUsers: async (params?: UserFilterParams): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>('/admin/users', { params });
    return response.data;
  },
  
  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>(`/admin/users/${id}`);
    return response.data;
  },

  getUserActivity: async (id: string): Promise<ApiResponse<UserActivity>> => {
    const response = await apiClient.get<ApiResponse<UserActivity>>(`/admin/users/${id}/activity`);
    return response.data;
  },

  activateUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/activate`);
    return response.data;
  },

  deactivateUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/deactivate`);
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/users/${id}`);
    return response.data;
  },
  
  // Careers
  getCareers: async (params?: AdminCareerFilterParams): Promise<ApiResponse<PaginatedResponse<AdminCareer>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<AdminCareer>>>('/admin/careers', { params });
    return response.data;
  },

  getCareerById: async (id: string): Promise<ApiResponse<AdminCareer>> => {
    const response = await apiClient.get<ApiResponse<AdminCareer>>(`/admin/careers/${id}`);
    return response.data;
  },

  createCareer: async (data: AdminCareerCreatePayload): Promise<ApiResponse<AdminCareer>> => {
    const response = await apiClient.post<ApiResponse<AdminCareer>>('/admin/careers', data);
    return response.data;
  },

  updateCareer: async (id: string, data: AdminCareerUpdatePayload): Promise<ApiResponse<AdminCareer>> => {
    const response = await apiClient.put<ApiResponse<AdminCareer>>(`/admin/careers/${id}`, data);
    return response.data;
  },

  deleteCareer: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/careers/${id}`);
    return response.data;
  },

  // Resume Statistics
  getResumeStatistics: async (): Promise<ApiResponse<AdminResumeStatisticsOut>> => {
    const response = await apiClient.get<ApiResponse<AdminResumeStatisticsOut>>('/admin/resume-statistics');
    return response.data;
  },

  getResumeAnalyses: async (params?: AdminResumeStatsFilterParams): Promise<ApiResponse<PaginatedResponse<AdminResumeAnalysis>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<AdminResumeAnalysis>>>('/admin/resume-statistics/analyses', { params });
    return response.data;
  },

  getResumeAnalysisById: async (id: string): Promise<ApiResponse<AdminResumeAnalysis>> => {
    const response = await apiClient.get<ApiResponse<AdminResumeAnalysis>>(`/admin/resume-statistics/analyses/${id}`);
    return response.data;
  },

  deleteResumeAnalysis: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/resume-statistics/analyses/${id}`);
    return response.data;
  },

  exportResumeStatisticsCsv: async (params?: AdminResumeStatsFilterParams): Promise<void> => {
    const response = await apiClient.get('/admin/resume-statistics/export/csv', {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'resume_analyses.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Analytics
  getAnalyticsUserGrowth: async (params?: Record<string, any>) => {
    const response = await apiClient.get('/admin/analytics/user-growth', { params });
    return response.data;
  },
  
  getAnalyticsCareerGrowth: async (params?: Record<string, any>) => {
    const response = await apiClient.get('/admin/analytics/career-growth', { params });
    return response.data;
  },
  
  getAnalyticsResumeTrends: async (params?: Record<string, any>) => {
    const response = await apiClient.get('/admin/analytics/resume-trends', { params });
    return response.data;
  },
  
  getAnalyticsInterviews: async (params?: Record<string, any>) => {
    const response = await apiClient.get('/admin/analytics/interviews', { params });
    return response.data;
  },
  
  getAnalyticsMentorUsage: async (params?: Record<string, any>) => {
    const response = await apiClient.get('/admin/analytics/mentor-usage', { params });
    return response.data;
  },

  // Settings
  getSettings: async (): Promise<ApiResponse<SystemSettingsResponse>> => {
    const response = await apiClient.get<ApiResponse<SystemSettingsResponse>>('/admin/settings');
    return response.data;
  },

  updateSettings: async (settings: { key: string; value: any }[]): Promise<ApiResponse<void>> => {
    const response = await apiClient.patch<ApiResponse<void>>('/admin/settings', { settings });
    return response.data;
  },

  getSystemInfo: async (): Promise<ApiResponse<SystemInfo>> => {
    const response = await apiClient.get<ApiResponse<SystemInfo>>('/admin/settings/system-info');
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async (params?: AuditFilterParams): Promise<ApiResponse<PaginatedResponse<AuditLog>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<AuditLog>>>('/admin/audit-logs', { params });
    return response.data;
  },

  getAuditStatistics: async (): Promise<ApiResponse<AuditStatisticsOut>> => {
    const response = await apiClient.get<ApiResponse<AuditStatisticsOut>>('/admin/audit-logs/stats');
    return response.data;
  },

  getAuditLogDetail: async (logId: string): Promise<ApiResponse<AuditLog>> => {
    const response = await apiClient.get<ApiResponse<AuditLog>>(`/admin/audit-logs/${logId}`);
    return response.data;
  },

  exportAuditLogsCsv: async (params?: AuditFilterParams): Promise<Blob> => {
    const response = await apiClient.get('/admin/audit-logs/export/csv', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Notifications
  getNotifications: async (params?: NotificationFilterParams): Promise<ApiResponse<PaginatedResponse<Notification>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Notification>>>('/admin/notifications', { params });
    return response.data;
  },

  getNotificationStats: async (): Promise<ApiResponse<NotificationStatisticsOut>> => {
    const response = await apiClient.get<ApiResponse<NotificationStatisticsOut>>('/admin/notifications/stats');
    return response.data;
  },

  getNotification: async (notifId: string): Promise<ApiResponse<Notification>> => {
    const response = await apiClient.get<ApiResponse<Notification>>(`/admin/notifications/${notifId}`);
    return response.data;
  },

  createNotification: async (payload: any): Promise<ApiResponse<Notification>> => {
    const response = await apiClient.post<ApiResponse<Notification>>('/admin/notifications', payload);
    return response.data;
  },

  updateNotification: async (notifId: string, payload: any): Promise<ApiResponse<Notification>> => {
    const response = await apiClient.put<ApiResponse<Notification>>(`/admin/notifications/${notifId}`, payload);
    return response.data;
  },

  deleteNotification: async (notifId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/notifications/${notifId}`);
    return response.data;
  },

  publishNotification: async (notifId: string): Promise<ApiResponse<Notification>> => {
    const response = await apiClient.post<ApiResponse<Notification>>(`/admin/notifications/${notifId}/publish`);
    return response.data;
  },

  scheduleNotification: async (notifId: string, scheduled_at: string): Promise<ApiResponse<Notification>> => {
    const response = await apiClient.post<ApiResponse<Notification>>(`/admin/notifications/${notifId}/schedule`, null, { params: { scheduled_at } });
    return response.data;
  },

  archiveNotification: async (notifId: string): Promise<ApiResponse<Notification>> => {
    const response = await apiClient.post<ApiResponse<Notification>>(`/admin/notifications/${notifId}/archive`);
    return response.data;
  },

  // Reports & Exports
  getExecutiveMetrics: async (): Promise<ApiResponse<ExecutiveMetricsOut>> => {
    const response = await apiClient.get<ApiResponse<ExecutiveMetricsOut>>('/admin/reports/dashboard-stats');
    return response.data;
  },
  getReportConfigs: async (params?: ReportFilterParams): Promise<ApiResponse<PaginatedResponse<ReportConfigOut>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ReportConfigOut>>>('/admin/reports/configs', { params });
    return response.data;
  },
  getReportConfig: async (configId: string): Promise<ApiResponse<ReportConfigOut>> => {
    const response = await apiClient.get<ApiResponse<ReportConfigOut>>(`/admin/reports/configs/${configId}`);
    return response.data;
  },
  createReportConfig: async (payload: ReportConfigCreate): Promise<ApiResponse<ReportConfigOut>> => {
    const response = await apiClient.post<ApiResponse<ReportConfigOut>>('/admin/reports/configs', payload);
    return response.data;
  },
  deleteReportConfig: async (configId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/reports/configs/${configId}`);
    return response.data;
  },
  getReportHistory: async (params?: ReportFilterParams): Promise<ApiResponse<PaginatedResponse<ReportHistoryOut>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ReportHistoryOut>>>('/admin/reports/history', { params });
    return response.data;
  },
  exportDynamicReport: async (category: ReportCategory): Promise<Blob> => {
    const response = await apiClient.get('/admin/reports/export/dynamic', {
      params: { category },
      responseType: 'blob',
    });
    return response.data;
  },
  downloadConfiguredReport: async (configId: string): Promise<Blob> => {
    const response = await apiClient.get(`/admin/reports/configs/${configId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Admin Profile & Preferences
  getMyAccount: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>('/admin/profile/account');
    return response.data;
  },
  updateMyAccount: async (payload: AdminAccountUpdate): Promise<ApiResponse<{message: string, full_name: string}>> => {
    const response = await apiClient.put<ApiResponse<{message: string, full_name: string}>>('/admin/profile/account', payload);
    return response.data;
  },
  changeMyPassword: async (payload: AdminPasswordChange): Promise<ApiResponse<{message: string}>> => {
    const response = await apiClient.put<ApiResponse<{message: string}>>('/admin/profile/password', payload);
    return response.data;
  },
  getMyPreferences: async (): Promise<ApiResponse<AdminPreferencesUpdate>> => {
    const response = await apiClient.get<ApiResponse<AdminPreferencesUpdate>>('/admin/profile/preferences');
    return response.data;
  },
  updateMyPreferences: async (payload: AdminPreferencesUpdate): Promise<ApiResponse<AdminPreferencesUpdate>> => {
    const response = await apiClient.put<ApiResponse<AdminPreferencesUpdate>>('/admin/profile/preferences', payload);
    return response.data;
  },
  getMySessions: async (params?: SessionFilterParams): Promise<ApiResponse<PaginatedResponse<SessionOut>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<SessionOut>>>('/admin/profile/sessions', { params });
    return response.data;
  },
  terminateMySession: async (sessionId: string): Promise<ApiResponse<{message: string}>> => {
    const response = await apiClient.delete<ApiResponse<{message: string}>>(`/admin/profile/sessions/${sessionId}`);
    return response.data;
  },
  terminateAllOtherSessions: async (): Promise<ApiResponse<{message: string}>> => {
    const response = await apiClient.delete<ApiResponse<{message: string}>>('/admin/profile/sessions');
    return response.data;
  },
  getMyActivity: async (params?: ActivityFilterParams): Promise<ApiResponse<PaginatedResponse<AuditLog>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<AuditLog>>>('/admin/profile/activity', { params });
    return response.data;
  }
};
