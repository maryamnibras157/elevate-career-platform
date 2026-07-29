export interface UserPreferences {
  theme: string;
  language: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
}

export interface UserPreferencesUpdate {
  theme?: string;
  language?: string;
  notifications_enabled?: boolean;
  email_notifications?: boolean;
}

export interface UserUpdate {
  full_name?: string;
  avatar_url?: string;
}
