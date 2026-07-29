export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER';

export type Permission = 
  | 'VIEW_DASHBOARD'
  | 'VIEW_ANALYTICS'
  | 'VIEW_USERS'
  | 'CREATE_USERS'
  | 'UPDATE_USERS'
  | 'DELETE_USERS'
  | 'VIEW_CAREERS'
  | 'CREATE_CAREERS'
  | 'UPDATE_CAREERS'
  | 'DELETE_CAREERS'
  | 'VIEW_RESUME_STATS'
  | 'DELETE_RESUME_ANALYSIS';

export interface AdminContextData {
  user_id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  permissions: Permission[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login_at: string | null;
}

export interface UserFilterParams {
  page?: number;
  size?: number;
  search?: string;
  is_active?: boolean;
  role?: string;
  is_verified?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface UserActivity {
  total_resumes: number;
  total_interviews: number;
  total_mentor_sessions: number;
  total_saved_careers: number;
}

export interface AdminCareer {
  id: string;
  title: string;
  description: string | null;
  salary_estimate: string | null;
  demand_level: string | null;
  growth_outlook: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminCareerFilterParams {
  page?: number;
  size?: number;
  search?: string;
  demand_level?: string;
}

export interface AdminCareerCreatePayload {
  title: string;
  description?: string;
  salary_estimate?: string;
  demand_level?: string;
  growth_outlook?: string;
}

export interface AdminCareerUpdatePayload {
  title?: string;
  description?: string;
  salary_estimate?: string;
  demand_level?: string;
  growth_outlook?: string;
}

export interface AdminResumeStatisticsOut {
  total_uploads: number;
  successful_parses: number;
  failed_parses: number;
  average_resume_score: number;
  average_ats_score: number;
  resume_score_distribution: { range: string; count: number }[];
  ats_score_distribution: { range: string; count: number }[];
  skill_gap_frequency: { skill: string; count: number }[];
  recommendation_categories: { category: string; count: number }[];
}

export interface AdminResumeStatsFilterParams {
  page?: number;
  size?: number;
  search?: string;
  min_resume_score?: number;
  min_ats_score?: number;
}

export interface AdminResumeAnalysis {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  resume_score: number | null;
  ats_score: number | null;
  skills: string[] | null;
  education: any[] | null;
  projects: any[] | null;
  experience: any[] | null;
  certifications: any[] | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  missing_keywords: string[] | null;
  suggested_improvements: string[] | null;
  created_at: string;
  recommendations?: any[];
  roadmaps?: any[];
}

export interface SystemSetting {
  key: string;
  category: string;
  value: any;
  description: string | null;
  is_secret: boolean;
  updated_by?: string | null;
  updated_at?: string;
  read_only?: boolean;
}

export interface SystemSettingsResponse {
  general: SystemSetting[];
  platform: SystemSetting[];
  ai: SystemSetting[];
  email: SystemSetting[];
  security: SystemSetting[];
}

export interface SystemInfo {
  environment: string;
  python_version: string;
  fastapi_version: string;
  database_version: string;
  database_status: string;
  redis_version: string;
  redis_status: string;
  nextjs_version: string;
  app_version: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  action: string;
  resource: string | null;
  resource_id: string | null;
  status: string | null;
  metadata_: any | null;
  ip_address: string | null;
  created_at: string;
}

export interface AuditStatisticsOut {
  total_events: number;
  events_today: number;
  successful_operations: number;
  failed_operations: number;
  activity_over_time: any[];
  actions_by_category: any[];
  success_vs_failure: any[];
  top_administrators: any[];
}

export interface AuditFilterParams {
  page?: number;
  page_size?: number;
  search?: string;
  action?: string;
  status?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_desc?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  status: string;
  target_audience: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  scheduled_at: string | null;
  published_at: string | null;
  expires_at: string | null;
  
  read_count: number;
  total_recipients: number;
  read_percentage: number;
}

export interface NotificationStatisticsOut {
  total_notifications: number;
  active_notifications: number;
  scheduled_notifications: number;
  draft_notifications: number;
  expired_notifications: number;
  notifications_over_time: any[];
  types_distribution: any[];
  priority_distribution: any[];
  audience_distribution: any[];
}

export interface NotificationFilterParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  type?: string;
  priority?: string;
  target_audience?: string;
  sort_by?: string;
  sort_desc?: boolean;
}

export type ReportCategory = "Users" | "Careers" | "Resumes" | "Audit Logs" | "Notifications";
export type ReportFormat = "CSV";
export type ReportScheduleFrequency = "Daily" | "Weekly" | "Monthly";

export interface ReportSchedule {
  frequency: ReportScheduleFrequency;
  is_active: boolean;
}

export interface ReportScheduleOut extends ReportSchedule {
  id: string;
  report_config_id: string;
  next_run_at: string;
}

export interface ReportConfigCreate {
  name: string;
  category: ReportCategory;
  format?: ReportFormat;
  filters?: Record<string, any>;
  schedule?: ReportSchedule;
}

export interface ReportConfigOut {
  id: string;
  name: string;
  category: ReportCategory;
  format: ReportFormat;
  filters: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
  schedule?: ReportScheduleOut;
}

export interface ReportHistoryOut {
  id: string;
  report_config_id: string;
  generated_by?: string;
  generated_at: string;
  status: string;
  record_count: number;
  filters_snapshot: Record<string, any>;
  
  config_name?: string;
  config_category?: ReportCategory;
  generator_name?: string;
}

export interface ReportFilterParams {
  page?: number;
  page_size?: number;
  search?: string;
  category?: string;
  format?: string;
  status?: string;
  sort_by?: string;
  sort_desc?: boolean;
}

export interface ExecutiveMetricsOut {
  total_users: number;
  total_careers: number;
  total_resumes: number;
  total_interviews: number;
  
  user_growth: { date: string; count: number }[];
  career_distribution: { name: string; value: number }[];
  resume_scores: { name: string; value: number }[];
  platform_activity: { date: string; count: number }[];
}

export interface AdminAccountUpdate {
  full_name: string;
  email?: string;
}

export interface AdminPasswordChange {
  current_password: string;
  new_password: string;
}

export interface AdminPreferencesUpdate {
  theme: string;
  language: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
}

export interface SessionOut {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  expires_at: string;
  is_current: boolean;
}

export interface SessionFilterParams {
  page?: number;
  page_size?: number;
}

export interface ActivityFilterParams {
  page?: number;
  page_size?: number;
  action?: string;
  sort_by?: string;
  sort_desc?: boolean;
}
